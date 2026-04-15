<script lang="ts" setup>
import type { GoodsSku } from '#/api/goods/goods';

import { useElementSize, useFullscreen } from '@vueuse/core';
import { Button, FormItem, Input, InputNumber } from 'antdv-next';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import { VxeColumn, VxeTable } from 'vxe-table';

import 'vxe-table/lib/style.css';

const modelValue = defineModel<GoodsSku[]>({ required: true });

const columns = computed(() => {
  const spec = modelValue.value[0]?.spec ?? [];
  return spec.map((item) => ({
    field: item.key,
    title: item.attrName,
  }));
});

/** 对该节点调用 Element.requestFullscreen() */
const fullscreenTargetRef = useTemplateRef<HTMLDivElement>('fullscreenTargetRef');
const tableWrapRef = useTemplateRef<HTMLDivElement>('tableWrapRef');
const vxeTableRef = useTemplateRef('vxeTableRef');

const { height: tableWrapHeight } = useElementSize(tableWrapRef);
const { isFullscreen, toggle } = useFullscreen(fullscreenTargetRef);

/** 全屏时用包裹层真实像素高度；calc(100vh) 与虚拟滚动在全屏下易算错导致无法滚动 */
const tableHeight = computed(() => {
  if (!isFullscreen.value) return 600;
  const h = Math.floor(tableWrapHeight.value);
  return h > 80 ? h : 400;
});

/** 纵向虚拟滚动在容器尺寸突变后常需重算，全屏下直接关闭更稳妥 */
const virtualYConfig = computed(() =>
  isFullscreen.value ? { enabled: false as const } : { enabled: true as const, gt: 0 },
);

function recalculateVxeTable() {
  nextTick(() => {
    const xe = (vxeTableRef.value as unknown as { $xeTable?: { recalculate?: () => void } })
      ?.$xeTable;
    xe?.recalculate?.();
  });
}

watch([isFullscreen, tableHeight], recalculateVxeTable);
</script>

<template>
  <FormItem label="价格及库存">
    <div
      ref="fullscreenTargetRef"
      class="sku-fullscreen-host bg-[#f7f8fa] p-[10px]! flex w-full min-h-0 flex-col spec-sort-wrap"
    >
      <div class="mb-2 flex shrink-0 justify-end pr-2">
        <Button type="primary" size="small" @click="toggle">
          <FullscreenExitOutlined v-if="isFullscreen" />
          <FullscreenOutlined v-else />
          {{ isFullscreen ? '退出全屏' : '全屏编辑' }}
        </Button>
      </div>
      <div
        ref="tableWrapRef"
        class="min-h-0"
        :class="isFullscreen ? 'min-h-0 flex-1 overflow-hidden' : 'h-[600px]'"
      >
        <VxeTable
          ref="vxeTableRef"
          :data="modelValue"
          border
          :column-config="{ resizable: true }"
          :virtual-y-config="virtualYConfig"
          :height="tableHeight"
          size="small"
        >
          <VxeColumn v-for="column in columns" :key="column.field" :field="column.field" :title="column.title">
            <template #="{ row }">
              {{
                row.spec.find((item: { key: string }) => item.key === column.field)?.optionName
              }}
            </template>
          </VxeColumn>
          <vxe-column field="name" title="编码" width="150">
            <template #="{ row }">
              <Input v-model="row.skuCode" size="small" />
            </template>
          </vxe-column>
          <vxe-column field="price" title="价格" width="150" fixed="right">
            <template #="{ row }">
              <InputNumber v-model:value="row.price" size="small" :precision="4" :controls="false" />
            </template>
          </vxe-column>
        </VxeTable>
      </div>
    </div>
  </FormItem>
</template>

<style scoped>
.sku-fullscreen-host:fullscreen,
.sku-fullscreen-host:-webkit-full-screen {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}
</style>
