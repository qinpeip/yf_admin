import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { CharEnum } from 'src/common/enum/index';
import { Type } from 'class-transformer';
import { GOODS_CLASS_TYPE } from '../entities/class.entity';

export class BaseClassDto {
  @ApiProperty({ required: false, description: '类目ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  classId?: number;

  @ApiProperty({ required: false, description: '租户ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tenantId?: number;

  @ApiProperty({ required: false, description: '数据所有者用户ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ownerUserId?: number;

  @ApiProperty({ required: false, description: '创建者' })
  @IsOptional()
  @IsString()
  createBy?: string;

  @ApiProperty({ required: false, description: '创建时间' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  createTime?: Array<string>;

  @ApiProperty({ required: false, description: '更新者' })
  @IsOptional()
  @IsString()
  updateBy?: string;

  @ApiProperty({ required: false, description: '更新时间' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  updateTime?: Array<string>;

  @ApiProperty({ required: false, description: '删除时间' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deleteTime?: Array<string>;

  @ApiProperty({ required: false, description: '名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: '父ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @ApiProperty({ required: false, description: '排序' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sort?: number;

  @ApiProperty({ required: false, description: '部门ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deptId?: number;

  @ApiProperty({ required: false, description: '类目类型：1-定制性商品，2-非定制型商品' })
  @IsOptional()
  @IsEnum(GOODS_CLASS_TYPE)
  type?: GOODS_CLASS_TYPE;

  @ApiProperty({ enum: CharEnum, required: false, description: '状态' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ClassAttrsDto {
  @ApiProperty({ required: false, description: '属性ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attrId?: number;

  @ApiProperty({ required: false, description: '属性名称' })
  @IsOptional()
  @IsString()
  attrName: string;

  @ApiProperty({ required: false, description: '属性键' })
  @IsOptional()
  @IsString()
  key: string;

  @ApiProperty({ required: false, description: '是否参与普通价格计算' })
  @IsOptional()
  @IsBoolean()
  joinNormalPrice: boolean;

  @ApiProperty({ required: false, description: '是否参与平方价格计算' })
  @IsOptional()
  @IsBoolean()
  joinSquarePrice: boolean;

  @ApiProperty({ required: false, description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  enable: boolean;
}

export class CreateClassDto extends OmitType(BaseClassDto, ['classId', 'createBy', 'createTime']) {
  @ApiProperty({ required: false, description: '属性列表' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassAttrsDto)
  attrs: ClassAttrsDto[];
}

export class UpdateClassDto extends OmitType(BaseClassDto, ['createBy', 'createTime']) {
  @ApiProperty({ required: false, description: '属性列表' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassAttrsDto)
  attrs: ClassAttrsDto[];
}

export class QueryClassDto extends IntersectionType(BaseClassDto, PagingDto) {}

export class ListClassDto extends OmitType(BaseClassDto, ['createBy', 'createTime', 'updateBy', 'updateTime']) {}
