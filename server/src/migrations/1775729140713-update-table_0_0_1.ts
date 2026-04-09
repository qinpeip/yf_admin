import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775729140713 implements MigrationInterface {
  name = 'UpdateTable0011775729140713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`sys_shipping_template_rule\` (\`rule_id\` int NOT NULL AUTO_INCREMENT COMMENT '规则ID', \`city_ids\` json NOT NULL COMMENT '城市ID列表', \`first_weight\` decimal(10,2) NOT NULL COMMENT '首重', \`first_weight_price\` decimal(10,2) NOT NULL COMMENT '首重价格', \`additional_weight\` decimal(10,2) NOT NULL COMMENT '续重', \`additional_weight_price\` decimal(10,2) NOT NULL COMMENT '续重价格', \`is_remote\` tinyint NOT NULL COMMENT '是否偏远地区模板' DEFAULT 0, \`shipping_template_id\` int NULL COMMENT '模板ID', PRIMARY KEY (\`rule_id\`)) ENGINE=InnoDB COMMENT="运费模板规则"`,
    );
    await queryRunner.query(
      `CREATE TABLE \`sys_shipping_template\` (\`tenant_id\` int NOT NULL COMMENT '租户ID' DEFAULT '1', \`owner_user_id\` int NULL COMMENT '数据所有者用户ID', \`create_by\` varchar(64) NOT NULL COMMENT '创建者' DEFAULT '', \`create_time\` datetime(6) NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_by\` varchar(64) NOT NULL COMMENT '更新者' DEFAULT '', \`update_time\` datetime(6) NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_time\` datetime(6) NULL COMMENT '删除时间', \`shipping_template_id\` int NOT NULL AUTO_INCREMENT COMMENT '模板ID', \`shipping_template_name\` varchar(255) NOT NULL COMMENT '模板名称', \`fee_type\` enum ('weight') NOT NULL COMMENT '计费方式', \`sort\` int NOT NULL COMMENT '排序值' DEFAULT '0', \`dept_id\` int NULL COMMENT '部门ID', \`express_id\` int NULL COMMENT '快递公司ID', PRIMARY KEY (\`shipping_template_id\`)) ENGINE=InnoDB COMMENT="运费模板"`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sys_shipping_template_rule\` ADD CONSTRAINT \`FK_38c983ba936c86bea0cd0407a82\` FOREIGN KEY (\`shipping_template_id\`) REFERENCES \`sys_shipping_template\`(\`shipping_template_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sys_shipping_template\` ADD CONSTRAINT \`FK_86297801189dcf7f639c5e69a1a\` FOREIGN KEY (\`express_id\`) REFERENCES \`sys_express\`(\`express_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`sys_shipping_template\` DROP FOREIGN KEY \`FK_86297801189dcf7f639c5e69a1a\``);
    await queryRunner.query(`ALTER TABLE \`sys_shipping_template_rule\` DROP FOREIGN KEY \`FK_38c983ba936c86bea0cd0407a82\``);
    await queryRunner.query(`DROP TABLE \`sys_shipping_template\``);
    await queryRunner.query(`DROP TABLE \`sys_shipping_template_rule\``);
  }
}
