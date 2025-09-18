import { Injectable } from '@nestjs/common';

export enum AppState {
  INITIALIZING = 'INITIALIZING',
  SETUP_REQUIRED = 'SETUP_REQUIRED',
  READY = 'READY',
  ERROR = 'ERROR',
}

@Injectable()
export class AppStateService {
  private state: AppState = AppState.SETUP_REQUIRED;
  private errorMessage: string | null = null;

  getState(): AppState {
    return this.state;
  }

  setState(state: AppState, errorMessage?: string): void {
    this.state = state;
    if (errorMessage) {
      this.errorMessage = errorMessage;
    } else if (state !== AppState.ERROR) {
      this.errorMessage = null;
    }
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
  }

  isReady(): boolean {
    return this.state === AppState.READY;
  }

  isSetupRequired(): boolean {
    return this.state === AppState.SETUP_REQUIRED;
  }
}