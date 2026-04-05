import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { EXPRESS_CODE_TYPE, SysExpressEntity } from './entities/express.entity';

@Injectable()
export class ExpressService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async list() {
    const list = await this.entityManager.find(SysExpressEntity, {
      select: {
        expressId: true,
        expressName: true,
        expressCode: true,
        wxCode: true,
        dyExpressCode: true,
        sort: true,
      },
      order: {
        sort: 'ASC',
      },
    });
    return list;
  }
  async findOneByCode(code: string, type: EXPRESS_CODE_TYPE = EXPRESS_CODE_TYPE.EXPRESS_100) {
    return await this.entityManager.findOne(SysExpressEntity, {
      where: {
        [type]: code,
      },
    });
  }
}
