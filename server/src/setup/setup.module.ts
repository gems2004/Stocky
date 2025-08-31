import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { SetupService } from './setup.service';
import { SetupController } from './setup.controller';
import { LoggerService } from '../common/logger.service';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [
    SetupService,
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
  controllers: [SetupController],
})
export class SetupModule {}
