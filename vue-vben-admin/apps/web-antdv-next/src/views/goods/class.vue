<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { cloneDeep, generateUUID } from '@vben/utils';

import { Button, Form, FormItem, Input, message, Modal, Radio, RadioGroup } from 'antdv-next';

import {
  addClass,
  type ClassRow,
  delClass,
  getClass,
  listClass,
  updateClass,
} from '#/api/goods/class';
import { SystemProShell, SystemProTable } from '#/components/system-pro';
import { useDict } from '#/composables/use-dict';

import ClassAttrsTable from './components/class-attrs-table.vue';
import { CLASS_CUSTOMIZE_DEFAULT_ATTRS } from './goods.constant';

/** 商品类目 */
type Row = ClassRow;

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
    const data = await listClass({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      name: query.name || undefined,
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
      await delClass(selectedRowKeys.value as any);
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
      await delClass(row.classId as any);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
type EditForm = Partial<Row> & { attrs: any[] };
const editForm = reactive<EditForm>({ attrs: [] });

function openAdd() {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  (editForm as any).name = '';
  (editForm as any).parentId = undefined;
  (editForm as any).sort = 0;
  (editForm as any).type = '1';
  (editForm as any).description = '';
  editForm.attrs = cloneDeep(CLASS_CUSTOMIZE_DEFAULT_ATTRS);
  editOpen.value = true;
}

async function openEdit(row: Row) {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  const detail = await getClass(row.classId as any);
  // Object.assign(editForm, detail as object);
  editForm.classId = detail.classId;
  editForm.name = detail.name;
  editForm.parentId = detail.parentId;
  editForm.sort = detail.sort;
  editForm.type = detail.type;
  editForm.description = detail.description;
  editForm.attrs = Array.isArray((detail as any)?.attrs) ? (detail as any).attrs : [];
  editOpen.value = true;
}

async function submitEdit() {
  const hasNotAttrName = editForm.attrs.some((item: any) => !item.attrName);
  if (hasNotAttrName) {
    message.warning('请填写属性名称');
    return;
  }
  const hasDuplicateAttrName = editForm.attrs.some((item: any, index: number) =>
    editForm.attrs.some(
      (item2: any, index2: number) => item.attrName === item2.attrName && index !== index2,
    ),
  );
  if (hasDuplicateAttrName) {
    message.warning('属性名称不能重复');
    return;
  }
  await (editForm.classId ? updateClass(editForm as any) : addClass(editForm as any));
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed(() => [
  { title: '类目ID', dataIndex: 'classId', width: 90 },
  { title: '名称', dataIndex: 'name' },
  { title: '排序', dataIndex: 'sort' },
  { title: '类目类型', dataIndex: 'type', key: 'type' },
  { title: '属性', dataIndex: 'attrText' },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]);

const class_type = useDict('goods_class_type');
const class_type_options = computed(() =>
  class_type.goods_class_type?.value?.map((item: any) => ({
    label: item.label,
    value: item.value,
  })),
);
const handleTypeChange = () => {
  editForm.attrs =
    editForm.type === '1'
      ? cloneDeep(CLASS_CUSTOMIZE_DEFAULT_ATTRS)
      : [
          {
            attrName: '',
            key: generateUUID(),
            joinSquarePrice: true,
            joinNormalPrice: true,
            enable: true,
          },
        ];
};

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="商品类目"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="name" label="名称" class="!mb-0">
              <Input
                v-model:value="query.name"
                allow-clear
                placeholder="请输入名称"
                @press-enter="doSearch"
              />
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

      <SystemProTable
        row-key="classId"
        class="system-pro-table"
        :row-selection="rowSelection"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        :scroll="{ x: 1200 }"
        :pagination="{
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
        }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            {{
              class_type.goods_class_type?.value?.find((item: any) => item.value === record.type)
                ?.label
            }}
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asRow(record))">
                修改
              </Button>
              <Button
                type="link"
                size="small"
                danger
                class="!px-1"
                @click="onDelete(asRow(record))"
              >
                删除
              </Button>
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'deleteTime'">
            <span>{{ asRow(record).deleteTime ?? '—' }}</span>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>

    <Modal
      v-model:open="editOpen"
      :title="editForm.classId ? '修改商品类目' : '新增商品类目'"
      @ok="submitEdit"
      width="630px"
    >
      <Form :label-col="{ style: { width: '100px' } }">
        <FormItem label="类目类型">
          <RadioGroup v-model:value="(editForm as any).type" @change="handleTypeChange">
            <Radio v-for="item in class_type_options" :key="item.value" :value="item.value">
              {{ item.label }}
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="名称">
          <Input v-model:value="(editForm as any).name" placeholder="请输入名称" />
        </FormItem>
        <FormItem label="父ID">
          <Input v-model:value="(editForm as any).parentId" placeholder="请输入父ID" />
        </FormItem>
        <FormItem label="排序">
          <Input v-model:value="(editForm as any).sort" placeholder="请输入排序" />
        </FormItem>
        <ClassAttrsTable v-model="editForm.attrs" :type="editForm.type as string" />
      </Form>
    </Modal>
  </Page>
</template>
