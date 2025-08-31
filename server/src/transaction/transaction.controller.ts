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

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
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
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponse<null>> {
    await this.transactionService.delete(id);
    return ApiResponseHelper.success(null, 'Transaction deleted successfully');
  }
}
