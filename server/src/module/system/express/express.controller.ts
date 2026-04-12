import { Controller, Get } from '@nestjs/common';
import { ExpressService } from './express.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';
import { ResultData } from 'src/common/utils/result';

@ApiTags('快递')
@Controller('system/express')
export class ExpressController {
  constructor(private readonly expressService: ExpressService) {}

  @ApiOperation({ summary: '快递列表' })
  @Get('list')
  async list() {
    const list = await this.expressService.list();
    return ResultData.ok(list);
  }
}
