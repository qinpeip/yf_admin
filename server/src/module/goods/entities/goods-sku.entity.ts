import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GoodsEntity } from './goods.entity';

/**
 * 与前端笛卡尔积每一行对应：每个元素表示在某个 attr key 下选中的选项。
 * goodsAttrsOptionsId 在已落库的商品上可填，用于与 goods_attrs_options 对齐；新建草稿阶段可省略。
 */
export type GoodsSkuSpecJsonItem = {
  key: string;
  attrName: string;
  optionName: string;
  imgUrl?: string;
  price?: number;
  num1?: number;
  num2?: number;
  remark?: string;
};

@Entity('goods_sku', {
  comment: '商品SKU（多规格笛卡尔积的一行）',
})
export class GoodsSkuEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_sku_id', comment: 'SKU ID' })
  public goodsSkuId: number;

  /** 列表展示顺序，与生成顺序一致即可 */
  @Column({ type: 'int', name: 'sort_order', comment: '排序', default: 0 })
  public sortOrder: number;

  /** 该 SKU 在各维度上的选项快照（下单、展示、对账都够用） */
  @Column({ type: 'json', name: 'spec_json', comment: '规格组合 JSON 快照' })
  public spec: GoodsSkuSpecJsonItem[];

  @Column({ type: 'decimal', name: 'price', precision: 10, scale: 4, comment: '价格', nullable: true, default: 0 })
  public price: number;

  @Column({ type: 'int', name: 'stock', comment: '库存', nullable: true, default: 0 })
  public stock: number;
  /**
   * 同一商品下规格组合唯一键：建议对 spec_json 按 key 排序后序列化再 hash（保存时在 Service 里生成）
   */
  @Column({ type: 'varchar', name: 'spec_fingerprint', length: 64, comment: '规格指纹（去重）' })
  public specFingerprint: string;

  @Column({ type: 'varchar', name: 'sku_code', length: 64, comment: '商家编码', nullable: true, default: '' })
  public skuCode: string;

  @ManyToOne(() => GoodsEntity, (goods) => goods.skus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_id' })
  public goods: GoodsEntity;
}
