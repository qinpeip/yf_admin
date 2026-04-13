<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';

import { Table } from 'antdv-next';

import { useSystemProTableScroll } from './use-system-pro-table-scroll';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const slots = useSlots();

/** 须在 `SystemProShell` 默认插槽内使用，`inject` 才能拿到测量高度 */
const shellScroll = useSystemProTableScroll();

const mergedScroll = computed(() => {
  const user = attrs.scroll as undefined | { x?: number | string; y?: number };
  const shell = shellScroll.value;
  if (!user && !shell) return undefined;
  const u = typeof user === 'object' && user ? user : {};
  const s = shell ?? {};
  return {
    ...u,
    ...s,
    x: u.x ?? s.x,
    y: s.y ?? u.y,
  };
});

const tableBind = computed(() => {
  const raw = { ...(attrs as Record<string, unknown>) };
  if (raw.size === undefined) {
    raw.size = 'small';
  }
  return {
    ...raw,
    scroll: mergedScroll.value,
  };
});
</script>

<template>
  <Table v-bind="tableBind">
    <template v-for="(_, name) in slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope || {}"></slot>
    </template>
  </Table>
</template>
