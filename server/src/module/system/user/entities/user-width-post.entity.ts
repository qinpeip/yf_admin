import { Column, Entity, PrimaryColumn } from 'typeorm';

//用户与岗位关联表  用户1-N岗位
@Entity('sys_user_post', {
  comment: '用户与岗位关联表',
})
export class SysUserWithPostEntity {
  @PrimaryColumn({ type: 'int', name: 'user_id', comment: '用户ID' })
  public userId: number;

  @PrimaryColumn({ type: 'int', name: 'post_id', comment: '岗位ID' })
  public postId: number;

  @Column({ type: 'int', name: 'tenant_id', default: 1, comment: '租户ID' })
  public tenantId: number;

  @Column({ type: 'int', name: 'dept_id', nullable: true, default: null, comment: '部门ID' })
  public deptId: number;

  @Column({ type: 'int', name: 'owner_user_id', nullable: true, default: null, comment: '数据所有者用户ID' })
  public ownerUserId: number;
}
