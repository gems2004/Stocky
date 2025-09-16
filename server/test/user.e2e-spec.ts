import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let cashierAccessToken: string;

  // Test admin user data for authentication
  const testAdminUser = {
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'ADMIN',
  };

  // Test cashier user data for authentication
  const testCashierUser = {
    username: 'testcashier',
    email: 'testcashier@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'Cashier',
    role: 'CASHIER',
  };

  // Updated user data
  const updatedUserData = {
    username: 'updateduser',
    email: 'updated@example.com',
    firstName: 'Updated',
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

    // Create and login admin user to get access token
    await request(app.getHttpServer())
      .post('/users')
      .send(testAdminUser)
      .expect(201);

    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testAdminUser.username,
        password: testAdminUser.password,
      })
      .expect(200);

    adminAccessToken = adminLoginResponse.body.data.tokens.accessToken;

    // Create and login cashier user to get access token
    await request(app.getHttpServer())
      .post('/users')
      .send(testCashierUser)
      .expect(201);

    const cashierLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testCashierUser.username,
        password: testCashierUser.password,
      })
      .expect(200);

    cashierAccessToken = cashierLoginResponse.body.data.tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    const newUser = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'newpassword123',
      firstName: 'New',
      lastName: 'User',
      role: 'CASHIER',
    };

    it('should create a new user as admin', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.username).toBe(newUser.username);
          expect(res.body.data.email).toBe(newUser.email);
          expect(res.body.data.firstName).toBe(newUser.firstName);
          expect(res.body.data.lastName).toBe(newUser.lastName);
          expect(res.body.data.role).toBe(newUser.role);
          expect(res.body.message).toBe('User created successfully');
        });
    });

    it('should create a new user as cashier (public endpoint)', () => {
      const newUser2 = {
        username: 'newuser2',
        email: 'newuser2@example.com',
        password: 'newpassword123',
        firstName: 'New',
        lastName: 'User2',
        role: 'CASHIER',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(newUser2)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.username).toBe(newUser2.username);
          expect(res.body.data.email).toBe(newUser2.email);
          expect(res.body.data.firstName).toBe(newUser2.firstName);
          expect(res.body.data.lastName).toBe(newUser2.lastName);
          expect(res.body.data.role).toBe(newUser2.role);
          expect(res.body.message).toBe('User created successfully');
        });
    });

    it('should fail to create a user with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: 'incompleteuser',
          // Missing required fields
        })
        .expect(400);
    });

    it('should fail to create a user with duplicate username', async () => {
      // Create first user
      const user = {
        username: 'duplicateuser',
        email: 'dupe1@example.com',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        role: 'CASHIER',
      };

      await request(app.getHttpServer()).post('/users').send(user).expect(201);

      // Try to create another user with the same username
      return request(app.getHttpServer())
        .post('/users')
        .send({
          ...user,
          email: 'dupe2@example.com', // Different email
        })
        .expect(409);
    });
  });

  describe('/users (GET)', () => {
    it('should retrieve all users as admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.data).toBeDefined();
          expect(Array.isArray(res.body.data.data)).toBe(true);
          expect(res.body.data.total).toBeDefined();
          expect(res.body.data.page).toBeDefined();
          expect(res.body.data.limit).toBeDefined();
          expect(res.body.message).toBe('Users retrieved successfully');
        });
    });

    it('should retrieve all users as cashier', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.data).toBeDefined();
          expect(Array.isArray(res.body.data.data)).toBe(true);
          expect(res.body.data.total).toBeDefined();
          expect(res.body.data.page).toBeDefined();
          expect(res.body.data.limit).toBeDefined();
          expect(res.body.message).toBe('Users retrieved successfully');
        });
    });

    it('should fail to retrieve users without authentication', () => {
      return request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('/users/:id (GET)', () => {
    let createdUserId: number;

    beforeEach(async () => {
      // Create a user to retrieve
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: `retrievaluser${timestamp}`,
          email: `retrieval${timestamp}@example.com`,
          password: 'password123',
          firstName: 'Retrieval',
          lastName: 'User',
          role: 'CASHIER',
        })
        .expect(201);
      createdUserId = response.body.data.id;
    });

    it('should retrieve a specific user by ID as admin', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdUserId);
          expect(res.body.data.username).toContain('retrievaluser');
          expect(res.body.message).toBe('User retrieved successfully');
        });
    });

    it('should retrieve a specific user by ID as cashier', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdUserId);
          expect(res.body.data.username).toContain('retrievaluser');
          expect(res.body.message).toBe('User retrieved successfully');
        });
    });

    it('should fail to retrieve a user with invalid ID', () => {
      return request(app.getHttpServer())
        .get('/users/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });

    it('should fail to retrieve a non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail to retrieve a user without authentication', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(401);
    });
  });

  describe('/users/:id (PUT)', () => {
    let createdUserId: number;

    beforeEach(async () => {
      // Create a user to update
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: `updateuser${timestamp}`,
          email: `update${timestamp}@example.com`,
          password: 'password123',
          firstName: 'Update',
          lastName: 'User',
          role: 'CASHIER',
        })
        .expect(201);
      createdUserId = response.body.data.id;
    });

    it('should update a user as admin', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedUserData)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdUserId);
          expect(res.body.data.username).toBe(updatedUserData.username);
          expect(res.body.data.email).toBe(updatedUserData.email);
          expect(res.body.data.firstName).toBe(updatedUserData.firstName);
          expect(res.body.data.lastName).toBe(updatedUserData.lastName);
          expect(res.body.data.role).toBe(updatedUserData.role);
          expect(res.body.message).toBe('User updated successfully');
        });
    });

    it('should fail to update a user as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(updatedUserData)
        .expect(403);
    });

    it('should fail to update a user with invalid ID', () => {
      return request(app.getHttpServer())
        .put('/users/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedUserData)
        .expect(400);
    });

    it('should fail to update a non-existent user', () => {
      return request(app.getHttpServer())
        .put('/users/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedUserData)
        .expect(404);
    });

    it('should fail to update a user without authentication', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .send(updatedUserData)
        .expect(401);
    });
  });

  describe('/users/:id (DELETE)', () => {
    let createdUserId: number;

    beforeEach(async () => {
      // Create a user to delete
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: `deleteuser${timestamp}`,
          email: `delete${timestamp}@example.com`,
          password: 'password123',
          firstName: 'Delete',
          lastName: 'User',
          role: 'CASHIER',
        })
        .expect(201);
      createdUserId = response.body.data.id;
    });

    it('should delete a user as admin', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('User deleted successfully');
        });
    });

    it('should fail to delete a user as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to delete a user with invalid ID', () => {
      return request(app.getHttpServer())
        .delete('/users/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });

    it('should fail to delete a non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail to delete a user without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .expect(401);
    });
  });

  describe('/users/search (GET)', () => {
    beforeEach(async () => {
      // Create test users for search
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: `searchuser1${timestamp}`,
          email: `search1${timestamp}@example.com`,
          password: 'password123',
          firstName: 'Search',
          lastName: 'User1',
          role: 'CASHIER',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          username: `searchuser2${timestamp}`,
          email: `search2${timestamp}@example.com`,
          password: 'password123',
          firstName: 'Search',
          lastName: 'User2',
          role: 'CASHIER',
        })
        .expect(201);
    });

    it('should search users by query as admin', () => {
      return request(app.getHttpServer())
        .get('/users/search?query=Search')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
          expect(res.body.message).toBe('Users search completed successfully');
        });
    });

    it('should search users by query as cashier', () => {
      return request(app.getHttpServer())
        .get('/users/search?query=Search')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
          expect(res.body.message).toBe('Users search completed successfully');
        });
    });

    it('should return empty array for non-matching search', () => {
      return request(app.getHttpServer())
        .get('/users/search?query=NonExistentUser')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBe(0);
          expect(res.body.message).toBe('Users search completed successfully');
        });
    });

    it('should fail to search users without authentication', () => {
      return request(app.getHttpServer())
        .get('/users/search?query=Search')
        .expect(401);
    });

    it('should fail to search users with empty query', () => {
      return request(app.getHttpServer())
        .get('/users/search?query=')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });
  });
});
