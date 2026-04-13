import { Injectable, Logger } from '@nestjs/common';
import { PLATFORM_TYPE } from 'src/common/constant';
import { Task } from 'src/common/decorators/task.decorator';
import { ECommercePlatformService } from 'src/module/e-commerce-platform/e-commerce-platform.service';

@Injectable()
export class PlatformOrderSyncService {
  private readonly logger = new Logger(PlatformOrderSyncService.name);
  constructor(private readonly eCommercePlatformService: ECommercePlatformService) {}

  @Task({
    name: 'platform-order-sync',
    description: '平台订单同步任务',
  })
  async syncPlatformOrder() {
    try {
      this.logger.log('平台订单同步任务开始执行');
      const res = await this.eCommercePlatformService.getOrderList(
        {
          page: 0,
          pageSize: 100,
          ownerId: '130296',
          startTime: '2025-03-11 10:00:00',
          endTime: '2026-04-12 10:00:00',
        },
        PLATFORM_TYPE.PDD,
      );
      this.logger.log(`返回数据：${JSON.stringify(res)}`);
    } catch (error: any) {
      this.logger.error(error.message, error.stack);
    }
  }
}
