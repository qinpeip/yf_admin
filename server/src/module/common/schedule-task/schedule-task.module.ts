import { Module } from '@nestjs/common';
import { PlatformOrderSyncService } from './platform-order-sync.service';
import { ECommercePlatformModule } from 'src/module/e-commerce-platform/e-commerce-platform.module';

@Module({
  imports: [ECommercePlatformModule],
  providers: [PlatformOrderSyncService],
  exports: [PlatformOrderSyncService],
})
export class ScheduleTaskModule {}
