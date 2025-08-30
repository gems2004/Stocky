import { IsString, IsOptional, MinLength, IsNumber, IsPositive, IsInt, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

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

  @IsInt()
  @IsOptional()
  @Min(0)
  stockQuantity?: number;
}