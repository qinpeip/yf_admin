import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { SysNoticeEntity } from './entities/notice.entity';
import { CreateNoticeDto, UpdateNoticeDto, ListNoticeDto } from './dto/index';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { UserType } from '../user/dto/user';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(SysNoticeEntity)
    private readonly sysNoticeEntityRep: Repository<SysNoticeEntity>,
    private readonly dataPermissionService: DataPermissionService,
  ) {}
  async create(createNoticeDto: CreateNoticeDto, currentUser: UserType['user']) {
    (createNoticeDto as any).tenantId = currentUser.tenantId;
    (createNoticeDto as any).deptId = currentUser.deptId;
    (createNoticeDto as any).ownerUserId = currentUser.userId;
    await this.sysNoticeEntityRep.save(createNoticeDto);
    return ResultData.ok();
  }

  async findAll(query: ListNoticeDto, currentUser: UserType['user']) {
    const entity = this.sysNoticeEntityRep.createQueryBuilder('entity');

    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', currentUser as any);

    if (query.noticeTitle) {
      entity.andWhere(`entity.noticeTitle LIKE "%${query.noticeTitle}%"`);
    }

    if (query.createBy) {
      entity.andWhere(`entity.createBy LIKE "%${query.createBy}%"`);
    }

    if (query.noticeType) {
      entity.andWhere('entity.noticeType = :noticeType', { noticeType: query.noticeType });
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.createTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }

    entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(noticeId: number, currentUser: UserType['user']) {
    const qb = this.sysNoticeEntityRep.createQueryBuilder('entity').where('entity.noticeId = :noticeId', { noticeId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const data = await qb.getOne();
    if (!data) return ResultData.fail(403, '无权限访问该数据');
    return ResultData.ok(data);
  }

  async update(updateNoticeDto: UpdateNoticeDto, currentUser: UserType['user']) {
    const qb = this.sysNoticeEntityRep.createQueryBuilder('entity').where('entity.noticeId = :noticeId', { noticeId: updateNoticeDto.noticeId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const found = await qb.getOne();
    if (!found) return ResultData.fail(403, '无权限修改该数据');

    await this.sysNoticeEntityRep.update({ noticeId: updateNoticeDto.noticeId }, updateNoticeDto);
    return ResultData.ok();
  }

  async remove(noticeIds: number[], currentUser: UserType['user']) {
    const qb = this.sysNoticeEntityRep
      .createQueryBuilder('entity')
      .select('entity.noticeId', 'noticeId')
      .where('entity.noticeId IN (:...ids)', { ids: noticeIds });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const rows = await qb.getRawMany<{ noticeId: string }>();
    const allowedIds = rows.map((r) => +r.noticeId);

    if (allowedIds.length !== noticeIds.length) {
      return ResultData.fail(403, '无权限删除部分数据');
    }

    const data = await this.sysNoticeEntityRep.softDelete({ noticeId: In(allowedIds) });
    return ResultData.ok(data);
  }
}
