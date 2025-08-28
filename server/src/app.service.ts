import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from './common/logger.service';

@Injectable()
export class AppService {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

  getHello(): string {
    this.logger.log('AppService.getHello() called');
    return 'Hello World!';
  }
}
