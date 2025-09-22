import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export enum AppState {
  INITIALIZING = 'INITIALIZING',
  SETUP_REQUIRED = 'SETUP_REQUIRED',
  READY = 'READY',
  ERROR = 'ERROR',
}

@Injectable()
export class AppStateService {
  private state: AppState;
  private errorMessage: string | null = null;

  constructor() {
    this.initializeAppState();
  }

  private initializeAppState(): void {
    // Check if setup is already complete
    const setupConfigPath = path.join(__dirname, '../setup/setup-config.json');

    try {
      if (fs.existsSync(setupConfigPath)) {
        const data = fs.readFileSync(setupConfigPath, 'utf8');
        const setupConfig = JSON.parse(data);
        if (setupConfig.isSetupComplete) {
          this.state = AppState.READY;
        } else {
          this.state = AppState.SETUP_REQUIRED;
        }
      } else {
        this.state = AppState.SETUP_REQUIRED;
      }
    } catch (error) {
      // If there's any error reading or parsing the config, default to SETUP_REQUIRED
      this.state = AppState.SETUP_REQUIRED;
    }
  }

  /**
   * Refresh the app state by checking the setup config file
   */
  refreshAppState(): void {
    this.initializeAppState();
  }

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
