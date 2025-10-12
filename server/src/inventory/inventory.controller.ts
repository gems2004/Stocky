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

@Controller('inventory')
@UseGuards(AuthGuard, RoleGuard, AppReadyGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @HttpCode(HttpStatus.OK)
  @Post('adjust')
  @Role(UserRole.ADMIN)
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
