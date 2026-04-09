<script setup lang="ts">
import type { ShippingTemplateRuleRow } from '#/api/system/shipping-template';

import { computed, customRef, ref } from 'vue';

import { Plus } from '@vben/icons';
import { cloneDeep } from '@vben/utils';

import { Button, InputNumber, Modal, Table } from 'antdv-next';
import { ElButton, ElCascaderPanel, ElCheckbox } from 'element-plus';
import { isEqual } from 'lodash-es';

import { useArea } from '#/hooks/use-area';

import AreaRender from './area-render.vue';

import 'element-plus/dist/index.css';

const props = withDefaults(
  defineProps<{
    disabledCityIds?: number[];
    isRemote?: boolean;
  }>(),
  {
    disabledCityIds: () => [],
    isRemote: false,
  },
);
const emits = defineEmits(['setCurrentCityIds']);
const modelValue = defineModel<ShippingTemplateRuleRow[]>('modelValue', { required: true });
const columns = [
  { title: '配送区域', dataIndex: 'cityIds', key: 'cityIds' },
  { title: '首重', dataIndex: 'firstWeight', key: 'firstWeight', width: 80 },
  { title: '首重价格', dataIndex: 'firstWeightPrice', key: 'firstWeightPrice', width: 80 },
  { title: '续重', dataIndex: 'additionalWeight', key: 'additionalWeight', width: 80 },
  {
    title: '续重价格',
    dataIndex: 'additionalWeightPrice',
    key: 'additionalWeightPrice',
    width: 80,
  },
  { title: '操作', dataIndex: 'action', width: 60 },
];

const currentCityIds = ref<number[]>([]);
const { proviceCityTree } = useArea();
const renderProviceCityTree = computed(() => {
  return proviceCityTree.value.map((item) => {
    const province = {
      ...item,
      disabled: false,
      children: item.children.map((child) => {
        return {
          ...child,
          disabled: props.disabledCityIds.includes(child.value),
        };
      }),
    };
    if (province.children.every((item) => item.disabled)) {
      province.disabled = true;
    }
    return province;
  });
});

const onDelete = (index: number) => {
  modelValue.value.splice(index, 1);
};
const areaModalVisible = ref(false);
const type = ref<'add' | 'edit'>('add');
const handleAddArea = () => {
  currentCityIds.value = [];
  emits('setCurrentCityIds', []);
  type.value = 'add';
  areaModalVisible.value = true;
};
const currentRules = ref<ShippingTemplateRuleRow | undefined>(undefined);
const handleAddAreaOk = () => {
  if (type.value === 'add') {
    modelValue.value.push({
      cityIds: cloneDeep(currentCityIds.value),
      firstWeight: 0,
      firstWeightPrice: 0,
      additionalWeight: 0,
      additionalWeightPrice: 0,
      isRemote: props.isRemote,
    });
  } else {
    if (currentRules.value) {
      currentRules.value.cityIds = cloneDeep(currentCityIds.value);
    }
  }
  areaModalVisible.value = false;
};

const checkAll = customRef((track, trigger) => ({
  get() {
    track();
    if (currentCityIds.value.length > 0) {
      return isEqual(
        renderProviceCityTree.value
          .flatMap((item) => item.children.map((child) => child.value))
          .filter((item) => !props.disabledCityIds.includes(item))
          .toSorted((a, b) => a - b),
        currentCityIds.value.toSorted((a, b) => a - b),
      );
    }
    return false;
  },
  set(val: boolean) {
    currentCityIds.value = val
      ? renderProviceCityTree.value
          .flatMap((item) => item.children.map((child) => child.value))
          .filter((item) => !props.disabledCityIds.includes(item))
      : [];
    trigger();
  },
}));
const handleEditCityIds = (record: ShippingTemplateRuleRow) => {
  currentCityIds.value = record.cityIds ?? [];
  emits('setCurrentCityIds', cloneDeep(currentCityIds.value));
  type.value = 'edit';
  currentRules.value = record;
  areaModalVisible.value = true;
};
</script>
<template>
  <div>
    <Table :columns="columns" :data-source="modelValue" size="small" :pagination="false">
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'cityIds'">
          <AreaRender :city-ids="record.cityIds" />
          <ElButton type="primary" link size="small" @click="handleEditCityIds(record)">
            编辑
          </ElButton>
        </template>
        <template v-if="column.key === 'firstWeight'">
          <InputNumber
            v-model:value="record.firstWeight"
            :precision="2"
            :step="0.01"
            size="small"
          />
        </template>
        <template v-if="column.key === 'firstWeightPrice'">
          <InputNumber
            v-model:value="record.firstWeightPrice"
            size="small"
            :precision="2"
            :step="0.01"
          />
        </template>
        <template v-if="column.key === 'additionalWeight'">
          <InputNumber
            v-model:value="record.additionalWeight"
            size="small"
            :precision="2"
            :step="0.01"
          />
        </template>
        <template v-if="column.key === 'additionalWeightPrice'">
          <InputNumber
            v-model:value="record.additionalWeightPrice"
            size="small"
            :precision="2"
            :step="0.01"
          />
        </template>
        <template v-if="column.dataIndex === 'action'">
          <Button type="link" danger size="small" @click="onDelete(index)">删除</Button>
        </template>
      </template>
    </Table>
    <!-- <Button type="link" size="small" icon="<PlusOutlined />">点击添加可配送区域和运费</Button> -->
    <Button type="link" size="small" class="mt-2" @click="handleAddArea">
      <template #icon>
        <Plus class="size-4" />
      </template>
      点击添加可配送区域和运费
    </Button>

    <Modal v-model:open="areaModalVisible" title="添加可配送区域和运费" @ok="handleAddAreaOk">
      <div class="pl-[20px]">
        <ElCheckbox v-model="checkAll">全选</ElCheckbox>
      </div>
      <ElCascaderPanel
        :options="renderProviceCityTree"
        class="area-cascader"
        v-model="currentCityIds"
        :props="{
          multiple: true,
          emitPath: false,
        }"
      />
    </Modal>
  </div>
</template>

<style lang="scss" scoped>
.area-cascader {
  :deep(.el-cascader-menu__wrap.el-scrollbar__wrap) {
    height: 400px;
  }
}
</style>
