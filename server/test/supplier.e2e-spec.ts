import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('SupplierController (e2e)', () => {
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

  // Test supplier data
  const testSupplier = {
    name: 'Test Supplier',
    contact_person: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    address: '123 Test Street, Test City',
  };

  const updatedSupplier = {
    name: 'Updated Test Supplier',
    contact_person: 'Jane Smith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    address: '456 Updated Street, Updated City',
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

  describe('/supplier (POST)', () => {
    it('should create a new supplier as admin', () => {
      return request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(testSupplier)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBeDefined();
          expect(res.body.data.name).toBe(testSupplier.name);
          expect(res.body.data.contact_person).toBe(
            testSupplier.contact_person,
          );
          expect(res.body.data.email).toBe(testSupplier.email);
          expect(res.body.data.phone).toBe(testSupplier.phone);
          expect(res.body.data.address).toBe(testSupplier.address);
          expect(res.body.message).toBe('Supplier created successfully');
        });
    });

    it('should fail to create a supplier as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(testSupplier)
        .expect(403);
    });

    it('should fail to create a supplier without authentication', () => {
      return request(app.getHttpServer())
        .post('/supplier')
        .send(testSupplier)
        .expect(401);
    });

    it('should fail to create a supplier with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .set('Content-Type', 'application/json')
        .send({
          contact_person: 'John Doe',
        })
        .expect(400);
    });

    it('should fail to create a supplier with duplicate name', async () => {
      // Create first supplier
      await request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Duplicate Test Supplier',
          contact_person: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Test Street, Test City',
        })
        .expect(201);

      // Try to create another supplier with the same name
      return request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Duplicate Test Supplier',
          contact_person: 'Jane Smith',
          email: 'jane@example.com',
          phone: '098-765-4321',
          address: '456 Updated Street, Updated City',
        })
        .expect(409);
    });
  });

  describe('/supplier (GET)', () => {
    beforeEach(async () => {
      // Create test suppliers
      const timestamp = Date.now();
      await request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Test Supplier 1 ${timestamp}`,
          contact_person: 'John Doe',
          email: 'john1@example.com',
          phone: '123-456-7890',
          address: '123 Test Street, Test City',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Test Supplier 2 ${timestamp}`,
          contact_person: 'Jane Smith',
          email: 'jane2@example.com',
          phone: '098-765-4321',
          address: '456 Updated Street, Updated City',
        })
        .expect(201);
    });

    it('should retrieve all suppliers', () => {
      return request(app.getHttpServer())
        .get('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThanOrEqual(2);
          expect(res.body.message).toBe('Suppliers retrieved successfully');
        });
    });
  });

  describe('/supplier/:id (PUT)', () => {
    let createdSupplierId: number;

    beforeEach(async () => {
      // Create a supplier to update
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Update Test Supplier ${timestamp}`,
          contact_person: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Test Street, Test City',
        })
        .expect(201);
      createdSupplierId = response.body.data.id;
    });

    it('should update a supplier as admin', () => {
      return request(app.getHttpServer())
        .put(`/supplier/${createdSupplierId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedSupplier)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toBeDefined();
          expect(res.body.data.id).toBe(createdSupplierId);
          expect(res.body.data.name).toBe(updatedSupplier.name);
          expect(res.body.data.contact_person).toBe(
            updatedSupplier.contact_person,
          );
          expect(res.body.data.email).toBe(updatedSupplier.email);
          expect(res.body.data.phone).toBe(updatedSupplier.phone);
          expect(res.body.data.address).toBe(updatedSupplier.address);
          expect(res.body.message).toBe('Supplier updated successfully');
        });
    });

    it('should fail to update a supplier as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .put(`/supplier/${createdSupplierId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .send(updatedSupplier)
        .expect(403);
    });

    it('should fail to update a supplier with invalid ID', () => {
      return request(app.getHttpServer())
        .put('/supplier/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedSupplier)
        .expect(400);
    });

    it('should fail to update a non-existent supplier', () => {
      return request(app.getHttpServer())
        .put('/supplier/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updatedSupplier)
        .expect(404);
    });

    it('should fail to update a supplier without authentication', () => {
      return request(app.getHttpServer())
        .put(`/supplier/${createdSupplierId}`)
        .send(updatedSupplier)
        .expect(401);
    });

    it('should fail to update a supplier with duplicate name', async () => {
      // Create a supplier with a specific name
      const existingSupplierResponse = await request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Existing Supplier',
          contact_person: 'Existing Person',
          email: 'existing@example.com',
          phone: '111-222-3333',
          address: '789 Existing Street, Existing City',
        })
        .expect(201);

      // Create another supplier that we'll try to update
      const updateSupplierResponse = await request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Supplier To Update',
          contact_person: 'Update Person',
          email: 'update@example.com',
          phone: '444-555-6666',
          address: '123 Update Street, Update City',
        })
        .expect(201);

      const updateSupplierId = updateSupplierResponse.body.data.id;

      // Try to update the supplier with a name that already exists
      return request(app.getHttpServer())
        .put(`/supplier/${updateSupplierId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: 'Existing Supplier', // This name already exists
        })
        .expect(409);
    });
  });

  describe('/supplier/:id (DELETE)', () => {
    let createdSupplierId: number;

    beforeEach(async () => {
      // Create a supplier to delete
      const timestamp = Date.now();
      const response = await request(app.getHttpServer())
        .post('/supplier')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          name: `Delete Test Supplier ${timestamp}`,
          contact_person: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Test Street, Test City',
        })
        .expect(201);
      createdSupplierId = response.body.data.id;
    });

    it('should delete a supplier as admin', () => {
      return request(app.getHttpServer())
        .delete(`/supplier/${createdSupplierId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.message).toBe('Supplier deleted successfully');
        });
    });

    it('should fail to delete a supplier as cashier (unauthorized role)', () => {
      return request(app.getHttpServer())
        .delete(`/supplier/${createdSupplierId}`)
        .set('Authorization', `Bearer ${cashierAccessToken}`)
        .expect(403);
    });

    it('should fail to delete a supplier with invalid ID', () => {
      return request(app.getHttpServer())
        .delete('/supplier/invalid')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);
    });

    it('should fail to delete a non-existent supplier', () => {
      return request(app.getHttpServer())
        .delete('/supplier/999999')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });

    it('should fail to delete a supplier without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/supplier/${createdSupplierId}`)
        .expect(401);
    });
  });
});
