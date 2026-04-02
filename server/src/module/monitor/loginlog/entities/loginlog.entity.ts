import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BaseStatusEntity } from 'src/common/entities/base';
import { dateTransformer } from 'src/common/utils/index';

@Entity('sys_logininfor', {
  comment: '系统访问记录',
})
export class MonitorLoginlogEntity extends BaseStatusEntity {
  @Column({ type: 'int', name: 'tenant_id', default: 1, comment: '租户ID' })
  tenantId: number;

  @Column({ type: 'int', name: 'dept_id', nullable: true, comment: '部门ID' })
  deptId: number;

  @Column({ type: 'int', name: 'owner_user_id', nullable: true, comment: '数据所有者用户ID' })
  ownerUserId: number;

  @PrimaryGeneratedColumn({ type: 'int', name: 'info_id', comment: '访问ID' })
  public infoId: number;

  @Column({ type: 'varchar', name: 'user_name', length: 50, default: '', comment: '用户账号' })
  public userName: string;

  @Column({ type: 'varchar', name: 'ipaddr', length: 128, default: '', comment: '登录IP地址' })
  public ipaddr: string;

  @Column({ type: 'varchar', name: 'login_location', length: 255, default: '', comment: '登录地点' })
  public loginLocation: string;

  @Column({ type: 'varchar', name: 'browser', length: 50, default: '', comment: '浏览器类型' })
  public browser: string;

  @Column({ type: 'varchar', name: 'os', length: 50, default: '', comment: '操作系统' })
  public os: string;

  @CreateDateColumn({ type: 'timestamp', name: 'login_time', transformer: dateTransformer, comment: '访问时间' })
  public loginTime: Date;

  //提示消息
  @Column({ type: 'varchar', name: 'msg', length: 255, default: '', comment: '提示消息' })
  public msg: string;
}
