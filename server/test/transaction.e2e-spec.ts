import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../src/database/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('TransactionController (e2e)', () => {
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

  // Test transaction data
  const testTransaction = {
    customerId: 1,
    userId: 0, // Will be set in beforeAll
    totalAmount: 204.98, // 2 * 99.99 + 10.0 - 5.0 (quantity * unitPrice + tax - discount)
    taxAmount: 10.0,
    discountAmount: 5.0,
    paymentMethod: 'cash',
    status: 'completed',
    items: [
      {
        productId: 0, // Will be set in beforeAll
        quantity: 2,
        unitPrice: 99.99,
      },
    ],
  };

  const updatedTransaction = {
    customerId: 2,
    userId: 0, // Will be set in beforeAll
    totalAmount: 314.97, // 3 * 99.99 + 15.0 - 0 (quantity * unitPrice + tax - discount)
    taxAmount: 15.0,
    discountAmount: 0,
    paymentMethod: 'card',
    status: 'completed',
    items: [
      {
        productId: 0, // Will be set in beforeAll
        quantity: 3,
        unitPrice: 99.99,
      },
    ],
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

    // Update userId in test data
    testTransaction.userId = 2; // testCashierUser id will be 2
    testTransaction.items[0].productId = testProductId;

    updatedTransaction.userId = 2;
    updatedTransaction.items[0].productId = testProductId;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/transactions (POST)', () => {
    it('should create a new transaction as cashier', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(testTransaction)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.totalAmount).toBe(testTransaction.totalAmount);
          expect(res.body.data.taxAmount).toBe(testTransaction.taxAmount);
          expect(res.body.data.discountAmount).toBe(
            testTransaction.discountAmount,
          );
          expect(res.body.data.paymentMethod).toBe(
            testTransaction.paymentMethod,
          );
          expect(res.body.data.status).toBe(testTransaction.status);
          expect(res.body.data.transactionItems).toBeDefined();
          expect(res.body.data.transactionItems.length).toBe(1);
          expect(res.body.data.transactionItems[0].productId).toBe(
            testProductId,
          );
          expect(res.body.data.transactionItems[0].quantity).toBe(
            testTransaction.items[0].quantity,
          );
          expect(res.body.data.transactionItems[0].unitPrice).toBe(
            testTransaction.items[0].unitPrice,
          );
          expect(res.body.message).toBe('Transaction created successfully');
        });
    });

    it('should create a new transaction as admin', () => {
      const transactionData = {
        ...testTransaction,
        items: [
          {
            productId: testProductId,
            quantity: 1,
            unitPrice: 99.99,
          },
        ],
        totalAmount: 99.99,
        taxAmount: 0,
        discountAmount: 0,
      };

      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(transactionData)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.totalAmount).toBe(transactionData.totalAmount);
          expect(res.body.message).toBe('Transaction created successfully');
        });
    });

    it('should fail to create a transaction without authentication', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .send(testTransaction)
        .expect(401);
    });

    it('should fail to create a transaction with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send({
          // Missing required fields
          totalAmount: 100,
        })
        .expect(400);
    });

    it('should fail to create a transaction with invalid product ID', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send({
          ...testTransaction,
          items: [
            {
              productId: 999999, // Invalid product ID
              quantity: 1,
              unitPrice: 99.99,
            },
          ],
        })
        .expect(404);
    });

    it('should fail to create a transaction with insufficient stock', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send({
          ...testTransaction,
          items: [
            {
              productId: testProductId,
              quantity: 999, // More than available stock
              unitPrice: 99.99,
            },
          ],
        })
        .expect(400);
    });

    it('should fail to create a transaction with negative quantity', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send({
          ...testTransaction,
          items: [
            {
              productId: testProductId,
              quantity: -1, // Negative quantity
              unitPrice: 99.99,
            },
          ],
        })
        .expect(400);
    });
  });

  describe('/transactions (GET)', () => {
    it('should retrieve all transactions as admin', () => {
      return request(app.getHttpServer())
        .get('/transactions')
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
          expect(res.body.message).toBe('Transactions retrieved successfully');
        });
    });

    it('should retrieve all transactions as cashier', () => {
      return request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.data).toBeDefined();
          expect(Array.isArray(res.body.data.data)).toBe(true);
          expect(res.body.message).toBe('Transactions retrieved successfully');
        });
    });

    it('should fail to retrieve transactions without authentication', () => {
      return request(app.getHttpServer()).get('/transactions').expect(401);
    });
  });

  describe('/transactions/:id (GET)', () => {
    let createdTransactionId: number;

    beforeEach(async () => {
      // Create a transaction to retrieve
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send({
          ...testTransaction,
          items: [
            {
              productId: testProductId,
              quantity: 1,
              unitPrice: 99.99,
            },
          ],
          totalAmount: 99.99,
        })
        .expect(201);
      createdTransactionId = response.body.data.id;
    });

    it('should retrieve a specific transaction by ID as admin', () => {
      return request(app.getHttpServer())
        .get(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdTransactionId);
          expect(res.body.message).toBe('Transaction retrieved successfully');
        });
    });

    it('should retrieve a specific transaction by ID as cashier', () => {
      return request(app.getHttpServer())
        .get(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdTransactionId);
          expect(res.body.message).toBe('Transaction retrieved successfully');
        });
    });

    it('should fail to retrieve a transaction with invalid ID', () => {
      return request(app.getHttpServer())
        .get('/transactions/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });

    it('should fail to retrieve a non-existent transaction', () => {
      return request(app.getHttpServer())
        .get('/transactions/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail to retrieve a transaction without authentication', () => {
      return request(app.getHttpServer())
        .get(`/transactions/${createdTransactionId}`)
        .expect(401);
    });
  });

  describe('/transactions/:id (PUT)', () => {
    let createdTransactionId: number;

    beforeEach(async () => {
      // Create a transaction to update
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send({
          ...testTransaction,
          items: [
            {
              productId: testProductId,
              quantity: 1,
              unitPrice: 99.99,
            },
          ],
          totalAmount: 99.99,
        })
        .expect(201);
      createdTransactionId = response.body.data.id;
    });

    it('should update a transaction as admin', () => {
      return request(app.getHttpServer())
        .put(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedTransaction)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdTransactionId);
          expect(res.body.data.customerId).toBe(updatedTransaction.customerId);
          expect(res.body.data.totalAmount).toBe(
            updatedTransaction.totalAmount,
          );
          expect(res.body.data.paymentMethod).toBe(
            updatedTransaction.paymentMethod,
          );
          expect(res.body.data.transactionItems).toBeDefined();
          expect(res.body.data.transactionItems.length).toBe(1);
          expect(res.body.data.transactionItems[0].quantity).toBe(
            updatedTransaction.items[0].quantity,
          );
          expect(res.body.message).toBe('Transaction updated successfully');
        });
    });

    it('should fail to update a transaction as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .put(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(updatedTransaction)
        .expect(403);
    });

    it('should fail to update a transaction with invalid ID', () => {
      return request(app.getHttpServer())
        .put('/transactions/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedTransaction)
        .expect(400);
    });

    it('should fail to update a non-existent transaction', () => {
      return request(app.getHttpServer())
        .put('/transactions/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedTransaction)
        .expect(404);
    });

    it('should fail to update a transaction without authentication', () => {
      return request(app.getHttpServer())
        .put(`/transactions/${createdTransactionId}`)
        .send(updatedTransaction)
        .expect(401);
    });

    it('should fail to update a transaction with insufficient stock', () => {
      return request(app.getHttpServer())
        .put(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          ...updatedTransaction,
          items: [
            {
              productId: testProductId,
              quantity: 999, // More than available stock
              unitPrice: 99.99,
            },
          ],
        })
        .expect(400);
    });
  });

  describe('/transactions/:id (DELETE)', () => {
    let createdTransactionId: number;

    beforeEach(async () => {
      // Create a transaction to delete
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send({
          ...testTransaction,
          items: [
            {
              productId: testProductId,
              quantity: 1,
              unitPrice: 99.99,
            },
          ],
          totalAmount: 99.99,
        })
        .expect(201);
      createdTransactionId = response.body.data.id;
    });

    it('should delete a transaction as admin', () => {
      return request(app.getHttpServer())
        .delete(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Transaction deleted successfully');
        });
    });

    it('should fail to delete a transaction as cashier (unauthorized)', () => {
      return request(app.getHttpServer())
        .delete(`/transactions/${createdTransactionId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to delete a transaction with invalid ID', () => {
      return request(app.getHttpServer())
        .delete('/transactions/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });

    it('should fail to delete a non-existent transaction', () => {
      return request(app.getHttpServer())
        .delete('/transactions/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail to delete a transaction without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/transactions/${createdTransactionId}`)
        .expect(401);
    });
  });
});
