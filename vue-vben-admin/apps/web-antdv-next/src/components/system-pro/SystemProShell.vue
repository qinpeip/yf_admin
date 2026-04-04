<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

import { LayoutGrid, Maximize, Minimize2, RotateCw, Search } from '@vben/icons';

import { useFullscreen } from '@vueuse/core';
import { Button, Card } from 'antdv-next';

const _props = withDefaults(
  defineProps<{
    /** 查询区标题 */
    searchTitle?: string;
    /** 是否展示列设置按钮 */
    showColumnSetting?: boolean;
    /** 是否展示查询卡片 */
    showSearch?: boolean;
    /** 表格卡片标题，如「角色列表」 */
    tableTitle: string;
  }>(),
  {
    searchTitle: '查询',
    showSearch: true,
    showColumnSetting: true,
  },
);

const emit = defineEmits<{
  columnSetting: [];
  refresh: [];
  reset: [];
  search: [];
}>();

const searchExpanded = ref(true);
const panelRef = useTemplateRef<HTMLDivElement>('panelRef');
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(panelRef);

function toggleSearch() {
  searchExpanded.value = !searchExpanded.value;
}
</script>

<template>
  <div class="system-pro-shell space-y-4">
    <Card v-if="showSearch"
      class="system-pro-search-card rounded-lg border border-[#f0f0f0] bg-card shadow-sm dark:border-white/10 search-card-small mb-2!"
      :bordered="false" size="small">
      <div
        class="flex items-center justify-between border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
        <span class="text-sm font-medium text-foreground/90">{{ searchTitle }}</span>
        <Button type="link" class="!h-auto !px-1 !py-0 text-primary" @click="toggleSearch">
          <span class="inline-flex items-center gap-1">
            {{ searchExpanded ? '收起' : '展开' }}
            <span class="text-xs opacity-70">{{ searchExpanded ? '▲' : '▼' }}</span>
          </span>
        </Button>
      </div>
      <div v-show="searchExpanded" class="px-3 pb-2 pt-2">
        <slot name="search" />
        <div class="mt-4 flex flex-wrap justify-end gap-2 border-t border-[#f0f0f0] pt-4 dark:border-white/10">
          <Button @click="emit('reset')">重置</Button>
          <Button type="primary" @click="emit('search')">
            <Search class="mr-1 inline size-4 align-text-bottom opacity-95" />
            搜索
          </Button>
        </div>
      </div>
    </Card>

    <div ref="panelRef"
      class="overflow-hidden rounded-lg border border-[#f0f0f0] bg-card shadow-sm dark:border-white/10">
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] bg-[#fafafa] px-5 py-3 dark:border-white/10 dark:bg-white/[0.04]">
        <span class="text-base font-semibold tracking-tight text-foreground">{{ tableTitle }}</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <slot name="toolbar-actions" />
          <Button shape="circle" type="text" title="刷新" @click="emit('refresh')">
            <RotateCw class="size-4 text-foreground/70" />
          </Button>
          <Button shape="circle" type="text" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
            <Minimize2 v-if="isFullscreen" class="size-4 text-foreground/70" />
            <Maximize v-else class="size-4 text-foreground/70" />
          </Button>
          <Button v-if="showColumnSetting" shape="circle" type="text" title="列设置" @click="emit('columnSetting')">
            <LayoutGrid class="size-4 text-foreground/70" />
          </Button>
        </div>
      </div>
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.search-card-small {
  :deep(.ant-card-body) {
    padding-bottom: 0;
  }
}
</style>