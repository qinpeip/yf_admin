import { baseRequestClient, requestClient } from '#/api/request';

export interface ListPostQuery {
  pageNum?: number;
  pageSize?: number;
  postCode?: string;
  postName?: string;
  status?: string;
}

export interface SysPost {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: '0' | '1';
  remark?: string;
  createTime?: string;
}

export async function listPost(query: ListPostQuery) {
  return requestClient.get<{ list: SysPost[]; total: number }>('/system/post/list', {
    params: query,
  });
}

export async function getPost(postId: number) {
  return requestClient.get<SysPost>(`/system/post/${postId}`);
}

export async function addPost(data: Partial<SysPost>) {
  return requestClient.post('/system/post/', data);
}

export async function updatePost(data: Partial<SysPost> & { postId: number }) {
  return requestClient.put('/system/post/', data);
}

export async function delPost(postIds: number | number[]) {
  const ids = Array.isArray(postIds) ? postIds.join(',') : String(postIds);
  return requestClient.delete(`/system/post/${ids}`);
}

export async function exportPost(body: any) {
  return baseRequestClient.post('/system/post/export', body, { responseType: 'blob' });
}

