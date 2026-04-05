import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base';
import { ApiProperty } from '@nestjs/swagger';

export enum EXPRESS_CODE_TYPE {
  EXPRESS_100 = 'expressCode',
  WECHAT_MINI_PROGRAM = 'wxCode',
  DOUYIN_SHOP = 'dyExpressCode',
}

@Entity('sys_express', {
  comment: '快递公司表',
})
export class SysExpressEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'express_id', comment: '快递公司ID' })
  public expressId: number;

  @Column({ type: 'varchar', name: 'express_name', length: 255, comment: '快递公司名称' })
  public expressName: string;

  @Column({ type: 'varchar', name: 'express_code', length: 255, comment: '物流公司代码 (快递100)' })
  public expressCode: string;

  @Column({ type: 'varchar', name: 'wx_code', length: 255, comment: '物流公司代码（微信小程序）' })
  public wxCode: string;

  @Column({ type: 'varchar', name: 'dy_express_code', length: 255, comment: '抖音物流公司代码（抖音商城）' })
  public dyExpressCode: string;

  @Column({ type: 'int', name: 'sort', comment: '排序', default: 0 })
  public sort: number;
}
