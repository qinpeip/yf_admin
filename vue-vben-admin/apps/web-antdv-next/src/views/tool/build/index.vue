<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { SystemProShell } from '#/components/system-pro';
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="表单构建" :show-search="false" :show-column-setting="false">
      <div class="text-sm leading-relaxed text-muted-foreground">
        旧版使用了表单设计器组件（`v-form-designer`）。这一块需要单独引入对应依赖并适配 vben
        的布局/主题，后续再补齐。
      </div>
    </SystemProShell>
  </Page>
</template>

