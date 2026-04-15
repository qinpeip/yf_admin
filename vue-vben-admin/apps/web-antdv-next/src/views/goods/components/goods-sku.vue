<script lang="ts" setup>
import type { GoodsSku } from '#/api/goods/goods';

import { computed } from 'vue';

import { FormItem } from 'antdv-next';
import VxeTable from 'vxe-table';

import 'vxe-table/lib/style.css';

const modelValue = defineModel<GoodsSku[]>({ required: true });

const columns = computed(() => [
  {
    title: '价格',
    key: 'price',
  },
  {
    title: '库存',
    key: 'stock',
  },
]);

console.log('modelValue', modelValue.value);
</script>

<template>
  <FormItem label="价格及库存">
    <div class="bg-[#f7f8fa] p-[10px]! w-full spec-sort-wrap">
      <VxeTable :data="modelValue" :columns="columns" />
    </div>
  </FormItem>
</template>



