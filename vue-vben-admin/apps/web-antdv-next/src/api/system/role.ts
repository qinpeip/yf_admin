import { baseRequestClient, requestClient } from '#/api/request';

export interface ListRoleQuery {
  pageNum?: number;
  pageSize?: number;
  roleName?: string;
  roleKey?: string;
  roleId?: string;
  status?: string;
  remark?: string;
  'params[beginTime]'?: string;
  'params[endTime]'?: string;
}

export interface SysRole {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: '0' | '1';
  createTime?: string;
  remark?: string;
}

export async function listRole(query: ListRoleQuery) {
  const raw = await requestClient.get<{
    list?: SysRole[];
    rows?: SysRole[];
    total: number;
  }>('/system/role/list', { params: query });
  return {
    list: raw?.list ?? raw?.rows ?? [],
    total: raw?.total ?? 0,
  };
}

/** 角色已授权用户 */
export async function allocatedUserList(query: {
  pageNum?: number;
  pageSize?: number;
  roleId: string | number;
  userName?: string;
  phonenumber?: string;
}) {
  const raw = await requestClient.get<{
    list?: any[];
    rows?: any[];
    total: number;
  }>('/system/role/authUser/allocatedList', { params: query });
  return {
    list: raw?.list ?? raw?.rows ?? [],
    total: raw?.total ?? 0,
  };
}

/** 角色未授权用户（弹窗选择） */
export async function unallocatedUserList(query: {
  pageNum?: number;
  pageSize?: number;
  roleId: string | number;
  userName?: string;
  phonenumber?: string;
}) {
  const raw = await requestClient.get<{
    list?: any[];
    rows?: any[];
    total: number;
  }>('/system/role/authUser/unallocatedList', { params: query });
  return {
    list: raw?.list ?? raw?.rows ?? [],
    total: raw?.total ?? 0,
  };
}

export async function authUserCancel(data: { userId: number; roleId: number }) {
  return requestClient.put('/system/role/authUser/cancel', data);
}

export async function authUserCancelAll(data: { roleId: number; userIds: string }) {
  return requestClient.put('/system/role/authUser/cancelAll', data);
}

export async function authUserSelectAll(data: { roleId: number; userIds: string }) {
  return requestClient.put('/system/role/authUser/selectAll', data);
}

export async function getRole(roleId: number) {
  return requestClient.get<SysRole>(`/system/role/${roleId}`);
}

export async function addRole(data: Partial<SysRole> & { dataScope?: string; menuIds?: number[] }) {
  return requestClient.post('/system/role', {
    dataScope: '1',
    ...data,
  });
}

export async function updateRole(data: Partial<SysRole> & { roleId: number; dataScope?: string; menuIds?: number[] }) {
  return requestClient.put('/system/role', {
    dataScope: '1',
    ...data,
  });
}

export async function delRole(roleIds: number | number[]) {
  const ids = Array.isArray(roleIds) ? roleIds.join(',') : String(roleIds);
  return requestClient.delete(`/system/role/${ids}`);
}

export async function changeRoleStatus(roleId: number, status: '0' | '1') {
  return requestClient.put('/system/role/changeStatus', { roleId, status });
}

export async function getRoleDataScope(roleId: number) {
  return requestClient.get<{ dataScope: string; deptIds: number[] }>(
    `/system/role/dataScope/${roleId}`,
  );
}

export async function updateRoleDataScope(data: { roleId: number; dataScope: string; deptIds?: number[] }) {
  return requestClient.put('/system/role/dataScope', data);
}

// 角色导出是文件流，先提供底层接口（页面迁移时再接）
export async function exportRole(body: any) {
  return baseRequestClient.post('/system/role/export', body, {
    responseType: 'blob',
  });
}

