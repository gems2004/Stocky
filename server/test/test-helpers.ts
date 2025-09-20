import { Injectable, CanActivate } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import {
  AppStateService,
  AppState,
} from '../src/dynamic-database/app-state.service';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

/**
 * Test version of AppReadyGuard that always allows access
 */
export class TestAppReadyGuard implements CanActivate {
  canActivate(): boolean {
    // Always allow access in test environment
    return true;
  }
}

/**
 * Test version of AppStateService that is always in READY state
 */
@Injectable()
export class TestAppStateService {
  private state: AppState = AppState.READY;
  private errorMessage: string | null = null;

  getState(): AppState {
    return this.state;
  }

  setState(state: AppState, errorMessage?: string): void {
    this.state = state;
    if (errorMessage) {
      this.errorMessage = errorMessage;
    } else if (state !== AppState.ERROR) {
      this.errorMessage = null;
    }
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
  }

  isReady(): boolean {
    return this.state === AppState.READY;
  }

  isSetupRequired(): boolean {
    return this.state === AppState.SETUP_REQUIRED;
  }
}

/**
 * Helper function to create a mock AppReadyGuard
 */
export const createAppReadyGuardMock = () => ({
  canActivate: jest.fn(() => true),
});

/**
 * Helper function to create a unique database name for each test
 */
export function generateUniqueDatabaseName(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `stocky_test_${timestamp}_${randomSuffix}`;
}

/**
 * Helper function to create a test database
 */
export async function createTestDatabase(databaseName: string): Promise<void> {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'george',
    password: 'zaq321xsw',
    database: 'postgres', // Connect to default postgres database to create new database
  });

  try {
    await client.connect();
    // Terminate any existing connections to the database
    await client.query(
      `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
    `,
      [databaseName],
    );
    // Drop database if exists
    await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    // Create new database
    await client.query(`CREATE DATABASE "${databaseName}"`);
  } finally {
    await client.end();
  }
}

/**
 * Helper function to drop a test database
 */
export async function dropTestDatabase(databaseName: string): Promise<void> {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'george',
    password: 'zaq321xsw',
    database: 'postgres', // Connect to default postgres database to drop test database
  });

  try {
    await client.connect();
    // Terminate any existing connections to the database
    await client.query(
      `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid()
    `,
      [databaseName],
    );
    // Drop database
    await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
  } finally {
    await client.end();
  }
}

/**
 * Helper function to initialize the test database with setup service
 */
export async function initializeTestApp(
  testDatabaseName: string,
): Promise<INestApplication> {
  // Create a unique database for this test
  await createTestDatabase(testDatabaseName);

  // Create a test database configuration with synchronization enabled
  const testDatabaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'george',
    password: 'zaq321xsw',
    database: testDatabaseName,
    synchronize: true, // Enable synchronization for tests
    dropSchema: true, // drop schema after each run
    entities: [__dirname + '/../src/**/*entity{.ts,.js}'],
  } as TypeOrmModuleOptions;

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      // Use a separate test database for e2e tests
      TypeOrmModule.forRoot(testDatabaseConfig),
      AppModule,
    ],
  })
    // Override the AppReadyGuard to allow all requests in tests
    .overrideGuard(TestAppReadyGuard)
    .useValue(createAppReadyGuardMock())
    // Override the AppStateService to always be in READY state
    .overrideProvider(AppStateService)
    .useClass(TestAppStateService)
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

/**
 * Helper function to initialize the test database with setup service
 */
export async function setupTestDatabase(
  app: INestApplication,
  testDatabaseName: string,
) {
  const databaseConfigData = {
    type: 'postgres',
    host: 'localhost',
    port: '5432',
    username: 'george',
    password: 'zaq321xsw',
    database: testDatabaseName,
    ssl: false,
  };

  // Configure the database through the setup service
  await request(app.getHttpServer())
    .post('/setup/database')
    .send(databaseConfigData)
    .expect(200);

  // Configure shop information
  const shopInfoData = {
    name: 'Test Shop',
    address: '123 Test Street',
    phone: '123-456-7890',
    email: 'test@example.com',
    currency: 'USD',
    businessType: 'retail',
    website: 'https://testshop.com',
  };

  await request(app.getHttpServer())
    .post('/setup/shop')
    .send(shopInfoData)
    .expect(200);

  // Complete the setup
  await request(app.getHttpServer()).post('/setup/complete').expect(200);
}

/**
 * Helper function to create setup config file directly
 */
export function createTestSetupConfig(
  testDatabaseName: string = 'stocky_test',
) {
  const setupConfigPath = path.join(
    __dirname,
    '../src/setup/setup-config.json',
  );

  const setupConfig = {
    isDatabaseConfigured: true,
    isShopConfigured: true,
    isSetupComplete: true,
    databaseConfig: {
      type: 'postgres',
      host: 'localhost',
      port: '5432',
      username: 'george',
      password: 'zaq321xsw',
      database: testDatabaseName,
      ssl: false,
    },
    shopInfo: {
      name: 'Test Shop',
      address: '123 Test Street',
      phone: '123-456-7890',
      email: 'test@example.com',
      currency: 'USD',
      businessType: 'retail',
      website: 'https://testshop.com',
    },
  };

  // Ensure the directory exists
  const setupDir = path.dirname(setupConfigPath);
  if (!fs.existsSync(setupDir)) {
    fs.mkdirSync(setupDir, { recursive: true });
  }

  // Write the setup config file
  fs.writeFileSync(setupConfigPath, JSON.stringify(setupConfig, null, 2));

  return setupConfigPath;
}

/**
 * Helper function to clean up test setup config file
 */
export function cleanupTestSetupConfig() {
  const setupConfigPath = path.join(
    __dirname,
    '../src/setup/setup-config.json',
  );

  if (fs.existsSync(setupConfigPath)) {
    fs.unlinkSync(setupConfigPath);
  }
}
