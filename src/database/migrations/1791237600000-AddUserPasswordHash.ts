import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPasswordHash1791237600000 implements MigrationInterface {
  name = 'AddUserPasswordHash1791237600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "password_hash" VARCHAR(255)
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "password_hash" = 'demo_password_hash_' || "id"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password_hash" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "password_hash"
    `);
  }
}
