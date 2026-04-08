import { Module } from '@nestjs/common';
import { GoodsCategoryModule } from './category/category.module';
import { CraftsmanshipModule } from './craftsmanship/craftsmanship.module';

@Module({
  imports: [GoodsCategoryModule, CraftsmanshipModule],
})
export class GoodsModule {}
