import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { SysDeptEntity } from './entities/dept.entity';
import { CreateDeptDto, UpdateDeptDto, ListDeptDto } from './dto/index';
import { ListToTree } from 'src/common/utils/index';
import { CacheEnum } from 'src/common/enum/index';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';
import { UserEntity } from '../user/entities/sys-user.entity';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { UserType } from '../user/dto/user';

@Injectable()
export class DeptService {
  constructor(
    @InjectRepository(SysDeptEntity)
    private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly dataPermissionService: DataPermissionService,
  ) {}

  /**
   * 获取本部门及以下部门ID（仅在同租户内）
   */
  async findChildDeptIdsByTenantAndDept(tenantId: number, deptId: number): Promise<number[]> {
    const rows = await this.sysDeptEntityRep
      .createQueryBuilder('dept')
      .select('dept.deptId', 'deptId')
      .where('dept.tenantId = :tenantId', { tenantId })
      .andWhere('(dept.ancestors LIKE :ancestors OR dept.deptId = :deptId)', {
        ancestors: `%${deptId}%`,
        deptId: deptId,
      })
      .getRawMany<{ deptId: string }>();

    return rows.map((r) => +r.deptId);
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async create(createDeptDto: CreateDeptDto, currentUser: UserType['user']) {
    // 强制写入租户/owner，避免跨租户越权
    (createDeptDto as any).tenantId = currentUser.tenantId;
    (createDeptDto as any).ownerUserId = currentUser.userId;
    if (createDeptDto.parentId) {
      const parent = await this.sysDeptEntityRep.findOne({
        where: {
          deptId: createDeptDto.parentId,
          tenantId: currentUser.tenantId,
        },
        select: ['ancestors'],
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const ancestors = parent.ancestors ? `${parent.ancestors},${createDeptDto.parentId}` : `${createDeptDto.parentId}`;
      Object.assign(createDeptDto, { ancestors: ancestors });
    }
    await this.sysDeptEntityRep.save(createDeptDto);
    return ResultData.ok();
  }

  async findAll(query: ListDeptDto, currentUser: UserType['user']) {
    const entity = this.sysDeptEntityRep.createQueryBuilder('entity');

    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', currentUser as any);

    if (query.deptName) {
      entity.andWhere(`entity.deptName LIKE "%${query.deptName}%"`);
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }
    const res = await entity.getMany();
    return ResultData.ok(res);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findOne:{currentUser.tenantId}:{deptId}')
  async findOne(deptId: number, currentUser: UserType['user']) {
    const qb = this.sysDeptEntityRep.createQueryBuilder('entity').where('entity.deptId = :deptId', { deptId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const data = await qb.getOne();
    return ResultData.ok(data);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findListExclude:{currentUser.tenantId}:{id}')
  async findListExclude(id: number, currentUser: UserType['user']) {
    //TODO 需排出ancestors 中不出现id的数据
    const qb = this.sysDeptEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const data = await qb.getMany();
    return ResultData.ok(data);
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async update(updateDeptDto: UpdateDeptDto, currentUser: UserType['user']) {
    const qb = this.sysDeptEntityRep.createQueryBuilder('entity').where('entity.deptId = :deptId', { deptId: updateDeptDto.deptId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const found = await qb.getOne();
    if (!found) return ResultData.fail(403, '无权限修改该数据');

    if (updateDeptDto.parentId && updateDeptDto.parentId !== 0) {
      const parent = await this.sysDeptEntityRep.findOne({
        where: {
          deptId: updateDeptDto.parentId,
          tenantId: currentUser.tenantId,
        },
        select: ['ancestors'],
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const ancestors = parent.ancestors ? `${parent.ancestors},${updateDeptDto.parentId}` : `${updateDeptDto.parentId}`;
      Object.assign(updateDeptDto, { ancestors: ancestors });
    }
    await this.sysDeptEntityRep.update({ deptId: updateDeptDto.deptId, tenantId: currentUser.tenantId }, updateDeptDto);
    return ResultData.ok();
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async remove(deptId: number, currentUser: UserType['user']) {
    const qb = this.sysDeptEntityRep.createQueryBuilder('entity').where('entity.deptId = :deptId', { deptId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const found = await qb.getOne();
    if (!found) return ResultData.fail(403, '无权限删除该数据');

    const hasUser = await this.entityManager.exists(UserEntity, {
      where: {
        deptId: deptId,
        tenantId: currentUser.tenantId,
      },
    });
    if (hasUser) {
      return ResultData.fail(500, '该部门下有用户，不能删除');
    }
    const hasChildren = await this.entityManager.exists(SysDeptEntity, {
      where: {
        parentId: deptId,
        tenantId: currentUser.tenantId,
      },
    });
    if (hasChildren) {
      return ResultData.fail(500, '该部门下有子部门，不能删除');
    }
    const result = await this.entityManager.delete(SysDeptEntity, { deptId: deptId, tenantId: currentUser.tenantId });
    return ResultData.ok(result);
  }

  /**
   * 部门树
   * @returns
   */
  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'deptTree:{currentUser.tenantId}')
  async deptTree(currentUser: UserType['user']) {
    const qb = this.sysDeptEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const res = await qb.getMany();
    const tree = ListToTree(
      res,
      (m) => m.deptId,
      (m) => m.deptName,
    );
    return tree;
  }
}
