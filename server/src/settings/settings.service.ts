import { Injectable } from '@nestjs/common';
import { LoggerService } from '../common/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import { ShopInfoDto } from '../setup/dto/shop-info.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';
import { DatabaseUpdateDto } from './dto/database-update.dto';
import { DatabaseConfigDto } from '../setup/dto/database-config.dto';
import { SetupConfig } from '../setup/interfaces/setup-config.interface';
import { Client } from 'pg';
import { UserService } from '../user/user.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { CombinedSettingsDto } from './dto/combined-settings.dto';

@Injectable()
export class SettingsService {
  private readonly setupConfigPath = path.join(
    __dirname,
    '../setup/setup-config.json',
  );

  constructor(
    private readonly logger: LoggerService,
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly userService: UserService,
  ) {}

  getShopInfo(): ShopInfoDto | null {
    try {
      this.logger.log('Fetching shop information from settings');
      const setupConfig = this.readSetupConfig();

      if (!setupConfig.isShopConfigured || !setupConfig.shopInfo) {
        this.logger.warn('Shop is not configured or shop info is missing');
        return null;
      }

      return setupConfig.shopInfo;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch shop information: ${errorMessage}`);
      throw new CustomException(
        'Failed to fetch shop information',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error in getShopInfo function: ${errorMessage}`,
      );
    }
  }

  async getProfile(userId: number): Promise<AuthResponseDto> {
    try {
      this.logger.log('Fetching user profile from settings');
      const userRepository = await this.getUserRepository();
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

      // For getProfile, we don't need to return tokens
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
        `Unexpected error in getProfile function: ${errorMessage}`,
      );
    }
  }

  private async getUserResponseDto(userId: number): Promise<UserResponseDto> {
    try {
      this.logger.log('Fetching user response DTO for combined settings');
      const userRepository = await this.getUserRepository();
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

      // Map entity to DTO format
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
        'An unexpected error occurred while fetching user data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Unexpected error in getUserResponseDto function: ${errorMessage}`,
      );
    }
  }

  async updateDatabaseConfig(
    config: DatabaseUpdateDto,
  ): Promise<{ isDatabaseConfigured: boolean }> {
    try {
      this.logger.log('Updating database configuration from setup-config.json');

      // Get existing config to merge with new values
      const setupConfig = this.readSetupConfig();
      const existingDatabaseConfig =
        setupConfig.databaseConfig || ({} as DatabaseConfigDto);

      // Merge new config with existing config to allow partial updates
      const mergedConfig: DatabaseConfigDto = {
        type: config.type ?? existingDatabaseConfig.type,
        host: config.host ?? existingDatabaseConfig.host,
        port: config.port ?? existingDatabaseConfig.port ?? '5432',
        username: config.username ?? existingDatabaseConfig.username,
        password: config.password ?? existingDatabaseConfig.password,
        database: config.database ?? existingDatabaseConfig.database,
        ssl: config.ssl ?? existingDatabaseConfig.ssl,
        tablePrefix: config.tablePrefix ?? existingDatabaseConfig.tablePrefix,
      };

      // Validate that essential fields are present
      if (
        !mergedConfig.type ||
        !mergedConfig.host ||
        !mergedConfig.port ||
        !mergedConfig.username ||
        !mergedConfig.password ||
        !mergedConfig.database
      ) {
        throw new CustomException(
          'Missing required database configuration fields',
          HttpStatus.BAD_REQUEST,
          'All essential database config fields must be provided (type, host, port, username, password, database)',
        );
      }

      // Test database connection with merged config
      await this.testDatabaseConnection(mergedConfig);

      // Update the database configuration in setup-config.json
      setupConfig.isDatabaseConfigured = true;
      setupConfig.databaseConfig = mergedConfig;

      // If shop is also configured, mark setup as complete
      if (setupConfig.isShopConfigured) {
        setupConfig.isSetupComplete = true;
      }

      this.writeSetupConfig(setupConfig);

      // Configure and initialize the database with new settings
      await this.dynamicDatabaseService.configureAndInitialize(mergedConfig);

      this.logger.log('Database configuration updated successfully');
      return { isDatabaseConfigured: true };
    } catch (error) {
      // If it's already a CustomException, re-throw it to preserve the original status code
      if (error instanceof CustomException) {
        throw error;
      }
      
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to update database configuration: ${errorMessage}`,
      );
      throw new CustomException(
        'Failed to update database configuration',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error in updateDatabaseConfig function: ${errorMessage}`,
      );
    }
  }

  async updateShopInfo(
    shopInfo: ShopInfoDto,
  ): Promise<{ isShopConfigured: boolean }> {
    try {
      this.logger.log('Updating shop information in setup-config.json');

      // Validate shop information - relying on DTO validation
      if (!shopInfo.name || !shopInfo.currency) {
        const errorMessage =
          'Missing required shop information parameters (name and currency are required)';
        throw new CustomException(
          'Invalid shop information',
          HttpStatus.BAD_REQUEST,
          errorMessage,
        );
      }

      // Update the shop information in setup-config.json
      const setupConfig = this.readSetupConfig();
      setupConfig.isShopConfigured = true;
      setupConfig.shopInfo = shopInfo;

      // If database is also configured, mark setup as complete
      if (setupConfig.isDatabaseConfigured) {
        setupConfig.isSetupComplete = true;
      }

      this.writeSetupConfig(setupConfig);

      this.logger.log('Shop information updated successfully');
      return { isShopConfigured: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update shop information: ${errorMessage}`);
      throw new CustomException(
        'Failed to update shop information',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error in updateShopInfo function: ${errorMessage}`,
      );
    }
  }

  async getAllSettings(userId: number): Promise<CombinedSettingsDto> {
    try {
      this.logger.log('Fetching all settings data');

      // Get user data
      const user = await this.getUserResponseDto(userId);

      // Get shop info
      const shopInfo = this.getShopInfo();

      // Get database config from setup config
      const setupConfig = this.readSetupConfig();
      const databaseConfig = setupConfig.databaseConfig || null;

      const result: CombinedSettingsDto = {
        user: user,
        shopInfo: shopInfo,
        databaseConfig: databaseConfig,
      };

      this.logger.log('All settings data fetched successfully');
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch all settings data: ${errorMessage}`);
      throw new CustomException(
        'Failed to fetch settings data',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error in getAllSettings function: ${errorMessage}`,
      );
    }
  }

  async updateUser(
    userId: number,
    userData: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Updating user info for user ID: ${userId}`);

      // Use the UserService to update the user
      const updatedUser = await this.userService.update(userId, userData);

      this.logger.log(`User info updated successfully for user ID: ${userId}`);
      return updatedUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update user info: ${errorMessage}`);
      throw new CustomException(
        'Failed to update user info',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error in updateUser function: ${errorMessage}`,
      );
    }
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

  private readSetupConfig(): SetupConfig {
    try {
      const data = fs.readFileSync(this.setupConfigPath, 'utf8');
      return JSON.parse(data) as SetupConfig;
    } catch (error) {
      return {
        isDatabaseConfigured: false,
        isShopConfigured: false,
        isSetupComplete: false,
      };
    }
  }

  private writeSetupConfig(config: SetupConfig): void {
    fs.writeFileSync(this.setupConfigPath, JSON.stringify(config, null, 2));
  }

  private async testDatabaseConnection(
    config: DatabaseUpdateDto,
  ): Promise<void> {
    // For now, supporting only PostgreSQL, but could be extended to support other types
    if (config.type !== 'postgres') {
      throw new CustomException(
        'Only PostgreSQL database type is currently supported for connection testing',
        HttpStatus.BAD_REQUEST,
        `Database type ${config.type} is not supported for connection testing`,
      );
    }

    const { Client } = await import('pg');

    let client: Client | null = null;

    try {
      client = new Client({
        host: config.host,
        port: config.port ? parseInt(config.port, 10) : 5432,
        user: config.username,
        password: config.password,
        database: config.database,
        ssl: config.ssl
          ? {
              rejectUnauthorized: false,
            }
          : false,
      });

      await client.connect();
      await client.query('SELECT 1');
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = `Failed to connect to database: ${error.message}`;
        throw new CustomException(
          'Database connection failed',
          HttpStatus.BAD_REQUEST,
          errorMessage,
        );
      }
    } finally {
      if (client) {
        try {
          await client.end();
        } catch (endError: unknown) {
          // Silently ignore errors when closing the connection
        }
      }
    }
  }
}
