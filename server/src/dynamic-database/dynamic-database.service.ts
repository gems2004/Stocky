import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DataSource,
  DataSourceOptions,
  Repository,
  ObjectLiteral,
} from 'typeorm';
import { AppStateService, AppState } from './app-state.service';
import { LoggerService } from '../common/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import { SetupConfig } from '../setup/interfaces/setup-config.interface';

@Injectable()
export class DynamicDatabaseService implements OnModuleInit {
  private dataSource: DataSource | null = null;
  private isInitializing = false;

  constructor(
    private readonly appStateService: AppStateService,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    await this.initializeIfConfigured();
  }

  async initializeIfConfigured(): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      this.logger.log('DataSource initialization already in progress, skipping');
      return;
    }

    this.isInitializing = true;
    
    try {
      const setupConfig = this.readSetupConfig();

      if (setupConfig.isDatabaseConfigured && setupConfig.databaseConfig) {
        this.logger.log(
          'Database configuration found, initializing DataSource',
        );
        await this.createDataSource(setupConfig.databaseConfig);
        // Don't automatically set the app state to READY
        // The setup process should control when the app is ready
        // this.appStateService.setState(AppState.READY);
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
    } finally {
      this.isInitializing = false;
    }
  }

  async configureAndInitialize(config: any): Promise<void> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      throw new Error('DataSource initialization already in progress');
    }

    this.isInitializing = true;
    
    try {
      this.logger.log('Configuring and initializing database');
      await this.createDataSource(config);

      // Run migrations
      if (this.dataSource && this.dataSource.isInitialized) {
        await this.dataSource.runMigrations();
        this.logger.log('Database migrations completed');
      }

      // Update setup config
      const setupConfig = this.readSetupConfig();
      setupConfig.isDatabaseConfigured = true;
      setupConfig.databaseConfig = config;
      this.writeSetupConfig(setupConfig);

      // Don't automatically set the app state to READY
      // The setup process should control when the app is ready
      // this.appStateService.setState(AppState.READY);
      this.logger.log('Database configured and initialized successfully');
    } catch (error) {
      // Ensure we don't keep a reference to a failed DataSource
      if (this.dataSource) {
        try {
          await this.dataSource.destroy();
        } catch (destroyError) {
          this.logger.error(`Failed to destroy DataSource: ${destroyError.message}`);
        }
        this.dataSource = null;
      }
      
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to configure database: ${errorMessage}`);
      this.appStateService.setState(AppState.ERROR, errorMessage);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  getDataSource(): DataSource {
    // Check if DataSource is properly initialized
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error(
        'DataSource not initialized. Database may not be configured yet.',
      );
    }
    return this.dataSource;
  }

  /**
   * Checks if the DataSource is initialized and throws an appropriate error if not.
   * This should be called at the beginning of service methods that require database access.
   */
  ensureDataSourceInitialized(): void {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error(
        'DataSource not initialized. Please complete the setup process first.',
      );
    }
  }

  /**
   * Gets a repository for the specified entity.
   * This method should be called after ensuring the DataSource is initialized.
   * @param entityClass The entity class for which to get the repository
   * @returns The repository for the specified entity
   */
  getRepository<T extends ObjectLiteral>(
    entityClass: new () => T,
  ): Repository<T> {
    this.ensureDataSourceInitialized();
    return this.dataSource!.getRepository(entityClass);
  }

  /**
   * Checks if the current DataSource connection is still active
   */
  async isConnectionAlive(): Promise<boolean> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return false;
    }

    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error(`Database connection lost: ${error.message}`);
      return false;
    }
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
      migrations: [__dirname + '/../dynamic-database/migrations/**/*{.ts,.js}'],
      synchronize: false,
      logging: false, // We'll handle logging through our logger service
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    };

    this.dataSource = new DataSource(dataSourceOptions);
    
    try {
      await this.dataSource.initialize();
    } catch (error) {
      // Ensure we don't keep a reference to a failed DataSource
      this.dataSource = null;
      throw error;
    }
  }

  private readSetupConfig(): SetupConfig {
    const setupConfigPath = path.join(__dirname, '../setup/setup-config.json');
    try {
      const data = fs.readFileSync(setupConfigPath, 'utf8');
      return JSON.parse(data) as SetupConfig;
    } catch (error) {
      // If the setup config file doesn't exist or can't be read, return default values
      // This is expected behavior when the application is first started
      return {
        isDatabaseConfigured: false,
        isShopConfigured: false,
        isSetupComplete: false,
      };
    }
  }

  private writeSetupConfig(config: SetupConfig): void {
    const setupConfigPath = path.join(__dirname, '../setup/setup-config.json');
    fs.writeFileSync(setupConfigPath, JSON.stringify(config, null, 2));
  }
}
