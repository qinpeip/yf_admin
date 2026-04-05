<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, reactive, ref } from 'vue';

import { SystemProShell, SystemProTable } from '#/components/system-pro';

import { Button, Form, FormItem, Input, message, Modal, Select, TextArea } from 'antdv-next';

import { addConfig, delConfig, exportConfig, listConfig, refreshConfigCache, updateConfig } from '#/api';

type ConfigRow = {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType?: string;
  remark?: string;
  createTime?: string;
};

const loading = ref(false);
const rows = ref<ConfigRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  configName: '',
  configKey: '',
});

function asConfigRow(x: any): ConfigRow {
  return x as ConfigRow;
}

const typeOptions = [
  { label: '是', value: 'Y' },
  { label: '否', value: 'N' },
];

const selectedRowKeys = ref<number[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

async function onBatchDelete() {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择要删除的参数');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除选中的 ${selectedRowKeys.value.length} 条参数？`,
    async onOk() {
      await delConfig(selectedRowKeys.value);
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

async function handleExport() {
  const blob = (await exportConfig({
    configName: query.configName || undefined,
    configKey: query.configKey || undefined,
  })) as Blob;
  downloadFileFromBlob({ fileName: `config_${Date.now()}.xlsx`, source: blob });
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listConfig({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      configName: query.configName || undefined,
      configKey: query.configKey || undefined,
    });
    rows.value = (data?.list ?? []) as any;
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.configName = '';
  query.configKey = '';
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onDelete(row: ConfigRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除参数「${row.configName}」？`,
    async onOk() {
      await delConfig(row.configId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

async function onRefreshCache() {
  await refreshConfigCache();
  message.success('缓存已刷新');
}

const editOpen = ref(false);
const editForm = reactive<Partial<ConfigRow> & { configType?: string }>({
  configId: undefined,
  configName: '',
  configKey: '',
  configValue: '',
  configType: 'Y',
  remark: '',
});

function openAdd() {
  Object.assign(editForm, {
    configId: undefined,
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'Y',
    remark: '',
  });
  editOpen.value = true;
}

function openEdit(row: ConfigRow) {
  Object.assign(editForm, row);
  editOpen.value = true;
}

async function submitEdit() {
  if (!editForm.configName || !editForm.configKey) {
    message.warning('请填写参数名称/参数键名');
    return;
  }
  if (!editForm.configType) {
    message.warning('请选择系统内置');
    return;
  }
  if (editForm.configId) {
    await updateConfig(editForm);
  } else {
    await addConfig(editForm);
  }
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed<any[]>(() => [
  { title: '参数编号', dataIndex: 'configId', width: 100 },
  { title: '参数名称', dataIndex: 'configName', width: 200 },
  { title: '参数键名', dataIndex: 'configKey', width: 220 },
  { title: '参数键值', dataIndex: 'configValue' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 180 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="参数列表"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="configName" label="参数名称" class="!mb-0">
              <Input v-model:value="query.configName" allow-clear placeholder="请输入参数名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="configKey" label="参数键名" class="!mb-0">
              <Input v-model:value="query.configKey" allow-clear placeholder="请输入参数键名" @press-enter="doSearch" />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增参数
        </Button>
        <Button danger :disabled="!selectedRowKeys.length" @click="onBatchDelete">删除</Button>
        <Button @click="handleExport">导出</Button>
        <Button @click="onRefreshCache">刷新缓存</Button>
      </template>

      <SystemProTable
        row-key="configId"
        class="system-pro-table"
        :row-selection="rowSelection"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        :pagination="{
          current: query.pageNum,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, pageSize) => {
            query.pageNum = page;
            query.pageSize = pageSize;
            fetchList();
          },
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asConfigRow(record))">修改</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asConfigRow(record))">删除</Button>
            </div>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>

    <Modal v-model:open="editOpen" :title="editForm.configId ? '修改参数' : '新增参数'" @ok="submitEdit">
      <Form layout="vertical">
        <FormItem label="参数名称">
          <Input v-model:value="(editForm.configName as any)" placeholder="请输入参数名称" />
        </FormItem>
        <FormItem label="参数键名">
          <Input v-model:value="(editForm.configKey as any)" placeholder="请输入参数键名" />
        </FormItem>
        <FormItem label="参数键值">
          <Input v-model:value="(editForm.configValue as any)" placeholder="请输入参数键值" />
        </FormItem>
        <FormItem label="系统内置">
          <Select v-model:value="(editForm.configType as any)" :options="typeOptions" placeholder="是否内置" />
        </FormItem>
        <FormItem label="备注">
          <TextArea v-model:value="(editForm.remark as any)" :rows="3" placeholder="请输入备注" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

