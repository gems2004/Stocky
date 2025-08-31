import { CreateTransactionDto } from './create-transaction.dto';
import { UpdateTransactionDto } from './update-transaction.dto';
import { TransactionResponseDto } from './transaction-response.dto';

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
