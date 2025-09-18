import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { Repository, Like, DataSource } from 'typeorm';
import { IUserService } from './interfaces/user.service.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { User } from './entity/user.entity';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import * as bcrypt from 'bcryptjs';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly logger: LoggerService,
  ) {
    // No initialization in constructor
  }

  private async getUserRepository(): Promise<Repository<User>> {
    try {
      // Ensure the database is ready
      await this.ensureDatabaseReady();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
      const dataSource = this.dynamicDatabaseService.getDataSource();
      return dataSource.getRepository(User);
    } catch (error) {
      this.logger.error(`Failed to get user repository: ${error.message}`);
      throw new CustomException(
        'Database connection error',
        HttpStatus.SERVICE_UNAVAILABLE,
        `Database may not be properly configured: ${error.message}`,
      );
    }
  }

  private async ensureDatabaseReady(): Promise<void> {
    try {
      this.dynamicDatabaseService.ensureDataSourceInitialized();
    } catch (error) {
      // If the datasource is not initialized, try to initialize it
      this.logger.log('Attempting to reinitialize database connection');
      await this.dynamicDatabaseService.initializeIfConfigured();
      this.dynamicDatabaseService.ensureDataSourceInitialized();
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const userRepository = await this.getUserRepository();
      this.logger.log(`Fetching users - page: ${page}, limit: ${limit}`);

      let users: User[] = [];
      let total: number = 0;

      [users, total] = await userRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          id: 'ASC',
        },
      });

      this.logger.log(
        `Successfully fetched ${users.length} users (page: ${page}, limit: ${limit})`,
      );

      // Map entities to DTOs
      const userResponseDtos = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      return {
        data: userResponseDtos,
        total,
        page,
        limit,
      };
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching all users',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findAll function: ${errorMessage}`,
      );
    }
  }

  async findOne(id: number): Promise<UserResponseDto> {
    try {
      const userRepository = await this.getUserRepository();
      this.logger.log(`Fetching user with ID: ${id}`);

      const user = await userRepository.findOne({
        where: { id },
      });

      // If user not found, throw exception
      if (!user) {
        const errorMsg = `User not found with ID: ${id}`;
        throw new CustomException(
          'User not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      this.logger.log(`Successfully fetched user with ID: ${id}`);

      // Map entity to DTO
      const userResponseDto: UserResponseDto = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return userResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred while fetching user',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in findOne function: ${errorMessage}`,
      );
    }
  }

  async create(userData: CreateUserDto): Promise<UserResponseDto> {
    try {
      const userRepository = await this.getUserRepository();
      this.logger.log('Creating a new user');

      // Check if user with same username or email already exists
      if (userData.username || userData.email) {
        const existingUser = await userRepository.findOne({
          where: [
            { username: userData.username },
            { email: userData.email },
          ].filter((condition) => Object.values(condition)[0] !== undefined), // Only include conditions with defined values
        });

        if (existingUser) {
          const errorMsg = `User with this username or email already exists: ${existingUser.username}`;
          throw new CustomException(
            'User with this username or email already exists',
            HttpStatus.CONFLICT,
            errorMsg,
          );
        }
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new user entity
      const newUser = userRepository.create({
        username: userData.username,
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || 'CASHIER',
      });

      // Save the user
      const savedUser = await userRepository.save(newUser);
      this.logger.log(`Successfully created user with ID: ${savedUser.id}`);

      // Map entity to DTO
      const userResponseDto: UserResponseDto = {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        firstName: savedUser.first_name,
        lastName: savedUser.last_name,
        role: savedUser.role,
        is_active: savedUser.is_active,
        created_at: savedUser.created_at,
        updated_at: savedUser.updated_at,
      };

      return userResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during user creation',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in create function: ${errorMessage}`,
      );
    }
  }

  async update(id: number, userData: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const userRepository = await this.getUserRepository();
      this.logger.log(`Updating user with ID: ${id}`);

      // Find the existing user
      const existingUser = await userRepository.findOne({
        where: { id },
      });

      // If user not found, throw exception
      if (!existingUser) {
        const errorMsg = `User not found with ID: ${id}`;
        throw new CustomException(
          'User not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Check if another user with same username or email already exists
      if (userData.username || userData.email) {
        const whereConditions: Array<{ username: string } | { email: string }> =
          [];
        if (userData.username) {
          whereConditions.push({ username: userData.username });
        }
        if (userData.email) {
          whereConditions.push({ email: userData.email });
        }

        if (whereConditions.length > 0) {
          const existingUserWithUsernameOrEmail = await userRepository.findOne({
            where: whereConditions,
          });

          if (
            existingUserWithUsernameOrEmail &&
            existingUserWithUsernameOrEmail.id !== id
          ) {
            const errorMsg = `User with this username or email already exists: ${existingUserWithUsernameOrEmail.username}`;
            throw new CustomException(
              'User with this username or email already exists',
              HttpStatus.CONFLICT,
              errorMsg,
            );
          }
        }
      }

      // Hash the password if it's being updated
      let hashedPassword = existingUser.password_hash;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      }

      // Update the user entity
      Object.assign(existingUser, {
        username: userData.username ?? existingUser.username,
        email: userData.email ?? existingUser.email,
        password_hash: hashedPassword,
        first_name: userData.firstName ?? existingUser.first_name,
        last_name: userData.lastName ?? existingUser.last_name,
        role: userData.role ?? existingUser.role,
      });

      // Save the updated user
      const updatedUser = await userRepository.save(existingUser);
      this.logger.log(`Successfully updated user with ID: ${updatedUser.id}`);

      // Map entity to DTO
      const userResponseDto: UserResponseDto = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        role: updatedUser.role,
        is_active: updatedUser.is_active,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
      };

      return userResponseDto;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during user update',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in update function: ${errorMessage}`,
      );
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const userRepository = await this.getUserRepository();
      this.logger.log(`Deleting user with ID: ${id}`);

      // Check if user exists
      const existingUser = await userRepository.findOne({
        where: { id },
      });

      // If user not found, throw exception
      if (!existingUser) {
        const errorMsg = `User not found with ID: ${id}`;
        throw new CustomException(
          'User not found',
          HttpStatus.NOT_FOUND,
          errorMsg,
        );
      }

      // Delete the user
      await userRepository.delete(id);
      this.logger.log(`Successfully deleted user with ID: ${id}`);
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during user deletion',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in delete function: ${errorMessage}`,
      );
    }
  }

  async search(query: SearchUserDto): Promise<UserResponseDto[]> {
    try {
      const userRepository = await this.getUserRepository();
      this.logger.log(`Searching users with query: ${query.query}`);

      // Search for users matching the query in username, email, first_name, or last_name
      const users = await userRepository.find({
        where: [
          { username: Like(`%${query.query}%`) },
          { email: Like(`%${query.query}%`) },
          { first_name: Like(`%${query.query}%`) },
          { last_name: Like(`%${query.query}%`) },
        ],
      });

      this.logger.log(
        `Found ${users.length} users matching query: ${query.query}`,
      );

      // Map entities to DTOs
      const userResponseDtos = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      return userResponseDtos;
    } catch (error) {
      // Re-throw if it's already a CustomException, otherwise wrap in CustomException
      if (error instanceof CustomException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'An unexpected error occurred during user search',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in search function: ${errorMessage}`,
      );
    }
  }
}
