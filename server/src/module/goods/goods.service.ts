import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { GoodsEntity } from './entities/goods.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(GoodsEntity)
    private readonly goodsEntityRep: Repository<GoodsEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}
}
