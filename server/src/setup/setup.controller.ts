import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupStatusDto } from './dto/setup-status.dto';
import { DatabaseConfigDto } from './dto/database-config.dto';
import { ShopInfoDto } from './dto/shop-info.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AppReadyOrSetupGuard } from '../dynamic-database/guards/app-ready-or-setup.guard';
import { SetupRequiredGuard } from '../dynamic-database/guards/setup-required.guard';

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @HttpCode(HttpStatus.OK)
  @Get('status')
  @Public()
  @UseGuards(AppReadyOrSetupGuard)
  async getStatus(): Promise<SuccessResponse<SetupStatusDto>> {
    const status = await this.setupService.getStatus();
    return ApiResponseHelper.success(
      status,
      'Setup status retrieved successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('database')
  @Public()
  @UseGuards(SetupRequiredGuard)
  async configureDatabase(
    @Body() config: DatabaseConfigDto,
  ): Promise<SuccessResponse<SetupStatusDto>> {
    const status = await this.setupService.configureDatabase(config);
    return ApiResponseHelper.success(
      status,
      'Database configured successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('shop')
  @Public()
  @UseGuards(SetupRequiredGuard)
  configureShop(@Body() info: ShopInfoDto): SuccessResponse<SetupStatusDto> {
    const status = this.setupService.configureShop(info);
    return ApiResponseHelper.success(
      status,
      'Shop information configured successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('complete')
  @Public()
  @UseGuards(SetupRequiredGuard)
  completeSetup(): SuccessResponse<SetupStatusDto> {
    const status = this.setupService.completeSetup();
    return ApiResponseHelper.success(
      status,
      'Setup process completed successfully',
    );
  }
}
