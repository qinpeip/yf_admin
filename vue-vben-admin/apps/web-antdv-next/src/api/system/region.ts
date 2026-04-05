/**
 * 地区表 — 由代码生成器生成（Vben / web-antdv-next）
 * 合并步骤：将本文件放到 apps/web-antdv-next/src/api/system/
 * 并在同目录 index.ts 中增加：export * from './region';
 */
import { requestClient } from '#/api/request';

export interface RegionRow {
  id?: number;
  tenantId?: number;
  ownerUserId?: number;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  deleteTime?: string;
  pid?: number;
  shortname?: string;
  name?: string;
  mergerName?: string;
  level?: number;
  pinyin?: string;
  code?: string;
  zipCode?: string;
  first?: string;
  lng?: string;
  lat?: string;
  sort?: number;
}

export interface ListRegionQuery {
  pageNum?: number;
  pageSize?: number;
  id?: number;
  tenantId?: number;
  ownerUserId?: number;
  createBy?: string;
  createTime?: [string, string];
  updateBy?: string;
  updateTime?: [string, string];
  deleteTime?: [string, string];
  pid?: number;
  shortname?: string;
  name?: string;
  mergerName?: string;
  level?: string;
  pinyin?: string;
  code?: string;
  zipCode?: string;
  first?: string;
  lng?: string;
  lat?: string;
  sort?: number;
}

export async function listRegion(query: ListRegionQuery) {
  return requestClient.get<{ list: RegionRow[]; total: number }>(
    '/system/region/list',
    { params: query },
  );
}

export async function getRegion(id: number) {
  return requestClient.get<RegionRow>(`/system/region/${id}`);
}

export async function addRegion(data: Partial<RegionRow>) {
  return requestClient.post(`/system/region/`, data);
}

export async function updateRegion(data: Partial<RegionRow> & { id: number }) {
  return requestClient.put(`/system/region/`, data);
}

export async function delRegion(pk: number | number[]) {
  const idStr = Array.isArray(pk) ? pk.join(',') : String(pk);
  return requestClient.delete(`/system/region/${idStr}`);
}

export async function  getProvinceList() {
  return requestClient.get<{id: number, name: string}[]>(`/system/region/province-list`);
}

export async function getCityList() {
  return requestClient.get<{id: number, name: string, pid: number}[]>(`/system/region/city-list`);
}