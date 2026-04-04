<script lang="ts" setup>
import { computed } from 'vue';

import { Tag } from 'antdv-next';

import type { DictOption } from '#/store/ruoyi-dict';

defineOptions({ name: 'DictTag' });

const props = withDefaults(
  defineProps<{
    options?: DictOption[] | null;
    showValue?: boolean;
    value?: any[] | number | string;
  }>(),
  { options: null, showValue: true },
);

const values = computed(() => {
  if (props.value !== null && props.value !== undefined) {
    return Array.isArray(props.value)
      ? props.value.map(String)
      : [String(props.value)];
  }
  return [] as string[];
});

const unmatchArray = computed(() => {
  const opts = props.options || [];
  return values.value.filter(
    (v) => !opts.some((o) => String(o.value) === String(v)),
  );
});

const showUnmatch = computed(
  () => unmatchArray.value.length > 0 && props.showValue,
);

function mapColor(
  elTagType: string | undefined,
): string | undefined {
  const t = (elTagType || 'default').toLowerCase();
  if (!t || t === 'default') {
    return undefined;
  }
  const map: Record<string, string> = {
    danger: 'error',
    error: 'error',
    info: 'processing',
    primary: 'blue',
    success: 'success',
    warning: 'warning',
  };
  return map[t] ?? t;
}
</script>

<template>
  <span class="ruoyi-dict-tag">
    <template v-for="item in options || []" :key="String(item.value)">
      <template v-if="values.includes(String(item.value))">
        <span
          v-if="!item.elTagType || item.elTagType === 'default'"
          :class="item.elTagClass"
        >
          {{ item.label }}&nbsp;
        </span>
        <Tag
          v-else
          :class="item.elTagClass"
          :color="mapColor(item.elTagType)"
        >
          {{ item.label }}&nbsp;
        </Tag>
      </template>
    </template>
    <template v-if="showUnmatch">
      {{ unmatchArray.join(' ') }}
    </template>
  </span>
</template>

<style scoped>
.ruoyi-dict-tag :deep(.ant-tag) {
  margin-inline-end: 8px;
}
</style>
