import { Module } from '@nestjs/common';
import { AppStateService } from './app-state.service';
import { DynamicDatabaseService } from './dynamic-database.service';
import { SetupRequiredGuard } from './guards/setup-required.guard';
import { AppReadyGuard } from './guards/app-ready.guard';
import { AppReadyOrSetupGuard } from './guards/app-ready-or-setup.guard';

@Module({
  providers: [
    AppStateService,
    DynamicDatabaseService,
    SetupRequiredGuard,
    AppReadyGuard,
    AppReadyOrSetupGuard,
  ],
  exports: [
    AppStateService,
    DynamicDatabaseService,
    SetupRequiredGuard,
    AppReadyGuard,
    AppReadyOrSetupGuard,
  ],
})
export class DynamicDatabaseModule {}
