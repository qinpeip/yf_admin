<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { SystemProShell } from '#/components/system-pro';

import {
  Button,
  DatePicker,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Table,
} from 'antdv-next';

import {
  cleanJobLog,
  exportJobLog,
  getJob,
  listJobLog,
  removeJobLog,
} from '#/api';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const selectedKeys = ref<number[]>([]);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  jobGroup: '',
  status: undefined as undefined | string,
});

const dateRange = ref<[string, string] | null>(null);

const statusOptions = [
  { label: '成功', value: '0' },
  { label: '失败', value: '1' },
];

const detailOpen = ref(false);
const detailRow = ref<any>(null);

const columns = computed(() => [
  { title: '日志编号', dataIndex: 'jobLogId', width: 100 },
  { title: '任务名称', dataIndex: 'jobName', width: 160 },
  { title: '任务组', dataIndex: 'jobGroup', width: 100 },
  { title: '调用目标', dataIndex: 'invokeTarget' },
  { title: '日志信息', dataIndex: 'jobMessage', width: 160 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '执行时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 90 },
]);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedKeys.value = keys.map((k) => Number(k));
  },
}));

function buildListParams() {
  const p: Record<string, any> = {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    jobName: query.jobName || undefined,
    jobGroup: query.jobGroup || undefined,
    status: query.status,
  };
  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    p['params[beginTime]'] = dateRange.value[0];
    p['params[endTime]'] = dateRange.value[1];
  }
  return p;
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listJobLog(buildListParams());
    rows.value = data.list ?? [];
    total.value = Number(data.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

function resetQuery() {
  query.pageNum = 1;
  query.jobName = '';
  query.jobGroup = '';
  query.status = undefined;
  dateRange.value = null;
  fetchList();
}

function goBack() {
  router.push('/monitor/job');
}

function openDetail(row: any) {
  detailRow.value = row;
  detailOpen.value = true;
}

async function handleExport() {
  const body: any = {
    jobName: query.jobName || undefined,
    jobGroup: query.jobGroup || undefined,
    status: query.status,
  };
  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    body.params = { beginTime: dateRange.value[0], endTime: dateRange.value[1] };
  }
  const blob = (await exportJobLog(body)) as Blob;
  downloadFileFromBlob({ fileName: `job_log_${Date.now()}.xlsx`, source: blob });
}

async function handleDelete() {
  if (!selectedKeys.value.length) return;
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除选中的 ${selectedKeys.value.length} 条调度日志？`,
    async onOk() {
      await removeJobLog(selectedKeys.value);
      message.success('删除成功');
      selectedKeys.value = [];
      await fetchList();
    },
  });
}

async function handleClean() {
  Modal.confirm({
    title: '确认清空',
    content: '是否清空全部调度日志？',
    async onOk() {
      await cleanJobLog();
      message.success('已清空');
      await fetchList();
    },
  });
}

onMounted(async () => {
  const jobId = route.params.jobId;
  if (jobId !== undefined && jobId !== '' && jobId !== '0') {
    try {
      const job = await getJob(Number(jobId));
      const j = job as any;
      query.jobName = j?.jobName ?? '';
      query.jobGroup = j?.jobGroup ?? '';
    } catch {
      /* 任务可能已删，仍可查日志 */
    }
  }
  await fetchList();
});
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="调度日志"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <FormItem label="任务名称" class="!mb-0">
            <Input v-model:value="query.jobName" allow-clear placeholder="任务名称" @press-enter="doSearch" />
          </FormItem>
          <FormItem label="任务组名" class="!mb-0">
            <Input v-model:value="query.jobGroup" allow-clear placeholder="任务组名" @press-enter="doSearch" />
          </FormItem>
          <FormItem label="执行状态" class="!mb-0">
            <Select v-model:value="query.status" allow-clear placeholder="状态" class="w-full" :options="statusOptions" />
          </FormItem>
          <FormItem label="执行时间" class="!mb-0 lg:col-span-2">
            <DatePicker.RangePicker v-model:value="dateRange" class="w-full" value-format="YYYY-MM-DD" />
          </FormItem>
        </div>
      </template>

      <template #toolbar-actions>
        <Button danger :disabled="!selectedKeys.length" @click="handleDelete">删除</Button>
        <Button danger @click="handleClean">清空</Button>
        <Button @click="handleExport">导出</Button>
        <Button @click="goBack">关闭</Button>
      </template>

      <Table
        row-key="jobLogId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        size="middle"
        :row-selection="rowSelection"
        :scroll="{ x: 1200 }"
        :pagination="{
          current: query.pageNum,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            query.pageNum = p;
            query.pageSize = ps;
            fetchList();
          },
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            {{ record.status === '0' || record.status === 0 ? '成功' : '失败' }}
          </template>
          <template v-else-if="column.key === 'action'">
            <Button type="link" size="small" class="!px-1" @click="openDetail(record)">详细</Button>
          </template>
        </template>
      </Table>
    </SystemProShell>

    <Modal v-model:open="detailOpen" title="调度日志详细" width="720px" :footer="null">
      <Form v-if="detailRow" layout="vertical" class="max-w-full">
        <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
          <FormItem label="日志序号">
            <span>{{ detailRow.jobLogId }}</span>
          </FormItem>
          <FormItem label="执行时间">
            <span>{{ detailRow.createTime }}</span>
          </FormItem>
          <FormItem label="任务名称">
            <span>{{ detailRow.jobName }}</span>
          </FormItem>
          <FormItem label="任务分组">
            <span>{{ detailRow.jobGroup }}</span>
          </FormItem>
        </div>
        <FormItem label="调用方法">
          <span class="break-all">{{ detailRow.invokeTarget }}</span>
        </FormItem>
        <FormItem label="日志信息">
          <span class="break-all">{{ detailRow.jobMessage }}</span>
        </FormItem>
        <FormItem label="执行状态">
          <span>{{ detailRow.status === '0' || detailRow.status === 0 ? '成功' : '失败' }}</span>
        </FormItem>
        <FormItem v-if="detailRow.status === '1' || detailRow.status === 1" label="异常信息">
          <span class="break-all text-red-600">{{ detailRow.exceptionInfo }}</span>
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
