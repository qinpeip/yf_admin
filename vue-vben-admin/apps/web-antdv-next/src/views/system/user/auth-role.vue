<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Button, Card, Form, FormItem, Input, message, Table } from 'antdv-next';

import { getUserAuthRole, updateUserAuthRole } from '#/api';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const userId = ref<number | null>(null);
const form = ref<{ nickName?: string; userName?: string }>({});
const roles = ref<any[]>([]);
const selectedKeys = ref<number[]>([]);

const pageNum = ref(1);
const pageSize = ref(10);

const pagedRoles = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value;
  return roles.value.slice(start, start + pageSize.value);
});

const columns = [
  { title: '角色编号', dataIndex: 'roleId', width: 100 },
  { title: '角色名称', dataIndex: 'roleName' },
  { title: '权限字符', dataIndex: 'roleKey' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedKeys.value = keys.map((k) => Number(k));
  },
  getCheckboxProps: (record: any) => ({
    disabled: record.roleId === 1,
  }),
}));

function onRoleTablePageChange(page: number, ps: number) {
  pageNum.value = page;
  pageSize.value = ps;
}

async function load() {
  const id = Number(route.params.userId);
  if (!id) {
    message.error('无效的用户');
    router.push('/system/user');
    return;
  }
  userId.value = id;
  loading.value = true;
  try {
    const resp = await getUserAuthRole(id);
    const u = resp?.user ?? resp;
    form.value = {
      nickName: u?.nickName,
      userName: u?.userName,
    };
    const list = resp?.roles ?? u?.roles ?? [];
    roles.value = Array.isArray(list) ? list : [];
    selectedKeys.value = roles.value.filter((r: any) => r?.flag).map((r: any) => Number(r.roleId));
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!userId.value) return;
  submitting.value = true;
  try {
    await updateUserAuthRole(userId.value, selectedKeys.value);
    message.success('授权成功');
    router.push('/system/user');
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push('/system/user');
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <Card :bordered="false" class="rounded-lg border border-[#f0f0f0] shadow-sm dark:border-white/10">
      <h3 class="mb-4 text-base font-medium">基本信息</h3>
      <Form layout="vertical" class="max-w-2xl">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormItem label="用户昵称">
            <Input :value="form.nickName" readonly />
          </FormItem>
          <FormItem label="登录账号">
            <Input :value="form.userName" readonly />
          </FormItem>
        </div>
      </Form>

      <h3 class="mb-4 mt-8 text-base font-medium">角色信息</h3>
      <Table
        row-key="roleId"
        :loading="loading"
        :columns="columns"
        :data-source="pagedRoles"
        :row-selection="rowSelection"
        size="middle"
        :pagination="{
          current: pageNum,
          pageSize,
          total: roles.length,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: onRoleTablePageChange,
        }"
      />

      <div class="mt-8 flex justify-center gap-3">
        <Button type="primary" :loading="submitting" @click="submit">提交</Button>
        <Button @click="goBack">返回</Button>
      </div>
    </Card>
  </Page>
</template>
