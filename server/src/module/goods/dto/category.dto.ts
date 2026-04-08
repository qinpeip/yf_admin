
import { IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, OmitType, IntersectionType } from '@nestjs/swagger';
import { PagingDto } from 'src/common/dto/index';
import { CharEnum } from 'src/common/enum/index';
import { Type } from 'class-transformer';


export class BaseCategoryDto{
	@ApiProperty({required: false , description: '分类ID'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	categoryId?: number;

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

	@ApiProperty({required: false , description: '名称'})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiProperty({required: false , description: '父ID'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	parentId?: number;

	@ApiProperty({required: false , description: '排序'})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	sort?: number;

	@ApiProperty({required: false , description: '图标'})
	@IsOptional()
	@IsString()
	icon?: string;

	@ApiProperty({required: false , description: '描述'})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({enum: CharEnum, required: false , description: '状态'})
	@IsOptional()
	@IsString()
	status?: string;

}

export class CreateCategoryDto extends OmitType(BaseCategoryDto, ['categoryId','createBy','createTime']){}

export class UpdateCategoryDto extends OmitType(BaseCategoryDto, ['createBy','createTime']){}

export class QueryCategoryDto extends IntersectionType(BaseCategoryDto, PagingDto){}

export class ListCategoryDto extends OmitType(BaseCategoryDto, ['createBy','createTime','updateBy','updateTime']){}
