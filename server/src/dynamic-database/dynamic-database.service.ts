import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppStateService, AppState } from './app-state.service';
import { LoggerService } from '../common/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import { SetupConfig } from '../setup/interfaces/setup-config.interface';

@Injectable()
export class DynamicDatabaseService implements OnModuleInit {
  private dataSource: DataSource | null = null;

  constructor(
    private readonly appStateService: AppStateService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.initializeIfConfigured();
  }

  async initializeIfConfigured(): Promise<void> {
    try {
      const setupConfig = this.readSetupConfig();

      if (setupConfig.isDatabaseConfigured && setupConfig.databaseConfig) {
        this.logger.log(
          'Database configuration found, initializing DataSource',
        );
        await this.createDataSource(setupConfig.databaseConfig);
        this.appStateService.setState(AppState.READY);
        this.logger.log('DataSource initialized successfully');
      } else {
        this.logger.log('No database configuration found, setup required');
        this.appStateService.setState(AppState.SETUP_REQUIRED);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize database: ${errorMessage}`);
      this.appStateService.setState(AppState.ERROR, errorMessage);
    }
  }

  async configureAndInitialize(config: any): Promise<void> {
    try {
      this.logger.log('Configuring and initializing database');
      await this.createDataSource(config);

      // Run migrations
      if (this.dataSource) {
        await this.dataSource.runMigrations();
        this.logger.log('Database migrations completed');
      }

      // Update setup config
      const setupConfig = this.readSetupConfig();
      setupConfig.isDatabaseConfigured = true;
      setupConfig.databaseConfig = config;
      this.writeSetupConfig(setupConfig);

      this.appStateService.setState(AppState.READY);
      this.logger.log('Database configured and initialized successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to configure database: ${errorMessage}`);
      this.appStateService.setState(AppState.ERROR, errorMessage);
      throw error;
    }
  }

  getDataSource(): DataSource {
    if (!this.dataSource) {
      throw new Error(
        'DataSource not initialized. Database may not be configured yet.',
      );
    }
    return this.dataSource;
  }

  private async createDataSource(config: any): Promise<void> {
    // Close existing connection if any
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }

    const dataSourceOptions: DataSourceOptions = {
      type: 'postgres',
      host: config.host,
      port: parseInt(config.port, 10),
      username: config.username,
      password: config.password,
      database: config.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/**/*{.ts,.js}'],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    };

    this.dataSource = new DataSource(dataSourceOptions);
    await this.dataSource.initialize();
  }

  private readSetupConfig(): SetupConfig {
    const setupConfigPath = path.join(__dirname, '../setup/setup-config.json');
    try {
      const data = fs.readFileSync(setupConfigPath, 'utf8');
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
    const setupConfigPath = path.join(__dirname, '../setup/setup-config.json');
    fs.writeFileSync(setupConfigPath, JSON.stringify(config, null, 2));
  }
}
