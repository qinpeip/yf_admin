<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { SystemProShell, SystemProTable } from '#/components/system-pro';

import { Button, Form, FormItem, Input, message, Modal } from 'antdv-next';

import { allocatedUserList, authUserCancel, authUserCancelAll } from '#/api';

import RoleSelectUser from './select-user.vue';

const route = useRoute();
const router = useRouter();

const roleId = ref(0);
const loading = ref(false);
const rows = ref<any[]>([]);
const total = ref(0);
const selectedKeys = ref<number[]>([]);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  userName: '',
  phonenumber: '',
});

const selectRef = ref<InstanceType<typeof RoleSelectUser> | null>(null);

const columns = computed(() => [
  { title: '用户账号', dataIndex: 'userName' },
  { title: '用户昵称', dataIndex: 'nickName' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '手机', dataIndex: 'phonenumber' },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 120 },
]);

const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedKeys.value = keys.map((k) => Number(k));
  },
}));

async function fetchList() {
  loading.value = true;
  try {
    const data = await allocatedUserList({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      roleId: roleId.value,
      userName: query.userName || undefined,
      phonenumber: query.phonenumber || undefined,
    });
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
  query.userName = '';
  query.phonenumber = '';
  doSearch();
}

function goBack() {
  router.push('/system/role');
}

function openSelectUser() {
  selectRef.value?.show();
}

async function cancelOne(row: any) {
  Modal.confirm({
    title: '确认取消授权',
    content: `确认要取消用户「${row.userName}」的该角色吗？`,
    async onOk() {
      await authUserCancel({ userId: row.userId, roleId: roleId.value });
      message.success('取消授权成功');
      await fetchList();
    },
  });
}

async function cancelBatch() {
  if (!selectedKeys.value.length) return;
  const uIds = selectedKeys.value.join(',');
  Modal.confirm({
    title: '批量取消授权',
    content: '是否取消选中用户的授权？',
    async onOk() {
      await authUserCancelAll({ roleId: roleId.value, userIds: uIds });
      message.success('取消授权成功');
      selectedKeys.value = [];
      await fetchList();
    },
  });
}

onMounted(() => {
  const id = Number(route.params.roleId);
  if (!id) {
    message.error('无效的角色');
    router.push('/system/role');
    return;
  }
  roleId.value = id;
  fetchList();
});
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="分配用户"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <Form :model="query" class="contents">
            <FormItem name="userName" label="用户账号" class="!mb-0">
              <Input v-model:value="query.userName" allow-clear placeholder="用户账号" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="phonenumber" label="手机号码" class="!mb-0">
              <Input v-model:value="query.phonenumber" allow-clear placeholder="手机号码" @press-enter="doSearch" />
            </FormItem>
          </Form>
        </div>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openSelectUser">添加用户</Button>
        <Button danger :disabled="!selectedKeys.length" @click="cancelBatch">批量取消授权</Button>
        <Button @click="goBack">关闭</Button>
      </template>

      <SystemProTable
        row-key="userId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        :row-selection="rowSelection"
        :scroll="{ x: 1000 }"
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
            {{ record.status === '0' ? '正常' : '停用' }}
          </template>
          <template v-else-if="column.key === 'action'">
            <Button type="link" size="small" class="!px-1" danger @click="cancelOne(record)">取消授权</Button>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>

    <RoleSelectUser v-if="roleId" ref="selectRef" :role-id="roleId" @ok="fetchList" />
  </Page>
</template>
