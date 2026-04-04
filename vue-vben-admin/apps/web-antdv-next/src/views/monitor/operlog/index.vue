<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, reactive, ref } from 'vue';

import { SystemProShell } from '#/components/system-pro';

import { Button, DatePicker, Form, FormItem, Input, message, Modal, Select, Table, Tag } from 'antdv-next';

import { cleanOperlog, delOperlog, exportOperlog, listOperlog } from '#/api';

type OperRow = {
  operId: number;
  title?: string;
  businessType?: number;
  operName?: string;
  operIp?: string;
  status?: string;
  operTime?: string;
  costTime?: number;
  operLocation?: string;
  operUrl?: string;
  requestMethod?: string;
  method?: string;
  operParam?: string;
  jsonResult?: string;
  errorMsg?: string;
};

const loading = ref(false);
const rows = ref<OperRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  operName: '',
  status: undefined as undefined | string,
  businessType: undefined as undefined | number,
  dateRange: undefined as [string, string] | undefined,
});

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '失败', value: '1' },
];

const businessTypeOptions = [
  { label: '其它', value: 0 },
  { label: '新增', value: 1 },
  { label: '修改', value: 2 },
  { label: '删除', value: 3 },
  { label: '授权', value: 4 },
  { label: '导出', value: 5 },
  { label: '导入', value: 6 },
  { label: '强退', value: 7 },
  { label: '生成代码', value: 8 },
  { label: '清空数据', value: 9 },
];

function asOperRow(x: any): OperRow {
  return x as OperRow;
}

function listParams() {
  const p: Record<string, any> = {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    title: query.title || undefined,
    operName: query.operName || undefined,
    status: query.status,
    businessType: query.businessType,
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
    const data = await listOperlog(listParams() as any);
    rows.value = (data?.list ?? []) as any;
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.title = '';
  query.operName = '';
  query.status = undefined;
  query.businessType = undefined;
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
    message.warning('请选择日志');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `将删除 ${selectedRowKeys.value.length} 条操作日志，确认？`,
    async onOk() {
      await Promise.all(selectedRowKeys.value.map((id) => delOperlog(id)));
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

async function handleExport() {
  const beginTime = query.dateRange?.[0];
  const endTime = query.dateRange?.[1];
  const blob = (await exportOperlog({
    title: query.title || undefined,
    operName: query.operName || undefined,
    status: query.status,
    businessType: query.businessType,
    ...(beginTime && endTime ? { params: { beginTime, endTime } } : {}),
  })) as Blob;
  downloadFileFromBlob({ fileName: `operlog_${Date.now()}.xlsx`, source: blob });
}

async function onDelete(row: OperRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除日志「${row.operId}」？`,
    async onOk() {
      await delOperlog(row.operId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

async function onClean() {
  Modal.confirm({
    title: '确认清空',
    content: '是否确认清空所有操作日志？',
    async onOk() {
      await cleanOperlog();
      message.success('清空成功');
      await fetchList();
    },
  });
}

const viewOpen = ref(false);
const viewRow = ref<OperRow | null>(null);
function openView(row: OperRow) {
  viewRow.value = row;
  viewOpen.value = true;
}

const columns = computed<any[]>(() => [
  { title: '日志编号', dataIndex: 'operId', width: 100 },
  { title: '系统模块', dataIndex: 'title', width: 200 },
  { title: '操作人员', dataIndex: 'operName', width: 140 },
  { title: '主机', dataIndex: 'operIp', width: 140 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '操作日期', dataIndex: 'operTime', width: 180 },
  { title: '耗时(ms)', dataIndex: 'costTime', width: 110 },
  { title: '操作', key: 'action', width: 160 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="操作日志"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FormItem name="title" label="系统模块" class="!mb-0">
              <Input v-model:value="query.title" allow-clear placeholder="系统模块" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="operName" label="操作人员" class="!mb-0">
              <Input v-model:value="query.operName" allow-clear placeholder="操作人员" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="businessType" label="类型" class="!mb-0">
              <Select
                v-model:value="query.businessType"
                allow-clear
                placeholder="业务类型"
                class="w-full"
                :options="businessTypeOptions"
              />
            </FormItem>
            <FormItem name="status" label="状态" class="!mb-0">
              <Select v-model:value="query.status" allow-clear placeholder="状态" class="w-full" :options="statusOptions" />
            </FormItem>
            <FormItem name="dateRange" label="操作时间" class="!mb-0 lg:col-span-2">
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

      <Table
        row-key="operId"
        class="system-pro-table"
        :row-selection="rowSelection"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        size="middle"
        :scroll="{ x: 1200 }"
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
            <Tag v-if="asOperRow(record).status === '0'" color="success">正常</Tag>
            <Tag v-else color="error">失败</Tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openView(asOperRow(record))">详情</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asOperRow(record))">删除</Button>
            </div>
          </template>
        </template>
      </Table>
    </SystemProShell>

    <Modal v-model:open="viewOpen" title="操作日志详情" :footer="null" width="820px">
      <div v-if="viewRow" class="space-y-2">
        <div><b>模块</b>：{{ viewRow.title }}</div>
        <div><b>登录信息</b>：{{ viewRow.operName }} / {{ viewRow.operIp }} / {{ viewRow.operLocation }}</div>
        <div><b>请求地址</b>：{{ viewRow.operUrl }}</div>
        <div><b>请求方式</b>：{{ viewRow.requestMethod }}</div>
        <div><b>操作方法</b>：{{ viewRow.method }}</div>
        <div><b>请求参数</b>：{{ viewRow.operParam }}</div>
        <div><b>返回参数</b>：{{ viewRow.jsonResult }}</div>
        <div><b>状态</b>：{{ viewRow.status }}</div>
        <div><b>耗时</b>：{{ viewRow.costTime }} ms</div>
        <div><b>操作时间</b>：{{ viewRow.operTime }}</div>
        <div v-if="viewRow.errorMsg"><b>异常</b>：{{ viewRow.errorMsg }}</div>
      </div>
    </Modal>
  </Page>
</template>

