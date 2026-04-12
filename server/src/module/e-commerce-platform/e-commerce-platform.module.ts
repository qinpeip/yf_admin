import { Module } from '@nestjs/common';
import { ECommercePlatformService } from './e-commerce-platform.service';
import { PddYtService } from 'src/common/services/third-party-apis/pdd-yt.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ECommercePlatformService, PddYtService],
  exports: [ECommercePlatformService, PddYtService],
})
export class ECommercePlatformModule {}
