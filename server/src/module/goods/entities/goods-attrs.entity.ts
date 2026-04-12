import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GoodsEntity } from './goods.entity';
import { GoodsAttrsOptionsEntity } from './goods-attrs-options.entity';

@Entity('goods_attrs', {
  comment: '商品类目属性',
})
export class GoodsAttrsEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_class_attrs_id', comment: '商品类目属性ID' })
  public goodsAttrsId: number;

  @Column({ type: 'varchar', name: 'attr_name', length: 255, comment: '属性名称' })
  public attrName: string;

  @Column({ type: 'boolean', name: 'join_normal_price', comment: '是否参与普通价格计算', default: true })
  public joinNormalPrice: boolean;

  @Column({ type: 'boolean', name: 'join_square_price', comment: '是否参与平方价格计算', default: true })
  public joinSquarePrice: boolean;

  @Column({ type: 'varchar', name: 'key', length: 255, comment: '属性键' })
  public key: string;

  @Column({ type: 'boolean', name: 'custom_value', comment: '是否自定义值', default: false })
  public customValue: boolean;

  @Column({ type: 'boolean', name: 'has_img', comment: '是否需要图片', default: false })
  public hasImg: boolean;

  @ManyToOne(() => GoodsEntity, (goods) => goods.attrs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_id' })
  public goods: GoodsEntity;

  @OneToMany(() => GoodsAttrsOptionsEntity, (attrsOptions) => attrsOptions.attrs, { cascade: true })
  public attrsOptions: GoodsAttrsOptionsEntity[];
}
