import { DataSource } from 'typeorm';
import { cliDbConfig } from '../cli-db-config';

async function runSeed() {
  // Initialize data source with the shared database configuration
  const AppDataSource = new DataSource(cliDbConfig);

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Data source initialized for seeding');

    // Import and run the seed service
    const { SeedService } = await import('./seed.service');
    
    // Create an instance of the seed service and run seeding
    const seedService = new SeedService(AppDataSource);
    await seedService.seedDatabase();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close the data source connection
    await AppDataSource.destroy();
  }
}

// Run the seeding process
if (require.main === module) {
  runSeed();
}