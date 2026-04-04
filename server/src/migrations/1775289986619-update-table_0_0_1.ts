import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 与实体一致：oper_param / json_result 为 varchar(2000)。
 * 库中若已有列则 MODIFY，避免误用 DROP（列不存在时会报 ER_CANT_DROP_FIELD_OR_KEY）。
 */
export class UpdateTable0011775289986619 implements MigrationInterface {
  name = 'UpdateTable0011775289986619';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('sys_oper_log', 'oper_param')) {
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` MODIFY COLUMN \`oper_param\` varchar(2000) NOT NULL DEFAULT '' COMMENT '请求参数'`);
    } else {
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`oper_param\` varchar(2000) NOT NULL DEFAULT '' COMMENT '请求参数'`);
    }
    if (await queryRunner.hasColumn('sys_oper_log', 'json_result')) {
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` MODIFY COLUMN \`json_result\` varchar(2000) NOT NULL DEFAULT '' COMMENT '返回参数'`);
    } else {
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`json_result\` varchar(2000) NOT NULL DEFAULT '' COMMENT '返回参数'`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('sys_oper_log', 'json_result')) {
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`json_result\``);
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`json_result\` varchar(2000) COLLATE "utf8mb4_0900_ai_ci" NOT NULL COMMENT '返回参数' DEFAULT ''`);
    }
    if (await queryRunner.hasColumn('sys_oper_log', 'oper_param')) {
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` DROP COLUMN \`oper_param\``);
      await queryRunner.query(`ALTER TABLE \`sys_oper_log\` ADD \`oper_param\` varchar(2000) COLLATE "utf8mb4_0900_ai_ci" NOT NULL COMMENT '请求参数' DEFAULT ''`);
    }
  }
}
