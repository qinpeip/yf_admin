import { UserEntity } from 'src/module/system/user/entities/sys-user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GoodsPublicEntity } from './goods-public.entity';
import { BaseEntity } from 'src/common/entities/base';

@Entity('goods_public_supplier', {
  comment: '供应商绑定公共池商品',
})
export class GoodsPublicSupplierEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_public_supplier_id', comment: '公共池商品供应商ID' })
  public goodsPublicSupplierId: number;

  // premium_fee
  @Column({ type: 'decimal', name: 'premium_fee', precision: 10, scale: 2, comment: '溢价', nullable: true, default: 0 })
  public premiumFee: number;

  // dept_id
  @Column({ type: 'int', name: 'dept_id', comment: '部门ID', nullable: true })
  public deptId: number;

  @ManyToOne(() => GoodsPublicEntity, (goodsPublic) => goodsPublic.supplierPublicGoods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_public_id' })
  public goodsPublic: GoodsPublicEntity;
}
