<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Form, FormItem, Input, message, Modal, Select, Table } from 'antdv-next';

import {
  addRegion,
  delRegion,
  getRegion,
  listRegion,
  type RegionRow,
  updateRegion,
} from '#/api/system/region';
import { SystemProShell } from '#/components/system-pro';
import { useDict } from '#/composables/use-dict';

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
  name: '',
  level: '0',
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
      name: query.name,
      ...(query.level === '0' ? {} : { level: query.level }),
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
  query.name = '';
  query.level = '0';
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
  { title: '简称', dataIndex: 'shortname' },
  { title: '名称', dataIndex: 'name' },
  { title: '全称', dataIndex: 'mergerName' },
  { title: '省市区', dataIndex: 'level', key: 'level' },
  { title: '拼音', dataIndex: 'pinyin' },
  { title: '首字母', dataIndex: 'first' },
  { title: '排序', dataIndex: 'sort' },
  { title: '操作', key: 'action', width: 200 },
]);

fetchList();

const region_type = useDict('region_type');
const region_type_options = computed(() => region_type.region_type?.value?.map((item: any) => ({ label: item.label, value: item.value })));
</script>

<template>
  <Page auto-content-height>
    <SystemProShell table-title="地区表" :show-column-setting="false" @search="doSearch" @reset="resetQuery"
      @refresh="fetchList">
      <template #search>
        <Form :model="query">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="name" label="地区名称" class="!mb-0">
              <Input v-model:value="query.name" allow-clear placeholder="请输入地区名称" @press-enter="doSearch" />
            </FormItem>
            <FormItem name="level" label="地区类型" class="!mb-0">
              <Select v-model:value="query.level" allow-clear placeholder="请选择地区类型" class="w-full"
                :options="region_type_options" />
              <!-- <Input v-model:value="query.level" allow-clear placeholder="请输入层级 1 2 3 省市区县" @press-enter="doSearch" /> -->
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
          <template v-if="column.key === 'level'">
            <span>{{ region_type_options?.find((item: any) => +item.value === +record.level)?.label ?? '—' }}</span>
          </template>
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
