import { Inject, Injectable } from '@nestjs/common';
import { SysShippingTemplateEntity } from './entities/shipping-template.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SysShippingTemplateRuleEntity } from './entities/shipping-template-rule.entity';
import { CreateShippingTemplateDto, ListShippingTemplateDto, UpdateShippingTemplateDto } from './dto';
import { UserDto } from '../user/user.decorator';
import { ResultData } from 'src/common/utils/result';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { ExpressService } from '../express/express.service';

@Injectable()
export class ShippingTemplateService {
  constructor(
    @InjectRepository(SysShippingTemplateEntity)
    private readonly shippingTemplateRepository: Repository<SysShippingTemplateEntity>,
    @InjectRepository(SysShippingTemplateRuleEntity)
    private readonly shippingTemplateRuleRepository: Repository<SysShippingTemplateRuleEntity>,
    @Inject(DataPermissionService)
    private readonly dataPermissionService: DataPermissionService,
    private readonly expressService: ExpressService,
  ) {}

  async create(createShippingTemplateDto: CreateShippingTemplateDto, user: UserDto['user']) {
    const res = await this.shippingTemplateRepository.save({
      ...createShippingTemplateDto,
      tenantId: user.tenantId,
      ownerUserId: user.userId,
      deptId: user.deptId,
      createBy: user.userName,
      express: {
        expressId: createShippingTemplateDto.expressId,
      },
    });
    return ResultData.ok(res);
  }
  async update(updateShippingTemplateDto: UpdateShippingTemplateDto, user: UserDto['user']) {
    const { shippingTemplateId } = updateShippingTemplateDto;
    const qb = this.shippingTemplateRepository.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', user as any);
    qb.andWhere('entity.shippingTemplateId = :shippingTemplateId', { shippingTemplateId });
    const exist = await qb.getOne();
    if (!exist) {
      return ResultData.fail(403, '无权限修改该数据');
    }
    // 1) 更新主表字段（不要把 attrs 传进 update）
    const { rules: _rules, ...shippingTemplatePayload } = updateShippingTemplateDto;
    Object.assign(exist, shippingTemplatePayload);
    exist.updateBy = user.userName;
    // 2) 同步 attrs：insert/update + 删除不再存在的行
    const incomingRules: any[] = Array.isArray(_rules) ? _rules : [];
    const normalizedRules = incomingRules.map((a) => ({
      ...a,
    }));

    const incomingIds = normalizedRules.map((a) => a.ruleId).filter((id) => id != null) as number[];

    const existIds = (exist.rules ?? []).map((a) => a.ruleId).filter((id) => id != null) as number[];
    const removeIds = existIds.filter((id) => !incomingIds.includes(id));
    if (removeIds.length) {
      await this.shippingTemplateRuleRepository.delete({ ruleId: In(removeIds) });
    }
    exist.rules = normalizedRules.map((a) =>
      this.shippingTemplateRuleRepository.create({
        ...a,
        template: exist,
      }),
    ) as unknown as SysShippingTemplateRuleEntity[];
    await this.shippingTemplateRepository.save(exist);
    return ResultData.ok({ value: true });
  }

  async findAll(listShippingTemplateDto: ListShippingTemplateDto, user: UserDto['user']) {
    const qb = this.shippingTemplateRepository.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', user as any);
    if (listShippingTemplateDto.shippingTemplateName) {
      qb.andWhere('entity.shippingTemplateName LIKE :shippingTemplateName', { shippingTemplateName: `%${listShippingTemplateDto.shippingTemplateName}%` });
    }
    qb.leftJoinAndSelect('entity.express', 'express');
    const [list, total] = await qb.getManyAndCount();
    const expressList = await this.expressService.list();
    return ResultData.ok({ list, total, expressList });
  }
  async findOne(shippingTemplateId: number, user: UserDto['user']) {
    const qb = this.shippingTemplateRepository.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', user as any);
    qb.andWhere('entity.shippingTemplateId = :shippingTemplateId', { shippingTemplateId });
    // Join 条件里用实体属性名时，TypeORM 不一定会替换成列名，容易出现 Unknown column
    qb.leftJoinAndSelect('entity.rules', 'rule');
    qb.leftJoinAndSelect('entity.express', 'express');
    const data = await qb.getOne();
    if (!data) {
      return ResultData.fail(403, '无权限访问该数据');
    }
    return ResultData.ok(data);
  }

  async remove(shippingTemplateIds: number[], user: UserDto['user']) {
    const ids = (shippingTemplateIds ?? []).filter((id) => Number.isFinite(id));
    if (!ids.length) {
      return ResultData.ok({ value: false });
    }

    // delete() 不带表别名，且 NaN 会被拼进 SQL 导致 Unknown column 'NaN'；先按权限筛选再按 ID 删除
    const qb = this.shippingTemplateRepository.createQueryBuilder('entity');
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', user as any);
    qb.andWhere('entity.shippingTemplateId IN (:...shippingTemplateIds)', { shippingTemplateIds: ids });
    const rows = await qb.select(['entity.shippingTemplateId']).getMany();
    const allowedIds = rows.map((r) => r.shippingTemplateId);
    if (!allowedIds.length) {
      return ResultData.ok({ value: false });
    }

    const res = await this.shippingTemplateRepository.delete({
      shippingTemplateId: In(allowedIds),
    } as any);
    return ResultData.ok({ value: (res.affected ?? 0) >= 1 });
  }
}
