import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { GOODS_PRICE_TYPE, GOODS_SHIPPING_TYPE, GOODS_UPLOAD_TYPE } from '../entities/goods.entity';
import { GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE } from '../entities/goods-with-craftsmanship.entity';
import { Type } from 'class-transformer';

export class CreateGoodsDto {
  @ApiProperty({ description: '名称', required: true })
  @IsString()
  name: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '图片', required: false })
  @IsOptional()
  @IsString()
  image: string;

  @ApiProperty({ description: '重量', required: false })
  @IsOptional()
  @IsNumber()
  weight: number;

  @ApiProperty({ description: '图片出血范围(mm)', required: false })
  @IsOptional()
  @IsNumber()
  bleedRange: number;

  @ApiProperty({ description: '计价方式', required: true })
  @IsEnum(GOODS_PRICE_TYPE)
  priceType: GOODS_PRICE_TYPE;

  @ApiProperty({ description: '运费', required: false })
  @IsOptional()
  @IsNumber()
  shippingFee: number;

  @ApiProperty({ description: '发货地址', required: false })
  @IsOptional()
  @IsString()
  shippingAddress: string;

  @ApiProperty({ description: '运费类型', required: true })
  @IsEnum(GOODS_SHIPPING_TYPE)
  shippingType: GOODS_SHIPPING_TYPE;

  @ApiProperty({ description: '快递模板ids', required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { each: true })
  shippingTemplateIds: number[];

  @ApiProperty({ description: '基础打包费用', required: false })
  @IsOptional()
  @IsNumber()
  basePackingFee: number;

  @ApiProperty({ description: '是否定制商品', required: true })
  @IsBoolean()
  isCustomization: boolean;

  @ApiProperty({ description: '展示价格', required: false })
  @IsOptional()
  @IsNumber()
  showPrice: number;

  @ApiProperty({ description: '上传类型', required: true })
  @IsEnum(GOODS_UPLOAD_TYPE)
  uploadType: GOODS_UPLOAD_TYPE;

  @ApiProperty({ description: '分类id', required: true })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '类目id', required: true })
  @IsNumber()
  classId: number;

  @ApiProperty({ description: '工艺', required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsWithCraftsmanshipDto)
  craftsmanship: GoodsWithCraftsmanshipDto[];
}

export class GoodsWithCraftsmanshipDto {
  @ApiProperty({ description: '工艺id', required: true })
  @IsNumber()
  craftsmanshipId: number;

  @ApiProperty({ description: '价格类型', required: true })
  @IsEnum(GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE)
  priceType: GOODS_WITH_CRAFTSMANSHIP_PRICE_TYPE;

  @ApiProperty({ description: '子工艺', required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsChildCraftsmanshipDto)
  childCraftsmanship: GoodsChildCraftsmanshipDto[];
}

export class GoodsChildCraftsmanshipDto {
  @ApiProperty({ description: '子工艺id', required: false })
  @IsOptional()
  @IsNumber()
  goodsChildCraftsmanshipId: number;

  @ApiProperty({ description: '子工艺名称', required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: '价格', required: false })
  @IsOptional()
  @IsNumber()
  price: number;
}

export class GoodsAttrsDto {
  @ApiProperty({ description: '属性id', required: false })
  @IsOptional()
  @IsNumber()
  goodsAttrsId: number;

  @ApiProperty({ description: '属性名称', required: true })
  @IsNotEmpty()
  @IsString()
  attrName: string;

  @ApiProperty({ description: '属性键', required: true })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ description: '是否参与普通价格计算', required: true })
  @IsBoolean()
  joinNormalPrice: boolean;

  @ApiProperty({ description: '是否参与平方价格计算', required: true })
  @IsBoolean()
  joinSquarePrice: boolean;

  @ApiProperty({ description: '是否自定义值', required: true })
  @IsBoolean()
  customValue: boolean;

  @ApiProperty({ description: '是否需要图片', required: true })
  @IsBoolean()
  hasImg: boolean;

  @ApiProperty({ description: '属性选项', required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsAttrsOptionsDto)
  attrsOptions: GoodsAttrsOptionsDto[];
}

export class GoodsAttrsOptionsDto {
  @ApiProperty({ description: '属性选项id', required: false })
  @IsOptional()
  @IsNumber()
  goodsAttrsOptionsId: number;

  @ApiProperty({ description: '属性选项名称', required: true })
  @IsNotEmpty()
  @IsString()
  optionName: string;

  @ApiProperty({ description: '属性选项图片', required: false })
  @IsOptional()
  @IsString()
  imgUrl: string;

  @ApiProperty({ description: '属性选项备注', required: false })
  @IsOptional()
  @IsString()
  remark: string;

  @ApiProperty({ description: '属性选项价格', required: false })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ description: '属性选项数值1', required: false })
  @IsOptional()
  @IsNumber()
  num1: number;

  @ApiProperty({ description: '属性选项数值2', required: false })
  @IsOptional()
  @IsNumber()
  num2: number;
}
