import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GoodsAttrsEntity } from './goods-attrs.entity';

@Entity('goods_attrs_options', {
  comment: '商品属性选项',
})
export class GoodsAttrsOptionsEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'goods_attrs_options_id', comment: '商品属性选项ID' })
  public goodsAttrsOptionsId: number;

  @Column({ type: 'varchar', name: 'option_name', length: 255, comment: '选项名称' })
  public optionName: string;

  @Column({ type: 'varchar', name: 'img_url', length: 255, comment: '图片URL', nullable: true, default: '' })
  public imgUrl: string;

  // remark
  @Column({ type: 'varchar', name: 'remark', length: 255, comment: '备注', nullable: true, default: '' })
  public remark: string;

  // price
  @Column({ type: 'decimal', name: 'price', precision: 10, scale: 2, comment: '价格', nullable: true, default: 0 })
  public price: number;

  @Column({ type: 'int', name: 'num1', comment: '数值1', nullable: true, default: 0 })
  public num1: number;

  @Column({ type: 'int', name: 'num2', comment: '数值2', nullable: true, default: 0 })
  public num2: number;

  @ManyToOne(() => GoodsAttrsEntity, (attrs) => attrs.attrsOptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goods_attrs_id' })
  public attrs: GoodsAttrsEntity;
}
