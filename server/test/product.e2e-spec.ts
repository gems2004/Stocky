import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../src/database/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  // Test user data for authentication
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
  };

  // Test product data
  const testProduct = {
    name: 'Test Product',
    description: 'A test product',
    price: 99.99,
    cost: 50.0,
    categoryId: 1,
    supplierId: 1,
    barcode: '1234567890123',
    sku: 'TEST-SKU-001',
    minStockLevel: 10,
  };

  const updatedProduct = {
    name: 'Updated Test Product',
    description: 'An updated test product',
    price: 149.99,
    cost: 75.0,
    categoryId: 1,
    supplierId: 2,
    barcode: '1234567890124',
    sku: 'TEST-SKU-002',
    minStockLevel: 15,
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

    // Register and login a test user to get access token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password,
      })
      .expect(200);

    accessToken = loginResponse.body.data.tokens.accessToken;

    // Create a test category for products
    await request(app.getHttpServer())
      .post('/category')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Category',
        description: 'A test category for products',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/products (POST)', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testProduct)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe(testProduct.name);
          expect(res.body.data.price).toBe(testProduct.price);
          expect(res.body.data.barcode).toBe(testProduct.barcode);
          expect(res.body.data.sku).toBe(testProduct.sku);
          expect(res.body.message).toBe('Product created successfully');
        });
    });

    it('should fail to create a product without authentication', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send(testProduct)
        .expect(401);
    });

    it('should fail to create a product with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: 'Product without name and price',
        })
        .expect(400);
    });

    it('should fail to create a product with negative price', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testProduct,
          name: 'Negative Price Product',
          barcode: '1234567890125',
          sku: 'TEST-SKU-003',
          price: -10,
        })
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    it('should retrieve all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data.data)).toBe(true);
          expect(res.body.data.total).toBeDefined();
          expect(res.body.data.page).toBeDefined();
          expect(res.body.data.limit).toBeDefined();
          expect(res.body.message).toBe('Products retrieved successfully');
        });
    });

    it('should fail to retrieve products without authentication', () => {
      return request(app.getHttpServer()).get('/products').expect(401);
    });
  });

  describe('/products/:id (GET)', () => {
    let createdProductId: number;

    beforeEach(async () => {
      // Create a product to retrieve
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testProduct,
          name: 'Retrieval Test Product',
          barcode: `123456789050${timestamp % 1000}`,
          sku: `TEST-SKU-50${timestamp % 1000}`,
        })
        .expect(201);
      createdProductId = response.body.data.id;
    });

    it('should retrieve a specific product by ID', () => {
      return request(app.getHttpServer())
        .get(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdProductId);
          expect(res.body.data.name).toBe('Retrieval Test Product');
          expect(res.body.message).toBe('Product retrieved successfully');
        });
    });

    it('should fail to retrieve a product with invalid ID', () => {
      return request(app.getHttpServer())
        .get('/products/invalid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should fail to retrieve a non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to retrieve a product without authentication', () => {
      return request(app.getHttpServer())
        .get(`/products/${createdProductId}`)
        .expect(401);
    });
  });

  describe('/products/:id (PUT)', () => {
    let createdProductId: number;

    beforeEach(async () => {
      // Create a product to update
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testProduct,
          name: 'Update Test Product',
          barcode: `123456789060${timestamp % 1000}`,
          sku: `TEST-SKU-60${timestamp % 1000}`,
        })
        .expect(201);
      createdProductId = response.body.data.id;
    });

    it('should update a product', () => {
      return request(app.getHttpServer())
        .put(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedProduct)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdProductId);
          expect(res.body.data.name).toBe(updatedProduct.name);
          expect(res.body.data.price).toBe(updatedProduct.price);
          expect(res.body.data.barcode).toBe(updatedProduct.barcode);
          expect(res.body.data.sku).toBe(updatedProduct.sku);
          expect(res.body.message).toBe('Product updated successfully');
        });
    });

    it('should fail to update a product with invalid ID', () => {
      return request(app.getHttpServer())
        .put('/products/invalid')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedProduct)
        .expect(400);
    });

    it('should fail to update a non-existent product', () => {
      return request(app.getHttpServer())
        .put('/products/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updatedProduct)
        .expect(404);
    });

    it('should fail to update a product without authentication', () => {
      return request(app.getHttpServer())
        .put(`/products/${createdProductId}`)
        .send(updatedProduct)
        .expect(401);
    });

    it('should fail to update a product with negative price', () => {
      return request(app.getHttpServer())
        .put(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...updatedProduct,
          price: -10,
          barcode: '1234567890128',
          sku: 'TEST-SKU-006',
        })
        .expect(400);
    });
  });

  describe('/products/:id (DELETE)', () => {
    let createdProductId: number;

    beforeEach(async () => {
      // Create a product to delete
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testProduct,
          name: 'Delete Test Product',
          barcode: `123456789070${timestamp % 1000}`,
          sku: `TEST-SKU-70${timestamp % 1000}`,
        })
        .expect(201);
      createdProductId = response.body.data.id;
    });

    it('should delete a product', () => {
      return request(app.getHttpServer())
        .delete(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Product deleted successfully');
        });
    });

    it('should fail to delete a product with invalid ID', () => {
      return request(app.getHttpServer())
        .delete('/products/invalid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should fail to delete a non-existent product', () => {
      return request(app.getHttpServer())
        .delete('/products/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should fail to delete a product without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/products/${createdProductId}`)
        .expect(401);
    });
  });

  describe('/products/search (GET)', () => {
    beforeEach(async () => {
      // Create test products for search
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testProduct,
          name: 'Search Test Product 1',
          description: 'First search test product',
          barcode: `123456789080${timestamp % 1000}`,
          sku: `SEARCH-SKU-80${timestamp % 1000}`,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...testProduct,
          name: 'Search Test Product 2',
          description: 'Second search test product',
          barcode: `123456789081${timestamp % 1000}`,
          sku: `SEARCH-SKU-81${timestamp % 1000}`,
        })
        .expect(201);
    });

    it('should search products by query', () => {
      return request(app.getHttpServer())
        .get('/products/search?query=Search')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
          expect(res.body.message).toBe(
            'Products search completed successfully',
          );
        });
    });

    it('should return empty array for non-matching search', () => {
      return request(app.getHttpServer())
        .get('/products/search?query=NonExistentProduct')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBe(0);
          expect(res.body.message).toBe(
            'Products search completed successfully',
          );
        });
    });

    it('should fail to search products without authentication', () => {
      return request(app.getHttpServer())
        .get('/products/search?query=Search')
        .expect(401);
    });

    it('should fail to search products with empty query', () => {
      return request(app.getHttpServer())
        .get('/products/search?query=')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });
});
