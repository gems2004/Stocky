import { IsInt, IsString, IsOptional, Min } from 'class-validator';

export class AdjustInventoryDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  changeAmount: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
