<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { computed, reactive, ref } from 'vue';

import { SystemProShell } from '#/components/system-pro';

import { Button, Form, FormItem, Input, message, Modal, Select, Table, Tag, TextArea } from 'antdv-next';

import { addNotice, delNotice, listNotice, updateNotice } from '#/api';

type NoticeRow = {
  noticeId: number;
  noticeTitle: string;
  noticeType?: string;
  noticeContent?: string;
  status?: string;
  createBy?: string;
  createTime?: string;
};

const loading = ref(false);
const rows = ref<NoticeRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  noticeType: undefined as undefined | string,
  status: undefined as undefined | string,
});

const noticeTypeOptions = [
  { label: '通知', value: '1' },
  { label: '公告', value: '2' },
];
const statusOptions = [
  { label: '正常', value: '0' },
  { label: '关闭', value: '1' },
];

function asNoticeRow(x: any): NoticeRow {
  return x as NoticeRow;
}

function noticeTypeLabel(v?: string) {
  if (v === '1') return '通知';
  if (v === '2') return '公告';
  return v ?? '-';
}

function noticeStatusLabel(v?: string) {
  if (v === '0') return '正常';
  if (v === '1') return '关闭';
  return v ?? '-';
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
    message.warning('请选择要删除的公告');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除选中的 ${selectedRowKeys.value.length} 条公告？`,
    async onOk() {
      await delNotice(selectedRowKeys.value);
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

const detailOpen = ref(false);
const detailRow = ref<NoticeRow | null>(null);
function openDetail(row: NoticeRow) {
  detailRow.value = row;
  detailOpen.value = true;
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listNotice({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      noticeTitle: query.noticeTitle || undefined,
      noticeType: query.noticeType,
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
  query.noticeTitle = '';
  query.noticeType = undefined;
  query.status = undefined;
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onDelete(row: NoticeRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除公告「${row.noticeTitle}」？`,
    async onOk() {
      await delNotice(row.noticeId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
const editForm = reactive<Partial<NoticeRow>>({
  noticeId: undefined,
  noticeTitle: '',
  noticeType: '1',
  status: '0',
  noticeContent: '',
});

function openAdd() {
  Object.assign(editForm, {
    noticeId: undefined,
    noticeTitle: '',
    noticeType: '1',
    status: '0',
    noticeContent: '',
  });
  editOpen.value = true;
}

function openEdit(row: NoticeRow) {
  Object.assign(editForm, row);
  editOpen.value = true;
}

async function submitEdit() {
  if (!editForm.noticeTitle) {
    message.warning('请填写标题');
    return;
  }
  if (editForm.noticeId) {
    await updateNotice(editForm);
  } else {
    await addNotice(editForm);
  }
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed<any[]>(() => [
  { title: '公告编号', dataIndex: 'noticeId', width: 100 },
  { title: '标题', dataIndex: 'noticeTitle', width: 260 },
  { title: '类型', dataIndex: 'noticeType', width: 100 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '创建者', dataIndex: 'createBy', width: 140 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 180 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="通知公告列表"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="noticeTitle" label="标题" class="!mb-0">
              <Input v-model:value="query.noticeTitle" allow-clear placeholder="请输入标题" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="noticeType" label="类型" class="!mb-0">
              <Select v-model:value="query.noticeType" allow-clear placeholder="类型" class="w-full" :options="noticeTypeOptions" />
            </FormItem>
            <FormItem name="status" label="状态" class="!mb-0">
              <Select v-model:value="query.status" allow-clear placeholder="状态" class="w-full" :options="statusOptions" />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增公告
        </Button>
        <Button danger :disabled="!selectedRowKeys.length" @click="onBatchDelete">删除</Button>
      </template>

      <Table
        row-key="noticeId"
        class="system-pro-table"
        :row-selection="rowSelection"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        size="middle"
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
          <template v-if="column.dataIndex === 'noticeType'">
            <Tag :color="asNoticeRow(record).noticeType === '2' ? 'processing' : 'default'">
              {{ noticeTypeLabel(asNoticeRow(record).noticeType) }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <Tag v-if="asNoticeRow(record).status === '0'" color="success">正常</Tag>
            <Tag v-else color="default">关闭</Tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openDetail(asNoticeRow(record))">详情</Button>
              <Button type="link" size="small" class="!px-1" @click="openEdit(asNoticeRow(record))">修改</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asNoticeRow(record))">删除</Button>
            </div>
          </template>
        </template>
      </Table>
    </SystemProShell>

    <Modal v-model:open="detailOpen" title="公告详情" :footer="null" width="720px">
      <div v-if="detailRow" class="space-y-2">
        <div><strong>标题：</strong>{{ detailRow.noticeTitle }}</div>
        <div><strong>类型：</strong>{{ noticeTypeLabel(detailRow.noticeType) }}</div>
        <div><strong>状态：</strong>{{ noticeStatusLabel(detailRow.status) }}</div>
        <div><strong>内容：</strong></div>
        <div class="whitespace-pre-wrap rounded border p-3 text-sm">{{ detailRow.noticeContent || '—' }}</div>
      </div>
    </Modal>

    <Modal
      v-model:open="editOpen"
      width="720px"
      :title="editForm.noticeId ? '修改公告' : '新增公告'"
      @ok="submitEdit"
    >
      <Form layout="vertical">
        <FormItem label="标题">
          <Input v-model:value="(editForm.noticeTitle as any)" placeholder="请输入标题" />
        </FormItem>
        <FormItem label="类型">
          <Select v-model:value="(editForm.noticeType as any)" :options="noticeTypeOptions" />
        </FormItem>
        <FormItem label="状态">
          <Select v-model:value="(editForm.status as any)" :options="statusOptions" />
        </FormItem>
        <FormItem label="内容">
          <TextArea v-model:value="(editForm.noticeContent as any)" :rows="6" placeholder="请输入内容" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

