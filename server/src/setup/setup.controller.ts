import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupStatusDto } from './dto/setup-status.dto';
import { DatabaseConfigDto } from './dto/database-config.dto';
import { ShopInfoDto } from './dto/shop-info.dto';
import { AdminUserDto } from './dto/admin-user.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @HttpCode(HttpStatus.OK)
  @Get('status')
  @Public()
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
  configureShop(@Body() info: ShopInfoDto): SuccessResponse<SetupStatusDto> {
    const status = this.setupService.configureShop(info);
    return ApiResponseHelper.success(
      status,
      'Shop information configured successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('admin')
  @Public()
  async createAdminUser(
    @Body() userData: AdminUserDto,
  ): Promise<SuccessResponse<SetupStatusDto>> {
    const status = await this.setupService.createAdminUser(userData);
    return ApiResponseHelper.success(status, 'Admin user created successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Post('complete')
  @Public()
  completeSetup(): SuccessResponse<SetupStatusDto> {
    const status = this.setupService.completeSetup();
    return ApiResponseHelper.success(
      status,
      'Setup process completed successfully',
    );
  }
}
