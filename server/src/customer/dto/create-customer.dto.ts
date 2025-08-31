import { IsString, IsOptional, IsEmail, IsInt, Min } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  loyalty_points?: number;
}