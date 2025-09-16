import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { LoggerService } from '../common/logger.service';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { AuthModule } from '../auth/auth.module';
import { DynamicDatabaseModule } from '../dynamic-database/dynamic-database.module';

@Module({
  imports: [AuthModule, DynamicDatabaseModule],
  providers: [
    CustomerService,
    LoggerService,
    ApiResponseHelper,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
