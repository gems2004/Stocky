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

describe('CustomerController (e2e)', () => {
  let app: INestApplication;
  let databaseName: string;
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

  // Test customer data
  const testCustomer = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St, City, Country',
    loyalty_points: 100,
  };

  const updatedCustomer = {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    phone: '098-765-4321',
    address: '456 Oak Ave, Town, Country',
    loyalty_points: 200,
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
    // Clean up the setup config file
    cleanupTestSetupConfig();
    
    // Drop the test database
    if (databaseName) {
      await dropTestDatabase(databaseName);
    }
  });

  describe('/customer (POST)', () => {
    it('should create a new customer as admin', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(testCustomer)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.first_name).toBe(testCustomer.first_name);
          expect(res.body.data.last_name).toBe(testCustomer.last_name);
          expect(res.body.data.email).toBe(testCustomer.email);
          expect(res.body.data.phone).toBe(testCustomer.phone);
          expect(res.body.data.address).toBe(testCustomer.address);
          expect(res.body.data.loyalty_points).toBe(
            testCustomer.loyalty_points,
          );
          expect(res.body.message).toBe('Customer created successfully');
        });
    });

    it('should fail to create a customer as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(testCustomer)
        .expect(403);
    });

    it('should fail to create a customer without authentication', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .send(testCustomer)
        .expect(401);
    });

    it('should fail to create a customer with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .set('Content-Type', 'application/json')
        .send({
          last_name: 'Doe',
          // Missing required first_name field
        })
        .expect(400);
    });

    it('should fail to create a customer with duplicate email', async () => {
      // Create first customer
      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'duplicate@example.com',
          phone: '123-456-7890',
          address: '123 Main St, City, Country',
        })
        .expect(201);

      // Try to create another customer with the same email
      return request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'duplicate@example.com', // Same email
          phone: '098-765-4321',
          address: '456 Oak Ave, Town, Country',
        })
        .expect(409);
    });
  });

  describe('/customer (GET)', () => {
    beforeEach(async () => {
      // Create test customers
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: `John ${timestamp}`,
          last_name: 'Doe',
          email: `john${timestamp}@example.com`,
          phone: '123-456-7890',
          address: '123 Main St, City, Country',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: `Jane ${timestamp}`,
          last_name: 'Smith',
          email: `jane${timestamp}@example.com`,
          phone: '098-765-4321',
          address: '456 Oak Ave, Town, Country',
        })
        .expect(201);
    });

    it('should retrieve all customers', () => {
      return request(app.getHttpServer())
        .get('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
          expect(res.body.message).toBe('Customers retrieved successfully');
        });
    });
  });

  describe('/customer/:id (PUT)', () => {
    let createdCustomerId: number;

    beforeEach(async () => {
      // Create a customer to update
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: `Update Customer ${timestamp}`,
          last_name: 'To Update',
          email: `update${timestamp}@example.com`,
          phone: '123-456-7890',
          address: '123 Main St, City, Country',
        })
        .expect(201);
      createdCustomerId = response.body.data.id;
    });

    it('should update a customer as admin', () => {
      return request(app.getHttpServer())
        .put(`/customer/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedCustomer)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdCustomerId);
          expect(res.body.data.first_name).toBe(updatedCustomer.first_name);
          expect(res.body.data.last_name).toBe(updatedCustomer.last_name);
          expect(res.body.data.email).toBe(updatedCustomer.email);
          expect(res.body.data.phone).toBe(updatedCustomer.phone);
          expect(res.body.data.address).toBe(updatedCustomer.address);
          expect(res.body.data.loyalty_points).toBe(
            updatedCustomer.loyalty_points,
          );
          expect(res.body.message).toBe('Customer updated successfully');
        });
    });

    it('should fail to update a customer as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .put(`/customer/${createdCustomerId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(updatedCustomer)
        .expect(403);
    });

    it('should fail to update a customer with invalid ID', () => {
      return request(app.getHttpServer())
        .put('/customer/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedCustomer)
        .expect(400);
    });

    it('should fail to update a non-existent customer', () => {
      return request(app.getHttpServer())
        .put('/customer/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedCustomer)
        .expect(404);
    });

    it('should fail to update a customer without authentication', () => {
      return request(app.getHttpServer())
        .put(`/customer/${createdCustomerId}`)
        .send(updatedCustomer)
        .expect(401);
    });

    it('should fail to update a customer with duplicate email', async () => {
      // Create a customer with a specific email
      const existingCustomerResponse = await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: 'Existing',
          last_name: 'Customer',
          email: 'existing@example.com',
          phone: '111-222-3333',
          address: '789 Existing St, Existing City',
        })
        .expect(201);

      // Create another customer that we'll try to update
      const updateCustomerResponse = await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: 'Customer',
          last_name: 'ToUpdate',
          email: 'update@example.com',
          phone: '444-555-6666',
          address: '123 Update St, Update City',
        })
        .expect(201);

      const updateCustomerId = updateCustomerResponse.body.data.id;

      // Try to update the customer with an email that already exists
      return request(app.getHttpServer())
        .put(`/customer/${updateCustomerId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          email: 'existing@example.com', // This email already exists
        })
        .expect(409);
    });
  });

  describe('/customer/:id (DELETE)', () => {
    let createdCustomerId: number;

    beforeEach(async () => {
      // Create a customer to delete
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/customer')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          first_name: `Delete Customer ${timestamp}`,
          last_name: 'To Delete',
          email: `delete${timestamp}@example.com`,
          phone: '123-456-7890',
          address: '123 Main St, City, Country',
        })
        .expect(201);
      createdCustomerId = response.body.data.id;
    });

    it('should delete a customer as admin', () => {
      return request(app.getHttpServer())
        .delete(`/customer/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Customer deleted successfully');
        });
    });

    it('should fail to delete a customer as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .delete(`/customer/${createdCustomerId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to delete a customer with invalid ID', () => {
      return request(app.getHttpServer())
        .delete('/customer/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });

    it('should fail to delete a non-existent customer', () => {
      return request(app.getHttpServer())
        .delete('/customer/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail to delete a customer without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/customer/${createdCustomerId}`)
        .expect(401);
    });
  });
});
