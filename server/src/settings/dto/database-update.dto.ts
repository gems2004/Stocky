import {
  IsEnum,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  IsPort,
  IsOptional,
} from 'class-validator';
import { DatabaseType } from '../../setup/dto/database-config.dto';

export class DatabaseUpdateDto {
  @IsEnum(DatabaseType)
  @IsOptional()
  type?: DatabaseType;

  @IsString()
  @IsOptional()
  host?: string;

  @IsPort()
  @IsOptional()
  port?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  database?: string;

  @IsBoolean()
  @IsOptional()
  ssl?: boolean;

  @IsOptional()
  @IsString()
  tablePrefix?: string;
}