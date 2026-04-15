import { Module } from '@nestjs/common';
import { GoodsCategoryModule } from './category/category.module';
import { CraftsmanshipModule } from './craftsmanship/craftsmanship.module';
import { ClassModule } from './class/class.module';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsEntity } from './entities/goods.entity';
import { GoodsSkuEntity } from './entities/goods-sku.entity';

@Module({
  imports: [GoodsCategoryModule, CraftsmanshipModule, ClassModule, TypeOrmModule.forFeature([GoodsEntity, GoodsSkuEntity])],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}
