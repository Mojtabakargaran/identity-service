import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateInstitutionalProfileTables1738041600000 implements MigrationInterface {
  name = 'CreateInstitutionalProfileTables1738041600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create medical_departments table
    await queryRunner.createTable(
      new Table({
        name: 'medical_departments',
        columns: [
          {
            name: 'department_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'department_name_en',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'department_name_fa',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_MEDICAL_DEPARTMENTS_NAME_EN',
            columnNames: ['department_name_en'],
          },
          {
            name: 'IDX_MEDICAL_DEPARTMENTS_ACTIVE',
            columnNames: ['is_active'],
          },
        ],
      }),
      true
    );

    // Create hospital_institutional_profiles table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_institutional_profiles',
        columns: [
          {
            name: 'profile_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'hospital_type',
            type: 'enum',
            enum: ['general_hospital', 'specialty_hospital', 'teaching_hospital', 'research_hospital', 'community_hospital', 'private_clinic'],
            isNullable: false,
          },
          {
            name: 'total_beds',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'icu_beds',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'operating_rooms',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'emergency_rooms',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'establishment_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'accreditation_status',
            type: 'enum',
            enum: ['accredited', 'pending', 'not_accredited'],
            isNullable: false,
          },
          {
            name: 'accreditation_body',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'accreditation_expiry_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'general_operating_start_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'general_operating_end_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'emergency_services_availability',
            type: 'enum',
            enum: ['24_7', 'limited_hours', 'not_available'],
            isNullable: false,
          },
          {
            name: 'mission_statement',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'vision_statement',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'values_statement',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'website_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'profile_completed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_HOSPITAL_INSTITUTIONAL_PROFILES_TENANT',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_HOSPITAL_INSTITUTIONAL_PROFILES_TYPE',
            columnNames: ['hospital_type'],
          },
        ],
      }),
      true
    );

    // Create hospital_departments table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_departments',
        columns: [
          {
            name: 'hospital_department_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'department_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_HOSPITAL_DEPARTMENTS_TENANT',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_HOSPITAL_DEPARTMENTS_DEPARTMENT',
            columnNames: ['department_id'],
          },
          {
            name: 'IDX_HOSPITAL_DEPARTMENTS_UNIQUE',
            columnNames: ['tenant_id', 'department_id'],
            isUnique: true,
          },
        ],
      }),
      true
    );

    // Create hospital_operating_hours table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_operating_hours',
        columns: [
          {
            name: 'operating_hours_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'day_of_week',
            type: 'enum',
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'end_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'is_closed',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_HOSPITAL_OPERATING_HOURS_TENANT',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_HOSPITAL_OPERATING_HOURS_DAY',
            columnNames: ['day_of_week'],
          },
          {
            name: 'IDX_HOSPITAL_OPERATING_HOURS_UNIQUE',
            columnNames: ['tenant_id', 'day_of_week'],
            isUnique: true,
          },
        ],
      }),
      true
    );

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "hospital_institutional_profiles" 
      ADD CONSTRAINT "FK_HOSPITAL_INSTITUTIONAL_PROFILES_TENANT" 
      FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "hospital_departments" 
      ADD CONSTRAINT "FK_HOSPITAL_DEPARTMENTS_TENANT" 
      FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "hospital_departments" 
      ADD CONSTRAINT "FK_HOSPITAL_DEPARTMENTS_DEPARTMENT" 
      FOREIGN KEY ("department_id") REFERENCES "medical_departments"("department_id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "hospital_operating_hours" 
      ADD CONSTRAINT "FK_HOSPITAL_OPERATING_HOURS_TENANT" 
      FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE
    `);

    // Insert default medical departments
    await queryRunner.query(`
      INSERT INTO medical_departments (department_name_en, department_name_fa, description, is_active) VALUES
      ('Cardiology', 'قلب و عروق', 'Department specializing in heart and cardiovascular conditions', true),
      ('Neurology', 'مغز و اعصاب', 'Department specializing in nervous system disorders', true),
      ('Orthopedics', 'ارتوپدی', 'Department specializing in musculoskeletal system', true),
      ('Emergency Medicine', 'طب اورژانس', 'Department providing emergency medical care', true),
      ('Internal Medicine', 'طب داخلی', 'Department providing comprehensive adult medical care', true),
      ('Pediatrics', 'اطفال', 'Department specializing in medical care of infants and children', true),
      ('Surgery', 'جراحی', 'Department performing surgical procedures', true),
      ('Obstetrics and Gynecology', 'زنان و زایمان', 'Department specializing in women''s health and childbirth', true),
      ('Psychiatry', 'روانپزشکی', 'Department specializing in mental health disorders', true),
      ('Dermatology', 'پوست', 'Department specializing in skin conditions', true),
      ('Ophthalmology', 'چشم', 'Department specializing in eye and vision care', true),
      ('ENT (Otolaryngology)', 'گوش، حلق و بینی', 'Department specializing in ear, nose, and throat conditions', true),
      ('Radiology', 'رادیولوژی', 'Department providing medical imaging services', true),
      ('Anesthesiology', 'بیهوشی', 'Department providing anesthesia services', true),
      ('Pathology', 'آسیب شناسی', 'Department providing diagnostic laboratory services', true),
      ('Physical Therapy', 'فیزیوتراپی', 'Department providing rehabilitation services', true),
      ('Pharmacy', 'داروخانه', 'Department managing medication services', true),
      ('Intensive Care Unit', 'مراقبت های ویژه', 'Department providing critical care services', true),
      ('Urology', 'اورولوژی', 'Department specializing in urinary tract and male reproductive system', true),
      ('Endocrinology', 'غدد درون ریز', 'Department specializing in hormonal and metabolic disorders', true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints first
    await queryRunner.query(`ALTER TABLE "hospital_operating_hours" DROP CONSTRAINT "FK_HOSPITAL_OPERATING_HOURS_TENANT"`);
    await queryRunner.query(`ALTER TABLE "hospital_departments" DROP CONSTRAINT "FK_HOSPITAL_DEPARTMENTS_DEPARTMENT"`);
    await queryRunner.query(`ALTER TABLE "hospital_departments" DROP CONSTRAINT "FK_HOSPITAL_DEPARTMENTS_TENANT"`);
    await queryRunner.query(`ALTER TABLE "hospital_institutional_profiles" DROP CONSTRAINT "FK_HOSPITAL_INSTITUTIONAL_PROFILES_TENANT"`);

    // Drop tables in reverse order
    await queryRunner.dropTable('hospital_operating_hours');
    await queryRunner.dropTable('hospital_departments');
    await queryRunner.dropTable('hospital_institutional_profiles');
    await queryRunner.dropTable('medical_departments');
  }
}