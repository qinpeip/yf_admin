<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  Button,
  Card,
  DatePicker,
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
  Modal,
  Select,
  Space,
  Switch,
  TextArea,
  Tree,
  TreeSelect,
} from 'antdv-next';

import {
  addUser,
  changeUserStatus,
  delUser,
  deptTree,
  getUser,
  getUserOptions,
  listUser,
  resetUserPwd,
  updateUser,
} from '#/api';
import { SystemProShell, SystemProTable } from '#/components/system-pro';
import { useDict } from '#/composables/use-dict';

const router = useRouter();

/** 若依字典 `sys_user_sex`（用户性别） */
const { sys_user_sex } = useDict('sys_user_sex');

type UserRow = {
  createTime?: string;
  dept?: null | { deptName: string };
  deptId?: number;
  email?: string;
  nickName: string;
  phonenumber?: string;
  status: '0' | '1';
  userId: number;
  userName: string;
};

const loading = ref(false);
const rows = ref<UserRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
  status: undefined as '0' | '1' | undefined,
  deptId: undefined as number | undefined,
  dateRange: null as [string, string] | null,
});

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

const sexOptions = computed(() => {
  const list = sys_user_sex?.value ?? [];
  const sorted = [...list].toSorted(
    (a, b) => (a.dictSort ?? 0) - (b.dictSort ?? 0),
  );
  return sorted.map((o) => ({ label: o.label, value: o.value }));
});

/** 新增/重置默认性别：取字典第一项，避免写死已删除的 dictValue（如原「未知」2） */
const defaultSex = computed(() => sexOptions.value[0]?.value ?? '0');

function asUserRow(x: any): UserRow {
  return x as UserRow;
}

// dept tree filter
const deptSearch = ref('');
const deptTreeData = ref<any[]>([]);
const selectedDeptKey = ref<number | null>(null);

function filterDeptNode(search: string, node: any) {
  if (!search) return true;
  return String(node?.label || '').includes(search);
}

watch(deptSearch, () => { });

async function loadDeptTree() {
  deptTreeData.value = (await deptTree()) as any;
}

function onDeptSelect(_keys: any, info: any) {
  const node = info?.node;
  const id = Number(node?.id ?? node?.key);
  if (!Number.isFinite(id)) return;
  selectedDeptKey.value = id;
  query.deptId = id;
  query.pageNum = 1;
  fetchList();
}

async function fetchList() {
  loading.value = true;
  try {
    const beginTime = query.dateRange?.[0];
    const endTime = query.dateRange?.[1];
    const data = await listUser({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      userName: query.userName || undefined,
      phonenumber: query.phonenumber || undefined,
      status: query.status,
      deptId: query.deptId,
      beginTime,
      endTime,
      ...(beginTime ? { 'params[beginTime]': beginTime } : {}),
      ...(endTime ? { 'params[endTime]': endTime } : {}),
    } as any);
    rows.value = (data?.list ?? []) as any;
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.userName = '';
  query.phonenumber = '';
  query.status = undefined;
  query.deptId = undefined;
  selectedDeptKey.value = null;
  query.dateRange = null;
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onDelete(row: UserRow) {
  if (row.userId === 1) return;
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除用户「${row.userName}」？`,
    async onOk() {
      await delUser(row.userId);
      message.success('删除成功');
      await fetchList();
    },
  });
}

async function onToggleStatus(row: UserRow) {
  if (row.userId === 1) return;
  const next = row.status === '0' ? '1' : '0';
  const text = next === '0' ? '启用' : '停用';
  Modal.confirm({
    title: `确认${text}`,
    content: `确认要${text}用户「${row.userName}」吗？`,
    async onOk() {
      await changeUserStatus(row.userId, next);
      row.status = next;
      message.success(`${text}成功`);
    },
  });
}

// add/edit user
const editOpen = ref(false);
const editLoading = ref(false);
const deptOptions = ref<any[]>([]);
const postOptions = ref<any[]>([]);
const roleOptions = ref<any[]>([]);

const editForm = reactive<any>({
  userId: undefined,
  userName: '',
  password: '',
  nickName: '',
  deptId: undefined,
  phonenumber: '',
  email: '',
  sex: '0',
  status: '0',
  remark: '',
  postIds: [] as number[],
  roleIds: [] as number[],
});

async function loadUserOptions() {
  deptOptions.value = (await deptTree()) as any;
  const opts = await getUserOptions();
  postOptions.value = opts?.posts ?? [];
  roleOptions.value = opts?.roles ?? [];
}

function resetEditForm() {
  Object.assign(editForm, {
    userId: undefined,
    userName: '',
    password: '',
    nickName: '',
    deptId: undefined,
    phonenumber: '',
    email: '',
    sex: defaultSex.value,
    status: '0',
    remark: '',
    postIds: [],
    roleIds: [],
  });
}

async function openAdd() {
  resetEditForm();
  editOpen.value = true;
  editLoading.value = true;
  try {
    await loadUserOptions();
  } finally {
    editLoading.value = false;
  }
}

async function openEdit(row: UserRow) {
  if (row.userId === 1) return;
  resetEditForm();
  editOpen.value = true;
  editLoading.value = true;
  try {
    await loadUserOptions();
    const resp = await getUser(row.userId);
    const data = resp?.data ?? resp;
    Object.assign(editForm, data);
    editForm.postIds = resp?.postIds ?? [];
    editForm.roleIds = resp?.roleIds ?? [];
    editForm.password = '';
    const allowedSex = new Set(sexOptions.value.map((o) => o.value));
    if (
      editForm.sex != null &&
      editForm.sex !== '' &&
      !allowedSex.has(String(editForm.sex))
    ) {
      editForm.sex = defaultSex.value;
    }
  } finally {
    editLoading.value = false;
  }
}

async function submitEdit() {
  const payload: any = { ...editForm };
  payload.postIds = payload.postIds || [];
  payload.roleIds = payload.roleIds || [];
  await (payload.userId ? updateUser(payload) : addUser(payload));
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

// reset password
const resetOpen = ref(false);
const resetLoading = ref(false);
const resetUserId = ref<number | null>(null);
const resetUserName = ref('');
const resetPwd = ref('');

function openResetPwd(row: UserRow) {
  if (row.userId === 1) return;
  resetUserId.value = row.userId;
  resetUserName.value = row.userName;
  resetPwd.value = '';
  resetOpen.value = true;
}

async function submitResetPwd() {
  if (!resetUserId.value) return;
  if (!resetPwd.value || resetPwd.value.length < 5 || resetPwd.value.length > 20) {
    message.warning('密码长度必须介于 5 和 20 之间');
    return;
  }
  resetLoading.value = true;
  try {
    await resetUserPwd(resetUserId.value, resetPwd.value);
    message.success('修改成功');
    resetOpen.value = false;
  } finally {
    resetLoading.value = false;
  }
}

function openAuthRole(row: UserRow) {
  if (row.userId === 1) return;
  router.push(`/system/user-auth/role/${row.userId}`);
}

const columns = computed<any[]>(() => [
  { title: '用户编号', dataIndex: 'userId', width: 100 },
  { title: '登录名称', dataIndex: 'userName', width: 160 },
  { title: '用户昵称', dataIndex: 'nickName', width: 160 },
  { title: '部门', dataIndex: ['dept', 'deptName'], width: 160 },
  { title: '手机号', dataIndex: 'phonenumber', width: 160 },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '操作', key: 'action', width: 260 },
]);

loadDeptTree();
fetchList();
</script>

<template>
  <Page auto-content-height>
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Card class="lg:col-span-3 rounded-lg border border-[#f0f0f0] bg-card shadow-sm dark:border-white/10"
        :bordered="false" title="部门"
        >
        <Space direction="vertical" style="width: 100%">
          <Input v-model:value="deptSearch" allow-clear placeholder="请输入部门名称" />
          <Tree :tree-data="deptTreeData" :field-names="{ key: 'id', title: 'label', children: 'children' }"
            default-expand-all :selected-keys="selectedDeptKey ? [selectedDeptKey] : []"
            :filter-tree-node="(node) => filterDeptNode(deptSearch, node)" @select="onDeptSelect" />
        </Space>
      </Card>

      <div class="flex min-h-0 min-w-0 flex-col lg:col-span-9">
        <SystemProShell
          class="min-h-0 flex-1"
          table-title="用户列表"
          :show-column-setting="false"
          @search="doSearch"
          @reset="resetQuery"
          @refresh="fetchList"
        >
          <template #search>
            <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Form :model="query" class="contents">
                <FormItem name="userName" label="用户账号" class="!mb-0">
                  <Input v-model:value="query.userName" allow-clear placeholder="用户账号" @press-enter="doSearch" />
                </FormItem>
                <FormItem name="phonenumber" label="手机号码" class="!mb-0">
                  <Input v-model:value="query.phonenumber" allow-clear placeholder="手机号码" @press-enter="doSearch" />
                </FormItem>
                <FormItem name="status" label="状态" class="!mb-0">
                  <Select v-model:value="query.status" allow-clear placeholder="状态" class="w-full"
                    :options="statusOptions" />
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
              新增用户
            </Button>
          </template>

          <SystemProTable
            row-key="userId"
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
                <Switch :checked="asUserRow(record).status === '0'" checked-children="已启用" un-checked-children="已禁用"
                  :disabled="asUserRow(record).userId === 1" @change="() => onToggleStatus(asUserRow(record))" />
              </template>
              <template v-else-if="column.key === 'action'">
                <div class="flex flex-wrap items-center gap-1">
                  <Button type="link" size="small" class="!px-1" :disabled="asUserRow(record).userId === 1"
                    @click="openEdit(asUserRow(record))">
                    修改
                  </Button>
                  <Button type="link" size="small" class="!px-1" :disabled="asUserRow(record).userId === 1"
                    @click="openResetPwd(asUserRow(record))">
                    重置密码
                  </Button>
                  <Button type="link" size="small" class="!px-1" :disabled="asUserRow(record).userId === 1"
                    @click="openAuthRole(asUserRow(record))">
                    分配角色
                  </Button>
                  <Button type="link" size="small" danger class="!px-1" :disabled="asUserRow(record).userId === 1"
                    @click="() => onDelete(asUserRow(record))">
                    删除
                  </Button>
                </div>
              </template>
            </template>
          </SystemProTable>
        </SystemProShell>
      </div>
    </div>

    <Modal v-model:open="editOpen" :title="editForm.userId ? '修改用户' : '新增用户'" width="900px"
      :confirm-loading="editLoading" @ok="submitEdit">
      <Form layout="vertical">
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormItem v-if="!editForm.userId" label="用户账号">
            <Input v-model:value="editForm.userName" :maxlength="30" />
          </FormItem>
          <FormItem v-if="!editForm.userId" label="用户密码">
            <InputPassword v-model:value="editForm.password" :maxlength="20" />
          </FormItem>
          <FormItem label="用户昵称">
            <Input v-model:value="editForm.nickName" :maxlength="30" />
          </FormItem>
          <FormItem label="归属部门">
            <TreeSelect v-model:value="editForm.deptId" :tree-data="deptOptions"
              :field-names="{ value: 'id', label: 'label', children: 'children' }" tree-default-expand-all allow-clear
              placeholder="请选择归属部门" />
          </FormItem>
          <FormItem label="手机号码">
            <Input v-model:value="editForm.phonenumber" :maxlength="11" />
          </FormItem>
          <FormItem label="邮箱">
            <Input v-model:value="editForm.email" :maxlength="50" />
          </FormItem>
          <FormItem label="用户性别">
            <Select v-model:value="editForm.sex" :options="sexOptions" />
          </FormItem>
          <FormItem label="状态">
            <Select v-model:value="editForm.status" :options="statusOptions" />
          </FormItem>
          <FormItem label="岗位">
            <Select v-model:value="editForm.postIds" mode="multiple"
              :options="postOptions.map((p) => ({ label: p.postName, value: p.postId, disabled: p.status == 1 }))" />
          </FormItem>
          <FormItem label="角色">
            <Select v-model:value="editForm.roleIds" mode="multiple"
              :options="roleOptions.map((r) => ({ label: r.roleName, value: r.roleId, disabled: r.status == 1 }))" />
          </FormItem>
        </div>
        <FormItem label="备注">
          <TextArea v-model:value="editForm.remark" :rows="3" />
        </FormItem>
      </Form>
    </Modal>

    <Modal v-model:open="resetOpen" title="重置密码" :confirm-loading="resetLoading" @ok="submitResetPwd">
      <Form layout="vertical">
        <FormItem label="用户账号">
          <Input :value="resetUserName" readonly />
        </FormItem>
        <FormItem label="新密码">
          <InputPassword v-model:value="resetPwd" placeholder="5-20 位" />
        </FormItem>
      </Form>
    </Modal>

  </Page>
</template>
