import { requestClient } from '#/api/request';

export interface DeptTreeNode {
  id: number;
  label: string;
  children?: DeptTreeNode[];
}

export async function deptTree() {
  return requestClient.get<DeptTreeNode[]>('/system/user/deptTree');
}

export interface ListUserQuery {
  pageNum?: number;
  pageSize?: number;
  deptId?: string | number;
  userName?: string;
  phonenumber?: string;
  status?: string;
  beginTime?: string;
  endTime?: string;
}

export interface SysUser {
  userId: number;
  userName: string;
  nickName: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
  status: '0' | '1';
  createTime?: string;
  deptId?: number;
  dept?: { deptId: number; deptName: string } | null;
}

export async function listUser(query: ListUserQuery) {
  const raw = await requestClient.get<{
    list?: SysUser[];
    rows?: SysUser[];
    total: number;
  }>('/system/user/list', { params: query });
  return {
    list: raw?.list ?? raw?.rows ?? [],
    total: raw?.total ?? 0,
  };
}

export async function getUser(userId: number) {
  return requestClient.get<any>(`/system/user/${userId}`);
}

export async function addUser(data: any) {
  return requestClient.post('/system/user', data);
}

export async function updateUser(data: any) {
  return requestClient.put('/system/user', data);
}

export async function delUser(userIds: number | number[]) {
  const ids = Array.isArray(userIds) ? userIds.join(',') : String(userIds);
  return requestClient.delete(`/system/user/${ids}`);
}

export async function changeUserStatus(userId: number, status: '0' | '1') {
  return requestClient.put('/system/user/changeStatus', { userId, status });
}

export async function getUserOptions() {
  // posts + roles
  return requestClient.get<{ posts: any[]; roles: any[] }>('/system/user');
}

export async function resetUserPwd(userId: number, password: string) {
  return requestClient.put('/system/user/resetPwd', { userId, password });
}

export async function getUserAuthRole(userId: number) {
  return requestClient.get<any>(`/system/user/authRole/${userId}`);
}

export async function updateUserAuthRole(userId: number, roleIds: number[]) {
  // 后端用 query：与 admin-vue3 一致；勿传 null 作 body，否则会变成 JSON `null` 触发解析问题
  return requestClient.put(
    '/system/user/authRole',
    {},
    {
      params: { userId, roleIds: roleIds.join(',') },
    },
  );
}

/** 个人中心（与 admin-vue3 / 若依一致） */
export async function getUserProfile() {
  return requestClient.get<any>('/system/user/profile');
}

export async function updateUserProfile(data: Record<string, any>) {
  return requestClient.put('/system/user/profile', data);
}

export async function updateProfilePwd(oldPassword: string, newPassword: string) {
  return requestClient.put('/system/user/profile/updatePwd', { oldPassword, newPassword });
}

export async function uploadProfileAvatar(file: File | Blob) {
  const fd = new FormData();
  fd.append('avatarfile', file);
  return requestClient.post<{ imgUrl: string }>('/system/user/profile/avatar', fd);
}

