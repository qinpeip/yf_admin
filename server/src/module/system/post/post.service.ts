import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';
import { SysPostEntity } from './entities/post.entity';
import { Response } from 'express';
import { CreatePostDto, UpdatePostDto, ListPostDto } from './dto/index';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { UserType } from '../user/dto/user';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(SysPostEntity)
    private readonly sysPostEntityRep: Repository<SysPostEntity>,
    private readonly dataPermissionService: DataPermissionService,
  ) {}
  async create(createPostDto: CreatePostDto, currentUser: UserType['user']) {
    // 创建时强制写入 tenant/dept/owner，避免前端传参越权
    (createPostDto as any).tenantId = currentUser.tenantId;
    (createPostDto as any).deptId = currentUser.deptId;
    (createPostDto as any).ownerUserId = currentUser.userId;
    await this.sysPostEntityRep.save(createPostDto);
    return ResultData.ok();
  }

  async findAll(query: ListPostDto, currentUser: UserType['user']) {
    const entity = this.sysPostEntityRep.createQueryBuilder('entity');

    // 多租户 + 数据范围过滤
    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', currentUser as any);

    if (query.postName) {
      entity.andWhere(`entity.postName LIKE "%${query.postName}%"`);
    }

    if (query.postCode) {
      entity.andWhere(`entity.postCode LIKE "%${query.postCode}%"`);
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(postId: number, currentUser: UserType['user']) {
    const qb = this.sysPostEntityRep.createQueryBuilder('entity').where('entity.postId = :postId', { postId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const res = await qb.getOne();
    if (!res) {
      return ResultData.fail(403, '无权限访问该数据');
    }
    return ResultData.ok(res);
  }

  async update(updatePostDto: UpdatePostDto, currentUser: UserType['user']) {
    const qb = this.sysPostEntityRep.createQueryBuilder('entity').where('entity.postId = :postId', { postId: updatePostDto.postId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const found = await qb.getOne();
    if (!found) {
      return ResultData.fail(403, '无权限修改该数据');
    }

    await this.sysPostEntityRep.update({ postId: updatePostDto.postId }, updatePostDto);
    return ResultData.ok();
  }

  async remove(postIds: string[], currentUser: UserType['user']) {
    const idNums = postIds.map((id) => +id).filter(Boolean);
    if (idNums.length === 0) return ResultData.ok();

    const qb = this.sysPostEntityRep
      .createQueryBuilder('entity')
      .select('entity.postId', 'postId')
      .where('entity.postId IN (:...ids)', { ids: idNums });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const rows = await qb.getRawMany<{ postId: string }>();
    const allowedIds = rows.map((r) => +r.postId);

    if (allowedIds.length !== idNums.length) {
      return ResultData.fail(403, '无权限删除部分数据');
    }

    await this.sysPostEntityRep.softDelete({ postId: In(allowedIds) });
    return ResultData.ok();
  }

  /**
   * 导出岗位管理数据为xlsx文件
   * @param res
   */
  async export(res: Response, body: ListPostDto, currentUser: UserType['user']) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body, currentUser);
    const options = {
      sheetName: '岗位数据',
      data: list.data.list,
      header: [
        { title: '岗位序号', dataIndex: 'postId' },
        { title: '岗位编码', dataIndex: 'postCode' },
        { title: '岗位名称', dataIndex: 'postName' },
        { title: '岗位排序', dataIndex: 'postSort' },
        { title: '状态', dataIndex: 'status' },
      ],
    };
    ExportTable(options, res);
  }
}
