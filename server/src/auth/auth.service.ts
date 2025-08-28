import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { IAuthService } from './interfaces/auth.service.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from './entity/user.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { JwtPayload } from './types/auth-tokens.type';
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
      this.logger.log(`Fetching user data for user ID: ${userId}`);

      // Find user by ID
      let user: User | null = null;
      try {
        user = await this.userRepository.findOne({
          where: { id: userId },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Database query failed during user lookup',
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during user lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying user: ${errorMessage}`,
        );
      }

      // If user not found, throw exception
      if (!user) {
        const errorMsg = `User not found with ID: ${userId}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'User not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      this.logger.log(`Successfully fetched user data for user ID: ${userId}`);

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
      this.logger.error(
        'An unexpected error occurred while fetching user data',
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred while fetching user data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getUserData function: ${errorMessage}`,
      );
    }
  }

  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Attempting to register user: ${userData.username}`);

      // Check if user already exists
      let existingUser: User | null = null;
      try {
        existingUser = await this.userRepository.findOne({
          where: [{ username: userData.username }, { email: userData.email }],
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Database query failed during user existence check',
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during user existence check',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying user existence: ${errorMessage}`,
        );
      }

      if (existingUser) {
        const errorMsg = `User with this username or email already exists: ${userData.username} or ${userData.email}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'User with this username or email already exists',
          HttpStatus.CONFLICT,
          errorMsg,
        );
      }

      // Hash the password
      let hashedPassword: string;
      try {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        this.logger.log(
          `Successfully hashed password for user: ${userData.username}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Failed to hash password', errorMessage);
        throw new CustomException(
          'Failed to hash password',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error during password hashing: ${errorMessage}`,
        );
      }

      // Create new user entity
      const newUser = this.userRepository.create({
        username: userData.username,
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
      });

      // Save the user
      let savedUser: User;
      try {
        savedUser = await this.userRepository.save(newUser);
        this.logger.log(
          `Successfully registered user with ID: ${savedUser.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Failed to save user', errorMessage);
        throw new CustomException(
          'Failed to save user',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error saving new user: ${errorMessage}`,
        );
      }

      // Generate tokens
      let accessToken: string;
      let refreshToken: string;
      try {
        const payload = {
          sub: savedUser.id,
          username: savedUser.username,
        };
        accessToken = this.jwtService.sign(payload);
        refreshToken = this.jwtService.sign(payload, {
          expiresIn: '1d',
        });
        this.logger.log(
          `Successfully generated tokens for user ID: ${savedUser.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Failed to generate authentication tokens',
          errorMessage,
        );
        throw new CustomException(
          'Failed to generate authentication tokens',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error during token generation: ${errorMessage}`,
        );
      }

      // Construct response (excluding password_hash)
      const { password_hash: _, ...userWithoutPassword } = savedUser;
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
      this.logger.error(
        'An unexpected error occurred during registration',
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred during registration',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in register function: ${errorMessage}`,
      );
    }
  }

  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    try {
      this.logger.log(`Login attempt for username: ${credentials.username}`);

      // Find user by username
      let user: User | null = null;
      try {
        user = await this.userRepository.findOne({
          where: { username: credentials.username },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Database query failed during user lookup',
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during user lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying user: ${errorMessage}`,
        );
      }

      // If user not found, throw exception
      if (!user) {
        const errorMsg = `Invalid credentials for username: ${credentials.username}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
          errorMsg,
        );
      }

      // Compare password
      let isPasswordValid: boolean;
      try {
        isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Failed to validate password', errorMessage);
        throw new CustomException(
          'Failed to validate password',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error during password comparison: ${errorMessage}`,
        );
      }

      // If password is invalid, throw exception
      if (!isPasswordValid) {
        const errorMsg = `Invalid password for username: ${credentials.username}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
          errorMsg,
        );
      }

      this.logger.log(`Successful login for user ID: ${user.id}`);

      // Generate tokens
      let accessToken: string;
      let refreshToken: string;
      try {
        const payload = {
          sub: user.id,
          username: user.username,
        };
        accessToken = this.jwtService.sign(payload);
        refreshToken = this.jwtService.sign(payload, {
          expiresIn: '1d',
        });
        this.logger.log(
          `Successfully generated tokens for user ID: ${user.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Failed to generate authentication tokens',
          errorMessage,
        );
        throw new CustomException(
          'Failed to generate authentication tokens',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error during token generation: ${errorMessage}`,
        );
      }

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
      this.logger.error(
        'An unexpected error occurred during login',
        errorMessage,
      );
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
      let payload: JwtPayload | null = null;
      try {
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

        payload = verifiedPayload;
        this.logger.log(
          `Successfully verified refresh token for user ID: ${payload.sub}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Token verification failed: ${errorMessage}`);
        throw new CustomException(
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
          `Token verification failed: ${errorMessage}`,
        );
      }

      // Find user by ID from token payload
      let user: User | null = null;
      try {
        // Extract user ID with proper type checking
        const userId = payload.sub;

        user = await this.userRepository.findOne({
          where: { id: userId },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Database query failed during user lookup',
          errorMessage,
        );
        throw new CustomException(
          'Database query failed during user lookup',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error querying user: ${errorMessage}`,
        );
      }

      // If user not found, throw exception
      if (!user) {
        const errorMsg = `User not found with ID: ${payload.sub}`;
        this.logger.warn(errorMsg);
        throw new CustomException(
          'User not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Generate new tokens
      let newAccessToken: string;
      let newRefreshToken: string;
      try {
        const newPayload = {
          sub: user.id,
          username: user.username,
        };
        newAccessToken = this.jwtService.sign(newPayload);
        newRefreshToken = this.jwtService.sign(newPayload, {
          expiresIn: '1d',
        });
        this.logger.log(
          `Successfully generated new tokens for user ID: ${user.id}`,
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          'Failed to generate authentication tokens',
          errorMessage,
        );
        throw new CustomException(
          'Failed to generate authentication tokens',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error during token generation: ${errorMessage}`,
        );
      }

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
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        'An unexpected error occurred during token refresh',
        errorMessage,
      );
      throw new CustomException(
        'An unexpected error occurred during token refresh',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in refreshToken function: ${errorMessage}`,
      );
    }
  }
}
