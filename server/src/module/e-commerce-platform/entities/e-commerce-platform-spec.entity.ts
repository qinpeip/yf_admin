import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ECommercePlatformSkuEntity } from './e-commerce-platform-sku.entity';

@Entity('e_commerce_platform_spec', {
  comment: '电商平台规格',
})
export class ECommercePlatformSpecEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', comment: 'ID' })
  public id: number;
  // parent_id
  @Column({ type: 'int', name: 'parent_id', comment: '父ID', nullable: true, default: 0 })
  public parent_id: number;
  // parent_name
  @Column({ type: 'varchar', name: 'parent_name', length: 255, comment: '父名称', nullable: true, default: '' })
  public parent_name: string;
  // spec_id
  @Column({ type: 'int', name: 'spec_id', comment: '规格ID', nullable: true, default: 0 })
  public spec_id: number;
  // spec_name
  @Column({ type: 'varchar', name: 'spec_name', length: 255, comment: '规格名称', nullable: true, default: '' })
  public spec_name: string;
  // spec_note
  @Column({ type: 'varchar', name: 'spec_note', length: 255, comment: '规格备注', nullable: true, default: '' })
  public spec_note: string;

  @ManyToOne(() => ECommercePlatformSkuEntity, (sku) => sku.spec_details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sku_id' })
  public sku: ECommercePlatformSkuEntity;
}
