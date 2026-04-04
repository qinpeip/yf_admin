
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { CharEnum } from 'src/common/enum/index';
import { Type } from 'class-transformer';


export class BaseRegionDto{
	@ApiProperty({required: false , description: '地区ID'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	id?: number;

	@ApiProperty({required: false , description: '租户ID'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	tenantId?: number;

	@ApiProperty({required: false , description: '数据所有者用户ID'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	ownerUserId?: number;

	@ApiProperty({required: false , description: '创建者'})
	@IsOptional()
	@IsString()
	createBy?: string;

	@ApiProperty({required: false , description: '创建时间'})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	createTime?: Array<string>;

	@ApiProperty({required: false , description: '更新者'})
	@IsOptional()
	@IsString()
	updateBy?: string;

	@ApiProperty({required: false , description: '更新时间'})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	updateTime?: Array<string>;

	@ApiProperty({required: false , description: '删除时间'})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	deleteTime?: Array<string>;

	@ApiProperty({required: false , description: '父ID'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	pid?: number;

	@ApiProperty({required: false , description: '简称'})
	@IsOptional()
	@IsString()
	shortname?: string;

	@ApiProperty({required: false , description: '名称'})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({required: false , description: '全称'})
	@IsOptional()
	@IsString()
	mergerName?: string;

	@ApiProperty({required: false , description: '层级 1 2 3 省市区县'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	level?: number;

	@ApiProperty({required: false , description: '拼音'})
	@IsOptional()
	@IsString()
	pinyin?: string;

	@ApiProperty({required: false , description: '长途区号'})
	@IsOptional()
	@IsString()
	code?: string;

	@ApiProperty({required: false , description: '邮编'})
	@IsOptional()
	@IsString()
	zipCode?: string;

	@ApiProperty({required: false , description: '首字母'})
	@IsOptional()
	@IsString()
	first?: string;

	@ApiProperty({required: false , description: '经度'})
	@IsOptional()
	@IsString()
	lng?: string;

	@ApiProperty({required: false , description: '纬度'})
	@IsOptional()
	@IsString()
	lat?: string;

	@ApiProperty({required: false , description: '排序'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	sort?: number;

}

export class CreateRegionDto extends OmitType(BaseRegionDto, ['id','createBy','createTime']){}

export class UpdateRegionDto extends OmitType(BaseRegionDto, ['createBy','createTime']){}

export class QueryRegionDto extends IntersectionType(BaseRegionDto, PagingDto){}

export class ListRegionDto extends OmitType(BaseRegionDto, ['createBy','createTime','updateBy','updateTime']){}
