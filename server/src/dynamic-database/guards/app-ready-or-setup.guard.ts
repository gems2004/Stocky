import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppStateService, AppState } from '../app-state.service';

@Injectable()
export class AppReadyOrSetupGuard implements CanActivate {
  constructor(private readonly appStateService: AppStateService) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow access if app is ready OR if setup is required
    return this.appStateService.isReady() || this.appStateService.isSetupRequired();
  }
}