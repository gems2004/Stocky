import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AuthModule } from '../auth/auth.module';
import { CustomerModule } from '../customer/customer.module';
import { DynamicDatabaseModule } from '../dynamic-database/dynamic-database.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    DynamicDatabaseModule,
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class TransactionModule {}
