import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

//角色和菜单关联表  角色1-N菜单
@Entity('sys_role_menu', {
  comment: '角色和菜单关联表',
})
export class SysRoleWithMenuEntity {
  @PrimaryColumn({ type: 'int', name: 'role_id', default: 0, comment: '角色ID' })
  public roleId: number;

  @PrimaryColumn({ type: 'int', name: 'menu_id', default: 0, comment: '菜单ID' })
  public menuId: number;

  @Column({ type: 'int', name: 'tenant_id', default: 1, comment: '租户ID' })
  public tenantId: number;

  @Column({ type: 'int', name: 'dept_id', nullable: true, default: null, comment: '部门ID' })
  public deptId: number;

  @Column({ type: 'int', name: 'owner_user_id', nullable: true, default: null, comment: '数据所有者用户ID' })
  public ownerUserId: number;
}
