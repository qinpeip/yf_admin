import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { CharEnum } from 'src/common/enum/index';
import { Type } from 'class-transformer';

export class BaseCraftsmanshipDto {
  @ApiProperty({ required: false, description: '工艺ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  craftsmanshipId?: number;

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

  @ApiProperty({ required: false, description: '排序' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sort?: number;

  @ApiProperty({ required: false, description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCraftsmanshipDto extends OmitType(BaseCraftsmanshipDto, ['craftsmanshipId', 'createBy', 'createTime']) {}

export class UpdateCraftsmanshipDto extends OmitType(BaseCraftsmanshipDto, ['createBy', 'createTime']) {}

export class QueryCraftsmanshipDto extends IntersectionType(BaseCraftsmanshipDto, PagingDto) {}

export class ListCraftsmanshipDto extends OmitType(BaseCraftsmanshipDto, ['createBy', 'createTime', 'updateBy', 'updateTime']) {}
