import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { DataScopeEnum } from 'src/common/enum/index';
import { SysDeptEntity } from 'src/module/system/dept/entities/dept.entity';
import { SysRoleEntity } from 'src/module/system/role/entities/role.entity';
import { SysRoleWithDeptEntity } from 'src/module/system/role/entities/role-width-dept.entity';
import { UserEntity } from 'src/module/system/user/entities/sys-user.entity';

export type DataPermissionContext = UserEntity & {
  roles: Array<SysRoleEntity>;
};

/**
 * 计算并注入“多租户 + 数据范围”过滤条件。
 *
 * 说明：
 * - 非超级管理员：强制加 tenant_id 限制
 * - dataScope 五种规则：ALL/CUSTOM/DEPT/DEPT_AND_CHILD/SELF
 * - 多角色合并：允许条件使用 OR；dataScope=ALL 会放开部门/owner 限制
 */
@Injectable()
export class DataPermissionService {
  constructor(
    @InjectRepository(SysDeptEntity)
    private readonly deptRepo: Repository<SysDeptEntity>,
    @InjectRepository(SysRoleWithDeptEntity)
    private readonly roleWithDeptRepo: Repository<SysRoleWithDeptEntity>,
  ) {}

  private isSuperAdmin(roles: Array<SysRoleEntity>): boolean {
    return roles.some((r) => r.roleId === 1);
  }

  private async getChildDeptIds(tenantId: number, deptId: number): Promise<number[]> {
    // 使用 ancestors 字段做“包含祖先路径”的匹配（同原项目逻辑）
    const rows = await this.deptRepo
      .createQueryBuilder('dept')
      .select('dept.deptId', 'deptId')
      .where('dept.tenantId = :tenantId', { tenantId })
      .andWhere('(dept.ancestors LIKE :ancestors OR dept.deptId = :deptId)', {
        ancestors: `%${deptId}%`,
        deptId,
      })
      .getRawMany<{ deptId: string }>();

    return rows.map((r) => Number(r.deptId)).filter((n) => Number.isFinite(n));
  }

  private uniq(nums: number[]) {
    return Array.from(new Set(nums));
  }

  private toFiniteNumber(value: unknown): number | null {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : null;
  }

  /**
   * 生成 scope SQL（不负责 add tenant 过滤）
   */
  private async buildScopeCondition(alias: string, user: UserEntity, roles: Array<SysRoleEntity>) {
    const tenantId = this.toFiniteNumber(user.tenantId) ?? 0;
    const userId = this.toFiniteNumber(user.userId) ?? 0;
    const userDeptId = this.toFiniteNumber(user.deptId);

    // 超级管理员：放开部门/owner 数据范围
    if (this.isSuperAdmin(roles)) {
      return { scopeSql: '1=1', scopeParams: {} as Record<string, any>, skipScope: true };
    }

    let allowAll = false;
    let allowSelf = false;
    const allowedDeptIds: number[] = [];

    for (const role of roles) {
      const scope = role.dataScope;
      switch (scope) {
        case DataScopeEnum.DATA_SCOPE_ALL:
          allowAll = true;
          break;
        case DataScopeEnum.DATA_SCOPE_SELF:
          allowSelf = true;
          break;
        case DataScopeEnum.DATA_SCOPE_DEPT:
          if (userDeptId != null) allowedDeptIds.push(userDeptId);
          break;
        case DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD:
          if (userDeptId != null) {
            const childIds = await this.getChildDeptIds(tenantId, userDeptId);
            allowedDeptIds.push(...childIds);
          }
          break;
        case DataScopeEnum.DATA_SCOPE_CUSTOM: {
          // 自定义数据权限来自 sys_role_dept（含 tenant 维度）
          const list = await this.roleWithDeptRepo.find({
            where: {
              roleId: role.roleId,
              tenantId: tenantId,
            },
            select: ['deptId'],
          });
          allowedDeptIds.push(...list.map((x) => this.toFiniteNumber(x.deptId)).filter((n): n is number => n != null));
          break;
        }
        default:
          break;
      }

      if (allowAll) break;
    }

    if (allowAll) {
      return { scopeSql: '1=1', scopeParams: {} as Record<string, any>, skipScope: true };
    }

    const deptIds = this.uniq(allowedDeptIds)
      .map((id) => this.toFiniteNumber(id))
      .filter((n): n is number => n != null);

    if (deptIds.length > 0 && allowSelf) {
      return {
        scopeSql: `(${alias}.deptId IN (:...deptIds) OR ${alias}.ownerUserId = :ownerUserId)`,
        scopeParams: { deptIds, ownerUserId: userId },
        skipScope: false,
      };
    }

    if (deptIds.length > 0) {
      return {
        scopeSql: `${alias}.deptId IN (:...deptIds)`,
        scopeParams: { deptIds },
        skipScope: false,
      };
    }

    if (allowSelf) {
      return {
        scopeSql: `${alias}.ownerUserId = :ownerUserId`,
        scopeParams: { ownerUserId: userId },
        skipScope: false,
      };
    }

    // 没有任何允许条件 => 禁止访问
    return { scopeSql: '1=0', scopeParams: {}, skipScope: false };
  }

  /**
   * 给 queryBuilder 注入 tenant + scope
   *
   * @param qbTypeormQueryBuilder 任意含 andWhere 的 queryBuilder
   * @param alias 表别名（如 'entity'）
   * @param user 当前用户（包含 tenantId/deptId/userId 以及 roles）
   */
  async applyTenantAndScope(qb: any, alias: string, user: DataPermissionContext): Promise<void> {
    const roles = user.roles || [];

    // 超级管理员：不限制 tenant + scope
    if (this.isSuperAdmin(roles)) {
      return;
    }

    const tenantId = this.toFiniteNumber(user.tenantId);
    if (tenantId != null) {
      qb.andWhere(`${alias}.tenantId = :tenantId`, { tenantId });
    }

    const { scopeSql, scopeParams } = await this.buildScopeCondition(alias, user, roles);
    qb.andWhere(scopeSql, scopeParams);
  }
}
