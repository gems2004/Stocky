import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// For CLI commands, we use a static configuration
// In production, you should use environment variables
const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'george',
  password: 'zaq321xsw',
  database: 'stocky',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/dynamic-database/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});

export default dataSource;
