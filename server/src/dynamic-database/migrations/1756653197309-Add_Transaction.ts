import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransaction1756653197309 implements MigrationInterface {
  name = 'AddTransaction1756653197309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the transaction_items table already exists
    const transactionItemsTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transaction_items')`
    );
    
    // Only create the transaction_items table if it doesn't exist
    if (!transactionItemsTableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "transaction_items" ("id" SERIAL NOT NULL, "transaction_id" integer NOT NULL, "product_id" integer NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "total_price" numeric(10,2) NOT NULL, CONSTRAINT "PK_ff5a487ad820dccafd53bebf578" PRIMARY KEY ("id"))`,
      );
    }
    
    // Check if the transactions table already exists
    const transactionsTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions')`
    );
    
    // Only create the transactions table if it doesn't exist
    if (!transactionsTableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "customer_id" integer, "user_id" integer NOT NULL, "total_amount" numeric(10,2) NOT NULL, "tax_amount" numeric(10,2) NOT NULL DEFAULT '0', "discount_amount" numeric(10,2) NOT NULL DEFAULT '0', "payment_method" text, "status" text NOT NULL DEFAULT 'completed', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
      );
    }
    
    // Add foreign key constraints only if the tables exist
    if (!transactionItemsTableExists[0].exists && !transactionsTableExists[0].exists) {
      await queryRunner.query(
        `ALTER TABLE "transaction_items" ADD CONSTRAINT "FK_5926425896b30c0d681fe879af0" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE "transaction_items" ADD CONSTRAINT "FK_027964fc28560d4d68a0de5ce30" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
      await queryRunner.query(
        `ALTER TABLE "transactions" ADD CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the tables exist before dropping constraints and tables
    const transactionsTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions')`
    );
    
    const transactionItemsTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transaction_items')`
    );
    
    if (transactionsTableExists[0].exists) {
      // Check if the foreign key constraint exists before dropping it
      const userConstraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'transactions' AND constraint_name = 'FK_e9acc6efa76de013e8c1553ed2b')`
      );
      
      if (userConstraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "transactions" DROP CONSTRAINT "FK_e9acc6efa76de013e8c1553ed2b"`,
        );
      }
    }
    
    if (transactionItemsTableExists[0].exists) {
      // Check if the foreign key constraints exist before dropping them
      const productConstraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'transaction_items' AND constraint_name = 'FK_027964fc28560d4d68a0de5ce30')`
      );
      
      if (productConstraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "transaction_items" DROP CONSTRAINT "FK_027964fc28560d4d68a0de5ce30"`,
        );
      }
      
      const transactionConstraintExists = await queryRunner.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'transaction_items' AND constraint_name = 'FK_5926425896b30c0d681fe879af0')`
      );
      
      if (transactionConstraintExists[0].exists) {
        await queryRunner.query(
          `ALTER TABLE "transaction_items" DROP CONSTRAINT "FK_5926425896b30c0d681fe879af0"`,
        );
      }
      
      await queryRunner.query(`DROP TABLE "transactions"`);
    }
    
    if (transactionItemsTableExists[0].exists) {
      await queryRunner.query(`DROP TABLE "transaction_items"`);
    }
  }
}
