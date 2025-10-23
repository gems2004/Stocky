import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger.service';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  // Parse cookies
  app.use(cookieParser());

  // Enable CORS for frontend with credentials support for cookies
  app.enableCors({
    origin: configService.get('frontendUrl'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // This is important for cookies to be sent with requests
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    exposedHeaders: ['Set-Cookie'], // Allow frontend to access Set-Cookie headers
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Stocky API')
    .setDescription(
      'API documentation for Stocky - Small Shop Management System',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('port');
  await app.listen(port);

  logger.log(`Server running on port ${port}`);
  logger.log(`API documentation available at http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
