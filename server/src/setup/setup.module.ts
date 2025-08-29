import { Module } from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupController } from './setup.controller';
import { LoggerService } from '../common/logger.service';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SetupService, LoggerService, ApiResponseHelper],
  controllers: [SetupController],
})
export class SetupModule {}
