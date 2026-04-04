import type {
  AccessModeType,
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';

import { message } from 'antdv-next';

import { getAllMenusApi } from '#/api';
import { BasicLayout, IFrameView, ParentView } from '#/layouts';
import { $t } from '#/locales';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

/** 路由生成必须含后端菜单；勿用 getPreferences().accessMode（易被 localStorage 脏缓存成 frontend） */
const RUOYI_ROUTE_ACCESS_MODE: AccessModeType = 'mixed';

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
    /** 若依 `server/.../user.constant.ts`：Layout / ParentView / InnerLink */
    Layout: BasicLayout,
    ParentView,
    InnerLink: IFrameView,
  };

  return await generateAccessible(RUOYI_ROUTE_ACCESS_MODE, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      return await getAllMenusApi();
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
