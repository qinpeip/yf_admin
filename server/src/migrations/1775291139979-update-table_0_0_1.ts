import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775291139979 implements MigrationInterface {
  name = 'UpdateTable0011775291139979';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`params\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`result\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`operParam\` longtext NOT NULL COMMENT '请求参数'`);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`jsonResult\` longtext NOT NULL COMMENT '返回参数'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`jsonResult\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`operParam\``);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`result\` longtext COLLATE "utf8mb4_0900_ai_ci" NOT NULL COMMENT '返回参数'`);
    await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`params\` longtext COLLATE "utf8mb4_0900_ai_ci" NOT NULL COMMENT '请求参数'`);
  }
}
