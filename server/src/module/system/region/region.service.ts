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
    if (!isEmpty(query.name)) {
      entity.where('(entity.name LIKE :name OR entity.mergerName LIKE :mergerName OR entity.shortname LIKE :shortname)', {
        name: `%${query.name}%`,
        mergerName: `%${query.name}%`,
        shortname: `%${query.name}%`,
      });
    }
    if (!isEmpty(query.level)) {
      entity.andWhere('entity.level = :level', { level: query.level });
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

  async provinceList() {
    const list = await this.regionEntityRep.find({
      where: {
        level: 1,
      },
      select: {
        id: true,
        name: true,
      },
    });
    return ResultData.ok(list);
  }

  async cityList() {
    const list = await this.regionEntityRep.find({
      where: {
        level: 2,
      },
      select: {
        id: true,
        name: true,
        pid: true,
      },
    });
    return ResultData.ok(list);
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
