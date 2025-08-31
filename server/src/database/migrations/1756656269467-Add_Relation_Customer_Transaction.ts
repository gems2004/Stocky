import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationCustomerTransaction1756656269467 implements MigrationInterface {
    name = 'AddRelationCustomerTransaction1756656269467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customers" ("id" SERIAL NOT NULL, "first_name" text NOT NULL, "last_name" text NOT NULL, "email" text, "phone" text, "address" text, "loyalty_points" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6f09843c214f21a462b54b11e8d" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6f09843c214f21a462b54b11e8d"`);
        await queryRunner.query(`DROP TABLE "customers"`);
    }

}
