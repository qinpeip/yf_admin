<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { computed, reactive, ref } from 'vue';

import { SystemProShell } from '#/components/system-pro';

import { Button, FormItem, Input, message, Modal, Table } from 'antdv-next';

import { forceLogout, listOnline } from '#/api';

type OnlineRow = {
  tokenId: string;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  os?: string;
  browser?: string;
  loginTime?: string;
  deptName?: string;
};

const loading = ref(false);
const rows = ref<OnlineRow[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  ipaddr: '',
  userName: '',
});

function asOnlineRow(x: any): OnlineRow {
  return x as OnlineRow;
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await listOnline({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      ipaddr: query.ipaddr || undefined,
      userName: query.userName || undefined,
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
  query.ipaddr = '';
  query.userName = '';
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onForceLogout(row: OnlineRow) {
  Modal.confirm({
    title: '确认强退',
    content: `是否确认强退用户「${row.userName}」？`,
    async onOk() {
      await forceLogout(row.tokenId);
      message.success('强退成功');
      await fetchList();
    },
  });
}

const columns = computed<any[]>(() => [
  { title: '会话编号', dataIndex: 'tokenId', width: 220 },
  { title: '登录账号', dataIndex: 'userName', width: 160 },
  { title: '所属部门', dataIndex: 'deptName', width: 160 },
  { title: '主机', dataIndex: 'ipaddr', width: 140 },
  { title: '登录地点', dataIndex: 'loginLocation', width: 160 },
  { title: '操作系统', dataIndex: 'os', width: 140 },
  { title: '浏览器', dataIndex: 'browser', width: 140 },
  { title: '登录时间', dataIndex: 'loginTime', width: 180 },
  { title: '操作', key: 'action', width: 120 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell
      table-title="在线用户"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <FormItem label="登录地址" class="!mb-0">
            <Input v-model:value="query.ipaddr" allow-clear placeholder="登录地址" @press-enter="doSearch" />
          </FormItem>
          <FormItem label="用户账号" class="!mb-0">
            <Input v-model:value="query.userName" allow-clear placeholder="用户账号" @press-enter="doSearch" />
          </FormItem>
        </div>
      </template>

      <Table
        row-key="tokenId"
        class="system-pro-table"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        size="middle"
        :scroll="{ x: 1200 }"
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
          <template v-if="column.key === 'action'">
            <Button type="link" size="small" danger class="!px-1" @click="onForceLogout(asOnlineRow(record))">强退</Button>
          </template>
        </template>
      </Table>
    </SystemProShell>
  </Page>
</template>

