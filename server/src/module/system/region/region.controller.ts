import { Controller, Get, Post, Put, Body, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { RegionService } from './region.service';
import { CreateRegionDto, BaseRegionDto, UpdateRegionDto, QueryRegionDto, ListRegionDto } from './dto/region.dto';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';

@ApiTags('地区表')
@Controller('system/region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @ApiOperation({ summary: '地区表-创建' })
  @ApiDataResponse(BaseRegionDto)
  @RequirePermission('system:region:add')
  @Post()
  create(@Body() body: CreateRegionDto) {
    return this.regionService.create(body);
  }

  @ApiOperation({ summary: '地区表-列表' })
  @ApiDataResponse(ListRegionDto, true, true)
  @RequirePermission('system:region:list')
  @Get('list')
  findAll(@Query() query: QueryRegionDto) {
    return this.regionService.findAll(query);
  }

  @ApiOperation({ summary: '地区表-省份列表' })
  @ApiDataResponse(ListRegionDto, true, true)
  @Get('province-list')
  provinceList() {
    return this.regionService.provinceList();
  }

  @ApiOperation({ summary: '地区表-城市列表' })
  @ApiDataResponse(ListRegionDto, true, true)
  @Get('city-list')
  cityList() {
    return this.regionService.cityList();
  }

  @ApiOperation({ summary: '地区表-详情' })
  @ApiDataResponse(BaseRegionDto)
  @RequirePermission('system:region:query')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(+id);
  }

  @ApiOperation({ summary: '地区表-修改' })
  @ApiDataResponse()
  @RequirePermission('system:region:edit')
  @Put()
  update(@Body() body: UpdateRegionDto) {
    return this.regionService.update(body);
  }

  @ApiOperation({ summary: '地区表-删除' })
  @ApiDataResponse()
  @RequirePermission('system:region:remove')
  @Delete(':id')
  remove(@Param('id') id: string) {
    const ids = id.split(',').map((id) => +id);
    return this.regionService.remove(ids);
  }
}
