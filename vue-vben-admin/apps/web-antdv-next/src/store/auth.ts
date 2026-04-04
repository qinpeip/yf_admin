import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
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

      if (accessStore.loginExpired) {
        accessStore.setLoginExpired(false);
      } else {
        onSuccess
          ? await onSuccess?.()
          : await router.push(
              userInfo.homePath || preferences.app.defaultHomePath,
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
