import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProducts1756498031509 implements MigrationInterface {
  name = 'AddProducts1756498031509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" text NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "cost" numeric(10,2), "category_id" integer, "supplier_id" integer, "barcode" text, "sku" text, "stock_quantity" integer NOT NULL DEFAULT '0', "min_stock_level" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_adfc522baf9d9b19cd7d9461b7e" UNIQUE ("barcode"), CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
