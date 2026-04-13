import { Injectable, Logger } from '@nestjs/common';
import { Task } from 'src/common/decorators/task.decorator';
import { ECommercePlatformService } from 'src/module/e-commerce-platform/e-commerce-platform.service';
import { PLATFORM_TYPE } from 'src/common/constant';

@Injectable()
export class PlatformGoodsSyncService {
  private readonly logger = new Logger(PlatformGoodsSyncService.name);
  constructor(private readonly eCommercePlatformService: ECommercePlatformService) {}

  @Task({
    name: 'platform-goods-sync',
    description: '平台商品同步任务',
  })
  async syncPlatformGoods() {
    try {
      this.logger.log('平台商品同步任务开始执行');
      const res = await this.eCommercePlatformService.getGoodsList(
        {
          page: 1,
          pageSize: 100,
          ownerId: '130296',
        },
        PLATFORM_TYPE.PDD,
      );
      console.log('res', res);
    } catch (error: any) {
      this.logger.error(error.message, error.stack);
    }
  }
}
