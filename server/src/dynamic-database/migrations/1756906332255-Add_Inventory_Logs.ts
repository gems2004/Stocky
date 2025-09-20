import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryLogs1756906332255 implements MigrationInterface {
  name = 'AddInventoryLogs1756906332255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the inventory_logs table already exists
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_logs')`
    );
    
    // Only create the table if it doesn't exist
    if (!tableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "inventory_logs" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "change_amount" integer NOT NULL, "reason" text, "user_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_06b444680ab11eb7c7d0ed6eced" PRIMARY KEY ("id"))`,
      );
      
      // Add foreign key constraints only if the related tables exist
      const customersTableExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers')`
      );
      
      if (customersTableExists[0].exists) {
        // Check if the constraint already exists
        const constraintExists = await queryRunner.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'transactions' AND constraint_name = 'FK_6f09843c214f21a462b54b11e8d')`
        );
        
        if (!constraintExists[0].exists) {
          await queryRunner.query(
            `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6f09843c214f21a462b54b11e8d" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
          );
        }
      }
      
      const productsTableExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products')`
      );
      
      if (productsTableExists[0].exists) {
        // Check if the constraint already exists
        const constraintExists = await queryRunner.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'inventory_logs' AND constraint_name = 'FK_09ba6e81f5ba61d6b4964b02307')`
        );
        
        if (!constraintExists[0].exists) {
          await queryRunner.query(
            `ALTER TABLE "inventory_logs" ADD CONSTRAINT "FK_09ba6e81f5ba61d6b4964b02307" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
          );
        }
      }
      
      const usersTableExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')`
      );
      
      if (usersTableExists[0].exists) {
        // Check if the constraint already exists
        const constraintExists = await queryRunner.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'inventory_logs' AND constraint_name = 'FK_0786e7b41f2c50ecf588cbd1df6')`
        );
        
        if (!constraintExists[0].exists) {
          await queryRunner.query(
            `ALTER TABLE "inventory_logs" ADD CONSTRAINT "FK_0786e7b41f2c50ecf588cbd1df6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the inventory_logs table exists before dropping constraints and table
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_logs')`
    );
    
    if (tableExists[0].exists) {
      // Check if the foreign key constraints exist before dropping them
      const userConstraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'inventory_logs' AND constraint_name = 'FK_0786e7b41f2c50ecf588cbd1df6')`
      );
      
      if (userConstraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "inventory_logs" DROP CONSTRAINT "FK_0786e7b41f2c50ecf588cbd1df6"`,
        );
      }
      
      const productConstraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'inventory_logs' AND constraint_name = 'FK_09ba6e81f5ba61d6b4964b02307')`
      );
      
      if (productConstraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "inventory_logs" DROP CONSTRAINT "FK_09ba6e81f5ba61d6b4964b02307"`,
        );
      }
      
      const customerConstraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'transactions' AND constraint_name = 'FK_6f09843c214f21a462b54b11e8d')`
      );
      
      if (customerConstraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6f09843c214f21a462b54b11e8d"`,
        );
      }
      
      await queryRunner.query(`DROP TABLE "inventory_logs"`);
    }
  }
}
