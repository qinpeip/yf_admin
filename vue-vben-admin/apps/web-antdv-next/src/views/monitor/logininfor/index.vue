<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, reactive, ref } from 'vue';

import { SystemProShell, SystemProTable } from '#/components/system-pro';

import { Button, DatePicker, Form, FormItem, Input, message, Modal, Select, Tag } from 'antdv-next';

import { cleanLogininfor, delLogininfor, exportLogininfor, listLogininfor } from '#/api';

type LoginRow = {
  infoId: number;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  os?: string;
  browser?: string;
  status?: string;
  msg?: string;
  loginTime?: string;
};

const loading = ref(false);
const rows = ref<LoginRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  userName: '',
  status: undefined as undefined | string,
  dateRange: undefined as [string, string] | undefined,
});

const statusOptions = [
  { label: '成功', value: '0' },
  { label: '失败', value: '1' },
];

function asLoginRow(x: any): LoginRow {
  return x as LoginRow;
}

function listParams() {
  const p: Record<string, any> = {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    ipaddr: query.ipaddr || undefined,
    userName: query.userName || undefined,
    status: query.status,
  };
  if (query.dateRange?.[0] && query.dateRange?.[1]) {
    p['params[beginTime]'] = query.dateRange[0];
    p['params[endTime]'] = query.dateRange[1];
  }
  return p;
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listLogininfor(listParams());
    rows.value = (data?.list ?? []) as any;
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.ipaddr = '';
  query.userName = '';
  query.status = undefined;
  query.dateRange = undefined;
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

const selectedRowKeys = ref<number[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys as number[];
  },
}));

async function onBatchDelete() {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择记录');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `将删除 ${selectedRowKeys.value.length} 条登录日志，确认？`,
    async onOk() {
      await delLogininfor(selectedRowKeys.value);
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

async function handleExport() {
  const beginTime = query.dateRange?.[0];
  const endTime = query.dateRange?.[1];
  const blob = (await exportLogininfor({
    ipaddr: query.ipaddr || undefined,
    userName: query.userName || undefined,
    status: query.status,
    ...(beginTime && endTime ? { params: { beginTime, endTime } } : {}),
  })) as Blob;
  downloadFileFromBlob({ fileName: `logininfor_${Date.now()}.xlsx`, source: blob });
}

async function onDelete(row: LoginRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除访问编号「${row.infoId}」？`,
    async onOk() {
      await delLogininfor(row.infoId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

async function onClean() {
  Modal.confirm({
    title: '确认清空',
    content: '是否确认清空所有登录日志？',
    async onOk() {
      await cleanLogininfor();
      message.success('清空成功');
      await fetchList();
    },
  });
}

const columns = computed<any[]>(() => [
  { title: '访问编号', dataIndex: 'infoId', width: 100 },
  { title: '用户账号', dataIndex: 'userName', width: 160 },
  { title: '地址', dataIndex: 'ipaddr', width: 140 },
  { title: '登录地点', dataIndex: 'loginLocation', width: 160 },
  { title: '操作系统', dataIndex: 'os', width: 140 },
  { title: '浏览器', dataIndex: 'browser', width: 140 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '描述', dataIndex: 'msg' },
  { title: '访问时间', dataIndex: 'loginTime', width: 180 },
  { title: '操作', key: 'action', width: 120 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="登录日志"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FormItem name="ipaddr" label="登录地址" class="!mb-0">
              <Input v-model:value="query.ipaddr" allow-clear placeholder="登录地址" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="userName" label="用户账号" class="!mb-0">
              <Input v-model:value="query.userName" allow-clear placeholder="用户账号" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="status" label="状态" class="!mb-0">
              <Select v-model:value="query.status" allow-clear placeholder="状态" class="w-full" :options="statusOptions" />
            </FormItem>
            <FormItem name="dateRange" label="访问时间" class="!mb-0 lg:col-span-2">
              <DatePicker.RangePicker v-model:value="query.dateRange" class="w-full" value-format="YYYY-MM-DD" />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button @click="handleExport">导出</Button>
        <Button danger :disabled="!selectedRowKeys.length" @click="onBatchDelete">删除</Button>
        <Button danger @click="onClean">清空</Button>
      </template>

      <SystemProTable
        row-key="infoId"
        class="system-pro-table"
        :row-selection="rowSelection"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        :scroll="{ x: 1400 }"
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
          <template v-if="column.dataIndex === 'status'">
            <Tag v-if="asLoginRow(record).status === '0'" color="success">成功</Tag>
            <Tag v-else color="error">失败</Tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <Button type="link" size="small" danger class="!px-1" @click="onDelete(asLoginRow(record))">删除</Button>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>
  </Page>
</template>

