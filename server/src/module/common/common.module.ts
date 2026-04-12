import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { AxiosModule } from './axios/axios.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientOptions } from '@songkeys/nestjs-redis';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { SysDeptEntity } from '../system/dept/entities/dept.entity';
import { SysRoleWithDeptEntity } from '../system/role/entities/role-width-dept.entity';
import { ScheduleTaskModule } from './schedule-task/schedule-task.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([SysDeptEntity, SysRoleWithDeptEntity]),
    RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            closeClient: true,
            readyLog: true,
            errorLog: true,
            config: config.get<RedisClientOptions>('redis'),
          };
        },
      },
      true,
    ),

    AxiosModule,
  ],
  providers: [DataPermissionService],
  exports: [DataPermissionService],
})
export class CommonModule {}
