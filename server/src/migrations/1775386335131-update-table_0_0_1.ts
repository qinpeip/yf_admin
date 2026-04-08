import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775386335131 implements MigrationInterface {
  name = 'UpdateTable0011775386335131';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`goods_craftsmanship\` (\`tenant_id\` int NOT NULL COMMENT '租户ID' DEFAULT '1', \`owner_user_id\` int NULL COMMENT '数据所有者用户ID', \`create_by\` varchar(64) NOT NULL COMMENT '创建者' DEFAULT '', \`create_time\` datetime(6) NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_by\` varchar(64) NOT NULL COMMENT '更新者' DEFAULT '', \`update_time\` datetime(6) NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_time\` datetime(6) NULL COMMENT '删除时间', \`craftsmanship_id\` int NOT NULL AUTO_INCREMENT COMMENT '工艺ID', \`name\` varchar(255) NOT NULL COMMENT '名称', \`sort\` int NOT NULL COMMENT '排序' DEFAULT '0', \`description\` varchar(255) NULL COMMENT '描述', PRIMARY KEY (\`craftsmanship_id\`)) ENGINE=InnoDB COMMENT="工艺"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`goods_craftsmanship\``);
  }
}
