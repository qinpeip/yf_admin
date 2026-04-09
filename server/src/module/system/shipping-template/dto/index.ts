import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { SHIPPING_TEMPLATE_FEE_TYPE } from '../entities/shipping-template.entity';
import { Type } from 'class-transformer';
import { PagingDto } from 'src/common/dto';

export class CreateShippingTemplateDto {
  @ApiProperty({ required: true })
  @IsString()
  @Length(0, 30)
  shippingTemplateName: string;

  @ApiProperty({ required: true })
  @IsEnum(SHIPPING_TEMPLATE_FEE_TYPE)
  feeType: SHIPPING_TEMPLATE_FEE_TYPE;

  @ApiProperty({ required: true })
  @IsNumber()
  sort: number;

  @ApiProperty({ required: true })
  @IsNumber()
  expressId: number;

  @ApiProperty({ required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShippingTemplateRuleDto)
  @ArrayMinSize(1)
  rules: CreateShippingTemplateRuleDto[];
}

export class CreateShippingTemplateRuleDto {
  @ApiProperty({ required: true })
  @IsArray()
  @IsNumber({}, { each: true })
  cityIds: number[];

  @ApiProperty({ required: true })
  @IsNumber()
  firstWeight: number;

  @ApiProperty({ required: true })
  @IsNumber()
  firstWeightPrice: number;

  @ApiProperty({ required: true })
  @IsNumber()
  additionalWeight: number;

  @ApiProperty({ required: true })
  @IsNumber()
  additionalWeightPrice: number;

  @ApiProperty({ required: true })
  @IsBoolean()
  isRemote: boolean;
}

export class UpdateShippingTemplateDto extends CreateShippingTemplateDto {
  @ApiProperty({ required: true })
  @IsNumber()
  shippingTemplateId: number;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateShippingTemplateRuleDto)
  @ArrayMinSize(1)
  rules: UpdateShippingTemplateRuleDto[];
}

export class UpdateShippingTemplateRuleDto extends CreateShippingTemplateRuleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  ruleId: number;
}

export class ListShippingTemplateDto extends PagingDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 30)
  shippingTemplateName?: string;
}
