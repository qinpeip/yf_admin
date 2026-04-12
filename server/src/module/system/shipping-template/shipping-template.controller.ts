import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ShippingTemplateService } from './shipping-template.service';
import { CreateShippingTemplateDto, ListShippingTemplateDto, UpdateShippingTemplateDto } from './dto';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { User, UserDto } from '../user/user.decorator';

@ApiTags('运费模板')
@Controller('system/shipping-template')
@ApiBearerAuth('Authorization')
export class ShippingTemplateController {
  constructor(private readonly shippingTemplateService: ShippingTemplateService) {}

  @ApiOperation({
    summary: '运费模板-创建',
  })
  @ApiBody({
    type: CreateShippingTemplateDto,
    required: true,
  })
  @RequirePermission('system:shipping-template:add')
  @Post()
  create(@Body() createShippingTemplateDto: CreateShippingTemplateDto, @User() user: UserDto) {
    return this.shippingTemplateService.create(createShippingTemplateDto, user.user);
  }
  @ApiOperation({
    summary: '运费模板-修改',
  })
  @ApiBody({
    type: UpdateShippingTemplateDto,
    required: true,
  })
  @RequirePermission('system:shipping-template:edit')
  @Put()
  update(@Body() updateShippingTemplateDto: UpdateShippingTemplateDto, @User() user: UserDto) {
    return this.shippingTemplateService.update(updateShippingTemplateDto, user.user);
  }

  @ApiOperation({
    summary: '运费模板-列表',
  })
  @ApiBody({
    type: ListShippingTemplateDto,
    required: false,
  })
  @RequirePermission('system:shipping-template:list')
  @Get('list')
  list(@Body() listShippingTemplateDto: ListShippingTemplateDto, @User() user: UserDto) {
    return this.shippingTemplateService.findAll(listShippingTemplateDto, user.user);
  }

  @ApiOperation({
    summary: '运费模板-枚举',
  })
  @Get('enums')
  enums(@User() user: UserDto) {
    return this.shippingTemplateService.enums(user.user);
  }
  @ApiQuery({
    name: 'shippingTemplateId',
    type: Number,
    required: true,
  })
  @ApiOperation({
    summary: '运费模板-详情',
  })
  @RequirePermission('system:shipping-template:query')
  @Get(':shippingTemplateId')
  findOne(@Param('shippingTemplateId') shippingTemplateId: string, @User() user: UserDto) {
    return this.shippingTemplateService.findOne(+shippingTemplateId, user.user);
  }

  @ApiOperation({
    summary: '运费模板-删除',
  })
  @RequirePermission('system:shipping-template:remove')
  @Delete(':shippingTemplateId')
  remove(@Param('shippingTemplateId') ids: string, @User() user: UserDto) {
    const shippingTemplateIds = ids
      .split(',')
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
    return this.shippingTemplateService.remove(shippingTemplateIds, user.user);
  }
}
