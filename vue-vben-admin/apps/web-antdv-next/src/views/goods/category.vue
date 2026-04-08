<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Form, FormItem, Input, message, Modal, TreeSelect } from 'antdv-next';

import {
  addCategory,
  type CategoryRow,
  delCategory,
  getCategory,
  listCategory,
  listCategoryTree,
  updateCategory,
} from '#/api/goods/category';
import { SystemProShell, SystemProTable } from '#/components/system-pro';

/** 商品分类 */
type Row = CategoryRow;

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
    const data = await listCategory({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      name: query.name,
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
      await delCategory(selectedRowKeys.value as any);
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
      await delCategory(row.categoryId as any);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const categoryTree = ref<any[]>([]);
const loadCategoryTree = async () => {
  const res = await listCategoryTree();
  categoryTree.value = res;
};

const editOpen = ref(false);
const editForm = reactive<Partial<Row>>({});
function openAdd() {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  (editForm as any).name = '';
  (editForm as any).parentId = undefined;
  (editForm as any).sort = 0;
  (editForm as any).description = '';
  editOpen.value = true;
  loadCategoryTree();
}

async function openEdit(row: Row) {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  const detail = await getCategory(row.categoryId as any);
  // Object.assign(editForm, detail as object);
  editForm.categoryId = detail.categoryId;
  editForm.name = detail.name;
  editForm.parentId = detail.parentId;
  editForm.sort = detail.sort;
  editForm.description = detail.description;
  editOpen.value = true;
}

async function submitEdit() {
  await (editForm.categoryId ? updateCategory(editForm as any) : addCategory(editForm as any));
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed(() => [
  { title: '分类ID', dataIndex: 'categoryId', width: 90 },
  { title: '名称', dataIndex: 'name' },
  { title: '父ID', dataIndex: 'parentId' },
  { title: '排序', dataIndex: 'sort' },
  { title: '描述', dataIndex: 'description' },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]);

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell table-title="商品分类" :show-column-setting="false" @search="doSearch" @reset="resetQuery"
      @refresh="fetchList">
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="name" label="名称" class="!mb-0">
              <Input v-model:value="query.name" allow-clear placeholder="请输入名称" @press-enter="doSearch" />
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

      <SystemProTable row-key="categoryId" class="system-pro-table" :row-selection="rowSelection" :loading="loading"
        :columns="columns" :data-source="rows" :scroll="{ x: 1200 }" :pagination="{
          current: query.pageNum,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: any) => `共 ${t} 条`,
          onChange: (page: number, pageSize: number) => {
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
      </SystemProTable>
    </SystemProShell>

    <Modal v-model:open="editOpen" :title="editForm.categoryId ? '修改商品分类' : '新增商品分类'" @ok="submitEdit">
      <Form :model="editForm" :label-col="{ span: 4 }">
        <FormItem label="名称">
          <Input v-model:value="(editForm as any).name" placeholder="请输入名称" />
        </FormItem>
        <FormItem label="所属分类">
          <TreeSelect 
          v-model:value="(editForm as any).parentId" :tree-data="categoryTree" placeholder="请选择父分类"
            :field-names="{ value: 'categoryId', label: 'name' }" />
        </FormItem>
        <FormItem label="排序">
          <Input v-model:value="(editForm as any).sort" placeholder="请输入排序" />
        </FormItem>
        <FormItem label="描述">
          <Input v-model:value="(editForm as any).description" placeholder="请输入描述" />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>
