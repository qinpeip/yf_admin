<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Plus, RotateCw } from '@vben/icons';
import { downloadFileFromBlob } from '@vben/utils';
import { computed, reactive, ref } from 'vue';

import { SystemProShell } from '#/components/system-pro';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tree,
} from 'antdv-next';

import {
  addDictData,
  addDictType,
  delDictData,
  delDictType,
  exportDictData,
  exportDictType,
  listDictData,
  listDictType,
  refreshDictCache,
  updateDictData,
  updateDictType,
} from '#/api';

type DictTypeRow = {
  dictId: number;
  dictName: string;
  dictType: string;
  status?: string;
  remark?: string;
  createTime?: string;
};

type DictDataRow = {
  dictCode: number;
  dictLabel: string;
  dictValue: string;
  dictSort: number;
  status?: string;
  remark?: string;
  createTime?: string;
};

function asDictTypeRow(x: any): DictTypeRow {
  return x as DictTypeRow;
}
function asDictDataRow(x: any): DictDataRow {
  return x as DictDataRow;
}

const loading = ref(false);

// left: dict type tree + list
const typeQuery = reactive({
  pageNum: 1,
  pageSize: 9999,
  dictName: '',
  dictType: '',
  status: undefined as undefined | string,
});
const typeRows = ref<DictTypeRow[]>([]);
const selectedType = ref<DictTypeRow | null>(null);
/** 左侧树选中：根节点 `all` = 右侧展示全部字典类型列表；叶子 = 展示该类型下的字典数据 */
const selectedTreeKeys = ref<string[]>(['all']);
const treeSearch = ref('');

const showAllTypes = computed(() => !selectedType.value);

// right: dict data list for selected type
const dataQuery = reactive({
  pageNum: 1,
  pageSize: 9999,
  dictType: '',
  status: undefined as undefined | string,
});
const dataRows = ref<DictDataRow[]>([]);

const statusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' },
];

async function fetchTypes() {
  loading.value = true;
  try {
    const data = await listDictType({
      ...typeQuery,
      dictName: typeQuery.dictName || undefined,
      dictType: typeQuery.dictType || undefined,
      status: typeQuery.status,
    });
    typeRows.value = (data?.list ?? []) as any;
  } finally {
    loading.value = false;
  }
}

async function fetchData() {
  if (!selectedType.value?.dictType) {
    dataRows.value = [];
    return;
  }
  loading.value = true;
  try {
    dataQuery.dictType = selectedType.value.dictType;
    const data = await listDictData({
      ...dataQuery,
      dictType: dataQuery.dictType,
      status: dataQuery.status,
    });
    dataRows.value = (data?.list ?? []) as any;
  } finally {
    loading.value = false;
  }
}

function resetTypeQuery() {
  typeQuery.dictName = '';
  typeQuery.dictType = '';
  typeQuery.status = undefined;
  fetchTypes();
}

function doSearchType() {
  fetchTypes();
}

function resetDataQuery() {
  dataQuery.status = undefined;
  fetchData();
}

function doSearchData() {
  fetchData();
}

// tree nodes
const treeData = computed(() => {
  const nodes = [
    {
      key: 'all',
      title: '全部字典项',
      children: typeRows.value.map((t) => ({
        key: String(t.dictId),
        title: t.dictName,
        data: t,
        isLeaf: true,
      })),
    },
  ];
  return nodes as any[];
});

function onSelectTree(keys: (string | number)[], info: any) {
  selectedDataKeys.value = [];
  const k = keys.length > 0 ? String(keys[0]) : '';
  if (!k) {
    selectedTreeKeys.value = ['all'];
    selectedType.value = null;
    dataRows.value = [];
    return;
  }
  selectedTreeKeys.value = keys as string[];
  if (k === 'all') {
    selectedType.value = null;
    dataRows.value = [];
    return;
  }
  const data = info?.node?.data as DictTypeRow | undefined;
  if (data?.dictId) {
    selectedType.value = data;
    fetchData();
  } else {
    selectedType.value = null;
    dataRows.value = [];
  }
}

function dataLabelTagColor(row: DictDataRow) {
  const v = String(row.dictLabel || '');
  if (v.includes('显示') || row.dictValue === '0') return 'processing' as const;
  if (v.includes('隐藏') || row.dictValue === '1') return 'error' as const;
  return 'default' as const;
}

// edit dialogs
const typeEditOpen = ref(false);
const typeEditForm = reactive<Partial<DictTypeRow>>({
  dictId: undefined,
  dictName: '',
  dictType: '',
  status: '0',
  remark: '',
});
function openAddType() {
  Object.assign(typeEditForm, {
    dictId: undefined,
    dictName: '',
    dictType: '',
    status: '0',
    remark: '',
  });
  typeEditOpen.value = true;
}
function openEditType(row: DictTypeRow) {
  Object.assign(typeEditForm, row);
  typeEditOpen.value = true;
}
async function submitType() {
  if (!typeEditForm.dictName || !typeEditForm.dictType) {
    message.warning('请填写字典名称/字典类型');
    return;
  }
  if (typeEditForm.dictId) await updateDictType(typeEditForm);
  else await addDictType(typeEditForm);
  message.success('保存成功');
  typeEditOpen.value = false;
  await fetchTypes();
}
async function removeType(row: DictTypeRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除字典类型「${row.dictName}」？`,
    async onOk() {
      await delDictType(row.dictId);
      message.success('删除成功');
      if (selectedType.value?.dictId === row.dictId) {
        selectedType.value = null;
        dataRows.value = [];
        selectedTreeKeys.value = ['all'];
      }
      await fetchTypes();
    },
  });
}

const dataEditOpen = ref(false);
const dataEditForm = reactive<Partial<DictDataRow & { dictType: string }>>({
  dictCode: undefined,
  dictType: '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  status: '0',
  remark: '',
});
function openAddData() {
  if (!selectedType.value?.dictType) {
    message.warning('请先选择一个字典类型');
    return;
  }
  Object.assign(dataEditForm, {
    dictCode: undefined,
    dictType: selectedType.value.dictType,
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    status: '0',
    remark: '',
  });
  dataEditOpen.value = true;
}
function openEditData(row: DictDataRow) {
  Object.assign(dataEditForm, row, {
    dictType: selectedType.value?.dictType || '',
  });
  dataEditOpen.value = true;
}
async function submitData() {
  if (!selectedType.value?.dictType) return;
  if (!dataEditForm.dictLabel || dataEditForm.dictValue === undefined) {
    message.warning('请填写字典标签/键值');
    return;
  }
  const payload = { ...dataEditForm, dictType: selectedType.value.dictType };
  if (payload.dictCode) await updateDictData(payload);
  else await addDictData(payload);
  message.success('保存成功');
  dataEditOpen.value = false;
  await fetchData();
}
async function removeData(row: DictDataRow) {
  Modal.confirm({
    title: '确认删除',
    content: `是否确认删除字典数据「${row.dictLabel}」？`,
    async onOk() {
      await delDictData(row.dictCode);
      message.success('删除成功');
      await fetchData();
    },
  });
}

async function onRefreshCache() {
  await refreshDictCache();
  message.success('缓存已刷新');
}

const selectedTypeKeys = ref<number[]>([]);
const typeRowSelection = computed(() => ({
  selectedRowKeys: selectedTypeKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedTypeKeys.value = keys as number[];
  },
}));

const selectedDataKeys = ref<number[]>([]);
const dataRowSelection = computed(() => ({
  selectedRowKeys: selectedDataKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedDataKeys.value = keys as number[];
  },
}));

async function handleExportType() {
  const blob = (await exportDictType({
    dictName: typeQuery.dictName || undefined,
    dictType: typeQuery.dictType || undefined,
    status: typeQuery.status,
  })) as Blob;
  downloadFileFromBlob({ fileName: `dict_type_${Date.now()}.xlsx`, source: blob });
}

async function handleExportData() {
  if (!selectedType.value?.dictType) {
    message.warning('请先选择字典类型');
    return;
  }
  const blob = (await exportDictData({
    dictType: selectedType.value.dictType,
    status: dataQuery.status,
  })) as Blob;
  downloadFileFromBlob({ fileName: `dict_data_${Date.now()}.xlsx`, source: blob });
}

async function batchRemoveType() {
  if (!selectedTypeKeys.value.length) {
    message.warning('请选择字典类型');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `将删除 ${selectedTypeKeys.value.length} 条字典类型，确认？`,
    async onOk() {
      await delDictType(selectedTypeKeys.value);
      message.success('删除成功');
      selectedTypeKeys.value = [];
      selectedType.value = null;
      dataRows.value = [];
      selectedTreeKeys.value = ['all'];
      await fetchTypes();
    },
  });
}

async function batchRemoveData() {
  if (!selectedDataKeys.value.length) {
    message.warning('请选择字典数据');
    return;
  }
  Modal.confirm({
    title: '确认删除',
    content: `将删除 ${selectedDataKeys.value.length} 条字典数据，确认？`,
    async onOk() {
      await delDictData(selectedDataKeys.value);
      message.success('删除成功');
      selectedDataKeys.value = [];
      await fetchData();
    },
  });
}

const typeColumns = computed<any[]>(() => [
  { title: '字典编号', dataIndex: 'dictId', width: 100 },
  { title: '字典名称', dataIndex: 'dictName', width: 180 },
  { title: '字典类型', dataIndex: 'dictType', width: 200 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '备注', dataIndex: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 180 },
]);

const dataColumns = computed<any[]>(() => [
  { title: '字典编码', dataIndex: 'dictCode', width: 110 },
  { title: '字典标签', dataIndex: 'dictLabel', width: 200 },
  { title: '字典键值', dataIndex: 'dictValue', width: 160 },
  { title: '排序', dataIndex: 'dictSort', width: 80 },
  { title: '状态', dataIndex: 'status', width: 80 },
  { title: '备注', dataIndex: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', width: 180 },
  { title: '操作', key: 'action', width: 180 },
]);

fetchTypes();
</script>

<template>
  <Page auto-content-height>
    <div class="flex gap-4">
      <Card
        class="w-[280px] shrink-0 rounded-lg border border-[#f0f0f0] bg-card shadow-sm dark:border-white/10"
        :bordered="false"
        title="字典分类"
      >
        <Space direction="vertical" style="width: 100%">
          <Button type="primary" block @click="openAddType">
            <Plus class="mr-1 inline size-4" />
            添加字典分类
          </Button>
          <div class="flex gap-1">
            <Input v-model:value="treeSearch" allow-clear placeholder="请输入字典项筛选" class="min-w-0 flex-1" />
            <Button type="default" title="刷新分类树" @click="fetchTypes">
              <RotateCw class="size-4" />
            </Button>
          </div>
          <Tree
            :tree-data="treeData"
            :selected-keys="selectedTreeKeys"
            block-node
            default-expand-all
            :filter-tree-node="(node) => !treeSearch || String(node?.title || '').includes(treeSearch)"
            @select="onSelectTree"
          />
        </Space>
      </Card>

      <div class="min-w-0 flex-1">
        <!-- 默认：全部字典项 → 字典类型列表（与图1一致） -->
        <SystemProShell
          v-if="showAllTypes"
          table-title="字典类型"
          :show-column-setting="false"
          @search="doSearchType"
          @reset="resetTypeQuery"
          @refresh="fetchTypes"
        >
          <template #search>
            <Form :model="typeQuery" class="contents">
              <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
                <FormItem name="dictName" label="字典名称" class="!mb-0">
                  <Input v-model:value="typeQuery.dictName" allow-clear placeholder="字典名称" />
                </FormItem>
                <FormItem name="dictType" label="字典类型" class="!mb-0">
                  <Input v-model:value="typeQuery.dictType" allow-clear placeholder="字典类型" />
                </FormItem>
                <FormItem name="status" label="状态" class="!mb-0">
                  <Select v-model:value="typeQuery.status" allow-clear placeholder="状态" class="w-full" :options="statusOptions" />
                </FormItem>
              </div>
            </Form>
          </template>

          <template #toolbar-actions>
            <Button type="primary" @click="openAddType">
              <Plus class="mr-1 inline size-4" />
              新增
            </Button>
            <Button danger :disabled="!selectedTypeKeys.length" @click="batchRemoveType">删除</Button>
            <Button class="border-amber-500 text-amber-600 hover:text-amber-700" @click="handleExportType">导出</Button>
            <Button class="border-amber-500/80 text-amber-600" @click="onRefreshCache">刷新缓存</Button>
          </template>

          <Table
            row-key="dictId"
            class="system-pro-table"
            :row-selection="typeRowSelection"
            :loading="loading"
            :columns="typeColumns"
            :data-source="typeRows"
            size="middle"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'status'">
                <Tag v-if="asDictTypeRow(record).status === '0' || asDictTypeRow(record).status == null" color="processing">正常</Tag>
                <Tag v-else color="error">停用</Tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <div class="flex flex-wrap items-center gap-1">
                  <Button type="link" size="small" class="!px-1" @click="openEditType(asDictTypeRow(record))">修改</Button>
                  <Button type="link" size="small" danger class="!px-1" @click="removeType(asDictTypeRow(record))">删除</Button>
                </div>
              </template>
            </template>
          </Table>
        </SystemProShell>

        <!-- 选中某一分类：字典数据详情（与图2一致） -->
        <SystemProShell
          v-else
          table-title="数据字典详情"
          :show-column-setting="false"
          @search="doSearchData"
          @reset="resetDataQuery"
          @refresh="fetchData"
        >
          <template #search>
            <Form :model="dataQuery" class="contents">
              <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
                <FormItem name="status" label="状态" class="!mb-0">
                  <Select v-model:value="dataQuery.status" allow-clear placeholder="字典数据状态" class="w-full" :options="statusOptions" />
                </FormItem>
              </div>
            </Form>
          </template>

          <template #toolbar-actions>
            <Button type="primary" @click="openAddData">
              <Plus class="mr-1 inline size-4" />
              新增
            </Button>
            <Button danger :disabled="!selectedDataKeys.length" @click="batchRemoveData">删除</Button>
            <Button class="border-amber-500 text-amber-600 hover:text-amber-700" @click="handleExportData">导出</Button>
          </template>

          <div
            v-if="selectedType"
            class="mb-4 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-md border border-[#f0f0f0] bg-[#fafafa] px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.04]"
          >
            <span>
              <span class="text-foreground/60">字典项：</span>
              <span class="font-medium text-foreground">{{ selectedType.dictName }}</span>
            </span>
            <span>
              <span class="text-foreground/60">字典编号：</span>
              <span class="font-mono text-foreground">{{ selectedType.dictType }}</span>
            </span>
            <span class="inline-flex items-center gap-2">
              <span class="text-foreground/60">状态</span>
              <Tag v-if="selectedType.status === '0' || selectedType.status == null" color="processing">正常</Tag>
              <Tag v-else color="error">停用</Tag>
            </span>
          </div>

          <Table
            row-key="dictCode"
            class="system-pro-table"
            :row-selection="dataRowSelection"
            :loading="loading"
            :columns="dataColumns"
            :data-source="dataRows"
            size="middle"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'dictLabel'">
                <Tag v-if="asDictDataRow(record).dictLabel" :color="dataLabelTagColor(asDictDataRow(record))">
                  {{ asDictDataRow(record).dictLabel }}
                </Tag>
                <span v-else class="text-muted-foreground">—</span>
              </template>
              <template v-else-if="column.dataIndex === 'status'">
                <Tag v-if="asDictDataRow(record).status === '0' || asDictDataRow(record).status == null" color="processing">正常</Tag>
                <Tag v-else color="error">停用</Tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <div class="flex flex-wrap items-center gap-1">
                  <Button type="link" size="small" class="!px-1" @click="openEditData(asDictDataRow(record))">修改</Button>
                  <Button type="link" size="small" danger class="!px-1" @click="removeData(asDictDataRow(record))">删除</Button>
                </div>
              </template>
            </template>
          </Table>
        </SystemProShell>
      </div>
    </div>

    <Modal v-model:open="typeEditOpen" :title="typeEditForm.dictId ? '修改字典类型' : '新增字典类型'" @ok="submitType">
      <Form layout="vertical">
        <FormItem label="字典名称">
          <Input v-model:value="(typeEditForm.dictName as any)" placeholder="请输入字典名称" />
        </FormItem>
        <FormItem label="字典类型">
          <Input v-model:value="(typeEditForm.dictType as any)" placeholder="请输入字典类型" />
        </FormItem>
        <FormItem label="状态">
          <Select v-model:value="(typeEditForm.status as any)" :options="statusOptions" />
        </FormItem>
        <FormItem label="备注">
          <Input v-model:value="(typeEditForm.remark as any)" placeholder="请输入备注" />
        </FormItem>
      </Form>
    </Modal>

    <Modal v-model:open="dataEditOpen" :title="dataEditForm.dictCode ? '修改字典数据' : '新增字典数据'" @ok="submitData">
      <Form layout="vertical">
        <FormItem label="字典标签">
          <Input v-model:value="(dataEditForm.dictLabel as any)" placeholder="请输入字典标签" />
        </FormItem>
        <FormItem label="字典键值">
          <Input v-model:value="(dataEditForm.dictValue as any)" placeholder="请输入字典键值" />
        </FormItem>
        <FormItem label="排序">
          <InputNumber v-model:value="dataEditForm.dictSort" :min="0" style="width: 100%" />
        </FormItem>
        <FormItem label="状态">
          <Select v-model:value="(dataEditForm.status as any)" :options="statusOptions" />
        </FormItem>
        <FormItem label="备注">
          <Input v-model:value="(dataEditForm.remark as any)" placeholder="请输入备注" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

