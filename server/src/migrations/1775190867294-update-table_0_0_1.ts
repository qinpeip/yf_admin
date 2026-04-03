import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775190867294 implements MigrationInterface {
  name = 'UpdateTable0011775190867294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_post\` ADD \`remark\` varchar(500) NOT NULL COMMENT '备注'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_post\` DROP COLUMN \`remark\``);
  }
}
