import { DataSourceOptions } from 'typeorm';

// Hardcoded database configuration for CLI tools
export const cliDbConfig: DataSourceOptions = {
  type: 'postgres', // Using PostgreSQL as specified
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  username: process.env.DB_USERNAME || 'george',
  password: process.env.DB_PASSWORD || 'zaq321xsw',
  database: process.env.DB_NAME || 'stocky',
  synchronize: false,
  logging: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/subscriber/**/*{.ts,.js}'],
};
