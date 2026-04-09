import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SysShippingTemplateEntity } from './shipping-template.entity';

@Entity('sys_shipping_template_rule', {
  comment: '运费模板规则',
})
export class SysShippingTemplateRuleEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'rule_id', comment: '规则ID' })
  public ruleId: number;

  @Column({ type: 'json', name: 'city_ids', comment: '城市ID列表' })
  public cityIds: number[];

  @Column({ type: 'decimal', name: 'first_weight', precision: 10, scale: 2, comment: '首重' })
  public firstWeight: number;

  @Column({ type: 'decimal', name: 'first_weight_price', precision: 10, scale: 2, comment: '首重价格' })
  public firstWeightPrice: number;

  @Column({ type: 'decimal', name: 'additional_weight', precision: 10, scale: 2, comment: '续重' })
  public additionalWeight: number;

  @Column({ type: 'decimal', name: 'additional_weight_price', precision: 10, scale: 2, comment: '续重价格' })
  public additionalWeightPrice: number;

  @Column({ type: 'boolean', name: 'is_remote', comment: '是否偏远地区模板', default: false })
  public isRemote: boolean;

  @ManyToOne(() => SysShippingTemplateEntity, (template) => template.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipping_template_id' })
  public template: SysShippingTemplateEntity;
}
