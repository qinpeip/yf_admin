<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { computed, reactive, ref } from 'vue';

import { SystemProShell } from '#/components/system-pro';

import { Button, Card, Form, FormItem, Input, message, Modal, Table, TextArea } from 'antdv-next';

import {
  clearCacheAll,
  clearCacheKey,
  clearCacheName,
  getCacheValue,
  listCacheKey,
  listCacheName,
} from '#/api';

type CacheNameRow = { cacheName: string; remark?: string };

const loadingNames = ref(false);
const loadingKeys = ref(false);
const cacheNames = ref<CacheNameRow[]>([]);
const cacheKeys = ref<string[]>([]);

const nowCacheName = ref('');
const cacheForm = reactive({
  cacheName: '',
  cacheKey: '',
  cacheValue: '',
});

function asCacheNameRow(x: any): CacheNameRow {
  return x as CacheNameRow;
}

async function fetchNames() {
  loadingNames.value = true;
  try {
    cacheNames.value = (await listCacheName()) as any;
  } finally {
    loadingNames.value = false;
  }
}

async function fetchKeys(cacheName?: string) {
  const name = cacheName ?? nowCacheName.value;
  if (!name) return;
  loadingKeys.value = true;
  try {
    cacheKeys.value = (await listCacheKey(name)) as any;
    nowCacheName.value = name;
    cacheForm.cacheName = name;
    cacheForm.cacheKey = '';
    cacheForm.cacheValue = '';
  } finally {
    loadingKeys.value = false;
  }
}

async function fetchValue(key: string) {
  if (!nowCacheName.value || !key) return;
  const data = await getCacheValue(nowCacheName.value, key);
  cacheForm.cacheName = data?.cacheName ?? nowCacheName.value;
  cacheForm.cacheKey = data?.cacheKey ?? key;
  cacheForm.cacheValue = String(data?.cacheValue ?? '');
}

async function onClearName(row: CacheNameRow) {
  await clearCacheName(row.cacheName);
  message.success(`清理缓存名称[${row.cacheName}]成功`);
  await fetchKeys(row.cacheName);
}

async function onClearKey(key: string) {
  await clearCacheKey(key);
  message.success(`清理缓存键名[${key}]成功`);
  await fetchKeys();
}

async function onClearAll() {
  Modal.confirm({
    title: '确认清理全部',
    content: '是否确认清理全部缓存？',
    async onOk() {
      await clearCacheAll();
      message.success('清理全部缓存成功');
      await fetchNames();
      cacheKeys.value = [];
      nowCacheName.value = '';
      cacheForm.cacheName = '';
      cacheForm.cacheKey = '';
      cacheForm.cacheValue = '';
    },
  });
}

const nameColumns = computed<any[]>(() => [
  { title: '缓存名称', dataIndex: 'cacheName' },
  { title: '备注', dataIndex: 'remark' },
  { title: '操作', key: 'action', width: 90 },
]);

const keyColumns = computed<any[]>(() => [
  { title: '缓存键名', dataIndex: 'key' },
  { title: '操作', key: 'action', width: 90 },
]);

async function refreshPage() {
  await fetchNames();
  if (nowCacheName.value) await fetchKeys();
}

fetchNames();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="缓存列表" :show-search="false" :show-column-setting="false" @refresh="refreshPage">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title="缓存列表" :loading="loadingNames">
        <div class="mb-3 flex justify-end">
          <Button size="small" @click="fetchNames">刷新</Button>
        </div>
        <Table
          row-key="cacheName"
          :columns="nameColumns"
          :data-source="cacheNames"
          :pagination="false"
          @row-click="(record: any) => fetchKeys(asCacheNameRow(record).cacheName)"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <Button size="small" danger @click.stop="onClearName(asCacheNameRow(record))">删</Button>
            </template>
          </template>
        </Table>
      </Card>

      <Card title="键名列表" :loading="loadingKeys">
        <div class="mb-3 flex justify-end">
          <Button size="small" :disabled="!nowCacheName" @click="fetchKeys()">刷新</Button>
        </div>
        <Table
          row-key="key"
          :columns="keyColumns"
          :data-source="cacheKeys.map((k) => ({ key: k }))"
          :pagination="false"
          @row-click="(record: any) => fetchValue(record.key)"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <Button size="small" danger @click.stop="onClearKey(record.key)">删</Button>
            </template>
          </template>
        </Table>
      </Card>

      <Card title="缓存内容">
        <div class="mb-3 flex justify-end">
          <Button danger size="small" @click="onClearAll">清理全部</Button>
        </div>
        <Form layout="vertical">
          <FormItem label="缓存名称">
            <Input v-model:value="cacheForm.cacheName" readonly />
          </FormItem>
          <FormItem label="缓存键名">
            <Input v-model:value="cacheForm.cacheKey" readonly />
          </FormItem>
          <FormItem label="缓存内容">
            <TextArea v-model:value="cacheForm.cacheValue" :rows="10" readonly />
          </FormItem>
        </Form>
      </Card>
    </div>
    </SystemProShell>
  </Page>
</template>

