import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity';
import { LoggerService } from '../common/logger.service';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AuthModule],
  providers: [CategoryService, LoggerService, ApiResponseHelper],
  controllers: [CategoryController],
  exports: [TypeOrmModule.forFeature([Category]), CategoryService],
})
export class CategoryModule {}
