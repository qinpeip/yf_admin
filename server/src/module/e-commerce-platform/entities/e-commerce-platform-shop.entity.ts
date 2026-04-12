import { PLATFORM_TYPE } from 'src/common/constant';
import { BaseEntity } from 'src/common/entities/base';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('e_commerce_platform_shop', {
  comment: '电商平台店铺',
})
export class ECommercePlatformShopEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'shop_id', comment: '店铺ID' })
  public shopId: number;

  @Column({ type: 'varchar', name: 'shop_name', length: 255, comment: '店铺名称', nullable: true, default: '' })
  public shopName: string;

  @Column({ type: 'enum', name: 'platform_type', enum: PLATFORM_TYPE, comment: '平台类型' })
  public platformType: PLATFORM_TYPE;

  @Column({ type: 'varchar', name: 'token', length: 255, comment: 'token', nullable: true, default: '' })
  public token: string;

  @Column({ type: 'int', name: 'mid', comment: 'mid', nullable: true })
  public mid: string;

  @Column({ type: 'datetime', name: 'expires_time', comment: 'token过期时间', nullable: true, default: null })
  public expiresTime: Date;

  @Column({ type: 'varchar', name: 'user_name', length: 255, comment: '用户名', nullable: true, default: '' })
  public userName: string;

  @Column({ type: 'int', name: 'mall_id', comment: '商城ID', nullable: true })
  public mallId: number;

  @Column({ type: 'varchar', name: 'shop_code', length: 255, comment: '店铺编码', nullable: true, default: '' })
  public shopCode: string;

  @Column({ type: 'int', name: 'dept_id', comment: '部门ID', nullable: true })
  public deptId: number;
}
