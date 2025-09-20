import { MigrationInterface, QueryRunner } from 'typeorm';

export class LastMigration1758196975824 implements MigrationInterface {
  name = 'LastMigration1758196975824';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the suppliers table already exists
    const suppliersTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers')`
    );
    
    // Only create the suppliers table if it doesn't exist
    if (!suppliersTableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "suppliers" ("id" SERIAL NOT NULL, "name" text NOT NULL, "contact_person" text, "email" text, "phone" text, "address" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5b5720d9645cee7396595a16c93" UNIQUE ("name"), CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`,
      );
    }
    
    // Check if the updated_at column already exists in users table
    const updatedAtColumnExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at')`
    );
    
    // Only add the updated_at column if it doesn't exist
    if (!updatedAtColumnExists[0].exists) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
      );
    }
    
    // Add foreign key constraint only if both tables exist and the constraint doesn't exist
    if (!suppliersTableExists[0].exists) {
      const productsTableExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products')`
      );
      
      if (productsTableExists[0].exists) {
        // Check if the constraint already exists
        const constraintExists = await queryRunner.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'products' AND constraint_name = 'FK_0ec433c1e1d444962d592d86c86')`
        );
        
        if (!constraintExists[0].exists) {
          await queryRunner.query(
            `ALTER TABLE "products" ADD CONSTRAINT "FK_0ec433c1e1d444962d592d86c86" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the suppliers table exists before dropping constraints and table
    const suppliersTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers')`
    );
    
    if (suppliersTableExists[0].exists) {
      // Check if the foreign key constraint exists before dropping it
      const constraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'products' AND constraint_name = 'FK_0ec433c1e1d444962d592d86c86')`
      );
      
      if (constraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "products" DROP CONSTRAINT "FK_0ec433c1e1d444962d592d86c86"`,
        );
      }
    }
    
    // Check if the updated_at column exists before dropping it
    const updatedAtColumnExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at')`
    );
    
    if (updatedAtColumnExists[0].exists) {
      await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    }
    
    if (suppliersTableExists[0].exists) {
      await queryRunner.query(`DROP TABLE "suppliers"`);
    }
  }
}
