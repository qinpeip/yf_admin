import { nextTick } from 'vue';
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import { resetStaticRoutes } from '@vben/utils';

import { createRouterGuard } from './guard';
import { routes } from './routes';

/**
 *  @zh_CN 创建vue-router实例
 */
const router = createRouter({
  history:
    import.meta.env.VITE_ROUTER_HISTORY === 'hash'
      ? createWebHashHistory(import.meta.env.VITE_BASE)
      : createWebHistory(import.meta.env.VITE_BASE),
  // 应该添加到路由的初始路由列表。
  routes,
  /**
   * 延后到 DOM 稳定再滚动，避免与 Layout Transition/KeepAlive 同一微任务内更新叠在一起，
   * 触发 handleScroll 时子节点尚未挂载导致 runtime-dom parentNode / subTree 为 null。
   */
  scrollBehavior(to, _from, savedPosition) {
    return new Promise((resolve) => {
      void nextTick(() => {
        requestAnimationFrame(() => {
          try {
            if (savedPosition) {
              resolve(savedPosition);
              return;
            }
            if (to.hash) {
              const el =
                document.querySelector(to.hash) ??
                document.getElementById(to.hash.slice(1));
              if (el) {
                resolve({ behavior: 'smooth', el: to.hash });
                return;
              }
            }
            resolve({ left: 0, top: 0 });
          } catch {
            resolve(false);
          }
        });
      });
    });
  },
  // 是否应该禁止尾部斜杠。
  // strict: true,
});

const resetRoutes = () => resetStaticRoutes(router, routes);

// 创建路由守卫
createRouterGuard(router);

export { resetRoutes, router };
