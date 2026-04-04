import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    /** 与 admin-vue3 首页 `/index` 对齐（见 `router/routes/core.ts` Root 子路由） */
    defaultHomePath: '/index',
    /**
     * - `frontend`：仅用前端路由模块，不请求 `/getRouters`（与 admin-vue3 动态菜单不一致）。
     * - `backend`：菜单与路由完全来自 `GET /getRouters`。
     * - `mixed`：每次登录后请求 `/getRouters` 并与前端补充路由合并（默认，对齐 admin-vue3 动态路由 + 隐藏页补充）。
     */
    accessMode: 'mixed',
  },
});
