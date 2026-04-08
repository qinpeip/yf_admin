import { Controller, Get, Post, Put, Body, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { ClassService } from './class.service';
import { CreateClassDto, BaseClassDto, UpdateClassDto, QueryClassDto, ListClassDto } from './dto/class.dto';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';
import { User } from 'src/module/system/user/user.decorator';
import { UserType } from 'src/module/system/user/dto/user';

@ApiTags('商品类目')
@Controller('goods/class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @ApiOperation({ summary: '商品类目-创建' })
  @ApiDataResponse(BaseClassDto)
  @RequirePermission('goods:class:add')
  @Post()
  create(@Body() body: CreateClassDto, @User() user: UserType) {
    return this.classService.create(body, user.user);
  }

  @ApiOperation({ summary: '商品类目-列表' })
  @ApiDataResponse(ListClassDto, true, true)
  @RequirePermission('goods:class:list')
  @Get('list')
  findAll(@Query() query: QueryClassDto) {
    return this.classService.findAll(query);
  }

  @ApiOperation({ summary: '商品类目-详情' })
  @ApiDataResponse(BaseClassDto)
  @RequirePermission('goods:class:query')
  @Get(':classId')
  findOne(@Param('classId') classId: string) {
    return this.classService.findOne(+classId);
  }

  @ApiOperation({ summary: '商品类目-修改' })
  @ApiDataResponse()
  @RequirePermission('goods:class:edit')
  @Put()
  update(@Body() body: UpdateClassDto, @User() user: UserType) {
    return this.classService.update(body, user.user);
  }

  @ApiOperation({ summary: '商品类目-删除' })
  @ApiDataResponse()
  @RequirePermission('goods:class:remove')
  @Delete(':classId')
  remove(@Param('classId') classId: string) {
    const classIds = classId.split(',').map((classId) => +classId);
    return this.classService.remove(classIds);
  }
}
