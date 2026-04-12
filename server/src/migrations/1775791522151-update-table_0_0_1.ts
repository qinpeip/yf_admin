import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775791522151 implements MigrationInterface {
  name = 'UpdateTable0011775791522151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`goods_child_craftsmanship\` (\`goods_child_craftsmanship_id\` int NOT NULL AUTO_INCREMENT COMMENT '商品子工艺关联ID', \`name\` varchar(255) NOT NULL COMMENT '名称', \`price\` decimal(10,2) NOT NULL COMMENT '价格' DEFAULT '0.00', \`goods_with_craftsmanship_id\` int NULL COMMENT '商品与工艺关联ID', PRIMARY KEY (\`goods_child_craftsmanship_id\`)) ENGINE=InnoDB COMMENT="商品子工艺关联"`,
    );
    await queryRunner.query(
      `CREATE TABLE \`goods_with_craftsmanship\` (\`goods_with_craftsmanship_id\` int NOT NULL AUTO_INCREMENT COMMENT '商品与工艺关联ID', \`price_type\` enum ('1', '2') NOT NULL COMMENT '价格类型' DEFAULT '1', \`goods_id\` int NULL COMMENT '商品ID', \`craftsmanship_id\` int NULL COMMENT '工艺ID', PRIMARY KEY (\`goods_with_craftsmanship_id\`)) ENGINE=InnoDB COMMENT="商品与工艺关联"`,
    );
    await queryRunner.query(
      `CREATE TABLE \`goods_attrs_options\` (\`goods_attrs_options_id\` int NOT NULL AUTO_INCREMENT COMMENT '商品属性选项ID', \`option_name\` varchar(255) NOT NULL COMMENT '选项名称', \`img_url\` varchar(255) NULL COMMENT '图片URL' DEFAULT '', \`remark\` varchar(255) NULL COMMENT '备注' DEFAULT '', \`price\` decimal(10,2) NULL COMMENT '价格' DEFAULT '0.00', \`num1\` int NULL COMMENT '数值1' DEFAULT '0', \`num2\` int NULL COMMENT '数值2' DEFAULT '0', \`goods_attrs_id\` int NULL COMMENT '商品类目属性ID', PRIMARY KEY (\`goods_attrs_options_id\`)) ENGINE=InnoDB COMMENT="商品属性选项"`,
    );
    await queryRunner.query(
      `CREATE TABLE \`goods_attrs\` (\`goods_class_attrs_id\` int NOT NULL AUTO_INCREMENT COMMENT '商品类目属性ID', \`attr_name\` varchar(255) NOT NULL COMMENT '属性名称', \`join_normal_price\` tinyint NOT NULL COMMENT '是否参与普通价格计算' DEFAULT 1, \`join_square_price\` tinyint NOT NULL COMMENT '是否参与平方价格计算' DEFAULT 1, \`key\` varchar(255) NOT NULL COMMENT '属性键', \`custom_value\` tinyint NOT NULL COMMENT '是否自定义值' DEFAULT 0, \`has_img\` tinyint NOT NULL COMMENT '是否需要图片' DEFAULT 0, \`goods_id\` int NULL COMMENT '商品ID', PRIMARY KEY (\`goods_class_attrs_id\`)) ENGINE=InnoDB COMMENT="商品类目属性"`,
    );
    await queryRunner.query(
      `CREATE TABLE \`goods\` (\`tenant_id\` int NOT NULL COMMENT '租户ID' DEFAULT '1', \`owner_user_id\` int NULL COMMENT '数据所有者用户ID', \`create_by\` varchar(64) NOT NULL COMMENT '创建者' DEFAULT '', \`create_time\` datetime(6) NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`update_by\` varchar(64) NOT NULL COMMENT '更新者' DEFAULT '', \`update_time\` datetime(6) NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_time\` datetime(6) NULL COMMENT '删除时间', \`goods_id\` int NOT NULL AUTO_INCREMENT COMMENT '商品ID', \`name\` varchar(255) NOT NULL COMMENT '名称', \`description\` varchar(255) NULL COMMENT '描述' DEFAULT '', \`image\` varchar(255) NULL COMMENT '图片' DEFAULT '', \`weight\` decimal(10,2) NULL COMMENT '重量' DEFAULT '0.00', \`volume\` decimal(10,2) NULL COMMENT '体积' DEFAULT '0.00', \`bleed_range\` int NULL COMMENT '图片出血范围（mm）' DEFAULT '0', \`price_type\` enum ('1', '2') NOT NULL COMMENT '计价方式：1-平方计价，2-普通计价' DEFAULT '1', \`shipping_fee\` decimal(10,2) NULL COMMENT '运费' DEFAULT '0.00', \`status\` enum ('10', '20') NOT NULL COMMENT '状态：10-上架中，20-下架' DEFAULT '10', \`shipping_address\` varchar(255) NULL COMMENT '发货地址' DEFAULT '', \`shipping_type\` enum ('1', '2') NOT NULL COMMENT '运费类型 1-固定运费， 2-运费模板' DEFAULT '2', \`shipping_template_ids\` json NULL COMMENT '快递模板ids', \`base_packing_fee\` decimal(10,2) NULL COMMENT '基础打包费用' DEFAULT '0.00', \`is_customization\` tinyint NOT NULL COMMENT '是否定制商品' DEFAULT 0, \`show_price\` decimal(10,2) NULL COMMENT '展示价格' DEFAULT '0.00', \`upload_type\` enum ('card', 'photo', 'roll') NOT NULL COMMENT '上传类型(card:卡片,photo:照片,roll:条幅)' DEFAULT 'card', \`category_id\` int NULL COMMENT '分类ID', \`class_id\` int NULL COMMENT '类目ID', \`dept_id\` int NULL COMMENT '部门ID', PRIMARY KEY (\`goods_id\`)) ENGINE=InnoDB COMMENT="商品"`,
    );
    await queryRunner.query(
      `ALTER TABLE \`goods_child_craftsmanship\` ADD CONSTRAINT \`FK_aeb39411588c68adfaf545653b8\` FOREIGN KEY (\`goods_with_craftsmanship_id\`) REFERENCES \`goods_with_craftsmanship\`(\`goods_with_craftsmanship_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`goods_with_craftsmanship\` ADD CONSTRAINT \`FK_7d83f83f001d40dbdd17ab058d3\` FOREIGN KEY (\`goods_id\`) REFERENCES \`goods\`(\`goods_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`goods_with_craftsmanship\` ADD CONSTRAINT \`FK_e39e27a81e3418c79fcd1fd08ed\` FOREIGN KEY (\`craftsmanship_id\`) REFERENCES \`goods_craftsmanship\`(\`craftsmanship_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`goods_attrs_options\` ADD CONSTRAINT \`FK_5932ebf34f05eea00a2aea866bd\` FOREIGN KEY (\`goods_attrs_id\`) REFERENCES \`goods_attrs\`(\`goods_class_attrs_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`goods_attrs\` ADD CONSTRAINT \`FK_13d3721e494a558faf54ffd9e88\` FOREIGN KEY (\`goods_id\`) REFERENCES \`goods\`(\`goods_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_attrs\` DROP FOREIGN KEY \`FK_13d3721e494a558faf54ffd9e88\``);
    await queryRunner.query(`ALTER TABLE \`goods_attrs_options\` DROP FOREIGN KEY \`FK_5932ebf34f05eea00a2aea866bd\``);
    await queryRunner.query(`ALTER TABLE \`goods_with_craftsmanship\` DROP FOREIGN KEY \`FK_e39e27a81e3418c79fcd1fd08ed\``);
    await queryRunner.query(`ALTER TABLE \`goods_with_craftsmanship\` DROP FOREIGN KEY \`FK_7d83f83f001d40dbdd17ab058d3\``);
    await queryRunner.query(`ALTER TABLE \`goods_child_craftsmanship\` DROP FOREIGN KEY \`FK_aeb39411588c68adfaf545653b8\``);
    await queryRunner.query(`DROP TABLE \`goods\``);
    await queryRunner.query(`DROP TABLE \`goods_attrs\``);
    await queryRunner.query(`DROP TABLE \`goods_attrs_options\``);
    await queryRunner.query(`DROP TABLE \`goods_with_craftsmanship\``);
    await queryRunner.query(`DROP TABLE \`goods_child_craftsmanship\``);
  }
}
