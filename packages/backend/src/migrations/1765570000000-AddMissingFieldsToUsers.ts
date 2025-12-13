import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMissingFieldsToUsers1765570000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users');

    if (!table) {
      throw new Error('Tabela users não encontrada');
    }

    // Adicionar coluna 'name'
    if (!table.findColumnByName('name')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'name',
        type: 'varchar',
        isNullable: true
      }));
    }

    // Adicionar coluna 'username'
    if (!table.findColumnByName('username')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'username',
        type: 'varchar',
        isNullable: true,
        isUnique: true
      }));
    }

    // Adicionar coluna 'role'
    if (!table.findColumnByName('role')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'role',
        type: 'varchar',
        default: "'user'"
      }));
    }

    // Adicionar coluna 'is_master'
    if (!table.findColumnByName('is_master')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'is_master',
        type: 'boolean',
        default: false
      }));
    }

    // Adicionar coluna 'company_id'
    if (!table.findColumnByName('company_id')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'company_id',
        type: 'uuid',
        isNullable: true
      }));
    }

    // Adicionar coluna 'reset_password_token'
    if (!table.findColumnByName('reset_password_token')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'reset_password_token',
        type: 'varchar',
        isNullable: true
      }));
    }

    // Adicionar coluna 'reset_password_expires'
    if (!table.findColumnByName('reset_password_expires')) {
      await queryRunner.addColumn('users', new TableColumn({
        name: 'reset_password_expires',
        type: 'timestamp',
        isNullable: true
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'name');
    await queryRunner.dropColumn('users', 'username');
    await queryRunner.dropColumn('users', 'role');
    await queryRunner.dropColumn('users', 'is_master');
    await queryRunner.dropColumn('users', 'company_id');
    await queryRunner.dropColumn('users', 'reset_password_token');
    await queryRunner.dropColumn('users', 'reset_password_expires');
  }
}
