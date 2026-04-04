import { baseRequestClient, requestClient } from '#/api/request';

export interface OperlogQuery {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  operName?: string;
  status?: string;
  businessType?: number;
  beginTime?: string;
  endTime?: string;
}

export interface OperlogRow {
  operId: number;
  title?: string;
  businessType?: number;
  requestMethod?: string;
  operName?: string;
  deptName?: string;
  operUrl?: string;
  operIp?: string;
  operLocation?: string;
  operTime?: string;
  status?: string;
  costTime?: number;
  errorMsg?: string;
  method?: string;
  operParam?: string;
  jsonResult?: string;
}

export async function listOperlog(query: OperlogQuery) {
  // 后端支持 QueryOperLogDto（含 PagingDto + BaseOperLogDto）
  return requestClient.get<{ list: OperlogRow[]; total: number }>('/monitor/operlog/list', {
    params: query,
  });
}

export async function getOperlog(operId: number) {
  return requestClient.get<OperlogRow>(`/monitor/operlog/${operId}`);
}

export async function delOperlog(operId: number) {
  return requestClient.delete(`/monitor/operlog/${operId}`);
}

export async function cleanOperlog() {
  return requestClient.delete('/monitor/operlog/clean');
}

export async function exportOperlog(body: any) {
  return baseRequestClient.post('/monitor/operlog/export', body, { responseType: 'blob' });
}

