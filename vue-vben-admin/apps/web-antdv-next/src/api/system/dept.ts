import { requestClient } from '#/api/request';

export interface ListDeptQuery {
  deptName?: string;
  status?: string;
}

export interface SysDept {
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: string; // 0/1
  createTime?: string;
  children?: SysDept[];
}

export async function listDept(query?: ListDeptQuery) {
  return requestClient.get<SysDept[]>('/system/dept/list', { params: query });
}

export async function getDept(deptId: number) {
  return requestClient.get<SysDept>(`/system/dept/${deptId}`);
}

export async function addDept(data: Partial<SysDept>) {
  return requestClient.post('/system/dept', data);
}

export async function updateDept(data: Partial<SysDept> & { deptId: number }) {
  return requestClient.put('/system/dept', data);
}

export async function delDept(deptId: number) {
  return requestClient.delete(`/system/dept/${deptId}`);
}

export async function listDeptExcludeChild(deptId: number) {
  return requestClient.get<SysDept[]>(`/system/dept/list/exclude/${deptId}`);
}

