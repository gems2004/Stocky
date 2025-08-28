import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger.service';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = await app.resolve(LoggerService);
  app.useLogger(logger);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  logger.log(`Server running on port ${port}`);
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
