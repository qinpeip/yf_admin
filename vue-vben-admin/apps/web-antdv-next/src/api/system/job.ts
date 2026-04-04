import { baseRequestClient, requestClient } from '#/api/request';

export interface JobQuery {
  pageNum?: number;
  pageSize?: number;
  jobName?: string;
  jobGroup?: string;
  status?: string;
}

export interface JobRow {
  jobId: number;
  jobName: string;
  jobGroup?: string;
  invokeTarget?: string;
  cronExpression?: string;
  status?: string;
  createTime?: string;
}

export async function listJob(query: JobQuery) {
  const raw = await requestClient.get<{
    list?: JobRow[];
    rows?: JobRow[];
    total: number;
  }>('/monitor/job/list', { params: query });
  return {
    list: raw?.list ?? raw?.rows ?? [],
    total: raw?.total ?? 0,
  };
}

export async function getJob(jobId: number) {
  return requestClient.get<JobRow>(`/monitor/job/${jobId}`);
}

export async function addJob(data: any) {
  return requestClient.post('/monitor/job', data);
}

export async function updateJob(data: { jobId: number } & Record<string, any>) {
  return requestClient.put('/monitor/job', data);
}

export async function removeJob(jobIds: number | number[]) {
  const ids = Array.isArray(jobIds) ? jobIds.join(',') : String(jobIds);
  return requestClient.delete(`/monitor/job/${ids}`);
}

export async function changeJobStatus(jobId: number, status: string) {
  return requestClient.put('/monitor/job/changeStatus', { jobId, status });
}

export async function runJob(jobId: number) {
  return requestClient.put('/monitor/job/run', { jobId });
}

export async function exportJob(body: any) {
  return baseRequestClient.post('/monitor/job/export', body, { responseType: 'blob' });
}

export interface JobLogQuery {
  pageNum?: number;
  pageSize?: number;
  jobName?: string;
  jobGroup?: string;
  status?: string;
  params?: { beginTime?: string; endTime?: string };
}

export async function listJobLog(query: JobLogQuery) {
  const raw = await requestClient.get<{
    list?: any[];
    rows?: any[];
    total: number;
  }>('/monitor/jobLog/list', { params: query });
  return {
    list: raw?.list ?? raw?.rows ?? [],
    total: raw?.total ?? 0,
  };
}

export async function removeJobLog(jobLogIds: number | number[]) {
  const ids = Array.isArray(jobLogIds) ? jobLogIds.join(',') : String(jobLogIds);
  return requestClient.delete(`/monitor/jobLog/${ids}`);
}

export async function cleanJobLog() {
  return requestClient.delete('/monitor/jobLog/clean');
}

export async function exportJobLog(body: any) {
  return baseRequestClient.post('/monitor/jobLog/export', body, { responseType: 'blob' });
}

