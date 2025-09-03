import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInventoryLogs1756906332255 implements MigrationInterface {
  name = 'AddInventoryLogs1756906332255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "inventory_logs" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "change_amount" integer NOT NULL, "reason" text, "user_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_06b444680ab11eb7c7d0ed6eced" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6f09843c214f21a462b54b11e8d" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_logs" ADD CONSTRAINT "FK_09ba6e81f5ba61d6b4964b02307" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_logs" ADD CONSTRAINT "FK_0786e7b41f2c50ecf588cbd1df6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_logs" DROP CONSTRAINT "FK_0786e7b41f2c50ecf588cbd1df6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_logs" DROP CONSTRAINT "FK_09ba6e81f5ba61d6b4964b02307"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6f09843c214f21a462b54b11e8d"`,
    );
    await queryRunner.query(`DROP TABLE "inventory_logs"`);
  }
}
