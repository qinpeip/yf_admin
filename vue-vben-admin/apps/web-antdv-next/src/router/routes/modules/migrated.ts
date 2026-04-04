import type { RouteRecordRaw } from 'vue-router';

/**
 * admin-vue3 业务菜单迁移（系统/监控/工具 + 隐藏子路由）。
 * 与 `admin-vue3-parity.ts`（首页/redirect/个人中心）及 `core.ts`（/register 别名）共同覆盖 `admin-vue3/src/router/index.js` 中的 constantRoutes + dynamicRoutes 路径。
 * 未迁入部分：表单构建（dd-form-draggable）等依赖；若依全局对齐见 `bootstrap.ts`（`v-hasPermi` / `$tab` / `useDict` / `DictTag` 等）。
 */
const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'carbon:settings',
      order: 50,
      title: '系统管理',
    },
    name: 'MigratedSystem',
    path: '/system',
    children: [
      {
        name: 'MigratedSystemUser',
        path: '/system/user',
        component: () => import('#/views/system/user/index.vue'),
        meta: { icon: 'carbon:user', title: '用户管理' },
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
        name: 'MigratedSystemRole',
        path: '/system/role',
        component: () => import('#/views/system/role/index.vue'),
        meta: { icon: 'carbon:user-role', title: '角色管理' },
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
        name: 'MigratedSystemMenu',
        path: '/system/menu',
        component: () => import('#/views/system/menu/index.vue'),
        meta: { icon: 'carbon:menu', title: '菜单管理' },
      },
      {
        name: 'MigratedSystemDept',
        path: '/system/dept',
        component: () => import('#/views/system/dept/index.vue'),
        meta: { icon: 'carbon:container-services', title: '部门管理' },
      },
      {
        name: 'MigratedSystemPost',
        path: '/system/post',
        component: () => import('#/views/system/post/index.vue'),
        meta: { icon: 'carbon:portfolio', title: '岗位管理' },
      },
      {
        name: 'MigratedSystemDict',
        path: '/system/dict',
        component: () => import('#/views/system/dict/index.vue'),
        meta: { icon: 'carbon:book', title: '字典管理' },
      },
      {
        name: 'MigratedSystemConfig',
        path: '/system/config',
        component: () => import('#/views/system/config/index.vue'),
        meta: { icon: 'carbon:settings-adjust', title: '参数设置' },
      },
      {
        name: 'MigratedSystemNotice',
        path: '/system/notice',
        component: () => import('#/views/system/notice/index.vue'),
        meta: { icon: 'carbon:notification', title: '通知公告' },
      },
    ],
  },
  {
    meta: {
      icon: 'carbon:activity',
      order: 60,
      title: '系统监控',
    },
    name: 'MigratedMonitor',
    path: '/monitor',
    children: [
      {
        name: 'MigratedOperlog',
        path: '/monitor/operlog',
        component: () => import('#/views/monitor/operlog/index.vue'),
        meta: { icon: 'carbon:blog', title: '操作日志' },
      },
      {
        name: 'MigratedLogininfor',
        path: '/monitor/logininfor',
        component: () => import('#/views/monitor/logininfor/index.vue'),
        meta: { icon: 'carbon:login', title: '登录日志' },
      },
      {
        name: 'MigratedOnline',
        path: '/monitor/online',
        component: () => import('#/views/monitor/online/index.vue'),
        meta: { icon: 'carbon:connection-signal', title: '在线用户' },
      },
      {
        name: 'MigratedJob',
        path: '/monitor/job',
        component: () => import('#/views/monitor/job/index.vue'),
        meta: { icon: 'carbon:timer', title: '定时任务' },
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
        name: 'MigratedDruid',
        path: '/monitor/druid',
        component: () => import('#/views/monitor/druid/index.vue'),
        meta: { icon: 'carbon:data-base', title: '数据监控' },
      },
      {
        name: 'MigratedServer',
        path: '/monitor/server',
        component: () => import('#/views/monitor/server/index.vue'),
        meta: { icon: 'carbon:cloud-monitoring', title: '服务监控' },
      },
      {
        name: 'MigratedCache',
        path: '/monitor/cache',
        component: () => import('#/views/monitor/cache/index.vue'),
        meta: { icon: 'carbon:chart-pie', title: '缓存监控' },
      },
      {
        name: 'MigratedCacheList',
        path: '/monitor/cache/list',
        component: () => import('#/views/monitor/cache/list.vue'),
        meta: { icon: 'carbon:list', title: '缓存列表' },
      },
    ],
  },
  {
    meta: {
      icon: 'carbon:tools',
      order: 70,
      title: '系统工具',
    },
    name: 'MigratedTool',
    path: '/tool',
    children: [
      {
        name: 'MigratedToolBuild',
        path: '/tool/build',
        component: () => import('#/views/tool/build/index.vue'),
        meta: { icon: 'carbon:construction', title: '表单构建' },
      },
      {
        name: 'MigratedToolGen',
        path: '/tool/gen',
        component: () => import('#/views/tool/gen/index.vue'),
        meta: { icon: 'carbon:code', title: '代码生成' },
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
      {
        name: 'MigratedToolSwagger',
        path: '/tool/swagger',
        component: () => import('#/views/tool/swagger/index.vue'),
        meta: { icon: 'carbon:api', title: '系统接口' },
      },
    ],
  },
];

export default routes;
