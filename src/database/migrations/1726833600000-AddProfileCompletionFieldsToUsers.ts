import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileCompletionFieldsToUsers1726833600000 implements MigrationInterface {
  name = 'AddProfileCompletionFieldsToUsers1726833600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for gender
    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM('male', 'female', 'other', 'prefer_not_to_say')
    `);

    // Add profile completion fields to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "date_of_birth" DATE,
      ADD COLUMN "gender" "gender_enum",
      ADD COLUMN "national_id_number" VARCHAR(100),
      ADD COLUMN "nationality" VARCHAR(100),
      ADD COLUMN "professional_license_number" VARCHAR(100),
      ADD COLUMN "medical_specialization" VARCHAR(100),
      ADD COLUMN "years_of_experience" INTEGER,
      ADD COLUMN "educational_background" TEXT,
      ADD COLUMN "profile_photo_url" VARCHAR(500),
      ADD COLUMN "profile_completed_at" TIMESTAMP
    `);

    // Add indexes for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_users_profile_completed_at" 
      ON "users" ("profile_completed_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_gender" 
      ON "users" ("gender")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_medical_specialization" 
      ON "users" ("medical_specialization")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_users_medical_specialization"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_users_gender"
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_users_profile_completed_at"
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "date_of_birth",
      DROP COLUMN "gender",
      DROP COLUMN "national_id_number",
      DROP COLUMN "nationality",
      DROP COLUMN "professional_license_number",
      DROP COLUMN "medical_specialization",
      DROP COLUMN "years_of_experience",
      DROP COLUMN "educational_background",
      DROP COLUMN "profile_photo_url",
      DROP COLUMN "profile_completed_at"
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "gender_enum"
    `);
  }
}