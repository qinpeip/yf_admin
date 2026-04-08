<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Form, FormItem, Input, message, Modal } from 'antdv-next';

import {
  addCraftsmanship,
  type CraftsmanshipRow,
  delCraftsmanship,
  getCraftsmanship,
  listCraftsmanship,
  updateCraftsmanship,
} from '#/api/goods/craftsmanship';
import { SystemProShell, SystemProTable } from '#/components/system-pro';

/** 工艺 */
type Row = CraftsmanshipRow;

function asRow(x: unknown): Row {
  return x as Row;
}

const loading = ref(false);
const rows = ref<Row[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
});

const selectedRowKeys = ref<(number | string)[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (number | string)[]) => {
    selectedRowKeys.value = keys;
  },
}));

async function fetchList() {
  loading.value = true;
  try {
    const data = await listCraftsmanship({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      name: query.name || undefined,
    });
    rows.value = (data?.list ?? []) as Row[];
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.name = '';
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除选中的 ${selectedRowKeys.value.length} 条记录？`,
    async onOk() {
      await delCraftsmanship(selectedRowKeys.value as any);
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

async function onDelete(row: Row) {
  Modal.confirm({
    title: '确认删除',
    content: '是否确认删除该条记录？',
    async onOk() {
      await delCraftsmanship(row.craftsmanshipId as any);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
const editForm = reactive<Partial<Row>>({});

function openAdd() {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  (editForm as any).name = '';
  (editForm as any).sort = 0;
  editOpen.value = true;
}

async function openEdit(row: Row) {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  const detail = await getCraftsmanship(row.craftsmanshipId as any);
  editForm.craftsmanshipId = detail.craftsmanshipId;
  editForm.name = detail.name;
  editForm.sort = detail.sort;
  editOpen.value = true;
}

async function submitEdit() {
  await (editForm.craftsmanshipId ? updateCraftsmanship(editForm as any) : addCraftsmanship(editForm as any));
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed(() => [
  { title: '名称', dataIndex: 'name' },
  { title: '排序', dataIndex: 'sort' },
  { title: '描述', dataIndex: 'description' },
  { title: '添加时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action', width: 200 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell table-title="工艺" :show-column-setting="false" @search="doSearch" @reset="resetQuery"
      @refresh="fetchList"
      class_type_options>
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="name" label="名称" class="!mb-0">
              <Input v-model:value="query.name" allow-clear placeholder="请输入名称" @press-enter="doSearch" />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增
        </Button>
        <Button danger :disabled="selectedRowKeys.length === 0" @click="onBatchDelete">删除</Button>
      </template>

      <SystemProTable row-key="craftsmanshipId" class="system-pro-table" :row-selection="rowSelection"
        :loading="loading" :columns="columns" :data-source="rows" :scroll="{ x: 1200 }" :pagination="{
          current: query.pageNum,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number) => `共 ${t} 条`,
          onChange: (page: number, pageSize: number) => {
            query.pageNum = page;
            query.pageSize = pageSize;
            fetchList();
          },
        }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asRow(record))">修改</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asRow(record))">删除</Button>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'deleteTime'">
            <span>{{ asRow(record).deleteTime ?? '—' }}</span>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>

    <Modal v-model:open="editOpen" :title="editForm.craftsmanshipId ? '修改工艺' : '新增工艺'" @ok="submitEdit">
      <Form layout="vertical">
        <FormItem label="名称">
          <Input v-model:value="(editForm as any).name" placeholder="请输入名称" />
        </FormItem>
        <FormItem label="排序">
          <Input v-model:value="(editForm as any).sort" placeholder="请输入排序" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
