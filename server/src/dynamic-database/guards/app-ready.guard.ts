import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppStateService } from '../app-state.service';

@Injectable()
export class AppReadyGuard implements CanActivate {
  constructor(private readonly appStateService: AppStateService) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow access only if app is ready
    return this.appStateService.isReady();
  }
}
