import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateEmailVerificationTokensTable1735981201000 implements MigrationInterface {
  name = 'CreateEmailVerificationTokensTable1735981201000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_verification_tokens',
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
            name: 'IDX_EMAIL_VERIFICATION_TOKENS_TOKEN_VALUE',
            columnNames: ['token_value'],
            isUnique: true,
          },
          {
            name: 'IDX_EMAIL_VERIFICATION_TOKENS_USER_ID',
            columnNames: ['user_id'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_EMAIL_VERIFICATION_TOKENS_USER_ID',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['user_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('email_verification_tokens');
  }
}
