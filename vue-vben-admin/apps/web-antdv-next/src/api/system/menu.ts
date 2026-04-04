import { requestClient } from '#/api/request';

export interface ListMenuQuery {
  menuName?: string;
  status?: string;
}

export interface SysMenu {
  menuId: number;
  parentId: number;
  menuName: string;
  orderNum?: number;
  path?: string;
  component?: string;
  query?: string;
  icon?: string;
  menuType?: string; // M/C/F
  perms?: string;
  status?: string; // 0/1
  visible?: string;
  isFrame?: string;
  isCache?: string;
  createTime?: string;
  children?: SysMenu[];
}

export async function listMenu(query?: ListMenuQuery) {
  return requestClient.get<SysMenu[]>('/system/menu/list', { params: query });
}

export async function getMenu(menuId: number) {
  return requestClient.get<SysMenu>(`/system/menu/${menuId}`);
}

export async function addMenu(data: Partial<SysMenu>) {
  return requestClient.post('/system/menu', data);
}

export async function updateMenu(data: Partial<SysMenu> & { menuId: number }) {
  return requestClient.put('/system/menu', data);
}

export async function delMenu(menuId: number) {
  return requestClient.delete(`/system/menu/${menuId}`);
}

export async function menuTreeSelect() {
  return requestClient.get<any>('/system/menu/treeselect');
}

export async function roleMenuTreeselect(roleId: number) {
  return requestClient.get<{ menus: any[]; checkedKeys: number[] }>(
    `/system/menu/roleMenuTreeselect/${roleId}`,
  );
}

