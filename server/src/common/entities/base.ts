import { Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { dateTransformer } from 'src/common/utils/index';
import { ApiProperty } from '@nestjs/swagger';

// 状态
@Entity()
export abstract class BaseStatusEntity {
  //0正常 1停用
  @ApiProperty({ type: String, description: '状态' })
  @Column({ type: 'char', name: 'status', default: '0', length: 1, comment: '状态' })
  public status: string;
}

//基础实体信息
@Entity()
export abstract class BaseEntity {
  @ApiProperty({ type: Number, description: '租户ID' })
  @Column({ type: 'int', name: 'tenant_id', default: 1, comment: '租户ID' })
  public tenantId: number;

  @ApiProperty({ type: Number, description: '数据所有者用户ID' })
  @Column({ type: 'int', name: 'owner_user_id', nullable: true, default: null, comment: '数据所有者用户ID' })
  public ownerUserId: number;

  @ApiProperty({ type: String, description: '创建者' })
  @Column({ type: 'varchar', name: 'create_by', length: 64, default: '', comment: '创建者' })
  public createBy: string;

  @CreateDateColumn({ type: 'datetime', name: 'create_time', default: null, transformer: dateTransformer, comment: '创建时间' })
  public createTime: Date;

  @Column({ type: 'varchar', name: 'update_by', length: 64, default: '', comment: '更新者' })
  public updateBy: string;

  @UpdateDateColumn({ type: 'datetime', name: 'update_time', default: null, transformer: dateTransformer, comment: '更新时间' })
  public updateTime: Date;

  @DeleteDateColumn({ type: 'datetime', name: 'delete_time', default: null, transformer: dateTransformer, comment: '删除时间' })
  public deleteTime: Date;
}
