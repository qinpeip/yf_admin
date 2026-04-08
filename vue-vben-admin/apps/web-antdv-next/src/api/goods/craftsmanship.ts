/**
 * 工艺 — 由代码生成器生成（Vben / web-antdv-next）
 * 合并步骤：将本文件放到 apps/web-antdv-next/src/api/goods/
 * 并在同目录 index.ts 中增加：export * from './craftsmanship';
 */
import { requestClient } from '#/api/request';

export interface CraftsmanshipRow {
  craftsmanshipId?: number;
  tenantId?: number;
  ownerUserId?: number;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  deleteTime?: string;
  name?: string;
  sort?: number;
  description?: string;
}

export interface ListCraftsmanshipQuery {
  pageNum?: number;
  pageSize?: number;
  craftsmanshipId?: number;
  tenantId?: number;
  ownerUserId?: number;
  createBy?: string;
  createTime?: [string, string];
  updateBy?: string;
  updateTime?: [string, string];
  deleteTime?: [string, string];
  name?: string;
  sort?: number;
  description?: string;
}

export async function listCraftsmanship(query: ListCraftsmanshipQuery) {
  return requestClient.get<{ list: CraftsmanshipRow[]; total: number }>(
    '/goods/craftsmanship/list',
    { params: query },
  );
}

export async function getCraftsmanship(craftsmanshipId: number) {
  return requestClient.get<CraftsmanshipRow>(`/goods/craftsmanship/${craftsmanshipId}`);
}

export async function addCraftsmanship(data: Partial<CraftsmanshipRow>) {
  return requestClient.post(`/goods/craftsmanship/`, data);
}

export async function updateCraftsmanship(data: Partial<CraftsmanshipRow> & { craftsmanshipId: number }) {
  return requestClient.put(`/goods/craftsmanship/`, data);
}

export async function delCraftsmanship(pk: number | number[]) {
  const idStr = Array.isArray(pk) ? pk.join(',') : String(pk);
  return requestClient.delete(`/goods/craftsmanship/${idStr}`);
}
