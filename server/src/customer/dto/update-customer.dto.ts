import { IsString, IsOptional, IsEmail, IsInt, Min } from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

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