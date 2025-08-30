import { IsString, IsOptional, MinLength, IsNumber, IsPositive, IsInt, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  categoryId?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  supplierId?: number;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  minStockLevel?: number;
}