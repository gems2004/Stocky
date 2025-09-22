import { Module, Global } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggerService } from './logger.service';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [HttpExceptionFilter, LoggerService, RequestIdMiddleware],
  exports: [HttpExceptionFilter, LoggerService, RequestIdMiddleware],
})
export class CommonModule {}
