import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { SearchTransactionDto } from './dto/search-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { ApiResponseHelper } from '../common/helpers/api-response.helper';
import { SuccessResponse } from '../common/types/api-response.type';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entity/user.entity';
import { AppReadyGuard } from '../dynamic-database/guards/app-ready.guard';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(AuthGuard, AppReadyGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiOperation({ summary: 'Get all transactions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Transactions retrieved successfully',
        data: {
          data: [
            {
              id: 1,
              transaction_id: 'TXN-001',
              customer_id: 1,
              total_amount: 299.97,
              tax_amount: 23.99,
              discount_amount: 0,
              final_amount: 299.97,
              payment_method: 'CASH',
              transaction_status: 'COMPLETED',
              payment_status: 'PAID',
              created_at: '2025-01-01T00:00:00.000Z',
              updated_at: '2025-01-01T00:00:00.000Z',
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
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<
    SuccessResponse<{
      data: TransactionResponseDto[];
      total: number;
      page: number;
      limit: number;
    }>
  > {
    // Parse page and limit with default values
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.transactionService.findAll(pageNum, limitNum);
    return ApiResponseHelper.success(
      result,
      'Transactions retrieved successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Transaction retrieved successfully',
        data: {
          id: 1,
          transaction_id: 'TXN-001',
          customer_id: 1,
          total_amount: 299.97,
          tax_amount: 23.99,
          discount_amount: 0,
          final_amount: 299.97,
          payment_method: 'CASH',
          transaction_status: 'COMPLETED',
          payment_status: 'PAID',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
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
    status: 404,
    description: 'Transaction not found',
    schema: {
      example: {
        success: false,
        message: 'Transaction not found',
        data: null,
      },
    },
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<TransactionResponseDto>> {
    const transaction = await this.transactionService.findOne(id);
    return ApiResponseHelper.success(
      transaction,
      'Transaction retrieved successfully',
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({
    type: CreateTransactionDto,
    examples: {
      example1: {
        summary: 'Sample transaction creation payload',
        value: {
          customer_id: 1,
          items: [
            {
              product_id: 1,
              quantity: 2,
              unit_price: 149.99,
              total_price: 299.98,
            },
          ],
          tax_amount: 23.99,
          discount_amount: 0.01,
          final_amount: 299.97,
          payment_method: 'CASH',
          transaction_status: 'COMPLETED',
          payment_status: 'PAID',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    schema: {
      example: {
        success: true,
        message: 'Transaction created successfully',
        data: {
          id: 1,
          transaction_id: 'TXN-001',
          customer_id: 1,
          total_amount: 299.97,
          tax_amount: 23.99,
          discount_amount: 0,
          final_amount: 299.97,
          payment_method: 'CASH',
          transaction_status: 'COMPLETED',
          payment_status: 'PAID',
          created_at: '2025-01-01T00:00:00.000Z',
          updated_at: '2025-01-01T00:00:00.000Z',
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
    description: 'Bad Request - Invalid input data',
    schema: {
      example: {
        success: false,
        message: 'Validation failed',
        data: null,
      },
    },
  })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<SuccessResponse<TransactionResponseDto>> {
    const transaction =
      await this.transactionService.create(createTransactionDto);
    return ApiResponseHelper.success(
      transaction,
      'Transaction created successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  @UseGuards(RoleGuard)
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a transaction by ID' })
  @ApiBody({
    type: UpdateTransactionDto,
    examples: {
      example1: {
        summary: 'Sample transaction update payload',
        value: {
          transaction_status: 'COMPLETED',
          payment_status: 'PAID',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Transaction updated successfully',
        data: {
          id: 1,
          transaction_id: 'TXN-001',
          customer_id: 1,
          total_amount: 299.97,
          tax_amount: 23.99,
          discount_amount: 0,
          final_amount: 299.97,
          payment_method: 'CASH',
          transaction_status: 'COMPLETED',
          payment_status: 'PAID',
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
    status: 404,
    description: 'Transaction not found',
    schema: {
      example: {
        success: false,
        message: 'Transaction not found',
        data: null,
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<SuccessResponse<TransactionResponseDto>> {
    const transaction = await this.transactionService.update(
      id,
      updateTransactionDto,
    );
    return ApiResponseHelper.success(
      transaction,
      'Transaction updated successfully',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @UseGuards(RoleGuard)
  @Role(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a transaction by ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Transaction deleted successfully',
        data: null,
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
    status: 404,
    description: 'Transaction not found',
    schema: {
      example: {
        success: false,
        message: 'Transaction not found',
        data: null,
      },
    },
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.transactionService.delete(id);
    return ApiResponseHelper.success(null, 'Transaction deleted successfully');
  }
}
