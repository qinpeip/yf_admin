<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';

import {
  Button,
  DatePicker,
  Descriptions,
  DescriptionsItem,
  Form,
  type FormInstance,
  FormItem,
  Input,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
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
import RuoyiCrontab from '#/components/ruoyi-crontab/index.vue';
import DictTag from '#/components/ruoyi/DictTag.vue';
import { SystemProShell, SystemProTable } from '#/components/system-pro';
import { useDict } from '#/composables/use-dict';
import { parseTime } from '#/utils/ruoyi-compat';

const router = useRouter();
const { sys_job_group, sys_job_status } = useDict('sys_job_group', 'sys_job_status');

const jobGroupOptions = computed(() =>
  (sys_job_group?.value ?? []).map((o) => ({ label: o.label, value: o.value })),
);

const statusDictOptions = computed(() =>
  (sys_job_status?.value ?? []).map((o) => ({ label: o.label, value: o.value })),
);

const jobGroupDict = computed(() => sys_job_group?.value ?? []);
const jobStatusDict = computed(() => sys_job_status?.value ?? []);

const tablePagination = computed(() => ({
  current: query.pageNum,
  pageSize: query.pageSize,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (t: number) => `共 ${t} 条`,
  onChange: (page: number, pageSize: number) => {
    query.pageNum = page;
    query.pageSize = pageSize;
    fetchList();
  },
}));

type JobRow = {
  concurrent?: string;
  createTime?: string;
  cronExpression?: string;
  invokeTarget?: string;
  jobGroup?: string;
  jobId: number;
  jobName: string;
  misfirePolicy?: string;
  nextValidTime?: string;
  status?: string;
};

const loading = ref(false);
const rows = ref<JobRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  jobName: '',
  jobGroup: undefined as string | undefined,
  status: undefined as string | undefined,
});

function asJobRow(x: any): JobRow {
  return x as JobRow;
}

function jobGroupLabel(group?: string) {
  const o = (sys_job_group?.value ?? []).find((x) => String(x.value) === String(group));
  return o?.label ?? group ?? '-';
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
  query.jobGroup = undefined;
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
      await runJob(row.jobId, row.jobGroup);
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
const editFormRef = ref<FormInstance>();
const editForm = reactive<any>({
  jobId: undefined,
  jobName: '',
  jobGroup: undefined,
  invokeTarget: '',
  cronExpression: '',
  misfirePolicy: '1',
  concurrent: '1',
  status: '0',
});

const editRules: Record<string, any[]> = {
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  jobGroup: [{ required: true, message: '请选择任务分组', trigger: 'change' }],
  invokeTarget: [{ required: true, message: '调用目标字符串不能为空', trigger: 'blur' }],
  cronExpression: [{ required: true, message: 'cron执行表达式不能为空', trigger: 'blur' }],
};

function resetEditForm() {
  Object.assign(editForm, {
    jobId: undefined,
    jobName: '',
    jobGroup: undefined,
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: '1',
    concurrent: '1',
    status: '0',
  });
}

async function openAdd() {
  resetEditForm();
  editOpen.value = true;
}

function normalizeJobFields(j: Record<string, any>) {
  return {
    ...j,
    misfirePolicy: j.misfirePolicy == null ? '1' : String(j.misfirePolicy),
    concurrent: j.concurrent == null ? '1' : String(j.concurrent),
    status: j.status == null ? '0' : String(j.status),
    jobGroup: j.jobGroup == null ? undefined : String(j.jobGroup),
  };
}

async function openEdit(row: JobRow) {
  editLoading.value = true;
  editOpen.value = true;
  try {
    const data = await getJob(row.jobId);
    const j = (data as any)?.data ?? data;
    Object.assign(editForm, normalizeJobFields(j));
  } finally {
    editLoading.value = false;
  }
}

async function submitEdit() {
  try {
    await editFormRef.value?.validate();
  } catch {
    return;
  }
  editLoading.value = true;
  try {
    await (editForm.jobId ? updateJob({ ...editForm }) : addJob({ ...editForm }));
    message.success('保存成功');
    editOpen.value = false;
    await fetchList();
  } finally {
    editLoading.value = false;
  }
}

// --- Cron 生成器 ---
const cronOpen = ref(false);
const cronSeed = ref('');

function handleShowCron() {
  cronSeed.value = editForm.cronExpression || '';
  cronOpen.value = true;
}

function onCronFill(value: string) {
  editForm.cronExpression = value;
}

// --- 详情 ---
const viewOpen = ref(false);
const viewRow = ref<Record<string, any>>({});

async function openView(row: JobRow) {
  const data = await getJob(row.jobId);
  const j = (data as any)?.data ?? data;
  viewRow.value = normalizeJobFields(j);
  viewOpen.value = true;
}

function misfireLabel(v: unknown) {
  const s = String(v ?? '');
  if (s === '1') return '立即执行';
  if (s === '2') return '执行一次';
  if (s === '3') return '放弃执行';
  if (s === '0') return '默认策略';
  return s || '-';
}

function concurrentLabel(v: unknown) {
  const s = String(v ?? '');
  if (s === '0') return '允许';
  if (s === '1') return '禁止';
  return s || '-';
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
  jobGroup: undefined as string | undefined,
  status: undefined as string | undefined,
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
  { title: '任务组名', dataIndex: 'jobGroup', width: 140 },
  { title: '调用目标', dataIndex: 'invokeTarget' },
  { title: 'cron', dataIndex: 'cronExpression', width: 180 },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '操作', key: 'action', width: 400 },
]);

const logColumns = computed<any[]>(() => [
  { title: '日志编号', dataIndex: 'jobLogId', width: 100 },
  { title: '任务名称', dataIndex: 'jobName', width: 160 },
  { title: '任务组', dataIndex: 'jobGroup', width: 100 },
  { title: '调用目标', dataIndex: 'invokeTarget' },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '执行时间', dataIndex: 'createTime', width: 180 },
]);

const logPagination = computed(() => ({
  current: logQuery.pageNum,
  pageSize: logQuery.pageSize,
  total: logTotal.value,
  showSizeChanger: true,
  onChange: (p: number, ps: number) => {
    logQuery.pageNum = p;
    logQuery.pageSize = ps;
    fetchJobLogs();
  },
}));

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="定时任务列表"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="jobName" label="任务名称" class="!mb-0">
              <Input v-model:value="query.jobName" allow-clear placeholder="任务名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="jobGroup" label="任务组名" class="!mb-0">
              <Select
                v-model:value="query.jobGroup"
                allow-clear
                placeholder="任务组名"
                class="w-full"
                :options="jobGroupOptions"
              />
            </FormItem>
            <FormItem name="status" label="状态" class="!mb-0">
              <Select
                v-model:value="query.status"
                allow-clear
                placeholder="状态"
                class="w-full"
                :options="statusDictOptions"
              />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增任务
        </Button>
        <Button @click="handleExport">导出</Button>
        <Button @click="openJobLogs">调度日志</Button>
      </template>

      <SystemProTable
        row-key="jobId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        :scroll="{ x: 1200 }"
        :pagination="tablePagination"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'jobGroup'">
            <DictTag :options="jobGroupDict" :value="asJobRow(record).jobGroup" />
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <Switch
              :checked="asJobRow(record).status === '0'"
              checked-children="正常"
              un-checked-children="暂停"
              @change="() => onToggleStatus(asJobRow(record))"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openView(asJobRow(record))">详细</Button>
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
      </SystemProTable>
    </SystemProShell>

    <Modal
      v-model:open="editOpen"
      :title="editForm.jobId ? '修改任务' : '新增任务'"
      width="820px"
      :confirm-loading="editLoading"
      destroy-on-close
      @ok="submitEdit"
    >
      <Form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        :label-col="{ style: { width: '120px' } }"
        :wrapper-col="{ span: 18 }"
        class="max-w-full"
      >
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <FormItem label="任务名称" name="jobName">
            <Input v-model:value="editForm.jobName" placeholder="请输入任务名称" allow-clear />
          </FormItem>
          <FormItem label="任务分组" name="jobGroup">
            <Select
              v-model:value="editForm.jobGroup"
              allow-clear
              placeholder="请选择任务分组"
              :options="jobGroupOptions"
            />
          </FormItem>
        </div>
        <FormItem name="invokeTarget">
          <template #label>
            <span class="inline-flex items-center gap-1">
              调用方法
              <Tooltip placement="top">
                <template #title>
                  <div class="max-w-sm text-left text-xs leading-relaxed">
                    Bean调用示例：ryTask.ryParams('ry')
                    <br />
                    Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                    <br />
                    参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                  </div>
                </template>
                <span class="cursor-help text-primary">?</span>
              </Tooltip>
            </span>
          </template>
          <Input v-model:value="editForm.invokeTarget" placeholder="请输入调用目标字符串" allow-clear />
        </FormItem>
        <FormItem label="cron表达式" name="cronExpression">
          <div class="flex flex-wrap gap-2">
            <Input v-model:value="editForm.cronExpression" placeholder="请输入cron执行表达式" allow-clear class="min-w-[200px] flex-1" />
            <Button type="primary" @click="handleShowCron">生成表达式</Button>
          </div>
        </FormItem>
        <FormItem v-if="editForm.jobId != null && editForm.jobId !== ''" label="状态" name="status">
          <RadioGroup v-model:value="editForm.status">
            <Radio v-for="d in jobStatusDict" :key="d.value" :value="d.value">{{ d.label }}</Radio>
          </RadioGroup>
        </FormItem>
        <div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
          <FormItem label="执行策略" name="misfirePolicy">
            <RadioGroup v-model:value="editForm.misfirePolicy" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Radio value="1">立即执行</Radio>
              <Radio value="2">执行一次</Radio>
              <Radio value="3">放弃执行</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="是否并发" name="concurrent">
            <RadioGroup v-model:value="editForm.concurrent">
              <Radio value="0">允许</Radio>
              <Radio value="1">禁止</Radio>
            </RadioGroup>
          </FormItem>
        </div>
      </Form>
    </Modal>

    <Modal v-model:open="cronOpen" title="Cron表达式生成器" width="900px" :footer="null" destroy-on-close>
      <RuoyiCrontab :expression="cronSeed" @hide="cronOpen = false" @fill="onCronFill" />
    </Modal>

    <Modal v-model:open="viewOpen" title="任务详细" width="720px" :footer="null" destroy-on-close>
      <Descriptions bordered :column="2" size="small">
        <DescriptionsItem label="任务编号">{{ viewRow.jobId }}</DescriptionsItem>
        <DescriptionsItem label="任务名称">{{ viewRow.jobName }}</DescriptionsItem>
        <DescriptionsItem label="任务分组">{{ jobGroupLabel(viewRow.jobGroup) }}</DescriptionsItem>
        <DescriptionsItem label="创建时间">{{ viewRow.createTime }}</DescriptionsItem>
        <DescriptionsItem label="cron表达式">{{ viewRow.cronExpression }}</DescriptionsItem>
        <DescriptionsItem label="下次执行时间">
          {{ viewRow.nextValidTime ? parseTime(viewRow.nextValidTime) : '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="调用目标方法" :span="2">{{ viewRow.invokeTarget }}</DescriptionsItem>
        <DescriptionsItem label="任务状态">
          <DictTag :options="jobStatusDict" :value="viewRow.status" />
        </DescriptionsItem>
        <DescriptionsItem label="是否并发">{{ concurrentLabel(viewRow.concurrent) }}</DescriptionsItem>
        <DescriptionsItem label="执行策略">{{ misfireLabel(viewRow.misfirePolicy) }}</DescriptionsItem>
      </Descriptions>
    </Modal>

    <Modal v-model:open="logOpen" title="调度日志" width="1000px" :footer="null">
      <Form layout="inline" class="mb-3">
        <FormItem label="任务名称">
          <Input v-model:value="logQuery.jobName" allow-clear style="width: 160px" />
        </FormItem>
        <FormItem label="任务组">
          <Select
            v-model:value="logQuery.jobGroup"
            allow-clear
            placeholder="任务组"
            style="width: 140px"
            :options="jobGroupOptions"
          />
        </FormItem>
        <FormItem label="状态">
          <Select
            v-model:value="logQuery.status"
            allow-clear
            style="width: 100px"
            :options="statusDictOptions"
          />
        </FormItem>
        <FormItem label="时间">
          <DatePicker.RangePicker v-model:value="logDateRange" value-format="YYYY-MM-DD" />
        </FormItem>
        <FormItem>
          <Space>
            <Button
              type="primary"
              @click="
                () => {
                  logQuery.pageNum = 1;
                  fetchJobLogs();
                }
              "
            >
              搜索
            </Button>
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
        :pagination="logPagination"
      />
    </Modal>
  </Page>
</template>
