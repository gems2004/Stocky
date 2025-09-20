import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTable1756391411731 implements MigrationInterface {
  name = 'AddUserTable1756391411731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the enum type already exists
    const enumExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum')`
    );
    
    // Only create the enum if it doesn't exist
    if (!enumExists[0].exists) {
      await queryRunner.query(
        `CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'CASHIER')`,
      );
    }
    
    // Check if the users table already exists
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')`
    );
    
    // Only create the table if it doesn't exist
    if (!tableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" text NOT NULL, "email" text, "password_hash" text NOT NULL, "first_name" text, "last_name" text, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CASHIER', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if the users table exists before dropping it
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')`
    );
    
    if (tableExists[0].exists) {
      await queryRunner.query(`DROP TABLE "users"`);
    }
    
    // Check if the enum type exists before dropping it
    const enumExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum')`
    );
    
    if (enumExists[0].exists) {
      await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
  }
}
