import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775190808744 implements MigrationInterface {
  name = 'UpdateTable0011775190808744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_post\` ADD \`status\` char(1) NOT NULL COMMENT '状态' DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_post\` DROP COLUMN \`status\``);
  }
}
