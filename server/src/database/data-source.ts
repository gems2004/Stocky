import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'stocky',
  password: process.env.DB_PASSWORD || 'stocky',
  database: process.env.DB_NAME || 'stocky',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + './migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
