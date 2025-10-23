import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { SetupStatusDto } from './dto/setup-status.dto';
import { DatabaseConfigDto } from './dto/database-config.dto';
import { ShopInfoDto } from './dto/shop-info.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AppReadyOrSetupGuard } from '../dynamic-database/guards/app-ready-or-setup.guard';
import { SetupRequiredGuard } from '../dynamic-database/guards/setup-required.guard';

@ApiTags('Setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @HttpCode(HttpStatus.OK)
  @Get('status')
  @Public()
  @UseGuards(AppReadyOrSetupGuard)
  @ApiOperation({ summary: 'Get setup status' })
  @ApiResponse({
    status: 200,
    description: 'Setup status retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Setup status retrieved successfully',
        data: {
          isSetupComplete: false,
        },
      },
    },
  })
  async getStatus(): Promise<SuccessResponse<{ isSetupComplete: boolean }>> {
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
  @ApiOperation({ summary: 'Configure database' })
  @ApiBody({
    type: DatabaseConfigDto,
    examples: {
      example1: {
        summary: 'Sample database configuration payload',
        value: {
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'password',
          database: 'shopdb',
          dialect: 'postgres',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Database configured successfully',
    schema: {
      example: {
        success: true,
        message: 'Database configured successfully',
        data: {
          isDatabaseConfigured: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid database configuration',
    schema: {
      example: {
        success: false,
        message: 'Database configuration validation failed',
        data: null,
      },
    },
  })
  async configureDatabase(
    @Body() config: DatabaseConfigDto,
  ): Promise<SuccessResponse<{ isDatabaseConfigured: boolean }>> {
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
  @ApiOperation({ summary: 'Configure shop information' })
  @ApiBody({
    type: ShopInfoDto,
    examples: {
      example1: {
        summary: 'Sample shop information payload',
        value: {
          shop_name: 'My Shop',
          shop_address: '123 Main St',
          shop_phone: '+1234567890',
          shop_email: 'info@myshop.com',
          tax_rate: 10.0,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Shop information configured successfully',
    schema: {
      example: {
        success: true,
        message: 'Shop information configured successfully',
        data: {
          isShopConfigured: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid shop information',
    schema: {
      example: {
        success: false,
        message: 'Shop information validation failed',
        data: null,
      },
    },
  })
  configureShop(
    @Body() info: ShopInfoDto,
  ): SuccessResponse<{ isShopConfigured: boolean }> {
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
  @ApiOperation({ summary: 'Complete setup process' })
  @ApiResponse({
    status: 200,
    description: 'Setup process completed successfully',
    schema: {
      example: {
        success: true,
        message: 'Setup process completed successfully',
        data: {
          isSetupComplete: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Setup already completed',
    schema: {
      example: {
        success: false,
        message: 'Setup has already been completed',
        data: null,
      },
    },
  })
  completeSetup(): SuccessResponse<{ isSetupComplete: boolean }> {
    const status = this.setupService.completeSetup();
    return ApiResponseHelper.success(
      { isSetupComplete: status.isSetupComplete },
      'Setup process completed successfully',
    );
  }
}
