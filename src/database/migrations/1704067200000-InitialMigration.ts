import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1704067200000 implements MigrationInterface {
  name = 'InitialMigration1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "tenant_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "hospital_name" character varying(255) NOT NULL,
        "subdomain" character varying(100) NOT NULL,
        "hospital_license_number" character varying(100) NOT NULL,
        "hospital_address_street" character varying(255) NOT NULL,
        "hospital_address_city" character varying(100) NOT NULL,
        "hospital_address_state" character varying(100) NOT NULL,
        "hospital_address_postal_code" character varying(20) NOT NULL,
        "hospital_contact_phone" character varying(20) NOT NULL,
        "hospital_contact_email" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("tenant_id"),
        CONSTRAINT "UQ_tenants_hospital_name" UNIQUE ("hospital_name"),
        CONSTRAINT "UQ_tenants_subdomain" UNIQUE ("subdomain")
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TYPE "user_status_enum" AS ENUM('active', 'pending_verification', 'suspended');
      
      CREATE TABLE "users" (
        "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "full_name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone_number" character varying(20) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "email_verified_at" TIMESTAMP NULL,
        "status" "user_status_enum" NOT NULL DEFAULT 'pending_verification',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("user_id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE
      )
    `);

    // Create user_roles table
    await queryRunner.query(`
      CREATE TYPE "role_type_enum" AS ENUM('owner', 'admin', 'staff');
      
      CREATE TABLE "user_roles" (
        "user_role_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "role_type" "role_type_enum" NOT NULL,
        "assigned_at" TIMESTAMP NOT NULL DEFAULT now(),
        "assigned_by" uuid NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_role_id"),
        CONSTRAINT "UQ_user_roles_user_role" UNIQUE ("user_id", "role_type"),
        CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_assigned_by" FOREIGN KEY ("assigned_by") REFERENCES "users"("user_id") ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_tenant_id" ON "users" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_status" ON "users" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_email_verified_at" ON "users" ("email_verified_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_roles_user_id" ON "user_roles" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_roles_role_type" ON "user_roles" ("role_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_tenants_hospital_license_number" ON "tenants" ("hospital_license_number")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tenants_hospital_license_number"`);
    await queryRunner.query(`DROP INDEX "IDX_user_roles_role_type"`);
    await queryRunner.query(`DROP INDEX "IDX_user_roles_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email_verified_at"`);
    await queryRunner.query(`DROP INDEX "IDX_users_status"`);
    await queryRunner.query(`DROP INDEX "IDX_users_tenant_id"`);
    
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TYPE "role_type_enum"`);
    
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    
    await queryRunner.query(`DROP TABLE "tenants"`);
  }
}
