import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppStateService, AppState } from '../app-state.service';

@Injectable()
export class SetupRequiredGuard implements CanActivate {
  constructor(private readonly appStateService: AppStateService) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow access only if setup is required
    return this.appStateService.isSetupRequired();
  }
}