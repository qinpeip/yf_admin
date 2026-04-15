import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GoodsService } from './goods.service';
import { ApiOperation } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { CreateGoodsDto, QueryGoodsDto, UpdateGoodsDto } from './dto/goods.dto';
import { User, UserDto } from '../system/user/user.decorator';
import { UserType } from '../system/user/dto/user';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';
import { ResultData } from 'src/common/utils/result';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @ApiOperation({ summary: '商品-创建' })
  @RequirePermission('goods:add')
  @Post()
  async create(@Body() body: CreateGoodsDto, @User() user: UserType) {
    return await this.goodsService.create(body, user.user);
  }

  @ApiOperation({ summary: '商品-更新' })
  @RequirePermission('goods:add')
  @Put('')
  async update(@Body() body: UpdateGoodsDto, @User() user: UserType) {
    return this.goodsService.update(body, user.user);
  }

  @ApiOperation({ summary: '商品-列表' })
  @RequirePermission('goods:list')
  @Get('list')
  findAll(@Query() query: QueryGoodsDto, @User() user: UserType) {
    return this.goodsService.findAll(query, user.user);
  }

  @ApiOperation({ summary: '商品-详情' })
  @ApiDataResponse()
  @RequirePermission('goods:query')
  @Get(':goodsId')
  findOne(@Param('goodsId') goodsId: string, @User() user: UserDto) {
    return this.goodsService.findOne(+goodsId, user.user);
  }

  @ApiOperation({ summary: '商品-sku-列表' })
  @ApiDataResponse()
  @RequirePermission('goods:query')
  @Get('/skus/:goodsId')
  findSkus(@Param('goodsId') goodsId: string, @User() user: UserDto) {
    return this.goodsService.findSkus(+goodsId, user.user);
  }

  @ApiOperation({ summary: '商品-删除' })
  @ApiDataResponse()
  @RequirePermission('goods:remove')
  @Delete(':goodsId')
  remove(@Param('goodsId') goodsId: string, @User() user: UserDto) {
    const goodsIds = goodsId.split(',').map((goodsId) => +goodsId);
    return this.goodsService.remove(goodsIds, user.user);
  }
}
