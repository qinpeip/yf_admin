/**
 * 商品分类 — 由代码生成器生成（Vben / web-antdv-next）
 * 合并步骤：将本文件放到 apps/web-antdv-next/src/api/goods/
 * 并在同目录 index.ts 中增加：export * from './category';
 */
import { requestClient } from '#/api/request';

export interface CategoryRow {
  categoryId?: number;
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
  icon?: string;
  description?: string;
  status?: string;
}

export interface ListCategoryQuery {
  pageNum?: number;
  pageSize?: number;
  categoryId?: number;
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
  icon?: string;
  description?: string;
  status?: string;
}

export async function listCategory(query: ListCategoryQuery) {
  return requestClient.get<{ list: CategoryRow[]; total: number }>('/goods/category/list', {
    params: query,
  });
}

export async function getCategory(categoryId: number) {
  return requestClient.get<CategoryRow>(`/goods/category/${categoryId}`);
}

export async function addCategory(data: Partial<CategoryRow>) {
  return requestClient.post(`/goods/category/`, data);
}

export async function updateCategory(data: Partial<CategoryRow> & { categoryId: number }) {
  return requestClient.put(`/goods/category/`, data);
}

export async function delCategory(pk: number | number[]) {
  const idStr = Array.isArray(pk) ? pk.join(',') : String(pk);
  return requestClient.delete(`/goods/category/${idStr}`);
}

export async function listCategoryTree() {
  return requestClient.get('/goods/category/tree');
}
