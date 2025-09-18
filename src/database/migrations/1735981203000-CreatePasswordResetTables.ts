import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreatePasswordResetTables1735981203000 implements MigrationInterface {
  name = 'CreatePasswordResetTables1735981203000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create password_reset_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'password_reset_tokens',
        columns: [
          {
            name: 'token_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'token_value',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'used_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_PASSWORD_RESET_TOKENS_TOKEN_VALUE',
            columnNames: ['token_value'],
            isUnique: true,
          },
          {
            name: 'IDX_PASSWORD_RESET_TOKENS_USER_ID',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_PASSWORD_RESET_TOKENS_EXPIRES_AT',
            columnNames: ['expires_at'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_PASSWORD_RESET_TOKENS_USER_ID',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['user_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create password_reset_rate_limits table
    await queryRunner.createTable(
      new Table({
        name: 'password_reset_rate_limits',
        columns: [
          {
            name: 'rate_limit_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'ip_address',
            type: 'inet',
            isNullable: false,
          },
          {
            name: 'request_count',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
          {
            name: 'window_start',
            type: 'timestamp',
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
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_PASSWORD_RESET_RATE_LIMITS_EMAIL',
            columnNames: ['email'],
          },
          {
            name: 'IDX_PASSWORD_RESET_RATE_LIMITS_IP_ADDRESS',
            columnNames: ['ip_address'],
          },
          {
            name: 'IDX_PASSWORD_RESET_RATE_LIMITS_WINDOW_START',
            columnNames: ['window_start'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('password_reset_rate_limits');
    await queryRunner.dropTable('password_reset_tokens');
  }
}