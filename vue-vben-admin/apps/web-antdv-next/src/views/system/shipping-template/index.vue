<script setup lang="ts">
import type { IExpress } from '#/global';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  Button,
  Drawer,
  Form,
  type FormInstance,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
} from 'antdv-next';

import {
  addShippingTemplate,
  delShippingTemplate,
  getShippingTemplate,
  listShippingTemplate,
  SHIPPING_TEMPLATE_FEE_TYPE,
  type ShippingTemplateRow,
  type ShippingTemplateRuleRow,
  updateShippingTemplate,
} from '#/api/system/shipping-template';
import { SystemProShell, SystemProTable } from '#/components/system-pro';

import AreaTable from './area-table.vue';

/** 商品类目 */
type Row = ShippingTemplateRow;

function asRow(x: unknown): Row {
  return x as Row;
}

const loading = ref(false);
const rows = ref<Row[]>([]);
const total = ref(0);

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  shippingTemplateName: '',
});

const selectedRowKeys = ref<(number | string)[]>([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (number | string)[]) => {
    selectedRowKeys.value = keys;
  },
}));

const expressList = ref<IExpress[]>([]);
const expressOptions = computed(() =>
  expressList.value.map((item) => ({ label: item.expressName, value: item.expressId })),
);
async function fetchList() {
  loading.value = true;
  try {
    const data = await listShippingTemplate({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      shippingTemplateName: query.shippingTemplateName || undefined,
    });
    rows.value = (data?.list ?? []) as Row[];
    total.value = Number(data?.total ?? 0);
    expressList.value = data?.expressList ?? [];
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.pageNum = 1;
  query.pageSize = 10;
  query.shippingTemplateName = '';
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
      await delShippingTemplate(selectedRowKeys.value as any);
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
      await delShippingTemplate(row.shippingTemplateId as any);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const editOpen = ref(false);
type EditForm = Partial<Row> & { expressId: number | undefined; rules: any[] };
const editForm = reactive<EditForm>({ expressId: undefined, rules: [] });
const normalRules = ref<ShippingTemplateRuleRow[]>([]);
const remoteRules = ref<ShippingTemplateRuleRow[]>([]);
const currentCityids = ref<number[]>([]);
const setCurrentCityIds = (cityIds: number[]) => {
  currentCityids.value = cityIds;
};
function openAdd() {
  currentCityids.value = [];
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  editForm.rules = [];
  editForm.shippingTemplateName = '';
  editForm.feeType = SHIPPING_TEMPLATE_FEE_TYPE.weight;
  editForm.sort = 0;
  editForm.expressId = undefined;
  (editForm as any).sort = 0;
  editOpen.value = true;
}
const allCheckedCityIds = computed(() => {
  const cityIds: number[] = [];
  for (const rule of normalRules.value) {
    cityIds.push(...(rule.cityIds ?? []));
  }
  for (const rule of remoteRules.value) {
    cityIds.push(...(rule.cityIds ?? []));
  }
  return cityIds;
});
const excludeCurrentCityIds = computed(() => {
  return allCheckedCityIds.value.filter((id) => !currentCityids.value.includes(id));
});

async function openEdit(_row: Row) {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  const detail = await getShippingTemplate(_row.shippingTemplateId as any);
  editForm.shippingTemplateId = detail.shippingTemplateId;
  editForm.shippingTemplateName = detail.shippingTemplateName;
  editForm.expressId = detail?.express?.expressId;
  editForm.sort = detail.sort;
  normalRules.value = detail.rules?.filter((item) => !item.isRemote) ?? [];
  remoteRules.value = detail.rules?.filter((item) => item.isRemote) ?? [];
  editOpen.value = true;
}

const editFormRef = ref<FormInstance | null>(null);
async function submitEdit() {
  const params = await editFormRef.value?.validate();
  if (normalRules.value.length === 0) {
    message.warning('请配置配送区域及运费');
    return;
  }
  (params as any).rules = [
    ...normalRules.value.map((item) => ({
      ...item,
      firstWeight: Number(item.firstWeight ?? 0),
      firstWeightPrice: Number(item.firstWeightPrice ?? 0),
      additionalWeight: Number(item.additionalWeight ?? 0),
      additionalWeightPrice: Number(item.additionalWeightPrice ?? 0),
    })),
    ...remoteRules.value.map((item) => ({
      ...item,
      firstWeight: Number(item.firstWeight ?? 0),
      firstWeightPrice: Number(item.firstWeightPrice ?? 0),
      additionalWeight: Number(item.additionalWeight ?? 0),
      additionalWeightPrice: Number(item.additionalWeightPrice ?? 0),
    })),
  ];
  (params as any).feeType = SHIPPING_TEMPLATE_FEE_TYPE.weight;
  (params as any).sort = editForm.sort;
  (params as any).shippingTemplateId = editForm.shippingTemplateId;
  await (editForm.shippingTemplateId
    ? updateShippingTemplate(params as any)
    : addShippingTemplate(params as any));
  message.success('保存成功');
  editOpen.value = false;
  await fetchList();
}

const columns = computed(() => [
  { title: '模板ID', dataIndex: 'shippingTemplateId', width: 90 },
  { title: '模板名称', dataIndex: 'shippingTemplateName' },
  { title: '快递公司', dataIndex: ['express', 'expressName'] },
  { title: '计费方式', dataIndex: 'feeType', key: 'feeType' },
  { title: '排序', dataIndex: 'sort' },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]);

fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="运费模板"
      :show-column-setting="false"
      @search="doSearch"
      @reset="resetQuery"
      @refresh="fetchList"
    >
      <template #search>
        <Form :model="query" class="contents">
          <div class="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            <FormItem name="shippingTemplateName" label="名称" class="!mb-0">
              <Input
                v-model:value="query.shippingTemplateName"
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
        row-key="shippingTemplateId"
        class="system-pro-table"
        :row-selection="rowSelection"
        :loading="loading"
        :columns="columns"
        :data-source="rows"
        :scroll="{ x: 1200 }"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'feeType'">
            按重量
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
        </template>
      </SystemProTable>
    </SystemProShell>
    <Drawer
      v-model:open="editOpen"
      :title="editForm.shippingTemplateId ? '修改运费模板' : '新增运费模板'"
      width="1000px"
      :mask-closable="false"
    >
      <Form :label-col="{ style: { width: '130px' } }" :model="editForm" ref="editFormRef">
        <FormItem
          label="模版名称"
          name="shippingTemplateName"
          :rules="[{ required: true, message: '请输入模版名称' }]"
        >
          <div class="w-80">
            <Input
              v-model:value="(editForm as any).shippingTemplateName"
              placeholder="请输入名称"
            />
          </div>
        </FormItem>
        <FormItem
          label="快递公司"
          name="expressId"
          :rules="[{ required: true, message: '请选择快递公司' }]"
        >
          <div class="w-80">
            <Select
              v-model:value="(editForm as any).expressId"
              placeholder="请选择快递公司"
              :options="expressOptions"
            />
          </div>
        </FormItem>
        <FormItem
          label="排序值"
          name="sort"
          :rules="[{ required: true, message: '请输入排序值' }]"
        >
          <div class="w-80">
            <InputNumber
              v-model:value="(editForm as any).sort"
              placeholder="请输入排序值"
            />
          </div>
        </FormItem>
        <FormItem label="配送区域及运费">
          <AreaTable
            v-model="normalRules"
            :disabled-city-ids="excludeCurrentCityIds"
            @set-current-city-ids="setCurrentCityIds"
          />
        </FormItem>
        <FormItem label="偏远配送区域及运费">
          <AreaTable
            v-model="remoteRules"
            :disabled-city-ids="excludeCurrentCityIds"
            @set-current-city-ids="setCurrentCityIds"
            is-remote
          />
        </FormItem>
      </Form>
      <template #footer>
        <div class="flex justify-end">
          <Button type="primary" @click="submitEdit"> 保存 </Button>
        </div>
      </template>
    </Drawer>
  </Page>
</template>
