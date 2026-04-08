import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { GoodsClassAttrsEntity } from './class-attrs.entity';

// 类目类型：1-定制性商品，2-非定制型商品
export enum GOODS_CLASS_TYPE {
  CUSTOMIZATION = '1',
  NON_CUSTOMIZATION = '2',
}

@Entity('goods_class', {
  comment: '商品类目',
})
export class GoodsClassEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'class_id', comment: '类目ID' })
  public classId: number;

  @Column({ type: 'varchar', name: 'name', length: 255, comment: '名称' })
  public name: string;

  @Column({ type: 'int', name: 'parent_id', comment: '父ID', default: 0 })
  public parentId: number;

  @Column({ type: 'int', name: 'sort', comment: '排序', default: 0 })
  public sort: number;

  @Column({ type: 'int', name: 'dept_id', default: null, comment: '部门ID' })
  public deptId: number;

  @Column({ type: 'enum', name: 'type', enum: GOODS_CLASS_TYPE, comment: '类目类型：1-定制性商品，2-非定制型商品', default: GOODS_CLASS_TYPE.CUSTOMIZATION })
  public type: GOODS_CLASS_TYPE;

  // status
  @Column({ type: 'char', name: 'status', comment: '状态', default: '1' })
  public status: string;

  @Column({ type: 'varchar', name: 'description', length: 255, comment: '描述', nullable: true })
  public description: string;

  @Column({ type: 'varchar', name: 'attr_text', length: 255, comment: '属性文本', nullable: true })
  public attrText: string;

  @OneToMany(() => GoodsClassAttrsEntity, (attrs) => attrs.class, { cascade: true })
  public attrs: GoodsClassAttrsEntity[];
}
