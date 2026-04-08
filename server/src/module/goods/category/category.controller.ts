import { Controller, Get, Post, Put, Body, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { GoodsCategoryService } from './category.service';
import { CreateCategoryDto, BaseCategoryDto, UpdateCategoryDto, QueryCategoryDto, ListCategoryDto } from '../dto/category.dto';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';
import { User, UserDto } from '../../system/user/user.decorator';

@ApiTags('商品分类')
@Controller('goods/category')
export class CategoryController {
  constructor(private readonly categoryService: GoodsCategoryService) {}

  @ApiOperation({ summary: '商品分类-创建' })
  @ApiDataResponse(BaseCategoryDto)
  @RequirePermission('goods:category:add')
  @Post()
  create(@Body() body: CreateCategoryDto, @User() user: UserDto) {
    return this.categoryService.create(body, user.user);
  }

  @ApiOperation({ summary: '商品分类-列表' })
  @ApiDataResponse(ListCategoryDto, true, true)
  @RequirePermission('goods:category:list')
  @Get('list')
  findAll(@Query() query: QueryCategoryDto, @User() user: UserDto) {
    return this.categoryService.findAll(query, user.user);
  }
  @ApiOperation({ summary: '商品分类-树形列表' })
  @ApiDataResponse(ListCategoryDto, true, true)
  @Get('tree')
  listTree(@User() user: UserDto) {
    return this.categoryService.listTree(user.user);
  }

  @ApiOperation({ summary: '商品分类-详情' })
  @ApiDataResponse(BaseCategoryDto)
  @RequirePermission('goods:category:query')
  @Get(':categoryId')
  findOne(@Param('categoryId') categoryId: string, @User() user: UserDto) {
    return this.categoryService.findOne(+categoryId, user.user);
  }

  @ApiOperation({ summary: '商品分类-修改' })
  @ApiDataResponse()
  @RequirePermission('goods:category:edit')
  @Put()
  update(@Body() body: UpdateCategoryDto, @User() user: UserDto) {
    return this.categoryService.update(body, user.user);
  }

  @ApiOperation({ summary: '商品分类-删除' })
  @ApiDataResponse()
  @RequirePermission('goods:category:remove')
  @Delete(':categoryId')
  remove(@Param('categoryId') categoryId: string, @User() user: UserDto) {
    const categoryIds = categoryId.split(',').map((categoryId) => +categoryId);
    return this.categoryService.remove(categoryIds, user.user);
  }
}
