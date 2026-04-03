import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775190962808 implements MigrationInterface {
  name = 'UpdateTable0011775190962808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_dict_type\` ADD \`status\` char(1) NOT NULL COMMENT '状态' DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE \`sys_dict_type\` ADD \`remark\` varchar(500) NOT NULL COMMENT '备注'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_dict_type\` DROP COLUMN \`remark\``);
    await queryRunner.query(`ALTER TABLE \`sys_dict_type\` DROP COLUMN \`status\``);
  }
}
