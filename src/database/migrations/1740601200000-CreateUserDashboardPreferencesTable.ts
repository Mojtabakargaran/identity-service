import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserDashboardPreferencesTable1740601200000 implements MigrationInterface {
  name = 'CreateUserDashboardPreferencesTable1740601200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_dashboard_preferences table
    await queryRunner.createTable(
      new Table({
        name: 'user_dashboard_preferences',
        columns: [
          {
            name: 'dashboard_preferences_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'widget_layout',
            type: 'jsonb',
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
            name: 'IDX_USER_DASHBOARD_PREFERENCES_USER',
            columnNames: ['user_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_USER_DASHBOARD_PREFERENCES_USER',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['user_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table
    await queryRunner.dropTable('user_dashboard_preferences');
  }
}