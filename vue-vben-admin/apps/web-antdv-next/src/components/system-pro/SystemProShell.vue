<script setup lang="ts">
import { nextTick, onMounted, provide, ref, useTemplateRef, watch } from 'vue';

import { LayoutGrid, Maximize, Minimize2, RotateCw, Search } from '@vben/icons';

import { useDebounceFn, useFullscreen, useResizeObserver } from '@vueuse/core';
import { Button, Card } from 'antdv-next';

import { SYSTEM_PRO_SHELL_TABLE_SCROLL_Y } from './injection';

const props = withDefaults(
  defineProps<{
    /**
     * 是否根据表格区域高度自动计算并下发 Table `scroll.y`。
     * 在「侧栏 + 主表」等复杂 flex 布局下若出现高度闪烁，可设为 false，仅保留横向 `scroll.x`。
     */
    enableMeasuredScrollY?: boolean;
    /**
     * 从表格可视区域高度中预留的像素（表头、分页、边距），用于计算 Table scroll.y
     */
    scrollBottomReserve?: number;
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
    scrollBottomReserve: 100,
    enableMeasuredScrollY: true,
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
const tableHostRef = useTemplateRef<HTMLDivElement>('tableHostRef');
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(panelRef);

const tableBodyScrollY = ref<number | undefined>(undefined);
provide(SYSTEM_PRO_SHELL_TABLE_SCROLL_Y, tableBodyScrollY);

/** 写入 scroll.y 后，Table 重排会再次触发 ResizeObserver；短时间内忽略观察回调，打断振荡 */
let suppressResizeObserverUntil = 0;

type MeasureReason = 'fullscreen' | 'init' | 'resize' | 'toggle';

function measureTableHostCore(reason: MeasureReason) {
  if (!props.enableMeasuredScrollY) {
    if (tableBodyScrollY.value !== undefined) {
      tableBodyScrollY.value = undefined;
    }
    return;
  }
  if (reason === 'resize' && Date.now() < suppressResizeObserverUntil) {
    return;
  }

  nextTick(() => {
    requestAnimationFrame(() => {
      const el = tableHostRef.value;
      if (!el) {
        if (tableBodyScrollY.value !== undefined) {
          tableBodyScrollY.value = undefined;
        }
        return;
      }
      const h = Math.round(el.getBoundingClientRect().height);
      const reserve = props.scrollBottomReserve;
      const raw = h > reserve + 80 ? h - reserve : undefined;
      const next = raw == null ? undefined : Math.max(120, Math.round(raw / 16) * 16);
      const prev = tableBodyScrollY.value;
      if (next === prev) return;
      if (next != null && prev != null && Math.abs(next - prev) < 16) return;
      tableBodyScrollY.value = next;
      suppressResizeObserverUntil = Date.now() + 240;
    });
  });
}

const measureOnResize = useDebounceFn(() => {
  if (!props.enableMeasuredScrollY) return;
  measureTableHostCore('resize');
}, 120);

onMounted(() => measureTableHostCore('init'));
useResizeObserver(tableHostRef, () => measureOnResize());

watch(isFullscreen, () => measureTableHostCore('fullscreen'));

function toggleSearch() {
  searchExpanded.value = !searchExpanded.value;
  measureTableHostCore('toggle');
}

watch(
  () => props.enableMeasuredScrollY,
  (en) => {
    if (en) {
      measureTableHostCore('init');
    } else {
      tableBodyScrollY.value = undefined;
    }
  },
);
</script>

<template>
  <div class="system-pro-shell flex h-full min-h-0 w-full flex-1 flex-col">
    <Card
      v-if="showSearch"
      class="system-pro-search-card mb-2! shrink-0 rounded-lg border border-[#f0f0f0] bg-card shadow-sm dark:border-white/10 search-card-small"
      :class="{ searchExpanded }"
      :bordered="false"
      size="small"
    >
      <div
        class="flex items-center justify-between border-[#f0f0f0] bg-[#fafafa] px-5 py-1 dark:border-white/10 dark:bg-white/[0.04]"
      >
        <span class="text-sm font-medium text-foreground/90">{{ searchTitle }}</span>
        <Button type="link" class="!h-auto !px-1 !py-0 text-primary" @click="toggleSearch">
          <span class="inline-flex items-center gap-1">
            {{ searchExpanded ? '收起' : '展开' }}
            <span class="text-xs opacity-70">{{ searchExpanded ? '▲' : '▼' }}</span>
          </span>
        </Button>
      </div>
      <div v-show="searchExpanded" class="px-3 pb-2 pt-2">
        <slot name="search"></slot>
        <div class="mt-2 flex flex-wrap justify-end gap-2 border-t border-[#f0f0f0] pt-2 dark:border-white/10">
          <Button @click="emit('reset')">重置</Button>
          <Button type="primary" @click="emit('search')">
            <Search class="mr-1 inline size-4 align-text-bottom opacity-95" />
            搜索
          </Button>
        </div>
      </div>
    </Card>

    <div
      ref="panelRef"
      class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#f0f0f0] bg-card shadow-sm dark:border-white/10"
    >
      <div
        class="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#f0f0f0] bg-[#fafafa] px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]"
      >
        <span class="text-sm font-semibold tracking-tight text-foreground">{{ tableTitle }}</span>
        <div class="flex flex-wrap items-center gap-1.5">
          <slot name="toolbar-actions"></slot>
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
      <div class="flex min-h-0 flex-1 flex-col p-3">
        <div ref="tableHostRef" class="table-host min-h-0 flex-1 overflow-hidden">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-card-small {
  :deep(.ant-card-body) {
    padding: 8px 10px;
  }

  &.searchExpanded {
    :deep(.ant-card-body) {
      padding-bottom: 0;
    }
  }
}

/* 让 Table 在定高容器内吃满高度，scroll.y 才能稳定生效 */
.table-host {

  :deep(.ant-spin-nested-loading),
  :deep(.ant-spin-container) {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  :deep(.ant-table-wrapper) {
    min-height: 0;
    flex: 1 1 auto;
  }
}
</style>
