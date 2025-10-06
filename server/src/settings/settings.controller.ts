import {
  Controller,
  Get,
  UseGuards,
  Post,
  Put,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ShopInfoDto } from '../setup/dto/shop-info.dto';
import { DatabaseUpdateDto } from './dto/database-update.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { CombinedSettingsDto } from './dto/combined-settings.dto';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/auth-tokens.type';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @HttpCode(HttpStatus.OK)
  @Put('database')
  @UseGuards(AuthGuard, AppReadyGuard)
  async updateDatabase(
    @Body() config: DatabaseUpdateDto,
  ): Promise<SuccessResponse<{ isDatabaseConfigured: boolean }>> {
    const result = await this.settingsService.updateDatabaseConfig(config);
    return ApiResponseHelper.success(
      result,
      'Database configuration updated successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put('shop')
  @UseGuards(AuthGuard, AppReadyGuard)
  async updateShop(
    @Body() shopInfo: ShopInfoDto,
  ): Promise<SuccessResponse<{ isShopConfigured: boolean }>> {
    const result = await this.settingsService.updateShopInfo(shopInfo);
    return ApiResponseHelper.success(
      result,
      'Shop information updated successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('user')
  @UseGuards(AuthGuard, AppReadyGuard)
  async updateUser(
    @CurrentUser() user: JwtPayload,
    @Body() userData: UpdateUserDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const result = await this.settingsService.updateUser(user.sub, userData);
    return ApiResponseHelper.success(
      result,
      'User information updated successfully',
    );
  }

  @Get('all')
  @UseGuards(AuthGuard, AppReadyGuard)
  async getAllSettings(
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponse<CombinedSettingsDto>> {
    const result = await this.settingsService.getAllSettings(user.sub);
    return ApiResponseHelper.success(
      result,
      'All settings data retrieved successfully',
    );
  }
}
