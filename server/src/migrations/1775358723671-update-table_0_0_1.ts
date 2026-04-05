import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775358723671 implements MigrationInterface {
  name = 'UpdateTable0011775358723671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`sys_express\` (\`tenant_id\` int NOT NULL COMMENT '租户ID' DEFAULT '1', \`owner_user_id\` int NULL COMMENT '数据所有者用户ID', \`create_by\` varchar(64) NOT NULL COMMENT '创建者' DEFAULT '', \`create_time\` datetime(6) NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_by\` varchar(64) NOT NULL COMMENT '更新者' DEFAULT '', \`update_time\` datetime(6) NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_time\` datetime(6) NULL COMMENT '删除时间', \`express_id\` int NOT NULL AUTO_INCREMENT COMMENT '快递公司ID', \`express_name\` varchar(255) NOT NULL COMMENT '快递公司名称', \`express_code\` varchar(255) NOT NULL COMMENT '物流公司代码 (快递100)', \`wx_code\` varchar(255) NOT NULL COMMENT '物流公司代码（微信小程序）', \`dy_express_code\` varchar(255) NOT NULL COMMENT '抖音物流公司代码（抖音商城）', \`sort\` int NOT NULL COMMENT '排序' DEFAULT '0', PRIMARY KEY (\`express_id\`)) ENGINE=InnoDB COMMENT="快递公司表"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`sys_express\``);
  }
}
