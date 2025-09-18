import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { LoggerService } from '../common/logger.service';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';
import { DynamicDatabaseModule } from '../dynamic-database/dynamic-database.module';

@Module({
  imports: [
    AuthModule,
    ProductModule,
    DynamicDatabaseModule,
  ],
  providers: [
    InventoryService,
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
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
