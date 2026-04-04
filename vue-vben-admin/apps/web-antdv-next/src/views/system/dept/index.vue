<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { computed, reactive, ref } from 'vue';

import { SystemProShell } from '#/components/system-pro';

import {
  Button,
  Checkbox,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioGroup,
  Select,
  Table,
  Tag,
  TreeSelect,
} from 'antdv-next';

import { addDept, delDept, getDept, listDept, listDeptExcludeChild, updateDept } from '#/api';

type DeptRow = {
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: string;
  createTime?: string;
  children?: DeptRow[];
};

function asDeptRow(x: any): DeptRow {
  return x as DeptRow;
}

const loading = ref(false);
const rows = ref<DeptRow[]>([]);

const query = reactive({
  deptName: '',
  status: undefined as undefined | '0' | '1',
});

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

const expandAll = ref(true);

// --- add/edit dialog ---
const dialogOpen = ref(false);
const dialogLoading = ref(false);
const deptOptions = ref<any[]>([]);

const statusOptions2 = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

const form = reactive<any>({
  deptId: undefined,
  parentId: 0,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: '0',
});

async function loadDeptOptions(excludeDeptId?: number) {
  const tree = excludeDeptId
    ? await listDeptExcludeChild(excludeDeptId)
    : await listDept();
  deptOptions.value = [{ deptId: 0, deptName: '主类目', children: tree || [] }];
}

function resetForm() {
  Object.assign(form, {
    deptId: undefined,
    parentId: 0,
    deptName: '',
    orderNum: 0,
    leader: '',
    phone: '',
    email: '',
    status: '0',
  });
}

async function openAdd(parent?: DeptRow) {
  resetForm();
  dialogOpen.value = true;
  dialogLoading.value = true;
  try {
    await loadDeptOptions();
    if (parent?.deptId) form.parentId = parent.deptId;
  } finally {
    dialogLoading.value = false;
  }
}

async function openEditFull(row: DeptRow) {
  dialogOpen.value = true;
  dialogLoading.value = true;
  try {
    await loadDeptOptions(row.deptId);
    const data = await getDept(row.deptId);
    Object.assign(form, data || {});
  } finally {
    dialogLoading.value = false;
  }
}

async function submitForm() {
  const payload: any = { ...form };
  payload.parentId = Number(payload.parentId ?? 0);
  payload.orderNum = Number(payload.orderNum ?? 0);
  payload.status = payload.status ?? '0';

  dialogLoading.value = true;
  try {
    if (payload.deptId) await updateDept(payload);
    else await addDept(payload);
    message.success('保存成功');
    dialogOpen.value = false;
    await fetchList();
  } finally {
    dialogLoading.value = false;
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listDept({
      deptName: query.deptName || undefined,
      status: query.status,
    });
    rows.value = (data ?? []) as any;
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.deptName = '';
  query.status = undefined;
  fetchList();
}

function doSearch() {
  fetchList();
}

async function onDelete(row: DeptRow) {
  if (row.parentId === 0) return;
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除部门「${row.deptName}」？`,
    async onOk() {
      await delDept(row.deptId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
const editForm = reactive<{ deptId?: number; deptName: string; status: '0' | '1' }>({
  deptId: undefined,
  deptName: '',
  status: '0',
});

// quick edit removed (full form covers it)

async function submitEdit() {
  if (!editForm.deptId) return;
  await updateDept({
    deptId: editForm.deptId,
    deptName: editForm.deptName,
    status: editForm.status,
  });
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const colModalOpen = ref(false);
const colVisibility = reactive({
  deptName: true,
  orderNum: true,
  leader: true,
  phone: true,
  email: true,
  status: true,
  createTime: true,
  action: true,
});

const allColumns = computed(() => [
  { title: '部门名称', dataIndex: 'deptName', width: 260, ellipsis: true },
  { title: '排序', dataIndex: 'orderNum', width: 88 },
  { title: '负责人', dataIndex: 'leader', width: 120, ellipsis: true },
  { title: '联系电话', dataIndex: 'phone', width: 140, ellipsis: true },
  { title: '邮箱', dataIndex: 'email', width: 200, ellipsis: true },
  { title: '状态', dataIndex: 'status', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 180, ellipsis: true },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const },
]);

const columns = computed(() =>
  allColumns.value.filter((c: any) => {
    const k = c.key || c.dataIndex;
    return colVisibility[k as keyof typeof colVisibility] !== false;
  }),
);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="部门列表"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
      @column-setting="colModalOpen = true"
    >
      <template #search>
        <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <FormItem label="部门名称" class="!mb-0">
            <Input v-model:value="query.deptName" allow-clear placeholder="请输入部门名称" @press-enter="doSearch" />
          </FormItem>
          <FormItem label="状态" class="!mb-0">
            <Select v-model:value="query.status" allow-clear placeholder="部门状态" class="w-full" :options="statusOptions" />
          </FormItem>
        </div>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd()">
          <Plus class="mr-1 inline size-4" />
          新增部门
        </Button>
        <Button @click="expandAll = !expandAll">{{ expandAll ? '全部折叠' : '全部展开' }}</Button>
      </template>

      <Table
        row-key="deptId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        size="middle"
        :pagination="false"
        :default-expand-all-rows="expandAll"
        :scroll="{ x: 1100 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'status'">
            <Tag v-if="asDeptRow(record).status === '0' || asDeptRow(record).status == null" color="success">已启用</Tag>
            <Tag v-else color="error">已禁用</Tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openAdd(asDeptRow(record))">新增下级</Button>
              <Button type="link" size="small" class="!px-1" @click="openEditFull(asDeptRow(record))">修改</Button>
              <Button
                type="link"
                size="small"
                danger
                class="!px-1"
                :disabled="asDeptRow(record).parentId === 0"
                @click="onDelete(asDeptRow(record))"
              >
                删除
              </Button>
            </div>
          </template>
        </template>
      </Table>
    </SystemProShell>

    <Modal v-model:open="colModalOpen" title="列设置" @ok="colModalOpen = false">
      <div class="flex flex-col gap-2">
        <Checkbox v-model:checked="colVisibility.deptName">部门名称</Checkbox>
        <Checkbox v-model:checked="colVisibility.orderNum">排序</Checkbox>
        <Checkbox v-model:checked="colVisibility.leader">负责人</Checkbox>
        <Checkbox v-model:checked="colVisibility.phone">联系电话</Checkbox>
        <Checkbox v-model:checked="colVisibility.email">邮箱</Checkbox>
        <Checkbox v-model:checked="colVisibility.status">状态</Checkbox>
        <Checkbox v-model:checked="colVisibility.createTime">创建时间</Checkbox>
      </div>
    </Modal>

    <Modal v-model:open="editOpen" title="编辑部门（简化版）" @ok="submitEdit">
      <Form layout="vertical">
        <FormItem label="部门名称">
          <Input v-model:value="editForm.deptName" placeholder="请输入部门名称" />
        </FormItem>
        <FormItem label="状态">
          <Select v-model:value="editForm.status" :options="statusOptions" />
        </FormItem>
      </Form>
    </Modal>

    <Modal
      v-model:open="dialogOpen"
      :title="form.deptId ? '修改部门' : '新增部门'"
      width="860px"
      :confirm-loading="dialogLoading"
      @ok="submitForm"
    >
      <Form layout="vertical">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormItem label="上级部门">
            <TreeSelect
              v-model:value="form.parentId"
              :tree-data="deptOptions"
              :field-names="{ value: 'deptId', label: 'deptName', children: 'children' }"
              tree-default-expand-all
              allow-clear
              placeholder="选择上级部门"
            />
          </FormItem>
          <FormItem label="部门名称">
            <Input v-model:value="form.deptName" placeholder="请输入部门名称" />
          </FormItem>
          <FormItem label="显示排序">
            <InputNumber v-model:value="(form.orderNum as any)" :min="0" style="width: 100%" />
          </FormItem>
          <FormItem label="负责人">
            <Input v-model:value="form.leader" placeholder="请输入负责人" />
          </FormItem>
          <FormItem label="联系电话">
            <Input v-model:value="form.phone" placeholder="请输入联系电话" />
          </FormItem>
          <FormItem label="邮箱">
            <Input v-model:value="form.email" placeholder="请输入邮箱" />
          </FormItem>
          <FormItem label="部门状态">
            <RadioGroup v-model:value="form.status" :options="statusOptions2" option-type="button" />
          </FormItem>
        </div>
      </Form>
    </Modal>
  </Page>
</template>

