import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { getPreferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'antdv-next';
import { defineStore } from 'pinia';

import { loginApi, logoutApi } from '#/api';
import {
  fetchRuoYiSession,
  mapRuoYiSessionToUserInfo,
} from '#/api/core/user';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 与 admin-vue3 一致：登录拿到 token + getInfo 后立即请求 `/getRouters` 并注册动态路由，
   * 避免仅依赖路由守卫时序导致未发起菜单请求。
   */
  async function syncDynamicRoutesAfterSession() {
    accessStore.setIsAccessChecked(false);
    try {
      const [{ generateAccess }, { accessRoutes }, { router: appRouter }] =
        await Promise.all([
          import('#/router/access'),
          import('#/router/routes'),
          import('#/router'),
        ]);
      const userRoles = userStore.userInfo?.roles ?? [];
      const { accessibleMenus, accessibleRoutes } = await generateAccess({
        roles: userRoles,
        router: appRouter,
        routes: accessRoutes,
      });
      accessStore.setAccessMenus(accessibleMenus);
      accessStore.setAccessRoutes(accessibleRoutes);
      accessStore.setIsAccessChecked(true);
    } catch (e) {
      accessStore.setIsAccessChecked(false);
      throw e;
    }
  }

  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const loginBody = await loginApi(params);
      const token = (loginBody as { token?: string })?.token;
      if (!token) {
        notification.error({
          title: '登录失败',
          description: '登录响应缺少 token',
        });
        return { userInfo: null };
      }

      accessStore.setAccessToken(token);

      const raw = await fetchRuoYiSession();
      userInfo = mapRuoYiSessionToUserInfo(raw, token);
      userStore.setUserInfo(userInfo);
      accessStore.setAccessCodes(raw.permissions ?? []);

      try {
        await syncDynamicRoutesAfterSession();
      } catch (e) {
        console.error(e);
        notification.error({
          title: '菜单加载失败',
          description: '无法拉取路由菜单，请检查网络或后端 /getRouters',
        });
        return { userInfo };
      }

      if (accessStore.loginExpired) {
        accessStore.setLoginExpired(false);
      } else {
        onSuccess
          ? await onSuccess?.()
          : await router.push(
              userInfo.homePath || getPreferences().app.defaultHomePath,
            );
      }

      if (userInfo?.realName) {
        notification.success({
          description: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
          duration: 3,
          title: $t('authentication.loginSuccess'),
        });
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);
    accessStore.setIsAccessChecked(false);

    const { resetRoutes } = await import('#/router');
    resetRoutes();

    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const raw = await fetchRuoYiSession();
    const token = accessStore.accessToken || '';
    const userInfo = mapRuoYiSessionToUserInfo(raw, token);
    userStore.setUserInfo(userInfo);
    accessStore.setAccessCodes(raw.permissions ?? []);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
