import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
import { DashboardStatsResponseDto } from './dto/dashboard-stats.dto';
import { WeeklySalesResponseDto } from './dto/weekly-sales.dto';
import { Product } from '../product/entity/product.entity';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(AuthGuard, RoleGuard, AppReadyGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sales summary report' })
  @ApiResponse({
    status: 200,
    description: 'Sales summary retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Sales summary retrieved successfully',
        data: {
          totalSales: 12500.75,
          totalTransactions: 120,
          averageTransactionValue: 104.17,
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-01-31',
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
  @ApiOperation({ summary: 'Get top products report' })
  @ApiResponse({
    status: 200,
    description: 'Top products retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Top products retrieved successfully',
        data: {
          products: [
            {
              id: 1,
              name: 'Product A',
              totalSold: 150,
              revenue: 3000.0,
            },
            {
              id: 2,
              name: 'Product B',
              totalSold: 120,
              revenue: 2400.0,
            },
          ],
          limit: 10,
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-01-31',
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
  @ApiOperation({ summary: 'Get profit margin report' })
  @ApiResponse({
    status: 200,
    description: 'Profit margin report retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Profit margin report retrieved successfully',
        data: {
          totalRevenue: 15000.0,
          totalCost: 9000.0,
          totalProfit: 6000.0,
          profitMargin: 40.0,
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-01-31',
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

  @Get('low-stock')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get low stock products report' })
  @ApiResponse({
    status: 200,
    description: 'Low stock products retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Low stock products retrieved successfully',
        data: [
          {
            id: 1,
            name: 'Product A',
            current_stock: 5,
            min_stock_level: 10,
          },
          {
            id: 2,
            name: 'Product B',
            current_stock: 3,
            min_stock_level: 8,
          },
        ],
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
  async getLowStockProducts(): Promise<SuccessResponse<Product[]>> {
    const result = await this.reportsService.getLowStockProducts();
    return ApiResponseHelper.success(
      result,
      'Low stock products retrieved successfully',
    );
  }

  @Get('dashboard-stats')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: {
          totalSales: 12500.75,
          totalTransactions: 120,
          totalCustomers: 85,
          lowStockProducts: 5,
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-01-31',
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
  async getDashboardStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SuccessResponse<DashboardStatsResponseDto>> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.reportsService.getDashboardStats(start, end);
    return ApiResponseHelper.success(
      result,
      'Dashboard stats retrieved successfully',
    );
  }

  @Get('weekly-sales')
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get weekly sales report' })
  @ApiResponse({
    status: 200,
    description: 'Weekly sales data retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Weekly sales data retrieved successfully',
        data: {
          weeklySales: [
            {
              week: '2025-01-01 - 2025-01-07',
              totalSales: 3125.19,
              totalTransactions: 30,
            },
            {
              week: '2025-01-08 - 2025-01-14',
              totalSales: 3000.0,
              totalTransactions: 28,
            },
          ],
          dateRange: {
            startDate: '2025-01-01',
            endDate: '2025-01-31',
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
  async getWeeklySales(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SuccessResponse<WeeklySalesResponseDto>> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await this.reportsService.getWeeklySales(start, end);
    return ApiResponseHelper.success(
      result,
      'Weekly sales data retrieved successfully',
    );
  }
}
