import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';

@Entity('goods_craftsmanship', {
  comment: '工艺',
})
export class GoodsCraftsmanshipEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'craftsmanship_id', comment: '工艺ID' })
  public craftsmanshipId: number;

  @Column({ type: 'varchar', name: 'name', length: 255, comment: '名称' })
  public name: string;

  @Column({ type: 'int', name: 'sort', comment: '排序', default: 0 })
  public sort: number;

  @Column({ type: 'varchar', name: 'description', length: 255, comment: '描述', nullable: true })
  public description: string;

  @Column({ type: 'int', name: 'dept_id', default: null, comment: '部门ID' })
  public deptId: number;
}
