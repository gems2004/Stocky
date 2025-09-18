import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  initializeTestApp,
  createTestSetupConfig,
  cleanupTestSetupConfig,
} from './test-helpers';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Create the setup config file directly
    createTestSetupConfig('stocky_test');

    app = await initializeTestApp('stocky_test');
  });

  afterAll(async () => {
    await app.close();
    // Clean up the setup config file
    cleanupTestSetupConfig();
  });

  it('/ (GET) - Health check', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
