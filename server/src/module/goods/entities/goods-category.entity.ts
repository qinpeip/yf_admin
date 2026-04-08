import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('goods_category', {
  comment: '商品分类',
})
export class GoodsCategoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'category_id', comment: '分类ID' })
  public categoryId: number;

  @Column({ type: 'varchar', name: 'name', length: 255, comment: '名称' })
  public name: string;

  @Column({ type: 'int', name: 'parent_id', comment: '父ID', nullable: true })
  public parentId: number;

  @Column({ type: 'int', name: 'sort', comment: '排序', default: 0 })
  public sort: number;

  @Column({ type: 'varchar', name: 'icon', length: 255, comment: '图标', nullable: true })
  public icon: string;

  @Column({ type: 'varchar', name: 'description', length: 255, comment: '描述', nullable: true })
  public description: string;

  @Column({ type: 'char', name: 'status', comment: '状态', default: '1' })
  public status: string;

  @Column({ type: 'int', name: 'dept_id', default: null, comment: '部门ID' })
  public deptId: number;
}
