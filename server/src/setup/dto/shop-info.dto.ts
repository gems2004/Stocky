import { IsString, IsEmail } from 'class-validator';

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
}
