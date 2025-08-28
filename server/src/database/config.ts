import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'stocky',
  password: process.env.DB_PASSWORD || 'stocky',
  database: process.env.DB_NAME || 'stocky',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false, // Disabled for production safety
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: process.env.NODE_ENV === 'development', // Only auto-run in development
};
