import { Injectable, HttpStatus } from '@nestjs/common';
import { ISetupService } from './interfaces/setup.service.interface';
import { SetupStatusDto } from './dto/setup-status.dto';
import { DatabaseConfigDto } from './dto/database-config.dto';
import { ShopInfoDto } from './dto/shop-info.dto';
import { CustomException } from '../common/exceptions/custom.exception';
import { LoggerService } from '../common/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';
import { SetupConfig } from './interfaces/setup-config.interface';
import { DynamicDatabaseService } from '../dynamic-database/dynamic-database.service';
import {
  AppStateService,
  AppState,
} from '../dynamic-database/app-state.service';

@Injectable()
export class SetupService implements ISetupService {
  private readonly setupConfigPath = path.join(__dirname, 'setup-config.json');
  private readonly envFilePath = path.join(__dirname, '../../.env.production');

  constructor(
    private readonly logger: LoggerService,
    private readonly dynamicDatabaseService: DynamicDatabaseService,
    private readonly appStateService: AppStateService,
  ) {
    // Initialize app state based on existing setup config
    this.initializeAppState();
  }

  private initializeAppState(): void {
    try {
      if (fs.existsSync(this.setupConfigPath)) {
        const data = fs.readFileSync(this.setupConfigPath, 'utf8');
        const setupConfig = JSON.parse(data);
        if (setupConfig.isSetupComplete) {
          this.appStateService.setState(AppState.READY);
        }
      }
    } catch (error) {
      // Ignore errors during initialization
    }
  }

  async getStatus(): Promise<SetupStatusDto> {
    try {
      this.logger.log('Fetching setup status');
      const setupConfig = this.readSetupConfig();

      return {
        isSetupComplete: setupConfig.isSetupComplete || false,
        isDatabaseConfigured: setupConfig.isDatabaseConfigured || false,
        isShopConfigured: setupConfig.isShopConfigured || false,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new CustomException(
        'Failed to fetch setup status',
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Error in getStatus function: ${errorMessage}`,
      );
    }
  }

  async configureDatabase(config: DatabaseConfigDto): Promise<SetupStatusDto> {
    this.logger.log('Configuring database');

    // Test database connection
    await this.testDatabaseConnection(config);

    // Configure and initialize database
    await this.dynamicDatabaseService.configureAndInitialize(config);

    // Save database configuration
    const setupStatus = this.readSetupConfig();
    setupStatus.isDatabaseConfigured = true;
    setupStatus.databaseConfig = config;
    this.writeSetupConfig(setupStatus);

    this.logger.log('Database configured successfully');
    return {
      isSetupComplete: setupStatus.isSetupComplete || false,
      isDatabaseConfigured: setupStatus.isDatabaseConfigured || false,
      isShopConfigured: setupStatus.isShopConfigured || false,
    };
  }

  configureShop(info: ShopInfoDto): SetupStatusDto {
    this.logger.log('Configuring shop');

    // Validate shop information
    if (!info.name || !info.currency) {
      const errorMessage = 'Missing required shop information parameters';
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
    return {
      isSetupComplete: setupStatus.isSetupComplete || false,
      isDatabaseConfigured: setupStatus.isDatabaseConfigured || false,
      isShopConfigured: setupStatus.isShopConfigured || false,
    };
  }

  completeSetup(): SetupStatusDto {
    this.logger.log('Completing setup process');

    const setupStatus = this.readSetupConfig();

    if (setupStatus.isDatabaseConfigured && setupStatus.isShopConfigured) {
      setupStatus.isSetupComplete = true;
      this.writeSetupConfig(setupStatus);

      // Set the app state to READY after successful setup
      this.appStateService.setState(AppState.READY);

      // Export configuration to .env file for production

      this.logger.log('Setup process completed successfully');
    } else {
      const errorMessage = 'Not all setup steps have been completed';
      throw new CustomException(
        'Setup incomplete',
        HttpStatus.BAD_REQUEST,
        errorMessage,
      );
    }

    return {
      isSetupComplete: setupStatus.isSetupComplete || false,
      isDatabaseConfigured: setupStatus.isDatabaseConfigured || false,
      isShopConfigured: setupStatus.isShopConfigured || false,
    };
  }

  getShopInfo(): ShopInfoDto | null {
    try {
      this.logger.log('Fetching shop information');
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
    config: DatabaseConfigDto,
  ): Promise<void> {
    let client: Client | null = null;

    try {
      client = new Client({
        host: config.host,
        port: parseInt(config.port, 10),
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
