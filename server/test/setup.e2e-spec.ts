import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseType } from '../src/setup/dto/database-config.dto';
import fs from 'fs';
import path from 'path';
describe('SetupController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Create a test database configuration with synchronization enabled
    const testDatabaseConfig: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      name: 'george',
      password: 'zaq321xsw',
      database: 'stocky_test_setup', // Use a separate test database
      synchronize: false, // Enable synchronization for tests
      dropSchema: true, // drop schema after each run
      entities: [__dirname + '/../src/**/*entity{.ts,.js}'],
    } as TypeOrmModuleOptions;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Use a separate test database for e2e tests
        TypeOrmModule.forRoot(testDatabaseConfig),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    try {
      const rootEnvProductionPath = path.join(
        __dirname,
        '../../.env.production',
      );
      if (fs.existsSync(rootEnvProductionPath)) {
        fs.unlinkSync(rootEnvProductionPath);
      }
      const setupConfigPath = path.join(
        __dirname,
        '../src/setup/setup-config.json',
      );
      if (fs.existsSync(setupConfigPath)) {
        fs.unlinkSync(setupConfigPath);
      }
    } catch (error) {
      console.warn('Failed to clean up test files:', error);
    }

    await app.close();
  });

  // Test data
  const databaseConfigData = {
    type: DatabaseType.POSTGRES,
    host: 'localhost',
    port: '5432',
    username: 'george',
    password: 'zaq321xsw',
    database: 'stocky_test_setup',
    ssl: false,
    tablePrefix: 'test_',
  };

  const databaseConfigDataWithoutPrefix = {
    type: DatabaseType.POSTGRES,
    host: 'localhost',
    port: '5432',
    username: 'george',
    password: 'zaq321xsw',
    database: 'stocky_test_setup',
    ssl: false,
  };

  const shopInfoData = {
    name: 'Test Shop',
    address: '123 Test Street',
    phone: '123-456-7890',
    email: 'test@example.com',
    currency: 'USD',
    businessType: 'retail',
    website: 'https://testshop.com',
  };

  describe('/setup/status (GET)', () => {
    it('should return setup status', () => {
      return request(app.getHttpServer())
        .get('/setup/status')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.isSetupComplete).toBeDefined();
          expect(typeof res.body.data.isSetupComplete).toBe('boolean');
        });
    });
  });

  describe('/setup/database (POST)', () => {
    it('should configure database', () => {
      return request(app.getHttpServer())
        .post('/setup/database')
        .send(databaseConfigData)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.isSetupComplete).toBeDefined();
          expect(typeof res.body.data.isSetupComplete).toBe('boolean');
          expect(res.body.message).toBe('Database configured successfully');
        });
    });

    it('should configure database without table prefix', () => {
      return request(app.getHttpServer())
        .post('/setup/database')
        .send(databaseConfigDataWithoutPrefix)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.isSetupComplete).toBeDefined();
          expect(typeof res.body.data.isSetupComplete).toBe('boolean');
          expect(res.body.message).toBe('Database configured successfully');
        });
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/setup/database')
        .send({
          type: DatabaseType.POSTGRES,
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('/setup/shop (POST)', () => {
    it('should configure shop information', () => {
      return request(app.getHttpServer())
        .post('/setup/shop')
        .send(shopInfoData)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.isSetupComplete).toBeDefined();
          expect(typeof res.body.data.isSetupComplete).toBe('boolean');
          expect(res.body.message).toBe(
            'Shop information configured successfully',
          );
        });
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/setup/shop')
        .send({
          address: '123 Test Street',
          phone: '123-456-7890',
          // Missing required name and currency fields
        })
        .expect(400);
    });
  });

  describe('/setup/complete (POST)', () => {
    it('should complete setup process', () => {
      // First configure all required steps
      return request(app.getHttpServer())
        .post('/setup/database')
        .send(databaseConfigData)
        .expect(200)
        .then(() => {
          return request(app.getHttpServer())
            .post('/setup/shop')
            .send(shopInfoData)
            .expect(200);
        })
        .then(() => {
          return request(app.getHttpServer())
            .post('/setup/complete')
            .expect(200)
            .expect((res) => {
              expect(res.body.success).toBe(true);
              expect(res.body.data).toBeDefined();
              expect(res.body.data.isSetupComplete).toBe(true);
              expect(res.body.message).toBe(
                'Setup process completed successfully',
              );
            });
        });
    });
  });
});
