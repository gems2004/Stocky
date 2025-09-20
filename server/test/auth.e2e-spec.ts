import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  initializeTestApp,
  generateUniqueDatabaseName,
  createTestDatabase,
  dropTestDatabase,
  createTestSetupConfig,
  cleanupTestSetupConfig,
} from './test-helpers';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let databaseName: string;

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
    // Generate a unique database name for this test
    databaseName = generateUniqueDatabaseName();
    
    // Create the test database
    await createTestDatabase(databaseName);
    
    // Create the setup config file directly
    createTestSetupConfig(databaseName);

    // Initialize the app with the unique database
    app = await initializeTestApp(databaseName);

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
    // Clean up the setup config file
    cleanupTestSetupConfig();
    
    // Drop the test database
    if (databaseName) {
      await dropTestDatabase(databaseName);
    }
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

  afterAll(async () => {
    await app.close();
    // Clean up the setup config file
    cleanupTestSetupConfig();
    
    // Drop the test database
    if (databaseName) {
      await dropTestDatabase(databaseName);
    }
  });

});
