import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775275946395 implements MigrationInterface {
  name = 'UpdateTable0011775275946395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_role\` ADD \`remark\` varchar(500) NOT NULL COMMENT '备注'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_role\` DROP COLUMN \`remark\``);
  }
}
