<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Button, FormItem, Input, message, Modal, Table } from 'antdv-next';

import { authUserSelectAll, unallocatedUserList } from '#/api';

const props = defineProps<{
  roleId: number;
}>();

const emit = defineEmits<{ ok: [] }>();

const open = ref(false);
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

const columns = [
  { title: '用户账号', dataIndex: 'userName' },
  { title: '用户昵称', dataIndex: 'nickName' },
  { title: '邮箱', dataIndex: 'email' },
  { title: '手机', dataIndex: 'phonenumber' },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
];

const rowSelection = computed(() => ({
  selectedRowKeys: selectedKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedKeys.value = keys.map((k) => Number(k));
  },
}));

function show() {
  query.pageNum = 1;
  query.userName = '';
  query.phonenumber = '';
  selectedKeys.value = [];
  open.value = true;
  fetchList();
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await unallocatedUserList({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      roleId: props.roleId,
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

async function confirm() {
  const uIds = selectedKeys.value.join(',');
  if (!uIds) {
    message.warning('请选择要分配的用户');
    return;
  }
  await authUserSelectAll({ roleId: props.roleId, userIds: uIds });
  message.success('分配成功');
  open.value = false;
  emit('ok');
}

defineExpose({ show });
</script>

<template>
  <Modal v-model:open="open" title="选择用户" width="880px" :footer="null" destroy-on-close>
    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      <FormItem label="用户账号" class="!mb-0">
        <Input v-model:value="query.userName" allow-clear placeholder="用户账号" @press-enter="doSearch" />
      </FormItem>
      <FormItem label="手机号码" class="!mb-0">
        <Input v-model:value="query.phonenumber" allow-clear placeholder="手机号码" @press-enter="doSearch" />
      </FormItem>
      <div class="flex items-end gap-2">
        <Button type="primary" @click="doSearch">搜索</Button>
        <Button @click="resetQuery">重置</Button>
      </div>
    </div>
    <Table
      row-key="userId"
      :loading="loading"
      :columns="columns"
      :data-source="rows"
      size="middle"
      :row-selection="rowSelection"
      :scroll="{ y: 260 }"
      :pagination="{
        current: query.pageNum,
        pageSize: query.pageSize,
        total,
        showSizeChanger: true,
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
      </template>
    </Table>
    <div class="mt-4 flex justify-end gap-2">
      <Button @click="open = false">取消</Button>
      <Button type="primary" @click="confirm">确定</Button>
    </div>
  </Modal>
</template>
