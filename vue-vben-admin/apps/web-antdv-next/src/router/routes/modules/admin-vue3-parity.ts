import type { RouteRecordRaw } from 'vue-router';

/**
 * admin-vue3 `router/index.js` 中与业务模块无关、但行为依赖的公共路由：
 * - 首页 `/index`（原分析页概览图表，见 `views/dashboard/home`）
 * - `/redirect/:path` 刷新辅助
 * - `/register` 白名单路径（转到 Vben `/auth/register`）
 * - `/user/profile` 个人中心（若依接口）
 */
const routes: RouteRecordRaw[] = [
  {
    name: 'MigratedIndex',
    path: '/index',
    component: () => import('#/views/dashboard/home/index.vue'),
    meta: {
      affixTab: true,
      icon: 'carbon:home',
      order: -10,
      title: '首页',
    },
  },
  {
    name: 'RuoyiPathRedirect',
    path: '/redirect/:path(.*)',
    component: () => import('#/views/_core/redirect/ruoyi-redirect.vue'),
    meta: {
      hideInBreadcrumb: true,
      hideInMenu: true,
      hideInTab: true,
      noBasicLayout: true,
      title: 'Redirect',
    },
  },
  {
    name: 'MigratedUserShell',
    path: '/user',
    redirect: '/user/profile',
    meta: {
      hideInBreadcrumb: true,
      hideInMenu: true,
      title: '用户',
    },
    children: [
      {
        name: 'MigratedUserProfile',
        path: '/user/profile',
        component: () => import('#/views/system/user/profile/index.vue'),
        meta: {
          hideInMenu: true,
          title: '个人中心',
        },
      },
    ],
  },
];

export default routes;
