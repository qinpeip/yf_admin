import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { SysMenuEntity } from './entities/menu.entity';
import { SysRoleWithMenuEntity } from '../role/entities/role-width-menu.entity';
import { CreateMenuDto, UpdateMenuDto, ListDeptDto } from './dto/index';
import { ListToTree, Uniq } from 'src/common/utils/index';
import { UserService } from '../user/user.service';
import { buildMenus } from './utils';
import { DataPermissionService } from 'src/common/services/data-permission/data-permission.service';
import { UserType } from '../user/dto/user';
@Injectable()
export class MenuService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectRepository(SysMenuEntity)
    private readonly sysMenuEntityRep: Repository<SysMenuEntity>,
    @InjectRepository(SysRoleWithMenuEntity)
    private readonly sysRoleWithMenuEntityRep: Repository<SysRoleWithMenuEntity>,
    private readonly dataPermissionService: DataPermissionService,
  ) {}

  async create(createMenuDto: CreateMenuDto, currentUser: UserType['user']) {
    (createMenuDto as any).tenantId = currentUser.tenantId;
    (createMenuDto as any).deptId = currentUser.deptId;
    (createMenuDto as any).ownerUserId = currentUser.userId;
    const res = await this.sysMenuEntityRep.save(createMenuDto);
    return ResultData.ok(res);
  }

  async findAll(query: ListDeptDto, currentUser: UserType['user']) {
    const entity = this.sysMenuEntityRep.createQueryBuilder('entity');

    await this.dataPermissionService.applyTenantAndScope(entity, 'entity', currentUser as any);

    if (query.menuName) {
      entity.andWhere(`entity.menuName LIKE "%${query.menuName}%"`);
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }
    entity.orderBy('entity.orderNum', 'ASC');

    const res = await entity.getMany();
    return ResultData.ok(res);
  }

  async treeSelect() {
    const res = await this.sysMenuEntityRep.find({
      order: {
        orderNum: 'ASC',
      },
    });
    const tree = ListToTree(
      res,
      (m) => m.menuId,
      (m) => m.menuName,
    );
    return ResultData.ok(tree);
  }

  async roleMenuTreeselect(roleId: number): Promise<any> {
    const res = await this.sysMenuEntityRep.find({
      order: {
        orderNum: 'ASC',
        parentId: 'ASC',
      },
    });
    const tree = ListToTree(
      res,
      (m) => m.menuId,
      (m) => m.menuName,
    );
    const menuIds = await this.sysRoleWithMenuEntityRep.find({
      where: { roleId: roleId },
      select: ['menuId'],
    });
    const checkedKeys = menuIds.map((item) => {
      return item.menuId;
    });
    return ResultData.ok({
      menus: tree,
      checkedKeys: checkedKeys,
    });
  }

  async findOne(menuId: number, currentUser: UserType['user']) {
    const qb = this.sysMenuEntityRep.createQueryBuilder('entity').where('entity.menuId = :menuId', { menuId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const res = await qb.getOne();
    if (!res) return ResultData.fail(403, '无权限访问该数据');
    return ResultData.ok(res);
  }

  async update(updateMenuDto: UpdateMenuDto, currentUser: UserType['user']) {
    const qb = this.sysMenuEntityRep.createQueryBuilder('entity').where('entity.menuId = :menuId', { menuId: updateMenuDto.menuId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const found = await qb.getOne();
    if (!found) return ResultData.fail(403, '无权限修改该数据');

    await this.sysMenuEntityRep.update({ menuId: updateMenuDto.menuId }, updateMenuDto);
    return ResultData.ok();
  }

  async remove(menuId: number, currentUser: UserType['user']) {
    const qb = this.sysMenuEntityRep.createQueryBuilder('entity').select('entity.menuId', 'menuId').where('entity.menuId = :menuId', { menuId });
    await this.dataPermissionService.applyTenantAndScope(qb, 'entity', currentUser as any);
    const rows = await qb.getRawMany<{ menuId: string }>();
    if (rows.length !== 1) return ResultData.fail(403, '无权限删除该数据');
    const data = await this.sysMenuEntityRep.softDelete({ menuId: rows[0].menuId as any });
    return ResultData.ok(data);
  }

  async findMany(where: FindManyOptions<SysMenuEntity>) {
    return await this.sysMenuEntityRep.find(where);
  }

  /**
   * 根据用户ID查询菜单
   *
   * @param userId 用户ID
   * @return 菜单列表
   */
  async getMenuListByUserId(userId: number) {
    const roleIds = await this.userService.getRoleIds([userId]);
    const allMenuList = await this.sysMenuEntityRep.find({
      where: {
        status: '0',
      },
      order: {
        orderNum: 'ASC',
      },
    });
    const menuById = new Map(allMenuList.map((m) => [m.menuId, m]));

    let visibleMenuIds: Set<number>;
    if (roleIds.includes(1)) {
      visibleMenuIds = new Set(allMenuList.map((m) => m.menuId));
    } else {
      const menuWidthRoleList = await this.sysRoleWithMenuEntityRep.find({
        where: { roleId: In(roleIds) },
        select: ['menuId'],
      });
      const assignedMenuIds = Uniq(menuWidthRoleList.map((item) => item.menuId));
      visibleMenuIds = new Set<number>();
      for (const menuId of assignedMenuIds) {
        const start = menuById.get(menuId);
        if (!start) {
          continue;
        }
        visibleMenuIds.add(menuId);
        let current: SysMenuEntity | undefined = start;
        while (current && current.parentId !== 0) {
          const parentId = current.parentId;
          if (!menuById.has(parentId)) {
            break;
          }
          visibleMenuIds.add(parentId);
          current = menuById.get(parentId);
        }
      }
    }

    const menuList = allMenuList.filter((m) => visibleMenuIds.has(m.menuId));
    return buildMenus(menuList);
  }
}
