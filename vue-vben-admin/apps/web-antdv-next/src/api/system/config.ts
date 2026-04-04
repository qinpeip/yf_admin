import { baseRequestClient, requestClient } from '#/api/request';

export interface ListConfigQuery {
  pageNum?: number;
  pageSize?: number;
  configName?: string;
  configKey?: string;
  configType?: string;
}

export interface SysConfig {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType?: string;
  remark?: string;
  createTime?: string;
}

export async function listConfig(query: ListConfigQuery) {
  return requestClient.get<{ list: SysConfig[]; total: number }>('/system/config/list', {
    params: query,
  });
}

export async function getConfig(configId: number) {
  return requestClient.get<SysConfig>(`/system/config/${configId}`);
}

export async function addConfig(data: any) {
  return requestClient.post('/system/config', data);
}

export async function updateConfig(data: any) {
  return requestClient.put('/system/config', data);
}

export async function delConfig(configIds: number | number[]) {
  const ids = Array.isArray(configIds) ? configIds.join(',') : String(configIds);
  return requestClient.delete(`/system/config/${ids}`);
}

export async function refreshConfigCache() {
  return requestClient.delete('/system/config/refreshCache');
}

export async function exportConfig(body: any) {
  return baseRequestClient.post('/system/config/export', body, { responseType: 'blob' });
}

