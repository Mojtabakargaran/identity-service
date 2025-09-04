import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreferredLanguageToTenants1735981200000 implements MigrationInterface {
  name = 'AddPreferredLanguageToTenants1735981200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for preferred_language
    await queryRunner.query(`
      CREATE TYPE "preferred_language_enum" AS ENUM('en', 'fa')
    `);

    // Add preferred_language column to tenants table
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      ADD COLUMN "preferred_language" "preferred_language_enum" NOT NULL DEFAULT 'en'
    `);

    // Add index for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_tenants_preferred_language" 
      ON "tenants" ("preferred_language")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`
      DROP INDEX "IDX_tenants_preferred_language"
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      DROP COLUMN "preferred_language"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "preferred_language_enum"
    `);
  }
}
