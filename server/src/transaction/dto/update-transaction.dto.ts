import {
  IsInt,
  IsPositive,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class TransactionItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class UpdateTransactionDto {
  @IsInt()
  @IsOptional()
  customerId?: number;

  @IsInt()
  @IsOptional()
  userId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  @IsOptional()
  items?: TransactionItemDto[];
}
