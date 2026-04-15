import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * migration:generate 曾把「删旧索引 + 建 UQ_goods_sku_goods_spec」再次写进迁移，
 * 但 UQ 已由 GoodsSkuUniqueUpsert1776220914990 建好，再执行会 ER_DUP_KEYNAME。
 * 本迁移只做：若仍存在非唯一的 idx_spec_fingerprint_goods_id 则删除（与唯一索引列重复、可省略）。
 */
export class UpdateTable0011776221384719 implements MigrationInterface {
  name = 'UpdateTable0011776221384719';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(`
      SELECT COUNT(*) AS cnt FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'goods_sku'
        AND index_name = 'idx_spec_fingerprint_goods_id'
    `);
    if (Number(rows[0]?.cnt) > 0) {
      await queryRunner.query('DROP INDEX `idx_spec_fingerprint_goods_id` ON `goods_sku`');
    }
  }

  public async down(): Promise<void> {
    // 与 1776220914990 的 down 配合时由人工决定；不在此重建易与唯一约束冲突的旧索引。
  }
}
