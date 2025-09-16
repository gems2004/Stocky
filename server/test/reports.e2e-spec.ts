import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;
  let adminAccessToken: string;
  let cashierAccessToken: string;
  let testProductId: number;
  let testTransactionId: number;

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

    // Create test customers for transactions
    await request(app.getHttpServer())
      .post('/customer')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Main St, City, Country',
        loyalty_points: 100,
      })
      .expect(201);

    // Create a test product for transactions
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

    // Update the product to have stock quantity
    await request(app.getHttpServer())
      .put(`/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        stockQuantity: 100, // Set stock quantity to 100
      })
      .expect(200);

    // Create a transaction to have data for reports
    const transactionResponse = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${cashierAccessToken}`)
      .send({
        customerId: 1,
        userId: 2, // testCashierUser id will be 2
        totalAmount: 204.98, // 2 * 99.99 + 10.0 - 5.0 (quantity * unitPrice + tax - discount)
        taxAmount: 10.0,
        discountAmount: 5.0,
        paymentMethod: 'cash',
        status: 'completed',
        items: [
          {
            productId: testProductId,
            quantity: 2,
            unitPrice: 99.99,
          },
        ],
      })
      .expect(201);

    testTransactionId = transactionResponse.body.data.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/reports/sales-summary (GET)', () => {
    it('should retrieve sales summary as admin', () => {
      return request(app.getHttpServer())
        .get('/reports/sales-summary')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.total_sales).toBeDefined();
          expect(res.body.data.total_transactions).toBeDefined();
          expect(res.body.data.average_transaction_value).toBeDefined();
          expect(res.body.data.date_range).toBeDefined();
          expect(res.body.data.date_range.start).toBeDefined();
          expect(res.body.data.date_range.end).toBeDefined();
          expect(res.body.message).toBe('Sales summary retrieved successfully');
        });
    });

    it('should retrieve sales summary with date range', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      return request(app.getHttpServer())
        .get(
          `/reports/sales-summary?startDate=${startDate}&endDate=${endDate}`,
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.total_sales).toBeDefined();
          expect(res.body.data.total_transactions).toBeDefined();
          expect(res.body.data.average_transaction_value).toBeDefined();
          expect(res.body.data.date_range).toBeDefined();
          expect(res.body.data.date_range.start).toBeDefined();
          expect(res.body.data.date_range.end).toBeDefined();
          expect(res.body.message).toBe('Sales summary retrieved successfully');
        });
    });

    it('should fail to retrieve sales summary as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .get('/reports/sales-summary')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to retrieve sales summary without authentication', () => {
      return request(app.getHttpServer())
        .get('/reports/sales-summary')
        .expect(401);
    });
  });

  describe('/reports/top-products (GET)', () => {
    it('should retrieve top products as admin', () => {
      return request(app.getHttpServer())
        .get('/reports/top-products?limit=10')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.products).toBeDefined();
          expect(Array.isArray(res.body.data.products)).toBe(true);
          expect(res.body.data.date_range).toBeDefined();
          expect(res.body.data.date_range.start).toBeDefined();
          expect(res.body.data.date_range.end).toBeDefined();
          expect(res.body.message).toBe('Top products retrieved successfully');
        });
    });

    it('should retrieve top products with limit', () => {
      return request(app.getHttpServer())
        .get('/reports/top-products?limit=5')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.products).toBeDefined();
          expect(Array.isArray(res.body.data.products)).toBe(true);
          expect(res.body.data.products.length).toBeLessThanOrEqual(5);
          expect(res.body.data.date_range).toBeDefined();
          expect(res.body.data.date_range.start).toBeDefined();
          expect(res.body.data.date_range.end).toBeDefined();
          expect(res.body.message).toBe('Top products retrieved successfully');
        });
    });

    it('should retrieve top products with date range', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      return request(app.getHttpServer())
        .get(
          `/reports/top-products?limit=10&startDate=${startDate}&endDate=${endDate}`,
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.products).toBeDefined();
          expect(Array.isArray(res.body.data.products)).toBe(true);
          expect(res.body.data.date_range).toBeDefined();
          expect(res.body.data.date_range.start).toBeDefined();
          expect(res.body.data.date_range.end).toBeDefined();
          expect(res.body.message).toBe('Top products retrieved successfully');
        });
    });

    it('should fail to retrieve top products as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .get('/reports/top-products')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to retrieve top products without authentication', () => {
      return request(app.getHttpServer())
        .get('/reports/top-products')
        .expect(401);
    });
  });

  describe('/reports/profit-margin (GET)', () => {
    it('should retrieve profit margin report as admin', () => {
      return request(app.getHttpServer())
        .get('/reports/profit-margin')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.products).toBeDefined();
          expect(Array.isArray(res.body.data.products)).toBe(true);
          expect(res.body.data.overall_profit_margin_percentage).toBeDefined();
          expect(res.body.data.date_range).toBeDefined();
          expect(res.body.data.date_range.start).toBeDefined();
          expect(res.body.data.date_range.end).toBeDefined();
          expect(res.body.message).toBe(
            'Profit margin report retrieved successfully',
          );
        });
    });

    it('should retrieve profit margin report with date range', () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      return request(app.getHttpServer())
        .get(
          `/reports/profit-margin?startDate=${startDate}&endDate=${endDate}`,
        )
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.products).toBeDefined();
          expect(Array.isArray(res.body.data.products)).toBe(true);
          expect(res.body.data.overall_profit_margin_percentage).toBeDefined();
          expect(res.body.data.date_range).toBeDefined();
          expect(res.body.data.date_range.start).toBeDefined();
          expect(res.body.data.date_range.end).toBeDefined();
          expect(res.body.message).toBe(
            'Profit margin report retrieved successfully',
          );
        });
    });

    it('should fail to retrieve profit margin report as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .get('/reports/profit-margin')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to retrieve profit margin report without authentication', () => {
      return request(app.getHttpServer())
        .get('/reports/profit-margin')
        .expect(401);
    });
  });
});