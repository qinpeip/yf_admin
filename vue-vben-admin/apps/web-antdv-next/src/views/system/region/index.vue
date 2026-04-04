<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, DatePicker, Form, FormItem, Input, message, Modal, Table } from 'antdv-next';

import {
  addRegion,
  delRegion,
  getRegion,
  listRegion,
  type RegionRow,
  updateRegion,
} from '#/api/system/region';
import { SystemProShell } from '#/components/system-pro';

/** 地区表 */
type Row = RegionRow;

function asRow(x: unknown): Row {
  return x as Row;
}

const loading = ref(false);
const rows = ref<Row[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  id: undefined as number | undefined,
  tenantId: undefined as number | undefined,
  ownerUserId: undefined as number | undefined,
  createBy: '',
  createTime: undefined as [string, string] | undefined,
  updateBy: '',
  updateTime: undefined as [string, string] | undefined,
  deleteTime: undefined as [string, string] | undefined,
  pid: undefined as number | undefined,
  shortname: '',
  name: '',
  mergerName: '',
  level: undefined as number | undefined,
  pinyin: '',
  code: '',
  zipCode: '',
  first: '',
  lng: '',
  lat: '',
  sort: undefined as number | undefined,
});

const selectedRowKeys = ref<(number | string)[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (number | string)[]) => {
    selectedRowKeys.value = keys;
  },
}));

async function fetchList() {
  loading.value = true;
  try {
    const data = await listRegion({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      id: query.id,
      tenantId: query.tenantId,
      ownerUserId: query.ownerUserId,
      createBy: query.createBy || undefined,
      ...(query.createTime?.[0] && query.createTime?.[1] ? { createTime: query.createTime } : {}),
      updateBy: query.updateBy || undefined,
      ...(query.updateTime?.[0] && query.updateTime?.[1] ? { updateTime: query.updateTime } : {}),
      ...(query.deleteTime?.[0] && query.deleteTime?.[1] ? { deleteTime: query.deleteTime } : {}),
      pid: query.pid,
      shortname: query.shortname || undefined,
      name: query.name || undefined,
      mergerName: query.mergerName || undefined,
      level: query.level,
      pinyin: query.pinyin || undefined,
      code: query.code || undefined,
      zipCode: query.zipCode || undefined,
      first: query.first || undefined,
      lng: query.lng || undefined,
      lat: query.lat || undefined,
      sort: query.sort,
    });
    rows.value = (data?.list ?? []) as Row[];
    total.value = Number(data?.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.id = undefined;
  query.tenantId = undefined;
  query.ownerUserId = undefined;
  query.createBy = '';
  query.createTime = undefined;
  query.updateBy = '';
  query.updateTime = undefined;
  query.deleteTime = undefined;
  query.pid = undefined;
  query.shortname = '';
  query.name = '';
  query.mergerName = '';
  query.level = undefined;
  query.pinyin = '';
  query.code = '';
  query.zipCode = '';
  query.first = '';
  query.lng = '';
  query.lat = '';
  query.sort = undefined;
  fetchList();
}

function doSearch() {
  query.pageNum = 1;
  fetchList();
}

async function onBatchDelete() {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的数据');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除选中的 ${selectedRowKeys.value.length} 条记录？`,
    async onOk() {
      await delRegion(selectedRowKeys.value as any);
      message.success('删除成功');
      selectedRowKeys.value = [];
      await fetchList();
    },
  });
}

async function onDelete(row: Row) {
  Modal.confirm({
    title: '确认删除',
    content: '是否确认删除该条记录？',
    async onOk() {
      await delRegion(row.id as any);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
const editForm = reactive<Partial<Row>>({});

function openAdd() {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  (editForm as any).tenantId = undefined;
  (editForm as any).ownerUserId = undefined;
  (editForm as any).updateBy = '';
  (editForm as any).updateTime = '';
  (editForm as any).deleteTime = '';
  (editForm as any).pid = undefined;
  (editForm as any).shortname = '';
  (editForm as any).name = '';
  (editForm as any).mergerName = '';
  (editForm as any).level = undefined;
  (editForm as any).pinyin = '';
  (editForm as any).code = '';
  (editForm as any).zipCode = '';
  (editForm as any).first = '';
  (editForm as any).lng = '';
  (editForm as any).lat = '';
  (editForm as any).sort = undefined;
  editOpen.value = true;
}

async function openEdit(row: Row) {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  const detail = await getRegion(row.id as any);
  Object.assign(editForm, detail as object);
  editOpen.value = true;
}

async function submitEdit() {
  await (editForm.id ? updateRegion(editForm as any) : addRegion(editForm as any));
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed(() => [
  { title: '地区ID', dataIndex: 'id', width: 90 },
  { title: '租户ID', dataIndex: 'tenantId' },
  { title: '数据所有者用户ID', dataIndex: 'ownerUserId' },
  { title: '删除时间', dataIndex: 'deleteTime' },
  { title: '父ID', dataIndex: 'pid' },
  { title: '简称', dataIndex: 'shortname' },
  { title: '名称', dataIndex: 'name' },
  { title: '全称', dataIndex: 'mergerName' },
  { title: '层级 1 2 3 省市区县', dataIndex: 'level' },
  { title: '拼音', dataIndex: 'pinyin' },
  { title: '长途区号', dataIndex: 'code' },
  { title: '邮编', dataIndex: 'zipCode' },
  { title: '首字母', dataIndex: 'first' },
  { title: '经度', dataIndex: 'lng' },
  { title: '纬度', dataIndex: 'lat' },
  { title: '排序', dataIndex: 'sort' },
  { title: '操作', key: 'action', width: 200 },
]);

fetchList();
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="地区表" :show-column-setting="false" @search="doSearch" @reset="resetQuery"
      @refresh="fetchList"
>
      <template #search>
        <Form :model="query">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
<FormItem name="id" label="地区ID" class="!mb-0">
              <Input v-model:value="query.id" allow-clear placeholder="请输入地区ID" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="tenantId" label="租户ID" class="!mb-0">
              <Input v-model:value="query.tenantId" allow-clear placeholder="请输入租户ID" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="ownerUserId" label="数据所有者用户ID" class="!mb-0">
              <Input v-model:value="query.ownerUserId" allow-clear placeholder="请输入数据所有者用户ID" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="createBy" label="创建者" class="!mb-0">
              <Input v-model:value="query.createBy" allow-clear placeholder="请输入创建者" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="createTime" label="创建时间" class="!mb-0">
              <DatePicker.RangePicker v-model:value="query.createTime" class="w-full" value-format="YYYY-MM-DD" />
            </FormItem>
            <FormItem name="updateBy" label="更新者" class="!mb-0">
              <Input v-model:value="query.updateBy" allow-clear placeholder="请输入更新者" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="updateTime" label="更新时间" class="!mb-0">
              <DatePicker.RangePicker v-model:value="query.updateTime" class="w-full" value-format="YYYY-MM-DD" />
            </FormItem>
            <FormItem name="deleteTime" label="删除时间" class="!mb-0">
              <DatePicker.RangePicker v-model:value="query.deleteTime" class="w-full" value-format="YYYY-MM-DD" />
            </FormItem>
            <FormItem name="pid" label="父ID" class="!mb-0">
              <Input v-model:value="query.pid" allow-clear placeholder="请输入父ID" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="shortname" label="简称" class="!mb-0">
              <Input v-model:value="query.shortname" allow-clear placeholder="请输入简称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="name" label="名称" class="!mb-0">
              <Input v-model:value="query.name" allow-clear placeholder="请输入名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="mergerName" label="全称" class="!mb-0">
              <Input v-model:value="query.mergerName" allow-clear placeholder="请输入全称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="level" label="层级 1 2 3 省市区县" class="!mb-0">
              <Input v-model:value="query.level" allow-clear placeholder="请输入层级 1 2 3 省市区县" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="pinyin" label="拼音" class="!mb-0">
              <Input v-model:value="query.pinyin" allow-clear placeholder="请输入拼音" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="code" label="长途区号" class="!mb-0">
              <Input v-model:value="query.code" allow-clear placeholder="请输入长途区号" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="zipCode" label="邮编" class="!mb-0">
              <Input v-model:value="query.zipCode" allow-clear placeholder="请输入邮编" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="first" label="首字母" class="!mb-0">
              <Input v-model:value="query.first" allow-clear placeholder="请输入首字母" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="lng" label="经度" class="!mb-0">
              <Input v-model:value="query.lng" allow-clear placeholder="请输入经度" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="lat" label="纬度" class="!mb-0">
              <Input v-model:value="query.lat" allow-clear placeholder="请输入纬度" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="sort" label="排序" class="!mb-0">
              <Input v-model:value="query.sort" allow-clear placeholder="请输入排序" @press-enter="doSearch" />
            </FormItem>
          </div>
        </Form>
      </template>

      <template #toolbar-actions>
        <Button type="primary" @click="openAdd">
          <Plus class="mr-1 inline size-4" />
          新增
        </Button>
        <Button danger :disabled="selectedRowKeys.length === 0" @click="onBatchDelete">删除</Button>
      </template>

      <Table row-key="id" class="system-pro-table" :row-selection="rowSelection" :loading="loading" :columns="columns"
        :data-source="rows" size="middle" :pagination="{
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
        }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asRow(record))">修改</Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asRow(record))">删除</Button>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'deleteTime'">
            <span>{{ asRow(record).deleteTime ?? '—' }}</span>
          </template>
        </template>
      </Table>
    </SystemProShell>

    <Modal v-model:open="editOpen" :title="editForm.id ? '修改地区表' : '新增地区表'" @ok="submitEdit">
      <Form layout="vertical">

        <FormItem label="租户ID">
          <Input v-model:value="(editForm as any).tenantId" placeholder="请输入租户ID" />
        </FormItem>
        <FormItem label="数据所有者用户ID">
          <Input v-model:value="(editForm as any).ownerUserId" placeholder="请输入数据所有者用户ID" />
        </FormItem>
        <FormItem label="更新者">
          <Input v-model:value="(editForm as any).updateBy" placeholder="请输入更新者" />
        </FormItem>
        <FormItem label="更新时间">
          <Input v-model:value="(editForm as any).updateTime" placeholder="YYYY-MM-DD 或带时间" />
        </FormItem>
        <FormItem label="删除时间">
          <Input v-model:value="(editForm as any).deleteTime" placeholder="YYYY-MM-DD 或带时间" />
        </FormItem>
        <FormItem label="父ID">
          <Input v-model:value="(editForm as any).pid" placeholder="请输入父ID" />
        </FormItem>
        <FormItem label="简称">
          <Input v-model:value="(editForm as any).shortname" placeholder="请输入简称" />
        </FormItem>
        <FormItem label="名称">
          <Input v-model:value="(editForm as any).name" placeholder="请输入名称" />
        </FormItem>
        <FormItem label="全称">
          <Input v-model:value="(editForm as any).mergerName" placeholder="请输入全称" />
        </FormItem>
        <FormItem label="层级 1 2 3 省市区县">
          <Input v-model:value="(editForm as any).level" placeholder="请输入层级 1 2 3 省市区县" />
        </FormItem>
        <FormItem label="拼音">
          <Input v-model:value="(editForm as any).pinyin" placeholder="请输入拼音" />
        </FormItem>
        <FormItem label="长途区号">
          <Input v-model:value="(editForm as any).code" placeholder="请输入长途区号" />
        </FormItem>
        <FormItem label="邮编">
          <Input v-model:value="(editForm as any).zipCode" placeholder="请输入邮编" />
        </FormItem>
        <FormItem label="首字母">
          <Input v-model:value="(editForm as any).first" placeholder="请输入首字母" />
        </FormItem>
        <FormItem label="经度">
          <Input v-model:value="(editForm as any).lng" placeholder="请输入经度" />
        </FormItem>
        <FormItem label="纬度">
          <Input v-model:value="(editForm as any).lat" placeholder="请输入纬度" />
        </FormItem>
        <FormItem label="排序">
          <Input v-model:value="(editForm as any).sort" placeholder="请输入排序" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
