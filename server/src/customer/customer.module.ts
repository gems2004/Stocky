import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { LoggerService } from '../common/logger.service';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuthModule],
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
  exports: [TypeOrmModule.forFeature([Customer]), CustomerService],
})
export class CustomerModule {}
