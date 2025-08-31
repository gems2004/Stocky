import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../user/entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/auth-tokens.type';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { IAuthService } from './interfaces/auth.service.interface';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}
  async getUserData(userId: number): Promise<AuthResponseDto> {
    try {
      // Find user by ID
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      // If user not found, throw exception
      if (!user) {
        const errorMsg = `User not found with ID: ${userId}`;
        throw new CustomException(
          'User not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Construct response (excluding password_hash)
      const { password_hash: _, ...userWithoutPassword } = user;

      // For getUserData, we don't need to return tokens
      const authResponse: AuthResponseDto = {
        user: userWithoutPassword,
        tokens: {
          accessToken: '',
          refreshToken: '',
        },
      };

      return authResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching user data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getUserData function: ${errorMessage}`,
      );
    }
  }

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Login attempt for username: ${credentials.username}`);

      // Find user by username
      const user = await this.userRepository.findOne({
        where: { username: credentials.username },
      });

      // If user not found, throw exception
      if (!user) {
        const errorMsg = `Invalid credentials for username: ${credentials.username}`;
        throw new CustomException(
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
          errorMsg,
        );
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password_hash,
      );

      // If password is invalid, throw exception
      if (!isPasswordValid) {
        const errorMsg = `Invalid password for username: ${credentials.username}`;
        throw new CustomException(
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
          errorMsg,
        );
      }

      this.logger.log(`Successful login for user ID: ${user.id}`);

      // Generate tokens
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '1d',
      });
      this.logger.log(`Successfully generated tokens for user ID: ${user.id}`);

      // Construct response (excluding password_hash)
      const { password_hash: _, ...userWithoutPassword } = user;
      const authResponse: AuthResponseDto = {
        user: userWithoutPassword,
        tokens: {
          accessToken,
          refreshToken,
        },
      };

      return authResponse;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during login',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in login function: ${errorMessage}`,
      );
    }
  }

  async refreshToken(
    refreshTokenData: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      this.logger.log('Attempting to refresh token');

      // Verify the refresh token
      // Verify the token and assert its type
      const verifiedPayload = this.jwtService.verify<JwtPayload>(
        refreshTokenData.refreshToken,
      );

      // Type guard to ensure payload has the required properties
      if (
        !verifiedPayload ||
        typeof verifiedPayload !== 'object' ||
        !('sub' in verifiedPayload) ||
        !('username' in verifiedPayload)
      ) {
        throw new Error('Invalid token payload');
      }

      // Ensure sub is a number
      if (typeof verifiedPayload.sub !== 'number') {
        throw new Error('Invalid user ID in token payload');
      }

      const payload = verifiedPayload;
      this.logger.log(
        `Successfully verified refresh token for user ID: ${payload.sub}`,
      );

      // Find user by ID from token payload
      // Extract user ID with proper type checking
      const userId = payload.sub;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      // If user not found, throw exception
      if (!user) {
        const errorMsg = `User not found with ID: ${payload.sub}`;
        throw new CustomException(
          'User not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Generate new tokens
      const newPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: '1d',
      });
      this.logger.log(
        `Successfully generated new tokens for user ID: ${user.id}`,
      );

      // Construct response (excluding password_hash)
      const { password_hash: _, ...userWithoutPassword } = user;
      const authResponse: AuthResponseDto = {
        user: userWithoutPassword,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      };

      return authResponse;
    } catch (error) {
      // Handle token verification errors specifically
      if (
        error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError'
      ) {
        throw new CustomException(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
          `Token verification failed: ${error.message}`,
        );
      }

      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during token refresh',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in refreshToken function: ${errorMessage}`,
      );
    }
  }
}
