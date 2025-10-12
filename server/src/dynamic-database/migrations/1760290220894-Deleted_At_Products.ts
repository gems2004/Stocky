import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletedAtProducts1760290220894 implements MigrationInterface {
    name = 'DeletedAtProducts1760290220894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "deleted_at"`);
    }

}
