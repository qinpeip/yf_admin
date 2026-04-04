<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { useAppConfig } from '@vben/hooks';
import { computed } from 'vue';

import { SystemProShell } from '#/components/system-pro';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

/**
 * iframe 地址：
 * - 默认：`{apiURL}/druid/login.html`（与 admin-vue3 一致，走 Vite 代理）
 * - 可设 `VITE_GLOB_DRUID_URL` 为完整地址（如直连带端口的 Spring Boot）
 * - 可设 `VITE_GLOB_DRUID_PATH` 替换路径段（默认 `druid/login.html`，含 context-path 时可写 `prod-api/druid/login.html`）
 */
const url = computed(() => {
  const full = import.meta.env.VITE_GLOB_DRUID_URL as string | undefined;
  if (full?.trim()) {
    return full.trim();
  }
  const base = (
    apiURL ||
    (import.meta.env.VITE_GLOB_API_URL as string | undefined) ||
    ''
  ).replace(/\/$/, '');
  const path = (
    (import.meta.env.VITE_GLOB_DRUID_PATH as string | undefined) ||
    'druid/login.html'
  ).replace(/^\//, '');
  return `${base}/${path}`;
});
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="数据监控（Druid）" :show-search="false" :show-column-setting="false">
      <div class="h-[calc(100vh-220px)] min-h-[480px] w-full overflow-hidden rounded-md border border-[#f0f0f0] bg-background dark:border-white/10">
        <iframe :src="url" class="h-full w-full border-0" title="Druid" />
      </div>
    </SystemProShell>
  </Page>
</template>
