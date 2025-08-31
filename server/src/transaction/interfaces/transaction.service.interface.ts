import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

export interface ITransactionService {
  findAll(
    page: number,
    limit: number,
  ): Promise<{
    data: TransactionResponseDto[];
    page: number;
    total: number;
    limit: number;
  }>;
  findOne(id: number): Promise<TransactionResponseDto>;
  create(
    transactionData: CreateTransactionDto,
  ): Promise<TransactionResponseDto>;
  update(
    id: number,
    transactionData: UpdateTransactionDto,
  ): Promise<TransactionResponseDto>;
  delete(id: number): Promise<void>;
}
