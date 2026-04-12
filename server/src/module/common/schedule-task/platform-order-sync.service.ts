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
    this.logger.log('平台订单同步任务开始执行');
    const res = await this.eCommercePlatformService.getOrderList(
      {
        page: 0,
        pageSize: 100,
        ownerId: '137484',
        startTime: '2026-03-11 10:00:00',
        endTime: '2026-04-12 10:00:00',
      },
      PLATFORM_TYPE.PDD,
    );
    console.log(res);
  }
}
