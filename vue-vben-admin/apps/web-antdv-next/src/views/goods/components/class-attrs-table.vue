<script setup lang="ts">
import { computed } from 'vue';

import { generateUUID } from '@vben/utils';

import { Button, Input, Space, Switch, Table } from 'antdv-next';

import {
  GOODS_CLASS_ATTRS_KS,
  GOODS_CLASS_ATTRS_NUM,
  GOODS_CLASS_ATTRS_SIZE,
} from '../goods.constant';

const props = defineProps<{
  type: string;
}>();

const modleValue = defineModel<any[]>({ required: true });

const onAdd = () => {
  modleValue.value.push({
    attrName: '',
    key: generateUUID(),
    joinSquarePrice: true,
    joinNormalPrice: true,
    enable: true,
  });
};

const columns = computed(() =>
  props.type === '1'
    ? [
        { title: '属性名称', dataIndex: 'attrName', key: 'attrName' },
        { title: '参与平方计价', dataIndex: 'joinSquarePrice', key: 'joinSquarePrice' },
        { title: '参与普通计价', dataIndex: 'joinNormalPrice', key: 'joinNormalPrice' },
        { title: '是否启用', dataIndex: 'enable', key: 'enable' },
        { title: '操作', key: 'action', width: 100 },
      ]
    : [
        { title: '属性名称', dataIndex: 'attrName', key: 'attrName', width: 200 },
        { title: '操作', key: 'action' },
      ],
);

function onDelete(record: any) {
  modleValue.value = modleValue.value.filter((item) => item.key !== record.key);
}
</script>

<template>
  <Table :columns="columns" :data-source="modleValue" size="small" :pagination="false">
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'attrName'">
        <Input v-model:value="record.attrName" size="small" class="w-[150px]!" />
      </template>
      <template v-else-if="column.key === 'joinSquarePrice'">
        <Switch v-model:checked="record.joinSquarePrice" size="small" />
      </template>
      <template v-else-if="column.key === 'joinNormalPrice'">
        <Switch v-model:checked="record.joinNormalPrice" size="small" />
      </template>
      <template v-else-if="column.key === 'enable'">
        <Switch v-model:checked="record.enable" size="small" />
      </template>
      <template v-else-if="column.key === 'action'">
        <Space>
          <Button type="link" size="small" @click="onAdd" v-if="index === modelValue.length - 1">
            新增
          </Button>
          <Button
            type="link"
            danger
            size="small"
            @click="onDelete(record)"
            :disabled="
              index === 0 ||
              [GOODS_CLASS_ATTRS_KS, GOODS_CLASS_ATTRS_SIZE, GOODS_CLASS_ATTRS_NUM].includes(
                record.key,
              )
            "
          >
            删除
          </Button>
        </Space>
      </template>
    </template>
  </Table>
</template>
