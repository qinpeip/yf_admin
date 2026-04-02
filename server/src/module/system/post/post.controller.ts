import { Controller, Get, Post, Body, Put, Param, Delete, Res, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto, UpdatePostDto, ListPostDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { Response } from 'express';
import { User, UserDto } from 'src/module/system/user/user.decorator';

@ApiTags('岗位管理')
@Controller('system/post')
@ApiBearerAuth('Authorization')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({
    summary: '岗位管理-创建',
  })
  @ApiBody({
    type: CreatePostDto,
    required: true,
  })
  @RequirePermission('system:post:add')
  @Post('/')
  create(@Body() createPostDto: CreatePostDto, @User() user: UserDto) {
    return this.postService.create(createPostDto, user.user);
  }

  @ApiOperation({
    summary: '岗位管理-列表',
  })
  @ApiBody({
    type: ListPostDto,
    required: true,
  })
  @RequirePermission('system:post:list')
  @Get('/list')
  findAll(@Query() query: ListPostDto, @User() user: UserDto) {
    return this.postService.findAll(query, user.user);
  }

  @ApiOperation({
    summary: '岗位管理-详情',
  })
  @RequirePermission('system:post:query')
  @Get('/:id')
  findOne(@Param('id') id: string, @User() user: UserDto) {
    return this.postService.findOne(+id, user.user);
  }

  @ApiOperation({
    summary: '岗位管理-更新',
  })
  @ApiBody({
    type: UpdatePostDto,
    required: true,
  })
  @RequirePermission('system:post:edit')
  @Put('/')
  update(@Body() updatePostDto: UpdatePostDto, @User() user: UserDto) {
    return this.postService.update(updatePostDto, user.user);
  }

  @ApiOperation({
    summary: '岗位管理-删除',
  })
  @RequirePermission('system:post:remove')
  @Delete('/:ids')
  remove(@Param('ids') ids: string, @User() user: UserDto) {
    const menuIds = ids.split(',').map((id) => id);
    return this.postService.remove(menuIds, user.user);
  }

  @ApiOperation({ summary: '导出岗位管理xlsx文件' })
  @RequirePermission('system:post:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: ListPostDto, @User() user: UserDto): Promise<void> {
    return this.postService.export(res, body, user.user);
  }
}
