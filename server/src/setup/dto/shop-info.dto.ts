import { IsString, IsEmail, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ShopInfoDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate?: number;

  @IsString()
  currency: string;

  @IsString()
  businessType: string;

  @IsOptional()
  @IsString()
  website?: string;
}
