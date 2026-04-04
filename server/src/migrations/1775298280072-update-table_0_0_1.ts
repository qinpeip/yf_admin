import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775298280072 implements MigrationInterface {
  name = 'UpdateTable0011775298280072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`sys_region\` (\`tenant_id\` int NOT NULL COMMENT '租户ID' DEFAULT '1', \`owner_user_id\` int NULL COMMENT '数据所有者用户ID', \`create_by\` varchar(64) NOT NULL COMMENT '创建者' DEFAULT '', \`create_time\` datetime(6) NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_by\` varchar(64) NOT NULL COMMENT '更新者' DEFAULT '', \`update_time\` datetime(6) NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_time\` datetime(6) NULL COMMENT '删除时间', \`id\` int NOT NULL AUTO_INCREMENT COMMENT '地区ID', \`pid\` int NULL COMMENT '父ID', \`shortname\` varchar(100) NULL COMMENT '简称', \`name\` varchar(100) NULL COMMENT '名称', \`merger_name\` varchar(100) NULL COMMENT '全称', \`level\` tinyint NULL COMMENT '层级 1 2 3 省市区县' DEFAULT '0', \`pinyin\` varchar(100) NULL COMMENT '拼音', \`code\` varchar(100) NULL COMMENT '长途区号', \`zip_code\` varchar(100) NULL COMMENT '邮编', \`first\` varchar(50) NULL COMMENT '首字母', \`lng\` varchar(100) NULL COMMENT '经度', \`lat\` varchar(100) NULL COMMENT '纬度', \`sort\` int NULL COMMENT '排序' DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB COMMENT="地区表"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`sys_region\``);
  }
}
