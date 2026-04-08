import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775642999062 implements MigrationInterface {
  name = 'UpdateTable0011775642999062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_class\` ADD \`attr_text\` varchar(255) NULL COMMENT '属性文本'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_class\` DROP COLUMN \`attr_text\``);
  }
}
