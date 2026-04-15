import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 为 goods_sku(goods_id, spec_fingerprint) 建立唯一约束，配合 Repository.upsert 批量写入。
 * 建索引前会删除历史重复行（同一商品 + 同一指纹保留 goods_sku_id 最小的一行）。
 */
export class GoodsSkuUniqueUpsert1776220914990 implements MigrationInterface {
  name = 'GoodsSkuUniqueUpsert1776220914990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DELETE gs1 FROM \`goods_sku\` gs1
INNER JOIN \`goods_sku\` gs2
  ON gs1.\`goods_id\` = gs2.\`goods_id\`
  AND gs1.\`spec_fingerprint\` = gs2.\`spec_fingerprint\`
  AND gs1.\`goods_sku_id\` > gs2.\`goods_sku_id\`
`);
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_goods_sku_goods_spec` ON `goods_sku` (`goods_id`, `spec_fingerprint`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `UQ_goods_sku_goods_spec` ON `goods_sku`');
  }
}
