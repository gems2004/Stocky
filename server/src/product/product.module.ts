import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';
import { DynamicDatabaseModule } from '../dynamic-database/dynamic-database.module';

@Module({
  imports: [
    AuthModule,
    DynamicDatabaseModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
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
export class ProductModule {}
