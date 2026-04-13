import { IsDateString, IsNumber, IsNumberString, IsObject, IsOptional, IsString, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { SortRuleEnum } from 'src/common/enum/index';

/**
 * 时间区间对象
 */
export class DateParamsDTO {
  @IsDateString()
  beginTime: string;

  @IsDateString()
  endTime: string;
}

export class EnumDto {
  @ApiProperty({ required: true, description: '标签' })
  @IsString()
  label: string;

  @ApiProperty({ required: true, description: '值' })
  @IsString()
  value: string;
}
export class EnumTreeDto extends EnumDto {
  @ApiProperty({ required: true, description: '子节点' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnumTreeDto)
  children: EnumTreeDto[];
}

/**
 * 分页DTO
 */
export class PagingDto {
  @ApiProperty({ required: true, description: '当前分页', default: 1 })
  @IsOptional()
  @Transform(({ value }) => {
    return value?.toString?.() || '1';
  })
  @IsNumberString()
  pageNum?: number;

  @ApiProperty({ required: true, description: '每页数量', default: 10 })
  @IsOptional()
  @Transform(({ value }) => {
    return value?.toString?.() || '10';
  })
  @IsNumberString()
  pageSize?: number;

  /**
   * 时间区间
   */
  @ApiProperty({ required: false, description: '时间范围' })
  @IsOptional()
  @IsObject()
  params?: DateParamsDTO;

  /**
   * 排序字段
   */
  @ApiProperty({ required: false, description: '排序字段' })
  @IsOptional()
  @IsString()
  orderByColumn?: string;

  /**
   * 排序规则
   */
  @ApiProperty({ required: false, description: '排序规则' })
  @IsOptional()
  @IsEnum(SortRuleEnum)
  isAsc?: string;
}
