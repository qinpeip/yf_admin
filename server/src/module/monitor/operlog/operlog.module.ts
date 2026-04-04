import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperlogService } from './operlog.service';
import { OperlogController } from './operlog.controller';
import { SysOperlogEntity } from './entities/operlog.entity';
import { OperlogRecordService } from './operlog-record.service';
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysOperlogEntity])],
  controllers: [OperlogController],
  providers: [OperlogRecordService, OperlogService],
  exports: [OperlogRecordService, OperlogService],
})
export class OperlogModule {}
