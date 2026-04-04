import { requestClient } from '#/api/request';

export async function getServerInfo() {
  return requestClient.get<any>('/monitor/server');
}

