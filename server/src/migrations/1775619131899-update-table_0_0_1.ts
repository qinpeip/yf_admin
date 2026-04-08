import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775619131899 implements MigrationInterface {
  name = 'UpdateTable0011775619131899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`goods_class_attrs\` (\`attr_id\` int NOT NULL AUTO_INCREMENT COMMENT '属性ID', \`attr_name\` varchar(255) NOT NULL COMMENT '属性名称', \`join_normal_price\` tinyint NOT NULL COMMENT '是否参与普通价格计算' DEFAULT 1, \`enable\` tinyint NOT NULL COMMENT '是否启用' DEFAULT 1, \`key\` varchar(255) NOT NULL COMMENT '属性键', \`join_square_price\` tinyint NOT NULL COMMENT '是否参与平方价格计算' DEFAULT 1, \`class_id\` int NULL COMMENT '类目ID', PRIMARY KEY (\`attr_id\`)) ENGINE=InnoDB COMMENT="类目属性"`,
    );
    await queryRunner.query(
      `CREATE TABLE \`goods_class\` (\`tenant_id\` int NOT NULL COMMENT '租户ID' DEFAULT '1', \`owner_user_id\` int NULL COMMENT '数据所有者用户ID', \`create_by\` varchar(64) NOT NULL COMMENT '创建者' DEFAULT '', \`create_time\` datetime(6) NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_by\` varchar(64) NOT NULL COMMENT '更新者' DEFAULT '', \`update_time\` datetime(6) NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_time\` datetime(6) NULL COMMENT '删除时间', \`class_id\` int NOT NULL AUTO_INCREMENT COMMENT '类目ID', \`name\` varchar(255) NOT NULL COMMENT '名称', \`parent_id\` int NULL COMMENT '父ID', \`sort\` int NOT NULL COMMENT '排序' DEFAULT '0', \`dept_id\` int NULL COMMENT '部门ID', \`type\` enum ('1', '2') NOT NULL COMMENT '类目类型：1-定制性商品，2-非定制型商品' DEFAULT '1', \`status\` char NOT NULL COMMENT '状态' DEFAULT '1', \`description\` varchar(255) NULL COMMENT '描述', PRIMARY KEY (\`class_id\`)) ENGINE=InnoDB COMMENT="商品类目"`,
    );
    await queryRunner.query(
      `ALTER TABLE \`goods_class_attrs\` ADD CONSTRAINT \`FK_bba60b76a8176f48f340bcfd3e3\` FOREIGN KEY (\`class_id\`) REFERENCES \`goods_class\`(\`class_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_class_attrs\` DROP FOREIGN KEY \`FK_bba60b76a8176f48f340bcfd3e3\``);
    await queryRunner.query(`DROP TABLE \`goods_class\``);
    await queryRunner.query(`DROP TABLE \`goods_class_attrs\``);
  }
}
