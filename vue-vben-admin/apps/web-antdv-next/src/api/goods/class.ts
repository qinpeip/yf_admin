/**
 * 商品类目 — 由代码生成器生成（Vben / web-antdv-next）
 * 合并步骤：将本文件放到 apps/web-antdv-next/src/api/goods/
 * 并在同目录 index.ts 中增加：export * from './class';
 */
import { requestClient } from '#/api/request';

export interface ClassRow {
  classId?: number;
  tenantId?: number;
  ownerUserId?: number;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  deleteTime?: string;
  name?: string;
  parentId?: number;
  sort?: number;
  deptId?: number;
  type?: string;
  status?: string;
  description?: string;
}

export interface ListClassQuery {
  pageNum?: number;
  pageSize?: number;
  classId?: number;
  tenantId?: number;
  ownerUserId?: number;
  createBy?: string;
  createTime?: [string, string];
  updateBy?: string;
  updateTime?: [string, string];
  deleteTime?: [string, string];
  name?: string;
  parentId?: number;
  sort?: number;
  deptId?: number;
  type?: string;
  status?: string;
  description?: string;
}

export async function listClass(query: ListClassQuery) {
  return requestClient.get<{ list: ClassRow[]; total: number }>(
    '/goods/class/list',
    { params: query },
  );
}

export async function getClass(classId: number) {
  return requestClient.get<ClassRow>(`/goods/class/${classId}`);
}

export async function addClass(data: Partial<ClassRow>) {
  return requestClient.post(`/goods/class/`, data);
}

export async function updateClass(data: Partial<ClassRow> & { classId: number }) {
  return requestClient.put(`/goods/class/`, data);
}

export async function delClass(pk: number | number[]) {
  const idStr = Array.isArray(pk) ? pk.join(',') : String(pk);
  return requestClient.delete(`/goods/class/${idStr}`);
}
