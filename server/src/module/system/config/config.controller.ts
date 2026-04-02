import { Controller, Get, Post, Body, Put, Param, Delete, Request, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { CreateConfigDto, UpdateConfigDto, ListConfigDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { User, UserDto } from 'src/module/system/user/user.decorator';

@ApiTags('参数设置')
@Controller('system/config')
@ApiBearerAuth('Authorization')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @ApiOperation({
    summary: '参数设置-创建',
  })
  @ApiBody({
    type: CreateConfigDto,
  })
  @RequirePermission('system:config:add')
  @Post()
  create(@Body() createConfigDto: CreateConfigDto, @Request() req, @User() user: UserDto) {
    createConfigDto['createBy'] = req.user.userName ?? user.user.userName;
    return this.configService.create(createConfigDto, user.user);
  }

  @ApiOperation({
    summary: '参数设置-列表',
  })
  @ApiBody({
    type: ListConfigDto,
    required: true,
  })
  @RequirePermission('system:config:list')
  @Get('/list')
  findAll(@Query() query: ListConfigDto, @User() user: UserDto) {
    return this.configService.findAll(query, user.user);
  }

  @ApiOperation({
    summary: '参数设置-详情(id)',
  })
  @RequirePermission('system:config:query')
  @Get(':id')
  findOne(@Param('id') id: string, @User() user: UserDto) {
    return this.configService.findOne(+id, user.user);
  }

  @ApiOperation({
    summary: '参数设置-详情(configKey)【走缓存】',
  })
  @RequirePermission('system:config:query')
  @Get('/configKey/:id')
  findOneByconfigKey(@Param('id') configKey: string) {
    return this.configService.findOneByConfigKey(configKey);
  }

  @ApiOperation({
    summary: '参数设置-更新',
  })
  @RequirePermission('system:config:edit')
  @Put()
  update(@Body() updateConfigDto: UpdateConfigDto, @User() user: UserDto) {
    return this.configService.update(updateConfigDto, user.user);
  }

  @ApiOperation({
    summary: '参数设置-刷新缓存',
  })
  @RequirePermission('system:config:remove')
  @Delete('/refreshCache')
  refreshCache() {
    return this.configService.resetConfigCache();
  }

  @ApiOperation({
    summary: '参数设置-删除',
  })
  @RequirePermission('system:config:remove')
  @Delete(':id')
  remove(@Param('id') ids: string, @User() user: UserDto) {
    const configIds = ids.split(',').map((id) => +id);
    return this.configService.remove(configIds, user.user);
  }

  @ApiOperation({ summary: '导出参数管理为xlsx文件' })
  @RequirePermission('system:config:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: ListConfigDto, @User() user: UserDto): Promise<void> {
    return this.configService.export(res, body, user.user);
  }
}
