import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { LoggerService } from '../common/logger.service';
import { DynamicDatabaseModule } from '../dynamic-database/dynamic-database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DynamicDatabaseModule, UserModule],
  controllers: [SettingsController],
  providers: [SettingsService, LoggerService]
})
export class SettingsModule {}
