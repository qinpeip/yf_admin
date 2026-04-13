import { Module } from '@nestjs/common';
import { PlatformOrderSyncService } from './platform-order-sync.service';
import { ECommercePlatformModule } from 'src/module/e-commerce-platform/e-commerce-platform.module';
import { PlatformGoodsSyncService } from './platform-goods-sync.service';

@Module({
  imports: [ECommercePlatformModule],
  providers: [PlatformOrderSyncService, PlatformGoodsSyncService],
  exports: [PlatformOrderSyncService, PlatformGoodsSyncService],
})
export class ScheduleTaskModule {}
