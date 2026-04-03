import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775194798522 implements MigrationInterface {
  name = 'UpdateTable0011775194798522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_dict_data\` ADD \`status\` char(1) NOT NULL COMMENT '状态' DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE \`sys_dict_data\` ADD \`remark\` varchar(500) NULL COMMENT '备注'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_dict_data\` DROP COLUMN \`remark\``);
    await queryRunner.query(`ALTER TABLE \`sys_dict_data\` DROP COLUMN \`status\``);
  }
}
