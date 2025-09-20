import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  initializeTestApp,
  generateUniqueDatabaseName,
  dropTestDatabase,
} from './test-helpers';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let databaseName: string;

  beforeAll(async () => {
    // Generate a unique database name for this test
    databaseName = generateUniqueDatabaseName();
    
    // Initialize the app with the unique database
    app = await initializeTestApp(databaseName);
  });

  afterAll(async () => {
    // Close the app first
    if (app) {
      await app.close();
    }
    
    // Drop the test database
    if (databaseName) {
      await dropTestDatabase(databaseName);
    }
  });

  it('/ (GET) - Health check', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
