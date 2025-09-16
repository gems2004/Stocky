import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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

  beforeAll(async () => {
    // Create a test database configuration with synchronization enabled
    const testDatabaseConfig: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'george',
      password: 'zaq321xsw',
      database: 'stocky_test', // Use a separate test database
      synchronize: true, // Enable synchronization for tests
      dropSchema: true, // drop schema after each run
      entities: [__dirname + '/../src/**/entity/*{.ts,.js}'],
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

    // Create user first
    await request(app.getHttpServer())
      .post('/users')
      .send(testUser)
      .expect(201);

    // Then login to get tokens
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password,
      })
      .expect(200);

    accessToken = loginResponse.body.data.tokens.accessToken;
    refreshToken = loginResponse.body.data.tokens.refreshToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users (POST)', () => {
    const newUser = {
      username: 'newtestuser',
      email: 'newtest@example.com',
      password: 'newpassword123',
      firstName: 'NewTest',
      lastName: 'User',
      role: 'CASHIER',
    };

    return request(app.getHttpServer())
      .post('/users')
      .send(newUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.username).toBe(newUser.username);
        expect(res.body.message).toBe('User created successfully');
      });
  });

  it('/users (POST) - duplicate user', () => {
    return request(app.getHttpServer())
      .post('/users')
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
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.username).toBe(testUser.username);
        expect(res.body.data.tokens).toBeDefined();
        expect(res.body.data.tokens.accessToken).toBeDefined();
        expect(res.body.data.tokens.refreshToken).toBeDefined();
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
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.username).toBe(testUser.username);
        expect(res.body.data.tokens).toBeDefined();
        expect(res.body.data.tokens.accessToken).toBeDefined();
        expect(res.body.data.tokens.refreshToken).toBeDefined();
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
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toBeDefined();
        expect(res.body.data.user.username).toBe(testUser.username);
        // Tokens should be empty for profile endpoint
        expect(res.body.data.tokens.accessToken).toBe('');
        expect(res.body.data.tokens.refreshToken).toBe('');
      });
  });
});
