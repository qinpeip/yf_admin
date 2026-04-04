import { requestClient } from '#/api/request';

export interface OnlineQuery {
  pageNum?: number;
  pageSize?: number;
  userName?: string;
  ipaddr?: string;
}

export interface OnlineRow {
  tokenId: string;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  loginTime?: string;
}

export async function listOnline(query: OnlineQuery) {
  return requestClient.get<{ list: OnlineRow[]; total: number }>('/monitor/online/list', {
    params: query,
  });
}

export async function forceLogout(token: string) {
  return requestClient.delete(`/monitor/online/${encodeURIComponent(token)}`);
}

