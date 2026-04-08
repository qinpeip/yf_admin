import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GoodsClassEntity } from './class.entity';

// 默认属性-尺寸
export const CLASS_ATTRS_SIZE = 'size';
// 默认属性-款数
export const CLASS_ATTRS_KS = 'KS';
// 默认属性-数量
export const CLASS_ATTRS_NUM = 'NUM';

@Entity('goods_class_attrs', {
  comment: '类目属性',
})
export class GoodsClassAttrsEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'attr_id', comment: '属性ID' })
  public attrId: number;

  @Column({ type: 'varchar', name: 'attr_name', length: 255, comment: '属性名称' })
  public attrName: string;

  @Column({ type: 'boolean', name: 'join_normal_price', comment: '是否参与普通价格计算', default: true })
  public joinNormalPrice: boolean;

  @Column({ type: 'boolean', name: 'enable', comment: '是否启用', default: true })
  public enable: boolean;

  @Column({ type: 'varchar', name: 'key', length: 255, comment: '属性键' })
  public key: string;

  @Column({ type: 'boolean', name: 'join_square_price', comment: '是否参与平方价格计算', default: true })
  public joinSquarePrice: boolean;

  @ManyToOne(() => GoodsClassEntity, (classEntity) => classEntity.classId, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  public class: GoodsClassEntity;
}
