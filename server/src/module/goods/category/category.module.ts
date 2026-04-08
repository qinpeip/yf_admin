import { Global, Module } from '@nestjs/common';
import { GoodsCategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { GoodsCategoryEntity } from '../entities/goods-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GoodsCategoryEntity])],
  controllers: [CategoryController],
  providers: [GoodsCategoryService],
})
export class GoodsCategoryModule {}
