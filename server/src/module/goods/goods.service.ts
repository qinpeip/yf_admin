import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { GoodsEntity } from './entities/goods.entity';
import { DeepPartial, EntityManager, In, Not, Repository } from 'typeorm';
import { CreateGoodsDto, QueryGoodsDto, UpdateGoodsDto } from './dto/goods.dto';
import { UserType } from '../system/user/dto/user';
import { GoodsSkuEntity } from './entities/goods-sku.entity';
import { GoodsWithCraftsmanshipEntity } from './entities/goods-with-craftsmanship.entity';
import { GoodsAttrsEntity } from './entities/goods-attrs.entity';
import { isEmpty } from 'src/common/utils';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { ResultData } from 'src/common/utils/result';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(GoodsEntity)
    private readonly goodsEntityRep: Repository<GoodsEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly dataPermissionService: DataPermissionService,
  ) {}

  async findAll(query: QueryGoodsDto, user: UserType['user']) {
    const entity = await this.goodsEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    if (!isEmpty(query.name)) {
      entity.andWhere('entity.name LIKE :name', { name: `%${query.name}%` });
    }
    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }
    entity.select(['entity.goodsId', 'entity.name', 'entity.description', 'entity.image', 'entity.status', 'entity.createTime', 'entity.updateTime', 'entity.createBy', 'entity.updateBy']);
    entity.leftJoinAndSelect('entity.public', 'public');
    const [list, total] = await entity.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  async create(createGoodsDto: CreateGoodsDto, user: UserType['user']) {
    const { attrs, skus, craftsmanship, ...goodsPayload } = createGoodsDto;
    try {
      await this.entityManager.transaction(async (manager) => {
        const goods = await manager.save(GoodsEntity, {
          ...goodsPayload,
          deptId: user.deptId,
          ownerUserId: user.userId,
          tenantId: user.tenantId,
          createBy: user.userName,
        });
        await manager.getRepository(GoodsWithCraftsmanshipEntity).save(
          craftsmanship.map((c) => ({
            priceType: c.priceType,
            childCraftsmanship: c.childCraftsmanship,
            craftsmanship: { craftsmanshipId: c.craftsmanshipId },
            goods,
          })),
        );
        await manager.getRepository(GoodsAttrsEntity).save(
          attrs.map((a) => ({
            ...a,
            goods,
          })),
        );
        const skuEntities: DeepPartial<GoodsSkuEntity>[] = skus.map((s) => ({
          ...s,
          spec: s.spec.map((it) => ({ ...it, optionName: String(it.optionName) })),
          goods,
        }));
        await manager.getRepository(GoodsSkuEntity).insert(skuEntities);
      });
      return ResultData.ok({ value: true });
    } catch (error) {
      return ResultData.fail(500, error.message);
    }
  }

  async update(updateGoodsDto: UpdateGoodsDto, user: UserType['user']) {
    const { goodsId, attrs, skus, craftsmanship, ...goodsPayload } = updateGoodsDto;
    const entity = await this.goodsEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    entity.andWhere('entity.goodsId = :goodsId', { goodsId });
    const found = await entity.getOne();
    if (!found) {
      return ResultData.fail(404, '商品不存在');
    }
    try {
      await this.entityManager.transaction(async (manager) => {
        await manager.getRepository(GoodsEntity).update(goodsId, goodsPayload);
        const goodsAttrsIdList = attrs.map((a) => a.goodsAttrsId).filter(Boolean);
        await manager.getRepository(GoodsAttrsEntity).delete({ goodsAttrsId: Not(In(goodsAttrsIdList)), goods: { goodsId } });
        await manager.getRepository(GoodsAttrsEntity).save(attrs);
        const goodsWithCraftsmanshipIdList = craftsmanship.map((c) => c.goodsWithCraftsmanshipId).filter(Boolean);
        await manager.getRepository(GoodsWithCraftsmanshipEntity).delete({ goodsWithCraftsmanshipId: Not(In(goodsWithCraftsmanshipIdList)), goods: { goodsId } });
        await manager.getRepository(GoodsWithCraftsmanshipEntity).save(craftsmanship);
      });
      return ResultData.ok({ value: true });
    } catch (error) {
      return ResultData.fail(500, error.message);
    }
    // await this.goodsEntityRep.update(goodsId, goodsPayload);
    // return ResultData.ok({ value: true });
  }

  async findOne(goodsId: number, user: UserType['user']) {
    const entity = await this.goodsEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    entity.andWhere('entity.goodsId = :goodsId', { goodsId });
    entity.leftJoinAndSelect('entity.attrs', 'attrs').leftJoinAndSelect('attrs.attrsOptions', 'attrsOptions');
    // entity.leftJoinAndSelect('entity.skus', 'skus');
    entity
      .leftJoinAndSelect('entity.craftsmanship', 'craftsmanship')
      .leftJoinAndSelect('craftsmanship.childCraftsmanship', 'childCraftsmanship')
      .leftJoinAndSelect('craftsmanship.craftsmanship', 'craftsmanshipEntity');
    const res = await entity.getOne();
    return ResultData.ok({
      ...res,
      craftsmanship: res.craftsmanship.map((c) => ({
        goodsWithCraftsmanshipId: c.goodsWithCraftsmanshipId,
        childCraftsmanship: c.childCraftsmanship,
        craftsmanshipId: c.craftsmanship.craftsmanshipId,
        priceType: c.priceType,
      })),
    });
  }

  async findSkus(goodsId: number, user: UserType['user']) {
    const entity = await this.goodsEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    entity.andWhere('entity.goodsId = :goodsId', { goodsId });
    entity.leftJoinAndSelect('entity.skus', 'skus');
    const res = await entity.getOne();
    return ResultData.ok(res.skus);
  }

  async remove(goodsIds: number[], user: UserType['user']) {
    const qb = this.goodsEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', user as any);
    qb.andWhere('entity.goodsId IN (:...goodsIds)', { goodsIds });
    const rows = await qb.select(['entity.goodsId']).getMany();
    const allowedIds = rows.map((r) => r.goodsId);
    const res = await this.goodsEntityRep.delete({ goodsId: In(allowedIds) });
    return ResultData.ok({ value: res.affected >= 1 });
  }
}
