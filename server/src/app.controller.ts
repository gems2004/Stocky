import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from './common/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(LoggerService) private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('Hello endpoint accessed');
    return this.appService.getHello();
  }
}
