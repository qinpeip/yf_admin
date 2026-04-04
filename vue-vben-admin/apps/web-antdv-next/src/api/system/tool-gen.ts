import { baseRequestClient, requestClient } from '#/api/request';

export async function listGenTable(query: {
  pageNum?: number;
  pageSize?: number;
  tableNames?: string;
  tableComment?: string;
}) {
  return requestClient.get<{ list: any[]; total: number }>('/tool/gen/list', { params: query });
}

export async function listGenDbTable(query: {
  pageNum?: number;
  pageSize?: number;
  tableName?: string;
  tableComment?: string;
}) {
  return requestClient.get<{ list: any[]; total: number }>('/tool/gen/db/list', { params: query });
}

export async function importGenTable(tableNames: string) {
  return requestClient.post('/tool/gen/importTable', { tableNames });
}

export async function synchGenTable(tableName: string) {
  return requestClient.get(`/tool/gen/synchDb/${encodeURIComponent(tableName)}`);
}

export async function getGenTable(tableId: number) {
  return requestClient.get<any>(`/tool/gen/${tableId}`);
}

export async function updateGenTable(data: Record<string, any>) {
  return requestClient.put('/tool/gen', data);
}

export async function removeGenTable(tableId: number) {
  return requestClient.delete(`/tool/gen/${tableId}`);
}

export async function previewGenCode(tableId: number) {
  return requestClient.get<Record<string, string>>(`/tool/gen/preview/${tableId}`);
}

/** Vben RequestClient.request 返回的是 AxiosResponse，二进制在 data 上 */
export async function batchGenCodeZip(tableNames: string): Promise<Blob> {
  const { data } = await baseRequestClient.instance.get<Blob>(
    '/tool/gen/batchGenCode/zip',
    {
      params: { tableNames },
      responseType: 'blob',
    },
  );
  return data;
}
