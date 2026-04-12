import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { GoodsEntity } from './goods.entity';
import { GoodsCraftsmanshipEntity } from '../craftsmanship/entities/craftsmanship.entity';
import { GoodsChildCraftsmanshipEntity } from './goods-child-craftsmanship.entity';

export enum GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE {
  // 普通计价
  NORMAL = '1',
  // 平方计价
  SQUARE = '2',
}

@Entity('goods_with_craftsmanship', {
  comment: '商品与工艺关联',
})
export class GoodsWithCraftsmanshipEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_with_craftsmanship_id', comment: '商品与工艺关联ID' })
  public goodsWithCraftsmanshipId: number;

  @Column({ type: 'enum', name: 'price_type', enum: GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE, comment: '价格类型', default: GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE.NORMAL })
  public priceType: GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE;

  @ManyToOne(() => GoodsEntity, (goods) => goods.craftsmanship, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_id' })
  public goods: GoodsEntity;

  @ManyToOne(() => GoodsCraftsmanshipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'craftsmanship_id' })
  public craftsmanship: GoodsCraftsmanshipEntity;

  @OneToMany(() => GoodsChildCraftsmanshipEntity, (childCraftsmanship) => childCraftsmanship.craftsmanship, { cascade: true })
  public childCraftsmanship: GoodsChildCraftsmanshipEntity[];
}
