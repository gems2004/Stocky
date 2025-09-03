import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../src/database/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('InventoryController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let cashierAccessToken: string;
  let testProductId: number;

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

  // Test product data
  const testProduct = {
    name: 'Test Product',
    description: 'A test product',
    price: 99.99,
    cost: 50.0,
    barcode: '1234567890123',
    sku: 'TEST-SKU-001',
  };

  // Test inventory adjustment data
  const testInventoryAdjustment = {
    productId: 0, // Will be set in beforeAll
    changeAmount: 10,
    reason: 'Stock received',
  };

  const negativeInventoryAdjustment = {
    productId: 0, // Will be set in beforeAll
    changeAmount: -5,
    reason: 'Stock sold',
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

    // Create a test category for products
    await request(app.getHttpServer())
      .post('/category')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Test Category',
        description: 'A test category for products',
      })
      .expect(201);

    // Create test suppliers for products
    await request(app.getHttpServer())
      .post('/supplier')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Test Supplier',
        contact_person: 'Supplier Contact',
        email: 'supplier@example.com',
        phone: '123-456-7890',
        address: '123 Supplier St, City, Country',
      })
      .expect(201);

    // Create a test product for inventory adjustments
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        cost: 50.0,
        categoryId: 1,
        supplierId: 1,
        barcode: '1234567890123',
        sku: 'TEST-SKU-001',
      })
      .expect(201);

    testProductId = productResponse.body.data.id;

    // Set initial stock quantity by adjusting inventory
    await request(app.getHttpServer())
      .post('/inventory/adjust')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        productId: testProductId,
        changeAmount: 50,
        reason: 'Initial stock',
      })
      .expect(200);

    // Update productId in test data
    testInventoryAdjustment.productId = testProductId;
    negativeInventoryAdjustment.productId = testProductId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/inventory/adjust (POST)', () => {
    it('should adjust inventory as admin', () => {
      return request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(testInventoryAdjustment)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.product_id).toBe(testProductId);
          expect(res.body.data.change_amount).toBe(
            testInventoryAdjustment.changeAmount,
          );
          expect(res.body.data.reason).toBe(testInventoryAdjustment.reason);
          expect(res.body.message).toBe('Inventory adjusted successfully');
        });
    });

    it('should fail to adjust inventory as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(testInventoryAdjustment)
        .expect(403);
    });

    it('should fail to adjust inventory without authentication', () => {
      return request(app.getHttpServer())
        .post('/inventory/adjust')
        .send(testInventoryAdjustment)
        .expect(401);
    });

    it('should fail to adjust inventory with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          // Missing required fields
          changeAmount: 10,
        })
        .expect(400);
    });

    it('should fail to adjust inventory for non-existent product', () => {
      return request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          productId: 999999,
          changeAmount: 10,
          reason: 'Test adjustment',
        })
        .expect(404);
    });
  });

  describe('/inventory/logs (GET)', () => {
    it('should retrieve inventory logs as admin', () => {
      return request(app.getHttpServer())
        .get('/inventory/logs')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.message).toBe(
            'Inventory logs retrieved successfully',
          );
        });
    });

    it('should fail to retrieve inventory logs as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .get('/inventory/logs')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to retrieve inventory logs without authentication', () => {
      return request(app.getHttpServer()).get('/inventory/logs').expect(401);
    });
  });

  describe('/inventory/low-stock (GET)', () => {
    it('should retrieve low stock products', () => {
      return request(app.getHttpServer())
        .get('/inventory/low-stock?threshold=30')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.message).toBe(
            'Low stock products retrieved successfully',
          );
        });
    });

    it('should retrieve low stock products with default threshold', () => {
      return request(app.getHttpServer())
        .get('/inventory/low-stock')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.message).toBe(
            'Low stock products retrieved successfully',
          );
        });
    });

    it('should fail to retrieve low stock products without authentication', () => {
      return request(app.getHttpServer())
        .get('/inventory/low-stock')
        .expect(401);
    });
  });
});
