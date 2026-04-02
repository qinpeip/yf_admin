import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindManyOptions } from 'typeorm';
import { Response } from 'express';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';

import { SysRoleEntity } from './entities/role.entity';
import { SysRoleWithMenuEntity } from './entities/role-width-menu.entity';
import { MenuService } from '../menu/menu.service';
import { CreateRoleDto, UpdateRoleDto, ListRoleDto, ChangeStatusDto } from './dto/index';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(SysRoleEntity)
    private readonly sysRoleEntityRep: Repository<SysRoleEntity>,
    @InjectRepository(SysRoleWithMenuEntity)
    private readonly sysRoleWithMenuEntityRep: Repository<SysRoleWithMenuEntity>,
    private readonly menuService: MenuService,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    // 数据权限相关字段已移除（data_scope/关联部门不再维护）
    delete (createRoleDto as any).dataScope;
    delete (createRoleDto as any).deptIds;
    const res = await this.sysRoleEntityRep.save(createRoleDto);
    const entity = this.sysRoleWithMenuEntityRep.createQueryBuilder('entity');
    const values = createRoleDto.menuIds.map((id) => {
      return {
        roleId: res.roleId,
        menuId: id,
      };
    });
    entity.insert().values(values).execute();
    return ResultData.ok(res);
  }

  async findAll(query: ListRoleDto) {
    const entity = this.sysRoleEntityRep.createQueryBuilder('entity');

    if (query.roleName) {
      entity.andWhere(`entity.roleName LIKE "%${query.roleName}%"`);
    }

    if (query.roleKey) {
      entity.andWhere(`entity.roleKey LIKE "%${query.roleKey}%"`);
    }

    if (query.roleId) {
      entity.andWhere('entity.roleId = :roleId', { roleId: query.roleId });
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.createTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }
    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(roleId: number) {
    const res = await this.sysRoleEntityRep.findOne({
      where: {
        roleId: roleId,
      },
    });
    return ResultData.ok(res);
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const hasId = await this.sysRoleWithMenuEntityRep.findOne({
      where: {
        roleId: updateRoleDto.roleId,
      },
      select: ['roleId'],
    });

    //角色已关联菜单
    if (hasId) {
      await this.sysRoleWithMenuEntityRep.delete({
        roleId: updateRoleDto.roleId,
      });
    }

    //TODO 后续改造为事务
    const entity = this.sysRoleWithMenuEntityRep.createQueryBuilder('entity');
    const values = updateRoleDto.menuIds.map((id) => {
      return {
        roleId: updateRoleDto.roleId,
        menuId: id,
      };
    });

    delete (updateRoleDto as any).menuIds;
    // 移除数据权限相关字段，避免服务端仍更新 data_scope/关联部门
    delete (updateRoleDto as any).dataScope;
    delete (updateRoleDto as any).deptIds;
    entity.insert().values(values).execute();
    const res = await this.sysRoleEntityRep.update({ roleId: updateRoleDto.roleId }, updateRoleDto);
    return ResultData.ok(res);
  }

  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const res = await this.sysRoleEntityRep.update(
      { roleId: changeStatusDto.roleId },
      {
        status: changeStatusDto.status,
      },
    );
    return ResultData.ok(res);
  }

  async remove(roleIds: number[]) {
    const data = await this.sysRoleEntityRep.softDelete({ roleId: In(roleIds) });
    return ResultData.ok(data);
  }

  async findRoles(where: FindManyOptions<SysRoleEntity>) {
    return await this.sysRoleEntityRep.find(where);
  }
  /**
   * 根据角色获取用户权限列表
   */
  async getPermissionsByRoleIds(roleIds: number[]) {
    if (roleIds.includes(1)) return [{ perms: '*:*:*' }]; //当角色为超级管理员时，开放所有权限
    const list = await this.sysRoleWithMenuEntityRep.find({
      where: {
        roleId: In(roleIds),
      },
      select: ['menuId'],
    });
    const menuIds = list.map((item) => item.menuId);
    const permission = await this.menuService.findMany({
      where: { status: '0', menuId: In(menuIds) },
    });
    return permission;
  }

  /**
   * 导出角色管理数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListRoleDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const options = {
      sheetName: '角色数据',
      data: list.data.list,
      header: [
        { title: '角色编号', dataIndex: 'roleId' },
        { title: '角色名称', dataIndex: 'roleName', width: 15 },
        { title: '权限字符', dataIndex: 'roleKey' },
        { title: '显示顺序', dataIndex: 'roleSort' },
        { title: '状态', dataIndex: 'status' },
        { title: '创建时间', dataIndex: 'createTime', width: 15 },
      ],
    };
    ExportTable(options, res);
  }
}
