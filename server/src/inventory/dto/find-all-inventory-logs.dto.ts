import { IsOptional, IsNumberString } from 'class-validator';

export class FindAllInventoryLogsDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}