import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategories1756548071675 implements MigrationInterface {
  name = 'AddCategories1756548071675';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the categories table already exists
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories')`
    );
    
    // Only create the table if it doesn't exist
    if (!tableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" text NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
      );
      
      // Only add the foreign key constraint if the products table exists
      const productsTableExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products')`
      );
      
      if (productsTableExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the categories table exists before dropping it
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories')`
    );
    
    if (tableExists[0].exists) {
      // Check if the foreign key constraint exists before dropping it
      const constraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'products' AND constraint_name = 'FK_9a5f6868c96e0069e699f33e124')`
      );
      
      if (constraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
        );
      }
      
      await queryRunner.query(`DROP TABLE "categories"`);
    }
  }
}
