import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountLockoutFieldsToUsers1735981202000 implements MigrationInterface {
  name = 'AddAccountLockoutFieldsToUsers1735981202000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add account lockout fields to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "failed_login_attempts" integer NOT NULL DEFAULT 0,
      ADD COLUMN "locked_until" TIMESTAMP NULL,
      ADD COLUMN "last_failed_login_at" TIMESTAMP NULL
    `);

    // Create indexes for performance on lockout queries
    await queryRunner.query(`CREATE INDEX "IDX_users_failed_login_attempts" ON "users" ("failed_login_attempts")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_locked_until" ON "users" ("locked_until")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_last_failed_login_at" ON "users" ("last_failed_login_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_users_last_failed_login_at"`);
    await queryRunner.query(`DROP INDEX "IDX_users_locked_until"`);
    await queryRunner.query(`DROP INDEX "IDX_users_failed_login_attempts"`);
    
    // Remove account lockout fields from users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "failed_login_attempts",
      DROP COLUMN "locked_until",
      DROP COLUMN "last_failed_login_at"
    `);
  }
}