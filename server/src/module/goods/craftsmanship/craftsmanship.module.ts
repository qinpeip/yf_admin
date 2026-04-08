import { Global, Module } from '@nestjs/common';
import { CraftsmanshipService } from './craftsmanship.service';
import { CraftsmanshipController } from './craftsmanship.controller';
import { GoodsCraftsmanshipEntity } from './entities/craftsmanship.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([GoodsCraftsmanshipEntity])],
  controllers: [CraftsmanshipController],
  providers: [CraftsmanshipService],
  exports: [CraftsmanshipService],
})
export class CraftsmanshipModule {}
