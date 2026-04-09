import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SysExpressEntity } from '../../express/entities/express.entity';
import { BaseEntity } from 'src/common/entities/base';
import { SysShippingTemplateRuleEntity } from './shipping-template-rule.entity';

export enum SHIPPING_TEMPLATE_FEE_TYPE {
  weight = 'weight',
}

@Entity('sys_shipping_template', {
  comment: '运费模板',
})
export class SysShippingTemplateEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'shipping_template_id', comment: '模板ID' })
  public shippingTemplateId: number;

  @Column({ type: 'varchar', name: 'shipping_template_name', length: 255, comment: '模板名称' })
  public shippingTemplateName: string;

  @Column({ type: 'enum', name: 'fee_type', enum: SHIPPING_TEMPLATE_FEE_TYPE, comment: '计费方式' })
  public feeType: SHIPPING_TEMPLATE_FEE_TYPE;

  @Column({ type: 'int', name: 'sort', default: 0, comment: '排序值' })
  public sort: number;

  @Column({ type: 'int', name: 'dept_id', default: null, comment: '部门ID' })
  public deptId: number;

  @ManyToOne(() => SysExpressEntity, (express) => express.expressId, { nullable: true })
  @JoinColumn({ name: 'express_id' })
  public express: SysExpressEntity;

  @OneToMany(() => SysShippingTemplateRuleEntity, (rule) => rule.template, { cascade: true })
  public rules: SysShippingTemplateRuleEntity[];
}
