import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775616439028 implements MigrationInterface {
  name = 'UpdateTable0011775616439028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_category\` ADD \`dept_id\` int NULL COMMENT '部门ID'`);
    await queryRunner.query(`ALTER TABLE \`goods_craftsmanship\` ADD \`dept_id\` int NULL COMMENT '部门ID'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_craftsmanship\` DROP COLUMN \`dept_id\``);
    await queryRunner.query(`ALTER TABLE \`goods_category\` DROP COLUMN \`dept_id\``);
  }
}
