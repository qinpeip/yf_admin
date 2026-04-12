import { Module } from '@nestjs/common';
import { ExpressController } from './express.controller';
import { ExpressService } from './express.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysExpressEntity } from './entities/express.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysExpressEntity])],
  controllers: [ExpressController],
  providers: [ExpressService],
  exports: [ExpressService],
})
export class ExpressModule {}
