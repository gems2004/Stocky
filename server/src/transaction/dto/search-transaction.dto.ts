import { IsString, IsNotEmpty } from 'class-validator';

export class SearchTransactionDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}
