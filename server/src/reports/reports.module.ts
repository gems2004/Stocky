import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthModule } from '../auth/auth.module';
import { DynamicDatabaseModule } from '../dynamic-database/dynamic-database.module';

@Module({
  imports: [
    AuthModule,
    DynamicDatabaseModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
