import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ECommercePlatformOrderEntity } from './e-commerce-platform-order.entity';

@Entity('e_commerce_platform_order_goodsInfo', {
  comment: '电商平台订单商品信息',
})
export class ECommercePlatformOrderGoodsInfoEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'pt_order_goods_info_id', comment: '订单商品信息ID' })
  public ptOrderGoodsInfoId: number;
  // goodsCount
  @Column({ type: 'int', name: 'goods_count', comment: '商品数量', nullable: true, default: 0 })
  public goodsCount: number;
  // goodsName
  @Column({ type: 'varchar', name: 'goods_name', length: 255, comment: '商品名称', nullable: true, default: '' })
  public goodsName: string;
  // goodsImg
  @Column({ type: 'varchar', name: 'goods_img', length: 255, comment: '商品图片', nullable: true, default: '' })
  public goodsImg: string;
  // goodsSpec
  @Column({ type: 'varchar', name: 'goods_spec', length: 255, comment: '商品规格', nullable: true, default: '' })
  public goodsSpec: string;
  // goodsPrice
  @Column({ type: 'decimal', name: 'goods_price', precision: 10, scale: 2, comment: '商品价格', nullable: true, default: 0 })
  public goodsPrice: number;
  // goodsId
  @Column({ type: 'varchar', name: 'goods_id', comment: '商品ID', nullable: true, default: '' })
  public goodsId: string;
  // skuId
  @Column({ type: 'varchar', name: 'sku_id', comment: 'SKU ID', nullable: true, default: '' })
  public skuId: string;
  //  outerId
  @Column({ type: 'varchar', name: 'outer_id', comment: '外部ID', nullable: true, default: '' })
  public outerId: string;
  // outerGoodsId
  @Column({ type: 'varchar', name: 'outer_goods_id', comment: '外部商品ID', nullable: true, default: '' })
  public outerGoodsId: string;

  @ManyToOne(() => ECommercePlatformOrderEntity, (ptOrder) => ptOrder.goodsInfo, { onDelete: 'CASCADE' })
  public ptOrder: ECommercePlatformOrderEntity;
}
