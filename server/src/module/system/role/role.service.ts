import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindManyOptions } from 'typeorm';
import { Response } from 'express';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';

import { SysRoleEntity } from './entities/role.entity';
import { SysRoleWithMenuEntity } from './entities/role-width-menu.entity';
import { SysRoleWithDeptEntity } from './entities/role-width-dept.entity';
import { MenuService } from '../menu/menu.service';
import { CreateRoleDto, UpdateRoleDto, ListRoleDto, ChangeStatusDto } from './dto/index';
import { UserType } from '../user/dto/user';
import { SysDeptEntity } from '../dept/entities/dept.entity';
import { DataScopeEnum } from 'src/common/enum/index';
import { UpdateRoleDataScopeDto } from './dto/index';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(SysRoleEntity)
    private readonly sysRoleEntityRep: Repository<SysRoleEntity>,
    @InjectRepository(SysRoleWithMenuEntity)
    private readonly sysRoleWithMenuEntityRep: Repository<SysRoleWithMenuEntity>,
    @InjectRepository(SysRoleWithDeptEntity)
    private readonly sysRoleWithDeptEntityRep: Repository<SysRoleWithDeptEntity>,
    private readonly menuService: MenuService,
    private readonly dataPermissionService: DataPermissionService,
    @InjectRepository(SysDeptEntity)
    private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
  ) {}
  async create(createRoleDto: CreateRoleDto, currentUser: UserType['user']) {
    // 数据权限相关字段已移除（data_scope/关联部门不再维护）
    delete (createRoleDto as any).dataScope;
    delete (createRoleDto as any).deptIds;
    // 强制写入租户/部门/owner，避免跨租户越权
    (createRoleDto as any).tenantId = currentUser.tenantId;
    (createRoleDto as any).deptId = currentUser.deptId;
    (createRoleDto as any).ownerUserId = currentUser.userId;
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

  async findAll(query: ListRoleDto, currentUser: UserType['user']) {
    const entity = this.sysRoleEntityRep.createQueryBuilder('entity');

    // 多租户 + 数据范围过滤
    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', currentUser as any);

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

    if (query.remark) {
      entity.andWhere('entity.remark LIKE :remark', { remark: `%${query.remark}%` });
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

  async findOne(roleId: number, currentUser: UserType['user']) {
    const qb = this.sysRoleEntityRep.createQueryBuilder('entity').where('entity.roleId = :roleId', { roleId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const res = await qb.getOne();
    if (!res) return ResultData.fail(403, '无权限访问该数据');
    return ResultData.ok(res);
  }

  async update(updateRoleDto: UpdateRoleDto, currentUser: UserType['user']) {
    const qb = this.sysRoleEntityRep.createQueryBuilder('entity').where('entity.roleId = :roleId', { roleId: updateRoleDto.roleId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const found = await qb.getOne();
    if (!found) return ResultData.fail(403, '无权限修改该数据');

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

  async changeStatus(changeStatusDto: ChangeStatusDto, currentUser: UserType['user']) {
    const qb = this.sysRoleEntityRep.createQueryBuilder('entity').where('entity.roleId = :roleId', { roleId: changeStatusDto.roleId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const found = await qb.getOne();
    if (!found) return ResultData.fail(403, '无权限修改该数据');

    const res = await this.sysRoleEntityRep.update({ roleId: changeStatusDto.roleId }, { status: changeStatusDto.status });
    return ResultData.ok(res);
  }

  async remove(roleIds: number[], currentUser: UserType['user']) {
    if (!roleIds?.length) return ResultData.ok();

    const qb = this.sysRoleEntityRep
      .createQueryBuilder('entity')
      .select('entity.roleId', 'roleId')
      .where('entity.roleId IN (:...ids)', { ids: roleIds });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const rows = await qb.getRawMany<{ roleId: string }>();
    const allowedIds = rows.map((r) => +r.roleId);

    if (allowedIds.length !== roleIds.length) {
      return ResultData.fail(403, '无权限删除部分数据');
    }

    const data = await this.sysRoleEntityRep.softDelete({ roleId: In(allowedIds) });
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
  async export(res: Response, body: ListRoleDto, currentUser: UserType['user']) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body, currentUser);
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

  async getRoleDataScope(roleId: number, currentUser: UserType['user']) {
    if (roleId === 1) {
      // 超管保持默认配置，不对外开放配置字段
      return ResultData.ok({ dataScope: DataScopeEnum.DATA_SCOPE_ALL, deptIds: [] });
    }

    const qb = this.sysRoleEntityRep.createQueryBuilder('entity').where('entity.roleId = :roleId', { roleId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const role = await qb.getOne();

    if (!role) {
      return ResultData.fail(403, '无权限访问该角色数据范围');
    }

    const dataScope = role.dataScope || DataScopeEnum.DATA_SCOPE_ALL;
    let deptIds: number[] = [];
    if (dataScope === DataScopeEnum.DATA_SCOPE_CUSTOM) {
      const rows = await this.sysRoleWithDeptEntityRep.find({
        where: {
          roleId,
          tenantId: role.tenantId,
        },
        select: ['deptId'],
      });
      deptIds = rows.map((x) => x.deptId);
    }

    return ResultData.ok({ dataScope, deptIds });
  }

  async updateRoleDataScope(body: UpdateRoleDataScopeDto, currentUser: UserType['user']) {
    const { roleId } = body;
    if (roleId === 1) {
      return ResultData.fail(403, '超管不可配置数据权限');
    }

    const qb = this.sysRoleEntityRep.createQueryBuilder('entity').where('entity.roleId = :roleId', { roleId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const role = await qb.getOne();
    if (!role) {
      return ResultData.fail(403, '无权限修改该角色数据范围');
    }

    const dataScope = body.dataScope;
    const allowedScopes: string[] = [
      DataScopeEnum.DATA_SCOPE_ALL,
      DataScopeEnum.DATA_SCOPE_CUSTOM,
      DataScopeEnum.DATA_SCOPE_DEPT,
      DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD,
      DataScopeEnum.DATA_SCOPE_SELF,
    ];
    if (!allowedScopes.includes(dataScope)) {
      return ResultData.fail(400, 'dataScope 参数非法');
    }

    const tenantId = role.tenantId;
    const uniqueDeptIds = Array.from(new Set((body.deptIds || []).map((x) => +x))).filter((x) => !Number.isNaN(x));

    // 先更新 data_scope，再同步 sys_role_dept（custom 时才写入）
    await this.sysRoleEntityRep.update({ roleId }, { dataScope });

    await this.sysRoleWithDeptEntityRep.delete({ roleId, tenantId });

    if (dataScope === DataScopeEnum.DATA_SCOPE_CUSTOM) {
      if (!uniqueDeptIds.length) {
        return ResultData.fail(400, '自定义数据权限必须选择部门');
      }

      const validDepts = await this.sysDeptEntityRep.find({
        where: {
          tenantId,
          deptId: In(uniqueDeptIds),
        },
        select: ['deptId'],
      });
      const validDeptIds = validDepts.map((d) => d.deptId);
      if (validDeptIds.length !== uniqueDeptIds.length) {
        return ResultData.fail(400, '选择的部门不属于当前租户');
      }

      const values = validDeptIds.map((deptId) => ({
        roleId,
        deptId,
        tenantId,
        ownerUserId: currentUser.userId,
      }));
      await this.sysRoleWithDeptEntityRep.insert(values);
    }

    return ResultData.ok();
  }
}
