import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { ISetupService } from './interfaces/setup.service.interface';
import { SetupStatusDto } from './dto/setup-status.dto';
import { DatabaseConfigDto } from './dto/database-config.dto';
import { ShopInfoDto } from './dto/shop-info.dto';
import { AdminUserDto } from './dto/admin-user.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import { SetupConfig } from './interfaces/setup-config.interface';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserRole } from '../auth/entity/user.entity';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SetupService implements ISetupService {
  private readonly setupConfigPath = path.join(__dirname, 'setup-config.json');
  private readonly envFilePath = path.join(__dirname, '../../.env.production');

  constructor(
    private readonly logger: LoggerService,
    private readonly authService: AuthService,
  ) {}

  async getStatus(): Promise<SetupStatusDto> {
    try {
      this.logger.log('Fetching setup status');
      // For now, we're just returning a default status
      // In a full implementation, this would check actual setup state
      await Promise.resolve(); // Satisfy linter requirement for await
      return { isSetupComplete: false };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to fetch setup status', errorMessage);
      throw new CustomException(
        'Failed to fetch setup status',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error in getStatus function: ${errorMessage}`,
      );
    }
  }

  async configureDatabase(config: DatabaseConfigDto): Promise<SetupStatusDto> {
    this.logger.log('Configuring database');

    // Validate database configuration
    if (!config.host || !config.port || !config.username || !config.database) {
      const errorMessage = 'Missing required database configuration parameters';
      this.logger.error('Invalid database configuration', errorMessage);
      throw new CustomException(
        'Invalid database configuration',
        HttpStatus.BAD_REQUEST,
        errorMessage,
      );
    }

    // Test database connection
    await this.testDatabaseConnection(config);

    // Save database configuration
    const setupStatus = this.readSetupConfig();
    setupStatus.isDatabaseConfigured = true;
    setupStatus.databaseConfig = config;
    this.writeSetupConfig(setupStatus);

    this.logger.log('Database configured successfully');
    return { isSetupComplete: setupStatus.isSetupComplete };
  }

  configureShop(info: ShopInfoDto): SetupStatusDto {
    this.logger.log('Configuring shop');

    // Validate shop information
    if (!info.name || !info.currency) {
      const errorMessage = 'Missing required shop information parameters';
      this.logger.error('Invalid shop information', errorMessage);
      throw new CustomException(
        'Invalid shop information',
        HttpStatus.BAD_REQUEST,
        errorMessage,
      );
    }

    // Save shop information
    const setupStatus = this.readSetupConfig();
    setupStatus.isShopConfigured = true;
    setupStatus.shopInfo = info;
    this.writeSetupConfig(setupStatus);

    this.logger.log('Shop configured successfully');
    return { isSetupComplete: setupStatus.isSetupComplete };
  }

  async createAdminUser(userData: AdminUserDto): Promise<SetupStatusDto> {
    this.logger.log('Creating admin user');
    if (!userData.username || !userData.password) {
      const errorMessage = 'Missing required user information parameters';
      this.logger.error('Invalid user information', errorMessage);
      throw new CustomException(
        'Invalid user information',
        HttpStatus.BAD_REQUEST,
        errorMessage,
      );
    }

    const registerData: RegisterDto = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: UserRole.ADMIN,
    };

    await this.authService.register(registerData);

    const setupStatus = this.readSetupConfig();
    setupStatus.isAdminUserCreated = true;
    this.writeSetupConfig(setupStatus);

    this.logger.log('Admin user created successfully');
    return { isSetupComplete: setupStatus.isSetupComplete };
  }

  completeSetup(): SetupStatusDto {
    this.logger.log('Completing setup process');

    const setupStatus = this.readSetupConfig();

    if (
      setupStatus.isDatabaseConfigured &&
      setupStatus.isShopConfigured &&
      setupStatus.isAdminUserCreated
    ) {
      setupStatus.isSetupComplete = true;
      this.writeSetupConfig(setupStatus);

      // Export configuration to .env file for production
      this.exportConfigToEnvFile(setupStatus);

      this.logger.log('Setup process completed successfully');
    } else {
      const errorMessage = 'Not all setup steps have been completed';
      this.logger.error('Setup incomplete', errorMessage);
      throw new CustomException(
        'Setup incomplete',
        HttpStatus.BAD_REQUEST,
        errorMessage,
      );
    }

    return { isSetupComplete: setupStatus.isSetupComplete };
  }

  private readSetupConfig(): SetupConfig {
    try {
      const data = fs.readFileSync(this.setupConfigPath, 'utf8');
      return JSON.parse(data) as SetupConfig;
    } catch (error) {
      return {
        isDatabaseConfigured: false,
        isShopConfigured: false,
        isAdminUserCreated: false,
        isSetupComplete: false,
      };
    }
  }

  private writeSetupConfig(config: SetupConfig): void {
    fs.writeFileSync(this.setupConfigPath, JSON.stringify(config, null, 2));
  }

  private async testDatabaseConnection(
    config: DatabaseConfigDto,
  ): Promise<void> {
    let client: Client | null = null;

    try {
      client = new Client({
        host: config.host,
        port: config.port,
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
        this.logger.error('Database connection failed', errorMessage);
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
          if (endError instanceof Error) {
            this.logger.warn(
              `Error closing database connection: ${endError.message}`,
            );
          } else {
            this.logger.warn('Unknown error closing database connection');
          }
        }
      }
    }
  }

  private exportConfigToEnvFile(config: SetupConfig): void {
    if (!config.isSetupComplete) {
      this.logger.warn('Setup is not complete. Skipping .env file export.');
      return;
    }

    try {
      let envContent = '# Production Environment Variables\n';

      // Add database configuration
      if (config.databaseConfig) {
        envContent += `DB_HOST=${config.databaseConfig.host}\n`;
        envContent += `DB_PORT=${config.databaseConfig.port}\n`;
        envContent += `DB_USERNAME=${config.databaseConfig.username}\n`;
        envContent += `DB_PASSWORD=${config.databaseConfig.password}\n`;
        envContent += `DB_NAME=${config.databaseConfig.database}\n`;
        envContent += `DB_SSL=${config.databaseConfig.ssl}\n`;
      }

      // Add shop information
      if (config.shopInfo) {
        envContent += `SHOP_NAME=${config.shopInfo.name}\n`;
        envContent += `SHOP_CURRENCY=${config.shopInfo.currency}\n`;
        if (config.shopInfo.address) {
          envContent += `SHOP_ADDRESS=${config.shopInfo.address}\n`;
        }
        if (config.shopInfo.phone) {
          envContent += `SHOP_PHONE=${config.shopInfo.phone}\n`;
        }
        if (config.shopInfo.email) {
          envContent += `SHOP_EMAIL=${config.shopInfo.email}\n`;
        }
      }

      // Write to .env.production file
      fs.writeFileSync(this.envFilePath, envContent);
      this.logger.log(`Configuration exported to ${this.envFilePath}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          'Failed to export configuration to .env file',
          error.message,
        );
        throw new CustomException(
          'Failed to export configuration',
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Error exporting to .env file: ${error.message}`,
        );
      }
    }
  }
}
