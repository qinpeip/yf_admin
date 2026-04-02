import { Controller, Get, Post, Body, Patch, Param, Query, Request, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, UpdateNoticeDto, ListNoticeDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { GetNowDate } from 'src/common/utils';
import { User, UserDto } from 'src/module/system/user/user.decorator';

@ApiTags('通知公告')
@Controller('system/notice')
@ApiBearerAuth('Authorization')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @ApiOperation({
    summary: '通知公告-创建',
  })
  @ApiBody({
    type: CreateNoticeDto,
  })
  @RequirePermission('system:notice:add')
  @Post()
  create(@Body() createConfigDto: CreateNoticeDto, @User() user: UserDto, @Request() req) {
    createConfigDto['createBy'] = req.user.userName;
    return this.noticeService.create(createConfigDto, user.user);
  }

  @ApiOperation({
    summary: '通知公告-列表',
  })
  @ApiBody({
    type: ListNoticeDto,
    required: true,
  })
  @RequirePermission('system:notice:list')
  @Get('/list')
  findAll(@Query() query: ListNoticeDto, @User() user: UserDto) {
    return this.noticeService.findAll(query, user.user);
  }

  @ApiOperation({
    summary: '通知公告-详情',
  })
  @RequirePermission('system:notice:query')
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: UserDto) {
    return this.noticeService.findOne(+id, user.user);
  }

  @ApiOperation({
    summary: '通知公告-更新',
  })
  @RequirePermission('system:notice:edit')
  @Put()
  update(@Body() updateNoticeDto: UpdateNoticeDto, @User() user: UserDto) {
    return this.noticeService.update(updateNoticeDto, user.user);
  }

  @ApiOperation({
    summary: '通知公告-删除',
  })
  @RequirePermission('system:notice:remove')
  @Delete(':id')
  remove(@Param('id') ids: string, @User() user: UserDto) {
    const noticeIds = ids.split(',').map((id) => +id);
    return this.noticeService.remove(noticeIds, user.user);
  }
}
