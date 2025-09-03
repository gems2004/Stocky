import { IsString, IsEmail, IsOptional } from 'class-validator';

export class ShopInfoDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  currency: string;

  @IsString()
  businessType: string;

  @IsOptional()
  @IsString()
  website?: string;
}
