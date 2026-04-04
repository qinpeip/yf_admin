import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';
import { transformGetRoutersToVbenMenus } from '#/router/ruoyi-backend-menu';

/**
 * `accessMode: 'backend' | 'mixed'` 时由 `@vben/access` 拉取菜单并生成动态路由。
 *
 * 对接本仓库 Nest / 若依：`GET /getRouters`（`admin-vue3` 同源），返回结构由 `transformGetRoutersToVbenMenus` 转为 Vben 所需格式。
 * 仍使用 `frontend` 时不会请求本接口。
 */
export async function getAllMenusApi(): Promise<RouteRecordStringComponent[]> {
  const data = await requestClient.get<unknown>('/getRouters');
  return transformGetRoutersToVbenMenus(data);
}
