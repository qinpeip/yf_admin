import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingTemplateController } from './shipping-template.controller';
import { ShippingTemplateService } from './shipping-template.service';
import { SysShippingTemplateEntity } from './entities/shipping-template.entity';
import { SysShippingTemplateRuleEntity } from './entities/shipping-template-rule.entity';
import { ExpressService } from '../express/express.service';

@Module({
  imports: [TypeOrmModule.forFeature([SysShippingTemplateEntity, SysShippingTemplateRuleEntity])],
  controllers: [ShippingTemplateController],
  providers: [ShippingTemplateService, ExpressService],
  exports: [ShippingTemplateService],
})
export class ShippingTemplateModule {}
