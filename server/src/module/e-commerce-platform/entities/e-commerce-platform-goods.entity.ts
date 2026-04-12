import { BaseEntity } from 'src/common/entities/base';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ECommercePlatformSkuEntity } from './e-commerce-platform-sku.entity';

@Entity('e_commerce_platform_goods', {
  comment: '电商平台商品',
})
export class ECommercePlatformGoodsEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'ID' })
  public id: number;

  // created_at
  @Column({ type: 'datetime', name: 'created_at', comment: '创建时间', nullable: true, default: null })
  public created_at: Date;

  // goods_id
  @Column({ type: 'int', name: 'goods_id', comment: '电商平台商品ID', nullable: true, default: 0 })
  public goods_id: number;

  // goods_name
  @Column({ type: 'varchar', name: 'goods_name', length: 255, comment: '商品名称', nullable: true, default: '' })
  public goods_name: string;

  // goods_quantity
  @Column({ type: 'int', name: 'goods_quantity', comment: '商品数量', nullable: true, default: 0 })
  public goods_quantity: number;

  // goods_reserve_quantity
  @Column({ type: 'int', name: 'goods_reserve_quantity', comment: '商品预留数量', nullable: true, default: 0 })
  public goods_reserve_quantity: number;

  // image_url
  @Column({ type: 'varchar', name: 'image_url', length: 255, comment: '商品图片URL', nullable: true, default: '' })
  public image_url: string;

  // is_more_sku
  @Column({ type: 'boolean', name: 'is_more_sku', comment: '是否有多SKU', nullable: true, default: false })
  public is_more_sku: boolean;

  // is_onsale
  @Column({ type: 'boolean', name: 'is_onsale', comment: '是否上架', nullable: true, default: false })
  public is_onsale: boolean;

  // outer_goods_id
  @Column({ type: 'varchar', name: 'outer_goods_id', length: 255, comment: '外部商品ID', nullable: true, default: '' })
  public outer_goods_id: string;

  // thumb_url
  @Column({ type: 'varchar', name: 'thumb_url', length: 255, comment: '商品缩略图URL', nullable: true, default: '' })
  public thumb_url: string;

  // mid
  @Column({ type: 'int', name: 'mid', comment: 'MID', nullable: true, default: 0 })
  public mid: number;

  // dept_id
  @Column({ type: 'int', name: 'dept_id', comment: '部门ID', nullable: true, default: 0 })
  public deptId: number;

  // sku_list
  @OneToMany(() => ECommercePlatformSkuEntity, (sku) => sku.goods, { cascade: true })
  public sku_list: ECommercePlatformSkuEntity[];
}
