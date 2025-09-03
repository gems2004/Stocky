import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entity/user.entity';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { SalesSummaryDto } from './dto/sales-summary.dto';
import { TopProductsResponseDto } from './dto/top-products.dto';
import { ProfitMarginResponseDto } from './dto/profit-margin.dto';

@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  @Role(UserRole.ADMIN)
  async getSalesSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SuccessResponse<SalesSummaryDto>> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.reportsService.getSalesSummary(start, end);
    return ApiResponseHelper.success(
      result,
      'Sales summary retrieved successfully',
    );
  }

  @Get('top-products')
  @Role(UserRole.ADMIN)
  async getTopProducts(
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SuccessResponse<TopProductsResponseDto>> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.reportsService.getTopProducts(limit, start, end);
    return ApiResponseHelper.success(
      result,
      'Top products retrieved successfully',
    );
  }

  @Get('profit-margin')
  @Role(UserRole.ADMIN)
  async getProfitMargin(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SuccessResponse<ProfitMarginResponseDto>> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.reportsService.getProfitMargin(start, end);
    return ApiResponseHelper.success(
      result,
      'Profit margin report retrieved successfully',
    );
  }
}
