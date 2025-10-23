import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { FindAllInventoryLogsDto } from './dto/find-all-inventory-logs.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entity/user.entity';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { InventoryLogResponseDto } from './dto/inventory-log-response.dto';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(AuthGuard, RoleGuard, AppReadyGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @HttpCode(HttpStatus.OK)
  @Post('adjust')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Adjust inventory levels' })
  @ApiBody({
    type: AdjustInventoryDto,
    examples: {
      example1: {
        summary: 'Sample inventory adjustment payload',
        value: {
          product_id: 1,
          quantity_change: 10,
          reason: 'Restocking',
          notes: 'Additional stock received from supplier',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory adjusted successfully',
    schema: {
      example: {
        success: true,
        message: 'Inventory adjusted successfully',
        data: {
          id: 1,
          product_id: 1,
          product_name: 'Product Name',
          quantity_change: 10,
          previous_quantity: 5,
          new_quantity: 15,
          reason: 'Restocking',
          notes: 'Additional stock received from supplier',
          adjusted_by: 1,
          created_at: '2025-01-01T00:00:00.000Z',
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
    status: 403,
    description: 'Forbidden - Admin role required',
    schema: {
      example: {
        success: false,
        message: 'Forbidden',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        data: null,
      },
    },
  })
  async adjustInventory(
    @Body() adjustInventoryDto: AdjustInventoryDto,
  ): Promise<SuccessResponse<InventoryLogResponseDto>> {
    const result =
      await this.inventoryService.adjustInventory(adjustInventoryDto);
    return ApiResponseHelper.success(result, 'Inventory adjusted successfully');
  }

  @HttpCode(HttpStatus.OK)
  @Get('logs')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get inventory logs with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Inventory logs retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Inventory logs retrieved successfully',
        data: {
          data: [
            {
              id: 1,
              product_id: 1,
              product_name: 'Product Name',
              quantity_change: 10,
              previous_quantity: 5,
              new_quantity: 15,
              reason: 'Restocking',
              notes: 'Additional stock received from supplier',
              adjusted_by: 1,
              created_at: '2025-01-01T00:00:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
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
    status: 403,
    description: 'Forbidden - Admin role required',
    schema: {
      example: {
        success: false,
        message: 'Forbidden',
        data: null,
      },
    },
  })
  async getInventoryLogs(
    @Query() findAllInventoryLogsDto: FindAllInventoryLogsDto,
  ): Promise<
    SuccessResponse<{
      data: InventoryLogResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    // Parse page and limit with default values
    const pageNum = findAllInventoryLogsDto.page
      ? parseInt(findAllInventoryLogsDto.page, 10)
      : 1;
    const limitNum = findAllInventoryLogsDto.limit
      ? parseInt(findAllInventoryLogsDto.limit, 10)
      : 10;

    const result = await this.inventoryService.getInventoryLogsWithPagination(
      pageNum,
      limitNum,
    );
    return ApiResponseHelper.success(
      result,
      'Inventory logs retrieved successfully',
    );
  }
}
