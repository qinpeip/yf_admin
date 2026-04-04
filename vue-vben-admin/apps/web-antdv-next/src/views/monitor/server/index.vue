<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { computed, ref } from 'vue';

import { SystemProShell } from '#/components/system-pro';

import { Card, Table, Tag } from 'antdv-next';

import { getServerInfo } from '#/api';

const loading = ref(false);
const server = ref<any>({});

async function fetchInfo() {
  loading.value = true;
  try {
    server.value = await getServerInfo();
  } finally {
    loading.value = false;
  }
}

const cpuRows = computed(() => {
  const cpu = server.value?.cpu || {};
  return [
    { k: '核心数', v: cpu.cpuNum },
    { k: '用户使用率', v: `${cpu.used}%` },
    { k: '系统使用率', v: `${cpu.sys}%` },
    { k: '当前空闲率', v: `${cpu.free}%` },
  ];
});

const memRows = computed(() => {
  const mem = server.value?.mem || {};
  const jvm = server.value?.jvm || {};
  return [
    { k: '总内存', mem: `${mem.total}G`, jvm: `${jvm.total}M` },
    { k: '已用内存', mem: `${mem.used}G`, jvm: `${jvm.used}M` },
    { k: '剩余内存', mem: `${mem.free}G`, jvm: `${jvm.free}M` },
    {
      k: '使用率',
      mem: mem.usage != null ? `${mem.usage}%` : '',
      jvm: jvm.usage != null ? `${jvm.usage}%` : '',
      memDanger: Number(mem.usage || 0) > 80,
      jvmDanger: Number(jvm.usage || 0) > 80,
    },
  ];
});

const sysRows = computed(() => {
  const sys = server.value?.sys || {};
  return [
    { k1: '服务器名称', v1: sys.computerName, k2: '操作系统', v2: sys.osName },
    { k1: '服务器IP', v1: sys.computerIp, k2: '系统架构', v2: sys.osArch },
  ];
});

const diskRows = computed(() => server.value?.sysFiles || []);

fetchInfo();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="服务监控" :show-search="false" :show-column-setting="false" @refresh="fetchInfo">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="CPU" :loading="loading">
        <Table
          row-key="k"
          :columns="[{ title: '属性', dataIndex: 'k' }, { title: '值', dataIndex: 'v' }]"
          :data-source="cpuRows"
          :pagination="false"
          size="small"
        />
      </Card>
      <Card title="内存" :loading="loading">
        <Table
          row-key="k"
          :columns="[
            { title: '属性', dataIndex: 'k' },
            { title: '内存', dataIndex: 'mem' },
            { title: 'JVM', dataIndex: 'jvm' },
          ]"
          :data-source="memRows"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="record.k === '使用率' && (column.dataIndex === 'mem' || column.dataIndex === 'jvm')">
              <Tag :color="column.dataIndex === 'mem' ? (record.memDanger ? 'red' : 'green') : (record.jvmDanger ? 'red' : 'green')">
                {{ column.dataIndex === 'mem' ? record.mem : record.jvm }}
              </Tag>
            </template>
          </template>
        </Table>
      </Card>
      <Card class="lg:col-span-2" title="服务器信息" :loading="loading">
        <Table
          row-key="k1"
          :columns="[
            { title: '属性', dataIndex: 'k1' },
            { title: '值', dataIndex: 'v1' },
            { title: '属性', dataIndex: 'k2' },
            { title: '值', dataIndex: 'v2' },
          ]"
          :data-source="sysRows"
          :pagination="false"
          size="small"
        />
      </Card>
      <Card class="lg:col-span-2" title="磁盘状态" :loading="loading">
        <Table
          row-key="dirName"
          :columns="[
            { title: '盘符路径', dataIndex: 'dirName' },
            { title: '文件系统', dataIndex: 'sysTypeName' },
            { title: '盘符类型', dataIndex: 'typeName' },
            { title: '总大小', dataIndex: 'total' },
            { title: '可用大小', dataIndex: 'free' },
            { title: '已用大小', dataIndex: 'used' },
            { title: '已用百分比', dataIndex: 'usage' },
          ]"
          :data-source="diskRows"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'usage'">
              <Tag :color="Number(record.usage || 0) > 80 ? 'red' : 'green'">{{ record.usage }}%</Tag>
            </template>
          </template>
        </Table>
      </Card>
    </div>
    </SystemProShell>
  </Page>
</template>

