import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, Like } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto } from '../dto/category.dto';
import { GoodsCategoryEntity } from '../entities/goods-category.entity';
import { isEmpty } from 'src/common/utils';
import { UserType } from '../../system/user/dto/user';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { buildMenus } from 'src/module/system/menu/utils';
import { CacheEnum } from 'src/common/enum';
import { RedisService } from 'src/module/common/redis/redis.service';

@Injectable()
export class GoodsCategoryService {
  constructor(
    @InjectRepository(GoodsCategoryEntity)
    private readonly categoryEntityRep: Repository<GoodsCategoryEntity>,
    private readonly dataPermissionService: DataPermissionService,
    private readonly redisService: RedisService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: UserType['user']) {
    const res = await this.categoryEntityRep.save({
      ...createCategoryDto,
      tenantId: user.tenantId,
      ownerUserId: user.userId,
      deptId: user.deptId,
    });
    // 清除缓存
    return ResultData.ok(res);
  }

  async findAll(query: QueryCategoryDto, user: UserType['user']) {
    const entity = this.categoryEntityRep.createQueryBuilder('entity');
    // 多租户 + 数据范围过滤
    if (user) {
      await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    }
    if (!isEmpty(query.name)) {
      entity.andWhere('entity.name LIKE :name', { name: `%${query.name}%` });
    }
    entity.select([
      'entity.categoryId',
      'entity.tenantId',
      'entity.ownerUserId',
      'entity.deleteTime',
      'entity.name',
      'entity.parentId',
      'entity.sort',
      'entity.icon',
      'entity.description',
      'entity.status',
    ]);

    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`entity.${query.orderByColumn}`, key);
    }

    if (query.pageNum && query.pageSize) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  async listTree(user: UserType['user']) {
    const entity = this.categoryEntityRep.createQueryBuilder('entity');
    // 多租户 + 数据范围过滤
    if (user) {
      await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    }
    entity.select(['entity.categoryId', 'entity.name', 'entity.parentId']);
    const res = await entity.orderBy('entity.sort', 'ASC').getMany();
    return ResultData.ok(this.buildTree(res, 0));
  }

  buildTree(list: Pick<GoodsCategoryEntity, 'categoryId' | 'name' | 'parentId'>[], parentId: number) {
    return list
      .filter((item) => item.parentId === parentId)
      .map((item) => {
        return {
          ...item,
          children: this.buildTree(list, item.categoryId),
        };
      });
  }

  async findOne(categoryId: number, user: UserType['user']) {
    const entity = this.categoryEntityRep.createQueryBuilder('entity');
    // 多租户 + 数据范围过滤
    if (user) {
      await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    }
    const res = await entity.andWhere('entity.categoryId = :categoryId', { categoryId }).getOne();
    return ResultData.ok(res);
  }

  async update(updateCategoryDto: UpdateCategoryDto, user: UserType['user']) {
    // update/delete 的 QueryBuilder 不会带表别名，WHERE 里不能写 entity.xxx；先 SELECT 校验权限再 update
    const qb = this.categoryEntityRep.createQueryBuilder('entity');
    if (user) {
      await this.dataPermissionService.applyTenantAndScope(qb, 'entity', user as any);
    }
    const row = await qb.andWhere('entity.categoryId = :categoryId', { categoryId: updateCategoryDto.categoryId }).getOne();
    if (!row) {
      return ResultData.ok({ value: false });
    }
    const { categoryId, ...payload } = updateCategoryDto;
    await this.categoryEntityRep.update({ categoryId }, payload);
    return ResultData.ok({ value: true });
  }

  async remove(categoryIds: number[], user: UserType['user']) {
    const hasChild = await this.categoryEntityRep.exists({
      where: {
        parentId: In(categoryIds),
      },
    });
    if (hasChild) {
      return ResultData.fail(500, '所选分类下有子分类，不能删除');
    }
    const qb = this.categoryEntityRep.createQueryBuilder('entity');
    if (user) {
      await this.dataPermissionService.applyTenantAndScope(qb, 'entity', user as any);
    }
    qb.andWhere('entity.categoryId IN (:...categoryIds)', { categoryIds });
    const rows = await qb.select(['entity.categoryId']).getMany();
    const allowedIds = rows.map((r) => r.categoryId);
    const res = await this.categoryEntityRep.delete({ categoryId: In(allowedIds) });
    return ResultData.ok({ value: (res.affected ?? 0) >= 1 });
  }
}
