import { Controller, Get, Post, Body, Put, Param, Query, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DeptService } from './dept.service';
import { CreateDeptDto, UpdateDeptDto, ListDeptDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { User, UserDto } from 'src/module/system/user/user.decorator';

@ApiTags('部门管理')
@Controller('system/dept')
@ApiBearerAuth('Authorization')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @ApiOperation({
    summary: '部门管理-创建',
  })
  @ApiBody({
    type: CreateDeptDto,
    required: true,
  })
  @RequirePermission('system:dept:add')
  @Post()
  @HttpCode(200)
  create(@Body() createDeptDto: CreateDeptDto, @User() user: UserDto) {
    return this.deptService.create(createDeptDto, user.user);
  }

  @ApiOperation({
    summary: '部门管理-列表',
  })
  @RequirePermission('system:dept:list')
  @Get('/list')
  findAll(@Query() query: ListDeptDto, @User() user: UserDto) {
    return this.deptService.findAll(query, user.user);
  }

  @ApiOperation({
    summary: '部门管理-详情',
  })
  @RequirePermission('system:dept:query')
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: UserDto) {
    return this.deptService.findOne(+id, user.user);
  }

  @ApiOperation({
    summary: '部门管理-黑名单',
  })
  @RequirePermission('system:dept:query')
  @Get('/list/exclude/:id')
  findListExclude(@Param('id') id: string, @User() user: UserDto) {
    return this.deptService.findListExclude(+id, user.user);
  }

  @ApiOperation({
    summary: '部门管理-更新',
  })
  @ApiBody({
    type: UpdateDeptDto,
    required: true,
  })
  @RequirePermission('system:dept:edit')
  @Put()
  update(@Body() updateDeptDto: UpdateDeptDto, @User() user: UserDto) {
    return this.deptService.update(updateDeptDto, user.user);
  }

  @ApiOperation({
    summary: '部门管理-删除',
  })
  @RequirePermission('system:dept:remove')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: UserDto) {
    return this.deptService.remove(+id, user.user);
  }
}
