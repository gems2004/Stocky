import {
  IsEnum,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  IsPort,
  IsOptional,
} from 'class-validator';

export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
}

export class DatabaseConfigDto {
  @IsEnum(DatabaseType)
  type: DatabaseType;

  @IsString()
  host: string;

  @IsPort()
  port: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  database: string;

  @IsBoolean()
  ssl: boolean;

  @IsOptional()
  @IsString()
  tablePrefix?: string;
}
