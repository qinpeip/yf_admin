<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { computed } from 'vue';

import { SystemProShell } from '#/components/system-pro';

const url = computed(() => `${import.meta.env.VITE_GLOB_API_URL}/swagger-ui`);
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="系统接口（Swagger）" :show-search="false" :show-column-setting="false">
      <div class="h-[calc(100vh-220px)] min-h-[480px] w-full overflow-hidden rounded-md border border-[#f0f0f0] bg-background dark:border-white/10">
        <iframe :src="url" class="h-full w-full border-0" title="Swagger UI" />
      </div>
    </SystemProShell>
  </Page>
</template>

