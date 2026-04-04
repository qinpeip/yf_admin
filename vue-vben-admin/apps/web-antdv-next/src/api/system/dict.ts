import { baseRequestClient, requestClient } from '#/api/request';

export interface ListDictTypeQuery {
  pageNum?: number;
  pageSize?: number;
  dictName?: string;
  dictType?: string;
  status?: string;
}

export interface DictType {
  dictId: number;
  dictName: string;
  dictType: string;
  status?: string;
  remark?: string;
  createTime?: string;
}

export interface ListDictDataQuery {
  pageNum?: number;
  pageSize?: number;
  dictType?: string;
  status?: string;
}

export interface DictData {
  dictCode: number;
  dictLabel: string;
  dictValue: string;
  dictSort: number;
  status?: string;
  remark?: string;
  listClass?: string;
  cssClass?: string;
  createTime?: string;
}

// type
export async function listDictType(query: ListDictTypeQuery) {
  return requestClient.get<{ list: DictType[]; total: number }>('/system/dict/type/list', {
    params: query,
  });
}

export async function getDictType(dictId: number) {
  return requestClient.get<DictType>(`/system/dict/type/${dictId}`);
}

export async function addDictType(data: any) {
  return requestClient.post('/system/dict/type', data);
}

export async function updateDictType(data: any) {
  return requestClient.put('/system/dict/type', data);
}

export async function delDictType(dictIds: number | number[]) {
  const ids = Array.isArray(dictIds) ? dictIds.join(',') : String(dictIds);
  return requestClient.delete(`/system/dict/type/${ids}`);
}

export async function refreshDictCache() {
  return requestClient.delete('/system/dict/type/refreshCache');
}

export async function exportDictType(body: any) {
  return baseRequestClient.post('/system/dict/type/export', body, { responseType: 'blob' });
}

// data
export async function listDictData(query: ListDictDataQuery) {
  return requestClient.get<{ list: DictData[]; total: number }>('/system/dict/data/list', {
    params: query,
  });
}

export async function getDictData(dictCode: number) {
  return requestClient.get<DictData>(`/system/dict/data/${dictCode}`);
}

export async function addDictData(data: any) {
  return requestClient.post('/system/dict/data', data);
}

export async function updateDictData(data: any) {
  return requestClient.put('/system/dict/data', data);
}

export async function delDictData(dictCodes: number | number[]) {
  const ids = Array.isArray(dictCodes) ? dictCodes.join(',') : String(dictCodes);
  return requestClient.delete(`/system/dict/data/${ids}`);
}

export async function exportDictData(body: any) {
  return baseRequestClient.post('/system/dict/data/export', body, { responseType: 'blob' });
}

/** 若依 `GET /system/dict/data/type/:dictType`（走缓存） */
export async function listDictDataByType(dictType: string) {
  return requestClient.get<DictData[]>(
    `/system/dict/data/type/${encodeURIComponent(dictType)}`,
  );
}

/** 代码生成等：`/system/dict/type/optionselect` */
export async function optionselectDictType() {
  return requestClient.get<any[]>('/system/dict/type/optionselect');
}
