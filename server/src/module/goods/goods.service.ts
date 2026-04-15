import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { GoodsEntity } from './entities/goods.entity';
import { DeepPartial, EntityManager, In, Not, Repository } from 'typeorm';
import { CreateGoodsDto, QueryGoodsDto, UpdateGoodsDto } from './dto/goods.dto';
import { UserType } from '../system/user/dto/user';
import { GoodsSkuEntity, GoodsSkuSpecJsonItem } from './entities/goods-sku.entity';
import { GoodsWithCraftsmanshipEntity } from './entities/goods-with-craftsmanship.entity';
import { GoodsAttrsEntity } from './entities/goods-attrs.entity';
import { GoodsAttrsOptionsEntity } from './entities/goods-attrs-options.entity';
import { GoodsChildCraftsmanshipEntity } from './entities/goods-child-craftsmanship.entity';
import { isEmpty } from 'src/common/utils';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { ResultData } from 'src/common/utils/result';
import { buildGoodsSkuSpecFingerprint } from './utils/goods-sku-fingerprint';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(GoodsEntity)
    private readonly goodsEntityRep: Repository<GoodsEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly dataPermissionService: DataPermissionService,
  ) { }

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
          // spec: s.spec.map((it) => ({ ...it, optionName: String(it.optionName) })),
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
    const { goodsId, attrs, craftsmanship, skus, ...goodsPayload } = updateGoodsDto;
    const skuSpecMap = await this.generateSkuSpecMap(attrs);
    const entity = await this.goodsEntityRep.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', user as any);
    entity.andWhere('entity.goodsId = :goodsId', { goodsId });
    console.time('updateGoodsDto:find');
    const found = await entity.getOne();
    console.timeEnd('updateGoodsDto:find');
    if (!found) {
      return ResultData.fail(404, '商品不存在');
    }
    await this.entityManager.transaction(async (manager) => {
      console.time('updateGoodsDto');
      console.time('updateGoodsDto:goods');
      await manager.getRepository(GoodsEntity).update(goodsId, {
        ...goodsPayload,
        updateBy: user.userName,
        ownerUserId: user.userId,
        tenantId: user.tenantId,
        deptId: user.deptId,
      });
      console.timeEnd('updateGoodsDto:goods');
      console.time('updateGoodsDto:attrs');
      const goodsAttrsIdList = attrs.map((a) => a.goodsAttrsId).filter(Boolean);
      const attrsRepo = manager.getRepository(GoodsAttrsEntity);
      await attrsRepo.delete({ goodsAttrsId: Not(In(goodsAttrsIdList)), goods: { goodsId } });
      await attrsRepo.save(attrs.map((a) => ({ ...a, goods: { goodsId } })));
      console.timeEnd('updateGoodsDto:attrs');
      console.time('updateGoodsDto:craft');
      const goodsWithCraftsmanshipIdList = craftsmanship.map((c) => c.goodsWithCraftsmanshipId).filter(Boolean);
      const craftRepo = manager.getRepository(GoodsWithCraftsmanshipEntity);
      await craftRepo.delete({ goodsWithCraftsmanshipId: Not(In(goodsWithCraftsmanshipIdList)), goods: { goodsId } });
      await craftRepo.save(craftsmanship.map((c) => ({ ...c, goods: { goodsId } })));
      console.timeEnd('updateGoodsDto:craft');
      // 整单提交视为「当前商品 SKU 全量」：先删该 goods 下全部 SKU，再纯 INSERT。避免 NOT IN 大列表 + 每行 ON DUPLICATE + 大 JSON 的代价。
      // 若业务需要「只 PATCH 部分指纹、保留其余 SKU」，需改回按指纹 upsert 方案。
      console.time('updateGoodsDto:sku');
      const specFingerprintList = skus.map((s) => s.specFingerprint);
      await manager.getRepository(GoodsSkuEntity).delete({ goods: { goodsId }, specFingerprint: Not(In(specFingerprintList)) });
      const skuRowList = skus.map((s) => ({
        sortOrder: s.sortOrder ?? 0,
        spec: skuSpecMap.get(s.specFingerprint),
        price: s.price,
        stock: s.stock ?? 0,
        specFingerprint: s.specFingerprint,
        skuCode: s.skuCode ?? '',
        goods: { goodsId },
      }));
      console.log('save skuRowList', skuRowList);
      await manager.getRepository(GoodsSkuEntity).save(skuRowList);
      // const skuRowList = skus
      //   .filter((s) => s.specFingerprint)
      //   .map((s) => ({
      //     sortOrder: s.sortOrder ?? 0,
      //     spec: s.spec.map((it) => ({ ...it, optionName: String(it.optionName) })),
      //     price: s.price,
      //     stock: s.stock ?? 0,
      //     specFingerprint: s.specFingerprint,
      //     skuCode: s.skuCode ?? '',
      //     goodsId,
      //     goods: { goodsId },
      //   }));
      // // 前端笛卡尔积可能产生相同 specFingerprint 的多行；唯一索引下同一批 INSERT 也会撞 ER_DUP_ENTRY，按指纹保留最后一条
      // const skuByFingerprint = new Map<string, (typeof skuRowList)[0]>();
      // for (const row of skuRowList) {
      //   skuByFingerprint.set(row.specFingerprint, row);
      // }
      // const skuRows = Array.from(skuByFingerprint.values());
      // await manager.query('DELETE FROM goods_sku WHERE goods_id = ?', [goodsId]);
      // const skuChunk = 1000;
      // for (let i = 0; i < skuRows.length; i += skuChunk) {
      //   const chunk = skuRows.slice(i, i + skuChunk);
      //   await manager
      //     .createQueryBuilder()
      //     .insert()
      //     .into(GoodsSkuEntity)
      //     .values(chunk)
      //     .updateEntity(false)
      //     .execute();
      // }
      console.timeEnd('updateGoodsDto:sku');
    });
    console.timeEnd('updateGoodsDto');
    return ResultData.ok({ value: true });
  }

  async generateSkuSpecMap(attrs: CreateGoodsDto['attrs']) {
    const arr = [];
    attrs.forEach(item => {
      arr.push(item.attrsOptions.map(o => ({
        ...o,
        key: item.key,
        attrName: item.attrName
      })))
    })
    const combos = this.combineArrays(...arr);
    const skuSpecMap = new Map<string, GoodsSkuSpecJsonItem[]>();
    combos.forEach(item => {
      const spec = item.map(p => ({
        key: p.key,
        optionName: p.optionName,
        imgUrl: p.imgUrl,
        price: p.price,
        num1: p.num1,
        num2: p.num2,
        attrName: p.attrName,
        remark: p.remark,
      }));
      skuSpecMap.set(buildGoodsSkuSpecFingerprint(spec), spec);
    })
    return skuSpecMap;
  }
  combineArrays(...arrays: any[]) {
    let acc: any[] = [[]];
    for (const array of arrays) {
      const next: any[] = [];
      for (const item of acc) {
        for (const subItem of array) {
          next.push([...item, subItem]);
        }
      }
      acc = next;
    }
    return acc;
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
    // 勿用 goods leftJoinAndSelect skus + getOne：OneToMany 会笛卡尔积，几千 SKU 时 ORM 组装可达数十秒
    const guard = this.goodsEntityRep.createQueryBuilder('g');
    await this.dataPermissionService.applyTenantAndScope(guard, 'g', user as any);
    guard.select(['g.goodsId']).andWhere('g.goodsId = :goodsId', { goodsId });
    const allowed = await guard.getOne();
    if (!allowed) {
      return ResultData.fail(404, '商品不存在');
    }
    const skus = await this.entityManager.find(GoodsSkuEntity, {
      where: { goods: { goodsId } },
      order: { sortOrder: 'ASC', goodsSkuId: 'ASC' },
    });
    return ResultData.ok(skus);
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
