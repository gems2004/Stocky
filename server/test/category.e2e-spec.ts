import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../src/database/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('CategoryController (e2e)', () => {
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

  // Test category data
  const testCategory = {
    name: 'Test Category',
    description: 'A test category',
  };

  const updatedCategory = {
    name: 'Updated Test Category',
    description: 'An updated test category',
  };

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

  describe('/category (POST)', () => {
    it('should create a new category as admin', () => {
      return request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(testCategory)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe(testCategory.name);
          expect(res.body.data.description).toBe(testCategory.description);
          expect(res.body.message).toBe('Category created successfully');
        });
    });

    it('should fail to create a category as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(testCategory)
        .expect(403);
    });

    it('should fail to create a category without authentication', () => {
      return request(app.getHttpServer())
        .post('/category')
        .send(testCategory)
        .expect(401);
    });

    it('should fail to create a category with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .set('Content-Type', 'application/json')
        .send({
          description: 'Category without name',
        })
        .expect(400);
    });

    it('should fail to create a category with duplicate name', async () => {
      // Create first category
      await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Duplicate Test Category',
          description: 'First category',
        })
        .expect(201);

      // Try to create another category with the same name
      return request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Duplicate Test Category',
          description: 'Second category with same name',
        })
        .expect(409);
    });
  });

  describe('/category (GET)', () => {
    beforeEach(async () => {
      // Create test categories
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Test Category 1 ${timestamp}`,
          description: 'First test category',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Test Category 2 ${timestamp}`,
          description: 'Second test category',
        })
        .expect(201);
    });

    it('should retrieve all categories', () => {
      return request(app.getHttpServer())
        .get('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
          expect(res.body.message).toBe('Categories retrieved successfully');
        });
    });
  });

  describe('/category/:id (PUT)', () => {
    let createdCategoryId: number;

    beforeEach(async () => {
      // Create a category to update
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Update Test Category ${timestamp}`,
          description: 'Category to update',
        })
        .expect(201);
      createdCategoryId = response.body.data.id;
    });

    it('should update a category as admin', () => {
      return request(app.getHttpServer())
        .put(`/category/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedCategory)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdCategoryId);
          expect(res.body.data.name).toBe(updatedCategory.name);
          expect(res.body.data.description).toBe(updatedCategory.description);
          expect(res.body.message).toBe('Category updated successfully');
        });
    });

    it('should fail to update a category as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .put(`/category/${createdCategoryId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(updatedCategory)
        .expect(403);
    });

    it('should fail to update a category with invalid ID', () => {
      return request(app.getHttpServer())
        .put('/category/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedCategory)
        .expect(400);
    });

    it('should fail to update a non-existent category', () => {
      return request(app.getHttpServer())
        .put('/category/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedCategory)
        .expect(404);
    });

    it('should fail to update a category without authentication', () => {
      return request(app.getHttpServer())
        .put(`/category/${createdCategoryId}`)
        .send(updatedCategory)
        .expect(401);
    });
  });

  describe('/category/:id (DELETE)', () => {
    let createdCategoryId: number;

    beforeEach(async () => {
      // Create a category to delete
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Delete Test Category ${timestamp}`,
          description: 'Category to delete',
        })
        .expect(201);
      createdCategoryId = response.body.data.id;
    });

    it('should delete a category as admin', () => {
      return request(app.getHttpServer())
        .delete(`/category/${createdCategoryId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Category deleted successfully');
        });
    });

    it('should fail to delete a category as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .delete(`/category/${createdCategoryId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to delete a category with invalid ID', () => {
      return request(app.getHttpServer())
        .delete('/category/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });

    it('should fail to delete a non-existent category', () => {
      return request(app.getHttpServer())
        .delete('/category/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail to delete a category without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/category/${createdCategoryId}`)
        .expect(401);
    });
  });
});
