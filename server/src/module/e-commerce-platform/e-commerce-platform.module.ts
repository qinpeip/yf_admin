import { Module } from '@nestjs/common';
import { ECommercePlatformService } from './e-commerce-platform.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ECommercePlatformService],
  exports: [ECommercePlatformService],
})
export class ECommercePlatformModule {}
