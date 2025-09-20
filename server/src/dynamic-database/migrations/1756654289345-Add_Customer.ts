import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomer1756654289345 implements MigrationInterface {
  name = 'AddCustomer1756654289345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the customers table already exists
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers')`
    );
    
    // Only create the table if it doesn't exist
    if (!tableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "customers" ("id" SERIAL NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "email" text, "phone" text, "address" text, "loyalty_points" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the customers table exists before dropping it
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers')`
    );
    
    if (tableExists[0].exists) {
      await queryRunner.query(`DROP TABLE "customers"`);
    }
  }
}
