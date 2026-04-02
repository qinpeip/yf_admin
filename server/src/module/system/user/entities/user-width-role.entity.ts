import { Column, Entity, PrimaryColumn } from 'typeorm';

//用户和角色关联表  用户N-1角色
@Entity('sys_user_role', {
  comment: '用户和角色关联表',
})
export class SysUserWithRoleEntity {
  @PrimaryColumn({ type: 'int', name: 'user_id', comment: '用户ID' })
  public userId: number;

  @PrimaryColumn({ type: 'int', name: 'role_id', comment: '角色ID' })
  public roleId: number;

  @Column({ type: 'int', name: 'tenant_id', default: 1, comment: '租户ID' })
  public tenantId: number;

  @Column({ type: 'int', name: 'dept_id', nullable: true, default: null, comment: '部门ID' })
  public deptId: number;

  @Column({ type: 'int', name: 'owner_user_id', nullable: true, default: null, comment: '数据所有者用户ID' })
  public ownerUserId: number;
}
