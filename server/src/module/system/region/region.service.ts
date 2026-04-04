import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In, Like } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { CreateRegionDto, UpdateRegionDto, QueryRegionDto } from './dto/region.dto';
import { SysRegionEntity } from './entities/region.entity';
import { isEmpty } from 'src/common/utils';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(SysRegionEntity)
    private readonly regionEntityRep: Repository<SysRegionEntity>,
  ) {}

  async create(createRegionDto: CreateRegionDto) {
    const res = await this.regionEntityRep.save(createRegionDto);
    return ResultData.ok(res);
  }

  async findAll(query: QueryRegionDto) {
    const entity = this.regionEntityRep.createQueryBuilder('entity');
    if (!isEmpty(query.id)) {
      entity.andWhere('entity.id = :id', { id: query.id });
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
    if (!isEmpty(query.pid)) {
      entity.andWhere('entity.pid = :pid', { pid: query.pid });
    }
    if (!isEmpty(query.shortname)) {
      entity.andWhere('entity.shortname LIKE :shortname', { shortname: `%${query.shortname}%` });
    }
    if (!isEmpty(query.name)) {
      entity.andWhere('entity.name LIKE :name', { name: `%${query.name}%` });
    }
    if (!isEmpty(query.mergerName)) {
      entity.andWhere('entity.mergerName LIKE :mergerName', { mergerName: `%${query.mergerName}%` });
    }
    if (!isEmpty(query.level)) {
      entity.andWhere('entity.level = :level', { level: query.level });
    }
    if (!isEmpty(query.pinyin)) {
      entity.andWhere('entity.pinyin = :pinyin', { pinyin: query.pinyin });
    }
    if (!isEmpty(query.code)) {
      entity.andWhere('entity.code = :code', { code: query.code });
    }
    if (!isEmpty(query.zipCode)) {
      entity.andWhere('entity.zipCode = :zipCode', { zipCode: query.zipCode });
    }
    if (!isEmpty(query.first)) {
      entity.andWhere('entity.first = :first', { first: query.first });
    }
    if (!isEmpty(query.lng)) {
      entity.andWhere('entity.lng = :lng', { lng: query.lng });
    }
    if (!isEmpty(query.lat)) {
      entity.andWhere('entity.lat = :lat', { lat: query.lat });
    }
    if (!isEmpty(query.sort)) {
      entity.andWhere('entity.sort = :sort', { sort: query.sort });
    }
    entity.select([
      'entity.id',
      'entity.tenantId',
      'entity.ownerUserId',
      'entity.deleteTime',
      'entity.pid',
      'entity.shortname',
      'entity.name',
      'entity.mergerName',
      'entity.level',
      'entity.pinyin',
      'entity.code',
      'entity.zipCode',
      'entity.first',
      'entity.lng',
      'entity.lat',
      'entity.sort',
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

  async findOne(id: number) {
    const res = await this.regionEntityRep.findOne({
      where: {
        id: id,
      },
    });
    return ResultData.ok(res);
  }

  async update(updateRegionDto: UpdateRegionDto) {
    const res = await this.regionEntityRep.update({ id: updateRegionDto.id }, updateRegionDto);
    return ResultData.ok({ value: res.affected >= 1 });
  }

  async remove(ids: number[]) {
    const res = await this.regionEntityRep.delete({ id: In(ids) });
    return ResultData.ok({ value: res.affected >= 1 });
  }
}
