import { requestClient } from '#/api/request';

export async function getCacheInfo() {
  return requestClient.get<any>('/monitor/cache');
}

export async function listCacheName() {
  return requestClient.get<any[]>('/monitor/cache/getNames');
}

export async function listCacheKey(cacheName: string) {
  return requestClient.get<any[]>(`/monitor/cache/getKeys/${encodeURIComponent(cacheName)}`);
}

export async function getCacheValue(cacheName: string, cacheKey: string) {
  return requestClient.get<any>(
    `/monitor/cache/getValue/${encodeURIComponent(cacheName)}/${encodeURIComponent(cacheKey)}`,
  );
}

export async function clearCacheName(cacheName: string) {
  return requestClient.delete(
    `/monitor/cache/clearCacheName/${encodeURIComponent(cacheName)}`,
  );
}

export async function clearCacheKey(cacheKey: string) {
  return requestClient.delete(
    `/monitor/cache/clearCacheKey/${encodeURIComponent(cacheKey)}`,
  );
}

export async function clearCacheAll() {
  return requestClient.delete('/monitor/cache/clearCacheAll');
}

