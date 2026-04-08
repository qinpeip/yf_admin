import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable0011775642856569 implements MigrationInterface {
  name = 'UpdateTable0011775642856569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_class\` CHANGE \`parent_id\` \`parent_id\` int NOT NULL COMMENT '父ID' DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`goods_class\` CHANGE \`parent_id\` \`parent_id\` int NULL COMMENT '父ID'`);
  }
}
