<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { generateAccess } from '#/router/access';
import { accessRoutes } from '#/router/routes';
import { useAuthStore } from '#/store';

defineOptions({ name: 'HomeRedirect' });

const router = useRouter();
const accessStore = useAccessStore();
const userStore = useUserStore();
const authStore = useAuthStore();

function pickFirstMenuPath(menus: any[]): string | null {
  for (const m of menus || []) {
    const p = m?.path;
    if (typeof p === 'string' && p && p !== '/' && p !== '/home') return p;
    const child = pickFirstMenuPath(m?.children || []);
    if (child) return child;
  }
  return null;
}

onMounted(async () => {
  // 某些情况下（例如刷新/切换用户后状态不同步）会出现 isAccessChecked=true 但菜单为空，
  // 这里做一次兜底：如果没生成出后端路由，就在 /home 页面主动触发生成。
  if (
    !accessStore.isAccessChecked ||
    !accessStore.accessMenus?.length ||
    !accessStore.accessRoutes?.length
  ) {
    accessStore.setIsAccessChecked(false);
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo?.roles ?? [];

    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      routes: accessRoutes,
    });
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
  }

  const target =
    userStore.userInfo?.homePath ||
    pickFirstMenuPath(accessStore.accessMenus) ||
    preferences.app.defaultHomePath;

  // 防止落到 / 或 /home 导致循环
  const safeTarget =
    !target || target === '/' || target === '/home'
      ? pickFirstMenuPath(accessStore.accessMenus) || '/'
      : target;

  await router.replace(safeTarget);
});
</script>

<template>
  <div style="padding: 24px">loading...</div>
</template>

