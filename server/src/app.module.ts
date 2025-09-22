import {
  Module,
  NestModule,
  MiddlewareConsumer,
  OnModuleInit,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ConfigModule } from '@nestjs/config';
import { SetupModule } from './setup/setup.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { UserModule } from './user/user.module';
import { SupplierModule } from './supplier/supplier.module';
import { TransactionModule } from './transaction/transaction.module';
import { CustomerModule } from './customer/customer.module';
import { InventoryModule } from './inventory/inventory.module';
import { ReportsModule } from './reports/reports.module';
import { DynamicDatabaseModule } from './dynamic-database/dynamic-database.module';
import { DynamicDatabaseService } from './dynamic-database/dynamic-database.service';
import { AppStateService } from './dynamic-database/app-state.service';
import configuration from './config/configuration';

@Module({
  imports: [
    DynamicDatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    CommonModule,
    SetupModule,
    ProductModule,
    CategoryModule,
    UserModule,
    SupplierModule,
    TransactionModule,
    CustomerModule,
    InventoryModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DynamicDatabaseService,
    AppStateService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(
    private readonly databaseService: DynamicDatabaseService,
    private readonly appStateService: AppStateService,
  ) {}

  async onModuleInit() {
    // Refresh app state to ensure it reflects the current setup status
    this.appStateService.refreshAppState();

    await this.databaseService.initializeIfConfigured();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
