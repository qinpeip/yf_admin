import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775290923421 implements MigrationInterface {
  name = 'UpdateTable0011775290923421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`json_result\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`oper_param\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`params\` longtext NOT NULL COMMENT '请求参数'`);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`result\` longtext NOT NULL COMMENT '返回参数'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`result\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`params\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`oper_param\` varchar(2000) COLLATE "utf8mb4_0900_ai_ci" NOT NULL COMMENT '请求参数' DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`json_result\` varchar(2000) COLLATE "utf8mb4_0900_ai_ci" NOT NULL COMMENT '返回参数' DEFAULT ''`);
  }
}
