import { Global, Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { GoodsClassEntity } from './entities/class.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsClassAttrsEntity } from './entities/class-attrs.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GoodsClassEntity, GoodsClassAttrsEntity])],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
