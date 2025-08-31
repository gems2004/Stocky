import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class SearchUserDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}
