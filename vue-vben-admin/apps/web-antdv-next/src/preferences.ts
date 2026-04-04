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
    /** 与 admin-vue3 首页 `/index` 对齐（见 `router/routes/modules/admin-vue3-parity.ts`） */
    defaultHomePath: '/index',
    /**
     * - `frontend`：仅用前端路由（如 `migrated.ts`），不请求 `/getRouters`。
     * - `backend`：菜单与路由完全来自 `GET /getRouters`（已与 Nest 若依格式对接）。
     * - `mixed`：前后端路由按 name 合并；若仍保留整棵 `migrated` 与数据库菜单重复，可能出现重复菜单，需自行取舍。
     */
    accessMode: 'frontend',
  },
});
