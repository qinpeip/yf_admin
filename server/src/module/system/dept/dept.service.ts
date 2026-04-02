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

@Injectable()
export class DeptService {
  constructor(
    @InjectRepository(SysDeptEntity)
    private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async create(createDeptDto: CreateDeptDto) {
    if (createDeptDto.parentId) {
      const parent = await this.sysDeptEntityRep.findOne({
        where: {
          deptId: createDeptDto.parentId,
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

  async findAll(query: ListDeptDto) {
    const entity = this.sysDeptEntityRep.createQueryBuilder('entity');

    if (query.deptName) {
      entity.andWhere(`entity.deptName LIKE "%${query.deptName}%"`);
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }
    const res = await entity.getMany();
    return ResultData.ok(res);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findOne:{deptId}')
  async findOne(deptId: number) {
    const data = await this.sysDeptEntityRep.findOne({
      where: {
        deptId: deptId,
      },
    });
    return ResultData.ok(data);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findListExclude')
  async findListExclude(id: number) {
    //TODO 需排出ancestors 中不出现id的数据
    const data = await this.sysDeptEntityRep.find({
      where: {},
    });
    return ResultData.ok(data);
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async update(updateDeptDto: UpdateDeptDto) {
    if (updateDeptDto.parentId && updateDeptDto.parentId !== 0) {
      const parent = await this.sysDeptEntityRep.findOne({
        where: {
          deptId: updateDeptDto.parentId,
        },
        select: ['ancestors'],
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const ancestors = parent.ancestors ? `${parent.ancestors},${updateDeptDto.parentId}` : `${updateDeptDto.parentId}`;
      Object.assign(updateDeptDto, { ancestors: ancestors });
    }
    await this.sysDeptEntityRep.update({ deptId: updateDeptDto.deptId }, updateDeptDto);
    return ResultData.ok();
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async remove(deptId: number) {
    const hasUser = await this.entityManager.exists(UserEntity, {
      where: {
        deptId: deptId,
      },
    });
    if (hasUser) {
      return ResultData.fail(500, '该部门下有用户，不能删除');
    }
    const hasChildren = await this.entityManager.exists(SysDeptEntity, {
      where: {
        parentId: deptId,
      },
    });
    if (hasChildren) {
      return ResultData.fail(500, '该部门下有子部门，不能删除');
    }
    const result = await this.entityManager.delete(SysDeptEntity, { deptId: deptId });
    return ResultData.ok(result);
  }

  /**
   * 部门树
   * @returns
   */
  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'deptTree')
  async deptTree() {
    const res = await this.sysDeptEntityRep.find({});
    const tree = ListToTree(
      res,
      (m) => m.deptId,
      (m) => m.deptName,
    );
    return tree;
  }
}
