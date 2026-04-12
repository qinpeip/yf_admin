import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ECommercePlatformSpecEntity } from './e-commerce-platform-spec.entity';
import { ECommercePlatformGoodsEntity } from './e-commerce-platform-goods.entity';

@Entity('e_commerce_platform_sku', {
  comment: '电商平台SKU',
})
export class ECommercePlatformSkuEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'ID' })
  public id: number;

  // is_sku_onsale
  @Column({ type: 'boolean', name: 'is_sku_onsale', comment: '是否上架', nullable: true, default: false })
  public is_sku_onsale: boolean;

  // outer_id
  @Column({ type: 'varchar', name: 'outer_id', length: 255, comment: '外部ID', nullable: true, default: '' })
  public outer_id: string;

  // reserve_quantity
  @Column({ type: 'int', name: 'reserve_quantity', comment: '预留数量', nullable: true, default: 0 })
  public reserve_quantity: number;

  // sku_id
  @Column({ type: 'int', name: 'sku_id', comment: 'SKU ID', nullable: true, default: 0 })
  public sku_id: number;

  // sku_quantity
  @Column({ type: 'int', name: 'sku_quantity', comment: 'SKU数量', nullable: true, default: 0 })
  public sku_quantity: number;

  // spec
  @Column({ type: 'varchar', name: 'spec', length: 255, comment: '规格', nullable: true, default: '' })
  public spec: string;

  @OneToMany(() => ECommercePlatformSpecEntity, (spec) => spec.sku, { cascade: true })
  public spec_details: ECommercePlatformSpecEntity[];

  @ManyToOne(() => ECommercePlatformGoodsEntity, (goods) => goods.sku_list, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_id' })
  public goods: ECommercePlatformGoodsEntity;
}
