<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

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
  Space,
  Switch,
  Table,
} from 'antdv-next';

import {
  addJob,
  changeJobStatus,
  cleanJobLog,
  exportJob,
  exportJobLog,
  getJob,
  listJob,
  listJobLog,
  removeJob,
  runJob,
  updateJob,
} from '#/api';

const router = useRouter();

type JobRow = {
  jobId: number;
  jobName: string;
  jobGroup?: string;
  invokeTarget?: string;
  cronExpression?: string;
  misfirePolicy?: string;
  concurrent?: string;
  status?: string;
  createTime?: string;
};

const loading = ref(false);
const rows = ref<JobRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  jobGroup: '',
  status: undefined as undefined | string,
});

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '暂停', value: '1' },
];

const misfireOptions = [
  { label: '立即执行', value: '1' },
  { label: '执行一次', value: '2' },
  { label: '放弃执行', value: '3' },
];

const concurrentOptions = [
  { label: '允许', value: '0' },
  { label: '禁止', value: '1' },
];

function asJobRow(x: any): JobRow {
  return x as JobRow;
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listJob({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      jobName: query.jobName || undefined,
      jobGroup: query.jobGroup || undefined,
      status: query.status,
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
  query.jobName = '';
  query.jobGroup = '';
  query.status = undefined;
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onDelete(row: JobRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除任务「${row.jobName}」？`,
    async onOk() {
      await removeJob(row.jobId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

async function onRun(row: JobRow) {
  Modal.confirm({
    title: '确认执行',
    content: `确认要立即执行一次「${row.jobName}」吗？`,
    async onOk() {
      await runJob(row.jobId);
      message.success('执行成功');
    },
  });
}

async function onToggleStatus(row: JobRow) {
  const next = row.status === '0' ? '1' : '0';
  const text = next === '0' ? '启用' : '暂停';
  Modal.confirm({
    title: `确认${text}`,
    content: `确认要${text}任务「${row.jobName}」吗？`,
    async onOk() {
      await changeJobStatus(row.jobId, next);
      row.status = next;
      message.success(`${text}成功`);
    },
  });
}

async function handleExport() {
  const blob = (await exportJob({
    jobName: query.jobName || undefined,
    jobGroup: query.jobGroup || undefined,
    status: query.status,
  })) as Blob;
  downloadFileFromBlob({ fileName: `job_${Date.now()}.xlsx`, source: blob });
}

// --- 新增/编辑 ---
const editOpen = ref(false);
const editLoading = ref(false);
const editForm = reactive<any>({
  jobId: undefined,
  jobName: '',
  jobGroup: 'DEFAULT',
  invokeTarget: '',
  cronExpression: '',
  misfirePolicy: '3',
  concurrent: '1',
  status: '0',
});

function resetEditForm() {
  Object.assign(editForm, {
    jobId: undefined,
    jobName: '',
    jobGroup: 'DEFAULT',
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: '3',
    concurrent: '1',
    status: '0',
  });
}

async function openAdd() {
  resetEditForm();
  editOpen.value = true;
}

async function openEdit(row: JobRow) {
  editLoading.value = true;
  editOpen.value = true;
  try {
    const data = await getJob(row.jobId);
    const j = (data as any)?.data ?? data;
    Object.assign(editForm, j);
  } finally {
    editLoading.value = false;
  }
}

async function submitEdit() {
  if (!editForm.jobName || !editForm.invokeTarget || !editForm.cronExpression) {
    message.warning('请填写任务名称、调用目标与 Cron 表达式');
    return;
  }
  editLoading.value = true;
  try {
    if (editForm.jobId) {
      await updateJob({ ...editForm });
    } else {
      await addJob({ ...editForm });
    }
    message.success('保存成功');
    editOpen.value = false;
    await fetchList();
  } finally {
    editLoading.value = false;
  }
}

// --- 调度日志 ---
const logOpen = ref(false);
const logLoading = ref(false);
const logRows = ref<any[]>([]);
const logTotal = ref(0);
const logQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  jobGroup: '',
  status: undefined as undefined | string,
});
const logDateRange = ref<[string, string] | null>(null);

async function fetchJobLogs() {
  logLoading.value = true;
  try {
    const p: any = {
      pageNum: logQuery.pageNum,
      pageSize: logQuery.pageSize,
      jobName: logQuery.jobName || undefined,
      jobGroup: logQuery.jobGroup || undefined,
      status: logQuery.status,
    };
    if (logDateRange.value?.[0] && logDateRange.value?.[1]) {
      p['params[beginTime]'] = logDateRange.value[0];
      p['params[endTime]'] = logDateRange.value[1];
    }
    const data = await listJobLog(p);
    logRows.value = (data?.list ?? []) as any;
    logTotal.value = Number(data?.total ?? 0);
  } finally {
    logLoading.value = false;
  }
}

function openJobLogs() {
  logOpen.value = true;
  logQuery.pageNum = 1;
  fetchJobLogs();
}

async function handleExportJobLog() {
  const body: any = {
    jobName: logQuery.jobName || undefined,
    jobGroup: logQuery.jobGroup || undefined,
    status: logQuery.status,
  };
  if (logDateRange.value?.[0] && logDateRange.value?.[1]) {
    body.params = { beginTime: logDateRange.value[0], endTime: logDateRange.value[1] };
  }
  const blob = (await exportJobLog(body)) as Blob;
  downloadFileFromBlob({ fileName: `job_log_${Date.now()}.xlsx`, source: blob });
}

async function onCleanJobLog() {
  Modal.confirm({
    title: '确认清空',
    content: '是否清空全部调度日志？',
    async onOk() {
      await cleanJobLog();
      message.success('已清空');
      await fetchJobLogs();
    },
  });
}

const columns = computed<any[]>(() => [
  { title: '任务编号', dataIndex: 'jobId', width: 100 },
  { title: '任务名称', dataIndex: 'jobName', width: 200 },
  { title: '任务组名', dataIndex: 'jobGroup', width: 120 },
  { title: '调用目标', dataIndex: 'invokeTarget' },
  { title: 'cron', dataIndex: 'cronExpression', width: 180 },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '操作', key: 'action', width: 340 },
]);

const logColumns = computed<any[]>(() => [
  { title: '日志编号', dataIndex: 'jobLogId', width: 100 },
  { title: '任务名称', dataIndex: 'jobName', width: 160 },
  { title: '任务组', dataIndex: 'jobGroup', width: 100 },
  { title: '调用目标', dataIndex: 'invokeTarget' },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '执行时间', dataIndex: 'createTime', width: 180 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="定时任务列表"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <FormItem label="任务名称" class="!mb-0">
            <Input v-model:value="query.jobName" allow-clear placeholder="任务名称" @press-enter="doSearch" />
          </FormItem>
          <FormItem label="任务组名" class="!mb-0">
            <Input v-model:value="query.jobGroup" allow-clear placeholder="任务组名" @press-enter="doSearch" />
          </FormItem>
          <FormItem label="状态" class="!mb-0">
            <Select v-model:value="query.status" allow-clear placeholder="状态" class="w-full" :options="statusOptions" />
          </FormItem>
        </div>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增任务
        </Button>
        <Button @click="handleExport">导出</Button>
        <Button @click="openJobLogs">调度日志</Button>
      </template>

      <Table
        row-key="jobId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        size="middle"
        :scroll="{ x: 1100 }"
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
            <Switch
              :checked="asJobRow(record).status === '0'"
              checked-children="正常"
              un-checked-children="暂停"
              @change="() => onToggleStatus(asJobRow(record))"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asJobRow(record))">修改</Button>
              <Button
                type="link"
                size="small"
                class="!px-1"
                @click="router.push(`/monitor/job-log/index/${asJobRow(record).jobId}`)"
              >
                日志
              </Button>
              <Button type="link" size="small" class="!px-1" @click="onRun(asJobRow(record))">执行一次</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asJobRow(record))">删除</Button>
            </div>
          </template>
        </template>
      </Table>
    </SystemProShell>

    <Modal
      v-model:open="editOpen"
      :title="editForm.jobId ? '修改任务' : '新增任务'"
      width="640px"
      :confirm-loading="editLoading"
      @ok="submitEdit"
    >
      <Form layout="vertical">
        <FormItem label="任务名称">
          <Input v-model:value="editForm.jobName" />
        </FormItem>
        <FormItem label="任务组名">
          <Input v-model:value="editForm.jobGroup" />
        </FormItem>
        <FormItem label="调用目标">
          <Input v-model:value="editForm.invokeTarget" placeholder="如：TaskService.run('param')" />
        </FormItem>
        <FormItem label="Cron 表达式">
          <Input v-model:value="editForm.cronExpression" />
        </FormItem>
        <FormItem label="错误策略">
          <Select v-model:value="editForm.misfirePolicy" :options="misfireOptions" />
        </FormItem>
        <FormItem label="并发">
          <Select v-model:value="editForm.concurrent" :options="concurrentOptions" />
        </FormItem>
        <FormItem v-if="!editForm.jobId" label="状态">
          <Select v-model:value="editForm.status" :options="statusOptions" />
        </FormItem>
      </Form>
    </Modal>

    <Modal v-model:open="logOpen" title="调度日志" width="1000px" :footer="null">
      <Form layout="inline" class="mb-3">
        <FormItem label="任务名称">
          <Input v-model:value="logQuery.jobName" allow-clear style="width: 160px" />
        </FormItem>
        <FormItem label="任务组">
          <Input v-model:value="logQuery.jobGroup" allow-clear style="width: 120px" />
        </FormItem>
        <FormItem label="状态">
          <Select v-model:value="logQuery.status" allow-clear style="width: 100px" :options="statusOptions" />
        </FormItem>
        <FormItem label="时间">
          <DatePicker.RangePicker v-model:value="logDateRange" value-format="YYYY-MM-DD" />
        </FormItem>
        <FormItem>
          <Space>
            <Button type="primary" @click="() => { logQuery.pageNum = 1; fetchJobLogs(); }">搜索</Button>
            <Button @click="handleExportJobLog">导出</Button>
            <Button danger @click="onCleanJobLog">清空</Button>
          </Space>
        </FormItem>
      </Form>
      <Table
        row-key="jobLogId"
        size="small"
        :loading="logLoading"
        :columns="logColumns"
        :data-source="logRows"
        :pagination="{
          current: logQuery.pageNum,
          pageSize: logQuery.pageSize,
          total: logTotal,
          showSizeChanger: true,
          onChange: (p, ps) => {
            logQuery.pageNum = p;
            logQuery.pageSize = ps;
            fetchJobLogs();
          },
        }"
      />
    </Modal>
  </Page>
</template>
