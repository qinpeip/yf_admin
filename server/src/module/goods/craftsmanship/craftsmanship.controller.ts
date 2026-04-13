import { Controller, Get, Post, Put, Body, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { CraftsmanshipService } from './craftsmanship.service';
import { CreateCraftsmanshipDto, BaseCraftsmanshipDto, UpdateCraftsmanshipDto, QueryCraftsmanshipDto, ListCraftsmanshipDto } from './dto/craftsmanship.dto';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';
import { User, UserDto } from 'src/module/system/user/user.decorator';
import { EnumDto } from 'src/common/dto';

@ApiTags('工艺')
@Controller('goods/craftsmanship')
export class CraftsmanshipController {
  constructor(private readonly craftsmanshipService: CraftsmanshipService) {}

  @ApiOperation({ summary: '工艺-创建' })
  @ApiDataResponse(BaseCraftsmanshipDto)
  @RequirePermission('goods:craftsmanship:add')
  @Post()
  create(@Body() body: CreateCraftsmanshipDto, @User() user: UserDto) {
    return this.craftsmanshipService.create(body, user.user);
  }

  @ApiOperation({ summary: '工艺-列表' })
  @ApiDataResponse(ListCraftsmanshipDto, true, true)
  @RequirePermission('goods:craftsmanship:list')
  @Get('list')
  findAll(@Query() query: QueryCraftsmanshipDto) {
    return this.craftsmanshipService.findAll(query);
  }

  @ApiOperation({ summary: '工艺-枚举' })
  @ApiDataResponse(EnumDto, true, true)
  @Get('enums')
  enums() {
    return this.craftsmanshipService.enums();
  }

  @ApiOperation({ summary: '工艺-详情' })
  @ApiDataResponse(BaseCraftsmanshipDto)
  @RequirePermission('goods:craftsmanship:query')
  @Get(':craftsmanshipId')
  findOne(@Param('craftsmanshipId') craftsmanshipId: string) {
    return this.craftsmanshipService.findOne(+craftsmanshipId);
  }

  @ApiOperation({ summary: '工艺-修改' })
  @ApiDataResponse()
  @RequirePermission('goods:craftsmanship:edit')
  @Put()
  update(@Body() body: UpdateCraftsmanshipDto, @User() user: UserDto) {
    return this.craftsmanshipService.update(body, user.user);
  }

  @ApiOperation({ summary: '工艺-删除' })
  @ApiDataResponse()
  @RequirePermission('goods:craftsmanship:remove')
  @Delete(':craftsmanshipId')
  remove(@Param('craftsmanshipId') craftsmanshipId: string) {
    const craftsmanshipIds = craftsmanshipId.split(',').map((craftsmanshipId) => +craftsmanshipId);
    return this.craftsmanshipService.remove(craftsmanshipIds);
  }
}
