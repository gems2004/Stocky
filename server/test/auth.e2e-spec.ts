import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../src/database/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Create a test database configuration with synchronization enabled
    const testDatabaseConfig: TypeOrmModuleOptions = {
      ...databaseConfig,
      database: 'stocky_test', // Use a separate test database
      synchronize: true, // Enable synchronization for tests
      dropSchema: true, // drop schema after each run
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
    await app.close();
  });

  // Store tokens for later use in tests
  let accessToken: string;
  let refreshToken: string;
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'CASHIER',
  };

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(testUser.username);
        expect(res.body.tokens).toBeDefined();
        expect(res.body.tokens.accessToken).toBeDefined();
        expect(res.body.tokens.refreshToken).toBeDefined();

        // Store tokens for later use
        accessToken = res.body.tokens.accessToken;
        refreshToken = res.body.tokens.refreshToken;
      });
  });

  it('/auth/register (POST) - duplicate user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409); // Conflict
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(testUser.username);
        expect(res.body.tokens).toBeDefined();
        expect(res.body.tokens.accessToken).toBeDefined();
        expect(res.body.tokens.refreshToken).toBeDefined();
      });
  });

  it('/auth/login (POST) - wrong credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testUser.username,
        password: 'wrongpassword',
      })
      .expect(401); // Unauthorized
  });

  it('/auth/refresh (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: refreshToken,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(testUser.username);
        expect(res.body.tokens).toBeDefined();
        expect(res.body.tokens.accessToken).toBeDefined();
        expect(res.body.tokens.refreshToken).toBeDefined();
      });
  });

  it('/auth/refresh (POST) - invalid token', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: 'invalidtoken',
      })
      .expect(401); // Unauthorized
  });

  it('/auth/profile (GET) - without token', () => {
    return request(app.getHttpServer()).get('/auth/profile').expect(401); // Unauthorized
  });

  it('/auth/profile (GET) - with token', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe(testUser.username);
        // Tokens should be empty for profile endpoint
        expect(res.body.tokens.accessToken).toBe('');
        expect(res.body.tokens.refreshToken).toBe('');
      });
  });
});
