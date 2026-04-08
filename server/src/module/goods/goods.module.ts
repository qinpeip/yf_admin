import { Module } from '@nestjs/common';
import { GoodsCategoryModule } from './category/category.module';
import { CraftsmanshipModule } from './craftsmanship/craftsmanship.module';
import { ClassModule } from './class/class.module';

@Module({
  imports: [GoodsCategoryModule, CraftsmanshipModule, ClassModule],
})
export class GoodsModule {}
