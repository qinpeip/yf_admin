<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { SystemProShell, SystemProTable } from '#/components/system-pro';

import { Button, Form, FormItem, Input, message, Modal, Table, Tabs, TabPane } from 'antdv-next';

import {
  batchGenCodeZip,
  importGenTable,
  listGenDbTable,
  listGenTable,
  previewGenCode,
  removeGenTable,
  synchGenTable,
} from '#/api';

const router = useRouter();

const loading = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  tableNames: '',
  tableComment: '',
});

const selectedKeys = ref<number[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedKeys.value = keys as number[];
  },
}));

async function fetchList() {
  loading.value = true;
  try {
    const data = await listGenTable({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      tableNames: query.tableNames || undefined,
      tableComment: query.tableComment || undefined,
    });
    rows.value = (data?.list ?? []) as any;
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.tableNames = '';
  query.tableComment = '';
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

// --- 导入 ---
const importOpen = ref(false);
const dbLoading = ref(false);
const dbRows = ref<any[]>([]);
const dbTotal = ref(0);
const dbQuery = reactive({ pageNum: 1, pageSize: 10, tableName: '', tableComment: '' });
const dbSelected = ref<string[]>([]);

async function fetchDb() {
  dbLoading.value = true;
  try {
    const data = await listGenDbTable({
      pageNum: dbQuery.pageNum,
      pageSize: dbQuery.pageSize,
      tableName: dbQuery.tableName || undefined,
      tableComment: dbQuery.tableComment || undefined,
    });
    dbRows.value = (data?.list ?? []) as any;
    dbTotal.value = Number(data?.total ?? 0);
  } finally {
    dbLoading.value = false;
  }
}

function openImport() {
  importOpen.value = true;
  dbSelected.value = [];
  dbQuery.pageNum = 1;
  fetchDb();
}

const dbRowSelection = computed(() => ({
  selectedRowKeys: dbSelected.value,
  onChange: (keys: (string | number)[]) => {
    dbSelected.value = keys as string[];
  },
}));

async function submitImport() {
  if (!dbSelected.value.length) {
    message.warning('请选择数据表');
    return;
  }
  await importGenTable(dbSelected.value.join(','));
  message.success('导入成功');
  importOpen.value = false;
  await fetchList();
}

// --- 预览 ---
const previewOpen = ref(false);
const previewMap = ref<Record<string, string>>({});

async function openPreview(row: any) {
  const data = await previewGenCode(row.tableId);
  const map = (data as any)?.data ?? data;
  previewMap.value = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
  previewOpen.value = true;
}

function openEdit(row: any) {
  router.push(`/tool/gen-edit/index/${row.tableId}`);
}

async function onSync(row: any) {
  Modal.confirm({
    title: '同步表结构',
    content: `从数据库同步「${row.tableName}」的字段到生成配置？`,
    async onOk() {
      await synchGenTable(row.tableName);
      message.success('同步成功');
      await fetchList();
    },
  });
}

async function onRemove(row: any) {
  Modal.confirm({
    title: '确认删除',
    content: `删除生成配置「${row.tableName}」？`,
    async onOk() {
      await removeGenTable(row.tableId);
      message.success('已删除');
      await fetchList();
    },
  });
}

async function onGenZip(names: string) {
  if (!names) {
    message.warning('请选择表');
    return;
  }
  const blob = await batchGenCodeZip(names);
  downloadFileFromBlob({ fileName: `gen_${Date.now()}.zip`, source: blob });
}

async function batchGenSelected() {
  const names = rows.value.filter((r) => selectedKeys.value.includes(r.tableId)).map((r) => r.tableName);
  if (!names.length) {
    message.warning('请选择记录');
    return;
  }
  await onGenZip(names.join(','));
}

const columns = computed<any[]>(() => [
  { title: '表编号', dataIndex: 'tableId', width: 90 },
  { title: '表名称', dataIndex: 'tableName', width: 200 },
  { title: '表描述', dataIndex: 'tableComment' },
  { title: '实体类名', dataIndex: 'className', width: 160 },
  { title: '操作', key: 'action', width: 320 },
]);

const dbColumns = computed<any[]>(() => [
  { title: '表名', dataIndex: 'tableName' },
  { title: '注释', dataIndex: 'tableComment' },
]);

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="代码生成"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <Form :model="query" class="contents">
            <FormItem name="tableNames" label="表名称" class="!mb-0">
              <Input v-model:value="query.tableNames" allow-clear placeholder="表名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="tableComment" label="表描述" class="!mb-0">
              <Input v-model:value="query.tableComment" allow-clear placeholder="表描述" @press-enter="doSearch" />
            </FormItem>
          </Form>
        </div>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openImport">
          <Plus class="mr-1 inline size-4" />
          导入表
        </Button>
        <Button @click="batchGenSelected">生成代码</Button>
      </template>

      <SystemProTable
        row-key="tableId"
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
          onChange: (p, ps) => {
            query.pageNum = p;
            query.pageSize = ps;
            fetchList();
          },
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openPreview(record)">预览</Button>
              <Button type="link" size="small" class="!px-1" @click="openEdit(record)">编辑</Button>
              <Button type="link" size="small" class="!px-1" @click="onSync(record)">同步</Button>
              <Button type="link" size="small" class="!px-1" @click="onGenZip(record.tableName)">生成</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onRemove(record)">删除</Button>
            </div>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>

    <Modal v-model:open="importOpen" title="导入表" width="900px" @ok="submitImport">
      <Form layout="inline" class="mb-3">
        <FormItem label="表名">
          <Input v-model:value="dbQuery.tableName" allow-clear style="width: 160px" />
        </FormItem>
        <FormItem label="注释">
          <Input v-model:value="dbQuery.tableComment" allow-clear style="width: 160px" />
        </FormItem>
        <Button type="primary" @click="() => { dbQuery.pageNum = 1; fetchDb(); }">搜索</Button>
      </Form>
      <Table
        row-key="tableName"
        :row-selection="dbRowSelection"
        :loading="dbLoading"
        :columns="dbColumns"
        :data-source="dbRows"
        :pagination="{
          current: dbQuery.pageNum,
          pageSize: dbQuery.pageSize,
          total: dbTotal,
          showSizeChanger: true,
          onChange: (p, ps) => {
            dbQuery.pageNum = p;
            dbQuery.pageSize = ps;
            fetchDb();
          },
        }"
      />
    </Modal>

    <Modal v-model:open="previewOpen" title="代码预览" width="1000px" :footer="null">
      <Tabs>
        <TabPane v-for="(text, key) in previewMap" :key="key" :tab="key">
          <pre class="max-h-[480px] overflow-auto rounded bg-gray-50 p-3 text-xs">{{ text }}</pre>
        </TabPane>
      </Tabs>
    </Modal>
  </Page>
</template>
