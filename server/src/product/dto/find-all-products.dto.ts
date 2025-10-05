import { IsOptional, IsNumberString } from 'class-validator';

export class FindAllProductsDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsNumberString()
  categoryId?: string;

  @IsOptional()
  @IsNumberString()
  supplierId?: string;
}
