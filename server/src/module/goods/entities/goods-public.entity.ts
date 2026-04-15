import { dateTransformer } from 'src/common/utils';
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GoodsEntity } from './goods.entity';
import { GoodsPublicSupplierEntity } from './goods-public-supplier.entity';

export enum GOODS_PUBLIC_STATUS {
  // 待审核
  PENDING = '10',
  // 已上架
  ON_SALE = '20',
  // 驳回
  REJECTED = '30',
}

@Entity('goods_public', {
  comment: '公共池商品',
})
export class GoodsPublicEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_public_id', comment: '公共池商品ID' })
  public goodsPublicId: number;

  @Column({ type: 'enum', name: 'status', enum: GOODS_PUBLIC_STATUS, comment: '状态', default: GOODS_PUBLIC_STATUS.PENDING })
  public status: GOODS_PUBLIC_STATUS;

  @Column({ type: 'varchar', name: 'remark', comment: '备注', nullable: true, default: '' })
  public remark: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time', default: null, transformer: dateTransformer, comment: '创建时间' })
  public createTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', default: null, transformer: dateTransformer, comment: '更新时间' })
  public updateTime: Date;

  @Column({ type: 'datetime', name: 'audit_time', default: null, transformer: dateTransformer, comment: '审核时间' })
  public auditTime: Date;
  // premium_fee
  @Column({ type: 'decimal', name: 'premium_fee', precision: 10, scale: 2, comment: '溢价', nullable: true, default: 0 })
  public premiumFee: number;

  @OneToOne(() => GoodsEntity, (goods) => goods.public, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_id' })
  public goods: GoodsEntity;

  @OneToMany(() => GoodsPublicSupplierEntity, (supplier) => supplier.goodsPublic, { cascade: true })
  public supplierPublicGoods: GoodsPublicSupplierEntity[];
}
