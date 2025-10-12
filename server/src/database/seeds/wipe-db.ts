import { DataSource } from 'typeorm';
import { cliDbConfig } from '../cli-db-config';

async function wipeDatabase() {
  // Create data source with the shared database configuration
  const AppDataSource = new DataSource(cliDbConfig);

  try {
    // Initialize the data source
    await AppDataSource.initialize();
    console.log('Connected to database for wipe operation');

    // Get all table names
    const entities = AppDataSource.entityMetadatas;
    const tableNames = entities.map(entity => entity.tableName);

    // Disable foreign key checks temporarily
    await AppDataSource.query('SET session_replication_role = replica;');

    // Delete all data from each table
    for (const tableName of tableNames) {
      console.log(`Wiping table: ${tableName}`);
      await AppDataSource.query(`DELETE FROM "${tableName}";`);
      
      // Reset auto-increment sequences for PostgreSQL
      try {
        await AppDataSource.query(`ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1;`);
      } catch (e) {
        // Sequence might not exist for all tables, which is fine
        console.log(`No sequence to reset for table: ${tableName}`);
      }
    }

    // Re-enable foreign key checks
    await AppDataSource.query('SET session_replication_role = DEFAULT;');

    console.log('Database wipe completed successfully!');
  } catch (error) {
    console.error('Error during database wipe:', error);
    process.exit(1);
  } finally {
    // Close the data source connection
    await AppDataSource.destroy();
  }
}

// Run the wipe process
if (require.main === module) {
  wipeDatabase();
}