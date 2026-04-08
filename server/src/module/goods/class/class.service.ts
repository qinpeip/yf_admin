import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { CreateClassDto, UpdateClassDto, QueryClassDto } from './dto/class.dto';
import { GoodsClassEntity } from './entities/class.entity';
import { GoodsClassAttrsEntity } from './entities/class-attrs.entity';
import { isEmpty } from 'src/common/utils';
import { UserType } from 'src/module/system/user/dto/user';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(GoodsClassEntity)
    private readonly classEntityRep: Repository<GoodsClassEntity>,
    @InjectRepository(GoodsClassAttrsEntity)
    private readonly classAttrsEntityRep: Repository<GoodsClassAttrsEntity>,
  ) {}

  async create(createClassDto: CreateClassDto, user: UserType['user']) {
    const { attrs, ...classPayload } = createClassDto as any;
    const attrText = attrs.map((a) => `${a.attrName}`).join(';');
    const res = await this.classEntityRep.save({
      ...createClassDto,
      attrText,
      ownerUserId: user.userId,
      deptId: user.deptId,
      createBy: user.userName,
    });
    return ResultData.ok(res);
  }

  async findAll(query: QueryClassDto) {
    const entity = this.classEntityRep.createQueryBuilder('entity');
    if (!isEmpty(query.classId)) {
      entity.andWhere('entity.classId = :classId', { classId: query.classId });
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
    if (!isEmpty(query.parentId)) {
      entity.andWhere('entity.parentId = :parentId', { parentId: query.parentId });
    }
    if (!isEmpty(query.sort)) {
      entity.andWhere('entity.sort = :sort', { sort: query.sort });
    }
    if (!isEmpty(query.deptId)) {
      entity.andWhere('entity.deptId = :deptId', { deptId: query.deptId });
    }
    if (!isEmpty(query.type)) {
      entity.andWhere('entity.type = :type', { type: query.type });
    }
    if (!isEmpty(query.status)) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }
    if (!isEmpty(query.description)) {
      entity.andWhere('entity.description = :description', { description: query.description });
    }
    entity.select([
      'entity.classId',
      'entity.tenantId',
      'entity.ownerUserId',
      'entity.deleteTime',
      'entity.name',
      'entity.parentId',
      'entity.sort',
      'entity.deptId',
      'entity.type',
      'entity.status',
      'entity.description',
      'entity.attrText',
    ]);

    if (query.orderByColumn && query.isAsc) {
      const key = query.isAsc === 'ascending' ? 'ASC' : 'DESC';
      entity.orderBy(`entity.${query.orderByColumn}`, key);
    }
    const list = await entity.getMany();
    return ResultData.ok({
      list: this.buildTree(list, 0),
    });
  }

  buildTree(data: GoodsClassEntity[], parentId: number) {
    return data
      .filter((item) => item.parentId === parentId)
      .map((item) => {
        const children = this.buildTree(data, item.classId);
        return {
          ...item,
          children: children.length > 0 ? children : undefined,
        };
      });
  }

  async findOne(classId: number) {
    const res = await this.classEntityRep.findOne({
      where: {
        classId: classId,
      },
      relations: {
        attrs: true,
      },
    });
    return ResultData.ok(res);
  }

  async update(updateClassDto: UpdateClassDto, user: UserType['user']) {
    const { classId } = updateClassDto;
    const exist = await this.classEntityRep.findOne({
      where: { classId },
      relations: { attrs: true },
    });
    if (!exist) {
      return ResultData.ok({ value: false });
    }

    // 1) 更新主表字段（不要把 attrs 传进 update）
    const { attrs: _attrs, ...classPayload } = updateClassDto as any;
    Object.assign(exist, classPayload);
    const attrText = _attrs.map((a) => `${a.attrName}`).join(';');
    exist.attrText = attrText;
    exist.updateBy = user.userName;
    // 2) 同步 attrs：insert/update + 删除不再存在的行
    const incomingAttrs: any[] = Array.isArray(updateClassDto.attrs) ? updateClassDto.attrs : [];
    const normalizedAttrs = incomingAttrs.map((a) => ({
      ...a,
    }));

    const incomingIds = normalizedAttrs.map((a) => a.attrId).filter((id) => id != null) as number[];

    const existIds = (exist.attrs ?? []).map((a) => a.attrId).filter((id) => id != null) as number[];
    const removeIds = existIds.filter((id) => !incomingIds.includes(id));
    if (removeIds.length) {
      await this.classAttrsEntityRep.delete({ attrId: In(removeIds) });
    }

    exist.attrs = normalizedAttrs.map((a) =>
      this.classAttrsEntityRep.create({
        ...a,
        class: exist,
      }),
    ) as unknown as GoodsClassAttrsEntity[];

    await this.classEntityRep.save(exist);
    return ResultData.ok({ value: true });
  }

  async remove(classIds: number[]) {
    const hasChildren = await this.classEntityRep.exist({
      where: {
        parentId: In(classIds),
      },
    });
    if (hasChildren) {
      return ResultData.fail(500, '该类目下有子类目，不能删除');
    }
    const res = await this.classEntityRep.delete({ classId: In(classIds) });
    return ResultData.ok({ value: res.affected >= 1 });
  }
}
