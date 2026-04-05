<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, reactive, ref } from 'vue';

import { SystemProShell, SystemProTable } from '#/components/system-pro';

import { Button, Form, FormItem, Input, InputNumber, message, Modal, Select, Tag, TextArea } from 'antdv-next';

import { addPost, delPost, exportPost, listPost, updatePost } from '#/api';

type PostRow = {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: '0' | '1';
  remark?: string;
  createTime?: string;
};

const loading = ref(false);
const rows = ref<PostRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  postCode: '',
  postName: '',
  status: undefined as undefined | '0' | '1',
});

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

function asPostRow(x: any): PostRow {
  return x as PostRow;
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
    message.warning('请选择要删除的岗位');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除选中的 ${selectedRowKeys.value.length} 条岗位？`,
    async onOk() {
      await delPost(selectedRowKeys.value);
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

async function handleExport() {
  const blob = (await exportPost({
    postCode: query.postCode || undefined,
    postName: query.postName || undefined,
    status: query.status,
  })) as Blob;
  downloadFileFromBlob({ fileName: `post_${Date.now()}.xlsx`, source: blob });
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listPost({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      postCode: query.postCode || undefined,
      postName: query.postName || undefined,
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
  query.postCode = '';
  query.postName = '';
  query.status = undefined;
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onDelete(row: PostRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除岗位「${row.postName}」？`,
    async onOk() {
      await delPost(row.postId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
const editForm = reactive<Partial<PostRow>>({
  postId: undefined,
  postName: '',
  postCode: '',
  postSort: 0,
  status: '0',
  remark: '',
});

function openAdd() {
  Object.assign(editForm, {
    postId: undefined,
    postName: '',
    postCode: '',
    postSort: 0,
    status: '0',
    remark: '',
  });
  editOpen.value = true;
}

function openEdit(row: PostRow) {
  Object.assign(editForm, row);
  editOpen.value = true;
}

async function submitEdit() {
  if (!editForm.postName || !editForm.postCode) {
    message.warning('请填写岗位名称/岗位编码');
    return;
  }
  if (editForm.postId) {
    await updatePost(editForm as any);
  } else {
    await addPost(editForm as any);
  }
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed<any[]>(() => [
  { title: '岗位编号', dataIndex: 'postId', width: 100 },
  { title: '岗位编码', dataIndex: 'postCode', width: 160 },
  { title: '岗位名称', dataIndex: 'postName', width: 160 },
  { title: '岗位排序', dataIndex: 'postSort', width: 100 },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action', width: 160 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="岗位列表"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="postCode" label="岗位编码" class="!mb-0">
              <Input v-model:value="query.postCode" allow-clear placeholder="请输入岗位编码" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="postName" label="岗位名称" class="!mb-0">
              <Input v-model:value="query.postName" allow-clear placeholder="请输入岗位名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="status" label="状态" class="!mb-0">
              <Select v-model:value="query.status" allow-clear placeholder="岗位状态" class="w-full" :options="statusOptions" />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增岗位
        </Button>
        <Button danger :disabled="!selectedRowKeys.length" @click="onBatchDelete">删除</Button>
        <Button @click="handleExport">导出</Button>
      </template>

      <SystemProTable
        row-key="postId"
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
          <template v-if="column.dataIndex === 'status'">
            <Tag v-if="asPostRow(record).status === '0'" color="success">已启用</Tag>
            <Tag v-else color="error">已禁用</Tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asPostRow(record))">修改</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asPostRow(record))">删除</Button>
            </div>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>

    <Modal v-model:open="editOpen" :title="editForm.postId ? '修改岗位' : '新增岗位'" @ok="submitEdit">
      <Form layout="vertical">
        <FormItem label="岗位名称">
          <Input v-model:value="(editForm.postName as any)" placeholder="请输入岗位名称" />
        </FormItem>
        <FormItem label="岗位编码">
          <Input v-model:value="(editForm.postCode as any)" placeholder="请输入岗位编码" />
        </FormItem>
        <FormItem label="岗位排序">
          <InputNumber v-model:value="(editForm.postSort as any)" :min="0" style="width: 100%" />
        </FormItem>
        <FormItem label="状态">
          <Select v-model:value="(editForm.status as any)" :options="statusOptions" />
        </FormItem>
        <FormItem label="备注">
          <TextArea v-model:value="(editForm.remark as any)" :rows="3" placeholder="请输入备注" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

