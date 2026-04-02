import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775112544302 implements MigrationInterface {
  name = 'UpdateTable0011775112544302';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_logininfor\` DROP COLUMN \`del_flag\``);
    await queryRunner.query(`ALTER TABLE \`sys_dept\` ADD \`status\` char(1) NOT NULL COMMENT '状态' DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_dept\` DROP COLUMN \`status\``);
    await queryRunner.query(`ALTER TABLE \`sys_logininfor\` ADD \`del_flag\` char COLLATE "utf8mb4_0900_ai_ci" NOT NULL COMMENT '删除标志' DEFAULT '0'`);
  }
}
