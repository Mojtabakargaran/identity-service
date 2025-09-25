import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOperationalParametersTables1727251200000 implements MigrationInterface {
  name = 'CreateOperationalParametersTables1727251200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create hospital_operational_parameters table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_operational_parameters',
        columns: [
          {
            name: 'operational_parameters_id',
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
            name: 'timezone',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'fiscal_year_start_month',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'default_currency',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'standard_consultation_duration_minutes',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'standard_appointment_slot_duration_minutes',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'advance_booking_limit_days',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'cancellation_deadline_hours',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'lunch_break_start_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'lunch_break_end_time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'patient_checkin_window_minutes',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'patient_late_arrival_grace_period_minutes',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'appointment_reminder_timing_hours',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'bed_occupancy_alert_threshold_percentage',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'inventory_low_stock_alert_threshold',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'emergency_evacuation_procedures',
            type: 'text',
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
            name: 'IDX_hospital_operational_parameters_tenant_id',
            columnNames: ['tenant_id'],
            isUnique: true,
          },
          {
            name: 'IDX_hospital_operational_parameters_timezone',
            columnNames: ['timezone'],
          },
          {
            name: 'IDX_hospital_operational_parameters_fiscal_year',
            columnNames: ['fiscal_year_start_month'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_hospital_operational_parameters_tenant',
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['tenant_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      })
    );

    // Create hospital_holidays table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_holidays',
        columns: [
          {
            name: 'holiday_id',
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
            name: 'holiday_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'holiday_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
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
            name: 'IDX_hospital_holidays_tenant_date',
            columnNames: ['tenant_id', 'holiday_date'],
            isUnique: true,
          },
          {
            name: 'IDX_hospital_holidays_tenant_id',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_hospital_holidays_date',
            columnNames: ['holiday_date'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_hospital_holidays_tenant',
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['tenant_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      })
    );

    // Create hospital_vacation_periods table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_vacation_periods',
        columns: [
          {
            name: 'vacation_period_id',
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
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
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
            name: 'IDX_hospital_vacation_periods_tenant_id',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_hospital_vacation_periods_start_date',
            columnNames: ['start_date'],
          },
          {
            name: 'IDX_hospital_vacation_periods_end_date',
            columnNames: ['end_date'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_hospital_vacation_periods_tenant',
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['tenant_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      })
    );

    // Create hospital_visitor_hours table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_visitor_hours',
        columns: [
          {
            name: 'visitor_hours_id',
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
            name: 'area_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'time',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'time',
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
            name: 'IDX_hospital_visitor_hours_tenant_area',
            columnNames: ['tenant_id', 'area_type'],
            isUnique: true,
          },
          {
            name: 'IDX_hospital_visitor_hours_tenant_id',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_hospital_visitor_hours_area_type',
            columnNames: ['area_type'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_hospital_visitor_hours_tenant',
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['tenant_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      })
    );

    // Create hospital_staff_ratios table
    await queryRunner.createTable(
      new Table({
        name: 'hospital_staff_ratios',
        columns: [
          {
            name: 'staff_ratio_id',
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
            name: 'staff_count',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'patient_count',
            type: 'integer',
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
            name: 'IDX_hospital_staff_ratios_tenant_department',
            columnNames: ['tenant_id', 'department_id'],
            isUnique: true,
          },
          {
            name: 'IDX_hospital_staff_ratios_tenant_id',
            columnNames: ['tenant_id'],
          },
          {
            name: 'IDX_hospital_staff_ratios_department_id',
            columnNames: ['department_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_hospital_staff_ratios_tenant',
            columnNames: ['tenant_id'],
            referencedTableName: 'tenants',
            referencedColumnNames: ['tenant_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          // Note: FK to medical_departments will be added in CreateInstitutionalProfileTables migration
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hospital_staff_ratios');
    await queryRunner.dropTable('hospital_visitor_hours');
    await queryRunner.dropTable('hospital_vacation_periods');
    await queryRunner.dropTable('hospital_holidays');
    await queryRunner.dropTable('hospital_operational_parameters');
  }
}