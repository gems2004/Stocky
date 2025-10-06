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
  async getStatus(): Promise<SuccessResponse<{isSetupComplete: boolean}>> {
    const status = await this.setupService.getStatus();
    return ApiResponseHelper.success(
      { isSetupComplete: status.isSetupComplete },
      'Setup status retrieved successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('database')
  @Public()
  @UseGuards(SetupRequiredGuard)
  async configureDatabase(
    @Body() config: DatabaseConfigDto,
  ): Promise<SuccessResponse<{isDatabaseConfigured: boolean}>> {
    const status = await this.setupService.configureDatabase(config);
    return ApiResponseHelper.success(
      { isDatabaseConfigured: status.isDatabaseConfigured },
      'Database configured successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('shop')
  @Public()
  @UseGuards(SetupRequiredGuard)
  configureShop(@Body() info: ShopInfoDto): SuccessResponse<{isShopConfigured: boolean}> {
    const status = this.setupService.configureShop(info);
    return ApiResponseHelper.success(
      { isShopConfigured: status.isShopConfigured },
      'Shop information configured successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('complete')
  @Public()
  @UseGuards(SetupRequiredGuard)
  completeSetup(): SuccessResponse<{isSetupComplete: boolean}> {
    const status = this.setupService.completeSetup();
    return ApiResponseHelper.success(
      { isSetupComplete: status.isSetupComplete },
      'Setup process completed successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('shop-info')
  @Public()
  @UseGuards(AppReadyOrSetupGuard)
  getShopInfo(): SuccessResponse<ShopInfoDto | null> {
    const shopInfo = this.setupService.getShopInfo();
    return ApiResponseHelper.success(
      shopInfo,
      shopInfo ? 'Shop information retrieved successfully' : 'Shop is not configured yet',
    );
  }
}
