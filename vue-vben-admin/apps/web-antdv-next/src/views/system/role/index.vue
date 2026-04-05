<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { SystemProShell, SystemProTable } from '#/components/system-pro';

import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
  TextArea,
  Tree,
} from 'antdv-next';

import {
  addRole,
  changeRoleStatus,
  delRole,
  getRole,
  getRoleDataScope,
  roleMenuTreeselect,
  updateRole,
  updateRoleDataScope,
  deptTree,
  listRole,
} from '#/api';

const router = useRouter();

type RoleRow = {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: '0' | '1';
  remark?: string;
  createTime?: string;
};

const loading = ref(false);
const rows = ref<RoleRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleKey: '',
  roleId: '',
  remark: '',
  status: undefined as undefined | '0' | '1',
  dateRange: null as [string, string] | null,
});

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

function asRoleRow(x: any): RoleRow {
  return x as RoleRow;
}

// --- role add/edit ---
const editOpen = ref(false);
const editLoading = ref(false);
const menuTree = ref<any[]>([]);
const checkedMenuIds = ref<number[]>([]);
const menuCheckStrictly = ref(true);

const editForm = reactive<{
  roleId?: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: '0' | '1';
  remark: string;
}>({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: '0',
  remark: '',
});

const treeFieldNames = { key: 'id', title: 'label', children: 'children' } as any;

async function openAdd() {
  Object.assign(editForm, {
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    remark: '',
  });
  menuCheckStrictly.value = true;
  checkedMenuIds.value = [];
  editOpen.value = true;
  editLoading.value = true;
  try {
    const resp = await roleMenuTreeselect(0);
    menuTree.value = resp?.menus ?? [];
  } finally {
    editLoading.value = false;
  }
}

async function openEdit(row: RoleRow) {
  if (row.roleId === 1) return;
  editOpen.value = true;
  editLoading.value = true;
  try {
    const [role, treeResp] = await Promise.all([
      getRole(row.roleId),
      roleMenuTreeselect(row.roleId),
    ]);
    Object.assign(editForm, {
      roleId: role?.roleId,
      roleName: role?.roleName ?? '',
      roleKey: role?.roleKey ?? '',
      roleSort: Number(role?.roleSort ?? 0),
      status: (role?.status as any) ?? '0',
      remark: role?.remark ?? '',
    });
    menuTree.value = treeResp?.menus ?? [];
    checkedMenuIds.value = (treeResp?.checkedKeys ?? []).map((x) => Number(x));
    menuCheckStrictly.value = true;
  } finally {
    editLoading.value = false;
  }
}

async function submitEdit() {
  const payload: any = {
    roleName: editForm.roleName,
    roleKey: editForm.roleKey,
    roleSort: Number(editForm.roleSort ?? 0),
    status: editForm.status,
    remark: editForm.remark,
    menuCheckStrictly: menuCheckStrictly.value,
    menuIds: checkedMenuIds.value,
    // 后端 dto 里仍有 dataScope 字段，这里固定 1，数据权限单独走 dataScope 接口
    dataScope: '1',
  };
  editLoading.value = true;
  try {
    if (editForm.roleId) {
      await updateRole({ roleId: editForm.roleId, ...payload });
    } else {
      await addRole(payload);
    }
    message.success('保存成功');
    editOpen.value = false;
    await fetchList();
  } finally {
    editLoading.value = false;
  }
}

// --- data scope ---
const scopeOpen = ref(false);
const scopeLoading = ref(false);
const scopeRoleId = ref<number | null>(null);
const scopeValue = ref<string>('1');
const deptTreeData = ref<any[]>([]);
const scopeDeptChecked = ref<number[]>([]);

const scopeOptions = [
  { label: '全部数据', value: '1' },
  { label: '自定义数据权限', value: '2' },
  { label: '本部门数据权限', value: '3' },
  { label: '本部门及以下数据权限', value: '4' },
  { label: '仅本人数据权限', value: '5' },
];

async function openScope(row: RoleRow) {
  if (row.roleId === 1) return;
  scopeOpen.value = true;
  scopeLoading.value = true;
  try {
    scopeRoleId.value = row.roleId;
    const [dept, scope] = await Promise.all([deptTree(), getRoleDataScope(row.roleId)]);
    deptTreeData.value = dept ?? [];
    scopeValue.value = scope?.dataScope ?? '1';
    scopeDeptChecked.value = (scope?.deptIds ?? []).map((x) => Number(x));
  } finally {
    scopeLoading.value = false;
  }
}

async function submitScope() {
  if (!scopeRoleId.value) return;
  const deptIds = scopeValue.value === '2' ? scopeDeptChecked.value : [];
  if (scopeValue.value === '2' && !deptIds.length) {
    message.warning('自定义数据权限必须选择部门');
    return;
  }
  scopeLoading.value = true;
  try {
    await updateRoleDataScope({
      roleId: scopeRoleId.value,
      dataScope: scopeValue.value,
      deptIds,
    });
    message.success('保存成功');
    scopeOpen.value = false;
  } finally {
    scopeLoading.value = false;
  }
}

function listParams() {
  const p: Record<string, any> = {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    roleName: query.roleName || undefined,
    roleKey: query.roleKey || undefined,
    roleId: query.roleId || undefined,
    remark: query.remark || undefined,
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
    const data = await listRole(listParams() as any);
    rows.value = (data?.list ?? []) as any;
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.roleName = '';
  query.roleKey = '';
  query.roleId = '';
  query.remark = '';
  query.status = undefined;
  query.dateRange = null;
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

const colModalOpen = ref(false);
const colVisibility = reactive({
  roleId: true,
  roleName: true,
  roleKey: true,
  roleSort: true,
  status: true,
  remark: true,
  createTime: true,
  action: true,
});

const allColumns = computed(() => [
  { title: '角色编号', dataIndex: 'roleId', width: 100, ellipsis: true },
  { title: '角色名称', dataIndex: 'roleName', width: 160, ellipsis: true },
  { title: '权限字符', dataIndex: 'roleKey', width: 200, ellipsis: true },
  { title: '显示顺序', dataIndex: 'roleSort', width: 100 },
  { title: '状态', dataIndex: 'status', width: 130 },
  { title: '备注', dataIndex: 'remark', ellipsis: true },
  { title: '创建时间', dataIndex: 'createTime', width: 180, ellipsis: true },
  { title: '操作', key: 'action', width: 320, fixed: 'right' as const },
]);

const columns = computed(() =>
  allColumns.value.filter((c: any) => {
    const k = c.key || c.dataIndex;
    return colVisibility[k as keyof typeof colVisibility] !== false;
  }),
);

async function onDelete(row: RoleRow) {
  if (row.roleId === 1) return;
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除角色「${row.roleName}」？`,
    async onOk() {
      await delRole(row.roleId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

async function onToggleStatus(row: RoleRow) {
  if (row.roleId === 1) return;
  const next = row.status === '0' ? '1' : '0';
  const text = next === '0' ? '启用' : '停用';
  Modal.confirm({
    title: `确认${text}`,
    content: `确认要${text}角色「${row.roleName}」吗？`,
    async onOk() {
      await changeRoleStatus(row.roleId, next);
      row.status = next;
      message.success(`${text}成功`);
    },
  });
}

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="角色列表"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
      @column-setting="colModalOpen = true"
    >
      <template #search>
        <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Form :model="query" class="contents">
            <FormItem name="roleName" label="角色名称" class="!mb-0">
              <Input v-model:value="query.roleName" allow-clear placeholder="请输入角色名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="roleId" label="角色编号" class="!mb-0">
              <Input v-model:value="query.roleId" allow-clear placeholder="角色 ID" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="roleKey" label="权限字符" class="!mb-0">
              <Input v-model:value="query.roleKey" allow-clear placeholder="请输入权限字符" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="status" label="状态" class="!mb-0">
              <Select v-model:value="query.status" allow-clear placeholder="角色状态" class="w-full" :options="statusOptions" />
            </FormItem>
            <FormItem name="remark" label="备注" class="!mb-0">
              <Input v-model:value="query.remark" allow-clear placeholder="备注关键词" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="dateRange" label="创建时间" class="!mb-0 lg:col-span-2">
              <DatePicker.RangePicker v-model:value="query.dateRange" class="w-full" value-format="YYYY-MM-DD" />
            </FormItem>
          </Form>
        </div>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增角色
        </Button>
      </template>

      <SystemProTable
        row-key="roleId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        :scroll="{ x: 1280 }"
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
              :checked="asRoleRow(record).status === '0'"
              checked-children="已启用"
              un-checked-children="已禁用"
              :disabled="asRoleRow(record).roleId === 1"
              @change="() => onToggleStatus(asRoleRow(record))"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" :disabled="asRoleRow(record).roleId === 1" @click="openEdit(asRoleRow(record))">
                修改
              </Button>
              <Button type="link" size="small" class="!px-1" :disabled="asRoleRow(record).roleId === 1" @click="openScope(asRoleRow(record))">
                数据权限
              </Button>
              <Button
                type="link"
                size="small"
                class="!px-1"
                :disabled="asRoleRow(record).roleId === 1"
                @click="router.push(`/system/role-auth/user/${asRoleRow(record).roleId}`)"
              >
                分配用户
              </Button>
              <Button
                type="link"
                size="small"
                danger
                class="!px-1"
                :disabled="asRoleRow(record).roleId === 1"
                @click="() => onDelete(asRoleRow(record))"
              >
                删除
              </Button>
            </div>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>

    <Modal v-model:open="colModalOpen" title="列设置" @ok="colModalOpen = false">
      <div class="flex flex-col gap-2">
        <Checkbox v-model:checked="colVisibility.roleId">角色编号</Checkbox>
        <Checkbox v-model:checked="colVisibility.roleName">角色名称</Checkbox>
        <Checkbox v-model:checked="colVisibility.roleKey">权限字符</Checkbox>
        <Checkbox v-model:checked="colVisibility.roleSort">显示顺序</Checkbox>
        <Checkbox v-model:checked="colVisibility.status">状态</Checkbox>
        <Checkbox v-model:checked="colVisibility.remark">备注</Checkbox>
        <Checkbox v-model:checked="colVisibility.createTime">创建时间</Checkbox>
      </div>
    </Modal>

    <Modal
      v-model:open="editOpen"
      :title="editForm.roleId ? '修改角色' : '新增角色'"
      width="860px"
      :confirm-loading="editLoading"
      @ok="submitEdit"
    >
      <Form layout="vertical">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormItem label="角色名称">
            <Input v-model:value="editForm.roleName" placeholder="请输入角色名称" />
          </FormItem>
          <FormItem label="权限字符">
            <Input v-model:value="editForm.roleKey" placeholder="请输入权限字符" />
          </FormItem>
          <FormItem label="显示顺序">
            <InputNumber v-model:value="(editForm.roleSort as any)" :min="0" style="width: 100%" />
          </FormItem>
          <FormItem label="状态">
            <Select v-model:value="(editForm.status as any)" :options="statusOptions" />
          </FormItem>
        </div>
        <FormItem label="菜单权限">
          <div class="mb-2">
            <Checkbox v-model:checked="menuCheckStrictly">父子联动</Checkbox>
          </div>
          <Tree
            checkable
            :field-names="treeFieldNames"
            :tree-data="menuTree"
            :checked-keys="checkedMenuIds"
            :check-strictly="!menuCheckStrictly"
            default-expand-all
            @check="(keys: any) => (checkedMenuIds = (Array.isArray(keys) ? keys : keys?.checked) as any)"
          />
        </FormItem>
        <FormItem label="备注">
          <TextArea v-model:value="editForm.remark" :rows="3" />
        </FormItem>
      </Form>
    </Modal>

    <Modal
      v-model:open="scopeOpen"
      title="角色数据权限"
      width="860px"
      :confirm-loading="scopeLoading"
      @ok="submitScope"
    >
      <Form layout="vertical">
        <FormItem label="数据范围">
          <Select v-model:value="scopeValue" :options="scopeOptions" />
        </FormItem>
        <FormItem v-if="scopeValue === '2'" label="选择部门">
          <Tree
            checkable
            :field-names="treeFieldNames"
            :tree-data="deptTreeData"
            :checked-keys="scopeDeptChecked"
            default-expand-all
            @check="(keys: any) => (scopeDeptChecked = (Array.isArray(keys) ? keys : keys?.checked) as any)"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

