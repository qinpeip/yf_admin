import { requestClient } from '#/api/request';

export interface ListNoticeQuery {
  pageNum?: number;
  pageSize?: number;
  noticeTitle?: string;
  noticeType?: string;
  status?: string;
}

export interface SysNotice {
  noticeId: number;
  noticeTitle: string;
  noticeType?: string;
  noticeContent?: string;
  status?: string;
  createBy?: string;
  createTime?: string;
}

export async function listNotice(query: ListNoticeQuery) {
  return requestClient.get<{ list: SysNotice[]; total: number }>('/system/notice/list', {
    params: query,
  });
}

export async function getNotice(noticeId: number) {
  return requestClient.get<SysNotice>(`/system/notice/${noticeId}`);
}

export async function addNotice(data: any) {
  return requestClient.post('/system/notice', data);
}

export async function updateNotice(data: any) {
  return requestClient.put('/system/notice', data);
}

export async function delNotice(noticeIds: number | number[]) {
  const ids = Array.isArray(noticeIds) ? noticeIds.join(',') : String(noticeIds);
  return requestClient.delete(`/system/notice/${ids}`);
}

