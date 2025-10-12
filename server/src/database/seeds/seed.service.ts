import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedCategories } from './category.seed';
import { seedSuppliers } from './supplier.seed';
import { seedUsers } from './user.seed';
import { seedCustomers } from './customer.seed';
import { seedProducts } from './product.seed';
import { seedTransactions } from './transaction.seed';
import { seedInventoryLogs } from './inventory-log.seed';

@Injectable()
export class SeedService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase(): Promise<void> {
    console.log('Starting database seeding process...');

    try {
      // Seed base entities first
      await seedCategories(this.dataSource);
      await seedSuppliers(this.dataSource);
      await seedUsers(this.dataSource);
      await seedCustomers(this.dataSource);

      // Then seed products (depends on categories and suppliers)
      await seedProducts(this.dataSource);

      // Seed transactions (depends on products, users, and customers)
      await seedTransactions(this.dataSource);

      // Finally seed inventory logs (depends on products and users)
      await seedInventoryLogs(this.dataSource);

      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
}
