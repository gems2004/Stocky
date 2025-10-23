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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @HttpCode(HttpStatus.OK)
  @Put('database')
  @UseGuards(AuthGuard, AppReadyGuard)
  @ApiOperation({ summary: 'Update database configuration' })
  @ApiBody({
    type: DatabaseUpdateDto,
    examples: {
      example1: {
        summary: 'Sample database update payload',
        value: {
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'updated_password',
          database: 'shopdb_updated',
          dialect: 'postgres',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Database configuration updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Database configuration updated successfully',
        data: {
          isDatabaseConfigured: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
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
  @ApiOperation({ summary: 'Update shop information' })
  @ApiBody({
    type: ShopInfoDto,
    examples: {
      example1: {
        summary: 'Sample shop information update payload',
        value: {
          shop_name: 'Updated Shop Name',
          shop_address: 'Updated 123 Main St',
          shop_phone: '+1234567890',
          shop_email: 'updated@shop.com',
          tax_rate: 12.5,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Shop information updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Shop information updated successfully',
        data: {
          isShopConfigured: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
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
  @ApiOperation({ summary: 'Update user information' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Sample user information update payload',
        value: {
          username: 'updated_user',
          email: 'updated@example.com',
          first_name: 'Updated',
          last_name: 'User',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User information updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User information updated successfully',
        data: {
          id: 1,
          username: 'updated_user',
          email: 'updated@example.com',
          first_name: 'Updated',
          last_name: 'User',
          role: 'admin',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-02T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user information',
    schema: {
      example: {
        success: false,
        message: 'User information validation failed',
        data: null,
      },
    },
  })
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
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({
    status: 200,
    description: 'All settings data retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'All settings data retrieved successfully',
        data: {
          shopInfo: {
            shop_name: 'Updated Shop Name',
            shop_address: 'Updated 123 Main St',
            shop_phone: '+1234567890',
            shop_email: 'updated@shop.com',
            tax_rate: 12.5,
          },
          databaseInfo: {
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            database: 'shopdb_updated',
            dialect: 'postgres',
          },
          userInfo: {
            id: 1,
            username: 'updated_user',
            email: 'updated@example.com',
            first_name: 'Updated',
            last_name: 'User',
            role: 'admin',
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-02T00:00:00.000Z',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        data: null,
      },
    },
  })
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
