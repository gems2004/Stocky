export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
}

export class DatabaseConfigDto {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
}
