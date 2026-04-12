import { Injectable, Logger } from '@nestjs/common';
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
    // 实现平台订单同步逻辑
  }
}
