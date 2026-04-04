import type { RouteRecordRaw } from 'vue-router';

/**
 * 数据库菜单通常不返回的「隐藏页」，在 `accessMode: mixed` 时与 `/getRouters` 结果合并。
 * 主菜单树由后端下发，避免与 migrated 全量前端路由重复。
 *
 * `/index`、`/user/*`、`/redirect/:path` 均在此（勿放 core）：避免进入 `coreRouteNames` 导致未登录也可访问。
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
    name: 'MigratedSystemUserAuthRole',
    path: '/system/user-auth/role/:userId',
    component: () => import('#/views/system/user/auth-role.vue'),
    meta: {
      activePath: '/system/user',
      hideInMenu: true,
      title: '分配角色',
    },
  },
  {
    name: 'MigratedSystemRoleAuthUser',
    path: '/system/role-auth/user/:roleId',
    component: () => import('#/views/system/role/auth-user.vue'),
    meta: {
      activePath: '/system/role',
      hideInMenu: true,
      title: '分配用户',
    },
  },
  {
    name: 'MigratedJobLog',
    path: '/monitor/job-log/index/:jobId',
    component: () => import('#/views/monitor/job/log.vue'),
    meta: {
      activePath: '/monitor/job',
      hideInMenu: true,
      title: '调度日志',
    },
  },
  {
    name: 'MigratedToolGenEdit',
    path: '/tool/gen-edit/index/:tableId',
    component: () => import('#/views/tool/gen/edit-table.vue'),
    meta: {
      activePath: '/tool/gen',
      hideInMenu: true,
      title: '修改生成配置',
    },
  },
];

export default routes;
