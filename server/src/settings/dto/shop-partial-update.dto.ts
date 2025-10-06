import { IsString, IsEmail, IsOptional } from 'class-validator';

export class ShopPartialUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
