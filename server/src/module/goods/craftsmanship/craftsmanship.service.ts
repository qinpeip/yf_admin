import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, Like } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { CreateCraftsmanshipDto, UpdateCraftsmanshipDto, QueryCraftsmanshipDto } from './dto/craftsmanship.dto';
import { GoodsCraftsmanshipEntity } from './entities/craftsmanship.entity';
import { isEmpty } from 'src/common/utils';
import { UserDto } from 'src/module/system/user/user.decorator';

@Injectable()
export class CraftsmanshipService {
  constructor(
    @InjectRepository(GoodsCraftsmanshipEntity)
    private readonly craftsmanshipEntityRep: Repository<GoodsCraftsmanshipEntity>,
  ) {}

  async create(createCraftsmanshipDto: CreateCraftsmanshipDto, user: UserDto['user']) {
    const res = await this.craftsmanshipEntityRep.save({
      ...createCraftsmanshipDto,
      createBy: user.userName,
      ownerUserId: user.userId,
      tenantId: user.tenantId,
      deptId: user.deptId,
    });
    return ResultData.ok(res);
  }

  async findAll(query: QueryCraftsmanshipDto) {
    const entity = this.craftsmanshipEntityRep.createQueryBuilder('entity');
    if (!isEmpty(query.craftsmanshipId)) {
      entity.andWhere('entity.craftsmanshipId = :craftsmanshipId', { craftsmanshipId: query.craftsmanshipId });
    }
    if (!isEmpty(query.tenantId)) {
      entity.andWhere('entity.tenantId = :tenantId', { tenantId: query.tenantId });
    }
    if (!isEmpty(query.ownerUserId)) {
      entity.andWhere('entity.ownerUserId = :ownerUserId', { ownerUserId: query.ownerUserId });
    }
    if (!isEmpty(query.createBy)) {
      entity.andWhere('entity.createBy = :createBy', { createBy: query.createBy });
    }
    if (!isEmpty(query.createTime)) {
      entity.andWhere('entity.createTime BETWEEN :start AND :end', { start: query.createTime[0], end: query.createTime[1] });
    }
    if (!isEmpty(query.updateBy)) {
      entity.andWhere('entity.updateBy = :updateBy', { updateBy: query.updateBy });
    }
    if (!isEmpty(query.updateTime)) {
      entity.andWhere('entity.updateTime BETWEEN :start AND :end', { start: query.updateTime[0], end: query.updateTime[1] });
    }
    if (!isEmpty(query.deleteTime)) {
      entity.andWhere('entity.deleteTime BETWEEN :start AND :end', { start: query.deleteTime[0], end: query.deleteTime[1] });
    }
    if (!isEmpty(query.name)) {
      entity.andWhere('entity.name LIKE :name', { name: `%${query.name}%` });
    }
    if (!isEmpty(query.sort)) {
      entity.andWhere('entity.sort = :sort', { sort: query.sort });
    }
    if (!isEmpty(query.description)) {
      entity.andWhere('entity.description = :description', { description: query.description });
    }
    entity.select([
      'entity.craftsmanshipId',
      'entity.tenantId',
      'entity.ownerUserId',
      'entity.deleteTime',
      'entity.name',
      'entity.sort',
      'entity.description',
      'entity.createBy',
      'entity.createTime',
      'entity.updateBy',
      'entity.updateTime',
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

  async enums() {
    const qb = this.craftsmanshipEntityRep.createQueryBuilder('entity');
    qb.select(['entity.craftsmanshipId', 'entity.name']);
    const list = await qb.getMany();
    return ResultData.ok(list.map((item) => ({ label: item.name, value: item.craftsmanshipId })));
  }

  async findOne(craftsmanshipId: number) {
    const res = await this.craftsmanshipEntityRep.findOne({
      where: {
        craftsmanshipId: craftsmanshipId,
      },
    });
    return ResultData.ok(res);
  }

  async update(updateCraftsmanshipDto: UpdateCraftsmanshipDto, user: UserDto['user']) {
    const res = await this.craftsmanshipEntityRep.update(
      { craftsmanshipId: updateCraftsmanshipDto.craftsmanshipId },
      {
        ...updateCraftsmanshipDto,
        updateBy: user.userName,
      },
    );
    return ResultData.ok({ value: res.affected >= 1 });
  }

  async remove(craftsmanshipIds: number[]) {
    const res = await this.craftsmanshipEntityRep.delete({ craftsmanshipId: In(craftsmanshipIds) });
    return ResultData.ok({ value: res.affected >= 1 });
  }
}
