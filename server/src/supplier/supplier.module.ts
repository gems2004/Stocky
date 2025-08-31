import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { Supplier } from './entities/supplier.entity';
import { LoggerService } from '../common/logger.service';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier]), AuthModule],
  providers: [
    SupplierService,
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
  controllers: [SupplierController],
  exports: [TypeOrmModule.forFeature([Supplier]), SupplierService],
})
export class SupplierModule {}
