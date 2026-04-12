import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GoodsWithCraftsmanshipEntity } from './goods-with-craftsmanship.entity';

@Entity('goods_child_craftsmanship', {
  comment: '商品子工艺关联',
})
export class GoodsChildCraftsmanshipEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_child_craftsmanship_id', comment: '商品子工艺关联ID' })
  public goodsChildCraftsmanshipId: number;

  @Column({ type: 'varchar', name: 'name', length: 255, comment: '名称' })
  public name: string;

  @Column({ type: 'decimal', name: 'price', precision: 10, scale: 2, comment: '价格', default: 0 })
  public price: number;

  @ManyToOne(() => GoodsWithCraftsmanshipEntity, (craftsmanship) => craftsmanship.childCraftsmanship, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_with_craftsmanship_id' })
  public craftsmanship: GoodsWithCraftsmanshipEntity;
}
