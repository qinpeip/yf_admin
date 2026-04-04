import { baseRequestClient, requestClient } from '#/api/request';

export interface LogininforQuery {
  pageNum?: number;
  pageSize?: number;
  ipaddr?: string;
  userName?: string;
  status?: string;
  'params[beginTime]'?: string;
  'params[endTime]'?: string;
}

export interface LogininforRow {
  infoId: number;
  ipaddr?: string;
  userName?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  msg?: string;
  status?: string;
  loginTime?: string;
}

export async function listLogininfor(query: LogininforQuery) {
  return requestClient.get<{ list: LogininforRow[]; total: number }>(
    '/monitor/logininfor/list',
    { params: query },
  );
}

export async function delLogininfor(ids: number | number[]) {
  const str = Array.isArray(ids) ? ids.join(',') : String(ids);
  return requestClient.delete(`/monitor/logininfor/${str}`);
}

export async function cleanLogininfor() {
  return requestClient.delete('/monitor/logininfor/clean');
}

export async function exportLogininfor(body: any) {
  return baseRequestClient.post('/monitor/logininfor/export', body, {
    responseType: 'blob',
  });
}

