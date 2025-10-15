import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { IAuthService } from './interfaces/auth.service.interface';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';
import {
  validatePassword,
  generateAccessToken,
  generateRefreshToken,
  removeSensitiveFields,
  validateUserData,
  verifyToken,
} from './helpers';
import { TypeOrmService } from '../common/typeorm.service';

@Injectable()
export class AuthService extends TypeOrmService implements IAuthService {
  constructor(
    protected readonly dynamicDatabaseService: DynamicDatabaseService,
    protected readonly jwtService: JwtService,
    protected readonly logger: LoggerService,
  ) {
    super(dynamicDatabaseService, logger);
  }

  async getUserData(userId: number): Promise<AuthResponseDto> {
    try {
      const userRepository = await this.getRepository(User);
      // Find user by ID
      const user = await userRepository.findOne({
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
      const userRepository = await this.getRepository(User);
      this.logger.log(`Login attempt for username: ${credentials.username}`);

      // Find user by username
      const user = await userRepository.findOne({
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

      // Compare password using helper
      const isPasswordValid = await validatePassword(
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

      // Validate user data before creating payload using helper
      if (!validateUserData(user)) {
        const errorMsg = `Invalid user data for ID: ${user.id}`;
        throw new CustomException(
          'Invalid user data',
          HttpStatus.INTERNAL_SERVER_ERROR,
          errorMsg,
        );
      }

      // Generate tokens
      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      // Log the payload for debugging
      this.logger.log(
        `Generating tokens with payload: ${JSON.stringify(payload)}`,
      );

      // Generate tokens using helper functions
      let accessToken: string;
      let refreshToken: string;

      try {
        accessToken = await generateAccessToken(this.jwtService, payload);
      } catch (signError) {
        this.logger.error(`Failed to sign access token: ${signError.message}`);
        throw new CustomException(
          'Token generation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Failed to generate access token: ${signError.message}`,
        );
      }

      try {
        refreshToken = await generateRefreshToken(this.jwtService, payload);
      } catch (signError) {
        this.logger.error(`Failed to sign refresh token: ${signError.message}`);
        throw new CustomException(
          'Token generation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Failed to generate refresh token: ${signError.message}`,
        );
      }

      this.logger.log(`Successfully generated tokens for user ID: ${user.id}`);

      // Construct response (excluding password_hash) using helper
      const userWithoutPassword = removeSensitiveFields(user);
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
      const userRepository = await this.getRepository(User);
      this.logger.log('Attempting to refresh token');

      // Verify the refresh token using helper
      const verifiedPayload = verifyToken(
        this.jwtService,
        refreshTokenData.refreshToken,
      );
      const payload = verifiedPayload;
      this.logger.log(
        `Successfully verified refresh token for user ID: ${payload.sub}`,
      );

      // Find user by ID from token payload
      // Extract user ID with proper type checking
      const userId = payload.sub;

      const user = await userRepository.findOne({
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

      let newAccessToken: string;
      let newRefreshToken: string;

      try {
        newAccessToken = await generateAccessToken(this.jwtService, newPayload);
      } catch (signError) {
        this.logger.error(
          `Failed to sign new access token: ${signError.message}`,
        );
        throw new CustomException(
          'Token generation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Failed to generate new access token: ${signError.message}`,
        );
      }

      try {
        newRefreshToken = await generateRefreshToken(
          this.jwtService,
          newPayload,
        );
      } catch (signError) {
        this.logger.error(
          `Failed to sign new refresh token: ${signError.message}`,
        );
        throw new CustomException(
          'Token generation failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Failed to generate new refresh token: ${signError.message}`,
        );
      }
      this.logger.log(
        `Successfully generated new tokens for user ID: ${user.id}`,
      );

      // Construct response (excluding password_hash) using helper
      const userWithoutPassword = removeSensitiveFields(user);
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
