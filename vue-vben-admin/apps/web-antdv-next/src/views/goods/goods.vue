<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
  TreeSelect,
  TypographyText,
} from 'antdv-next';
import { isArray } from 'lodash-es';

import { delCategory, getCategory, listCategory, listCategoryTree } from '#/api/goods/category';
import { listClass } from '#/api/goods/class';
import { craftsmanshipEnum } from '#/api/goods/craftsmanship';
import {
  GOODS_PRICE_TYPE,
  GOODS_SHIPPING_TYPE,
  GOODS_UPLOAD_TYPE,
  type GoodsRow,
} from '#/api/goods/goods';
import { listShippingTemplateOptions } from '#/api/system/shipping-template';
import { SystemProShell, SystemProTable } from '#/components/system-pro';
import { useDict } from '#/composables/use-dict';

import ClassSelector from './components/class-selector.vue';
import GoodsCraftsmanship from './components/goods-craftsmanship.vue';

/** 商品分类 */
type Row = GoodsRow;

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

const columns = computed(() => [
  { title: '分类ID', dataIndex: 'categoryId', width: 90 },
  { title: '名称', dataIndex: 'name' },
  { title: '父ID', dataIndex: 'parentId' },
  { title: '排序', dataIndex: 'sort' },
  { title: '描述', dataIndex: 'description' },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]);

// form
const goods_price_type = useDict('goods_price_type');
const goods_price_type_options = computed(() => {
  return goods_price_type.goods_price_type?.value?.map((item: any) => ({
    label: item.label,
    value: item.value,
  }));
});
const categoryTree = ref<any[]>([]);
const loadCategoryTree = async () => {
  const res = await listCategoryTree();
  categoryTree.value = res;
};
const classTreeList = ref<any[]>([]);
const classCircleData = ref<any[]>([]);
const class_type_text = computed(() => {
  if (checkedList.value.length > 0) {
    return checkedList.value[0].type === '1' ? '定制性商品' : '非定制性商品';
  }
  return '';
});
const checkedList = computed(() => {
  const list: any[] = [];
  let currentParent = classCircleData.value?.find((item) => item.classId === editForm.classId);
  if (currentParent) {
    list.unshift(currentParent);
    while (currentParent) {
      if (currentParent.parent) {
        list.unshift(currentParent.parent);
        currentParent = currentParent.parent;
      } else {
        currentParent = null;
      }
    }
  }
  return list;
});
const loadClassTree = async () => {
  classCircleData.value = [];
  const res = await listClass({});
  classTreeList.value = res.list;
  buildClassCircleData(res.list);
};
const buildClassCircleData = (data: any[], parent = null) => {
  data.forEach((item) => {
    const newItem = {
      ...item,
      parent,
    };
    classCircleData.value.push(newItem);
    if (isArray(item.children)) {
      buildClassCircleData(item.children, newItem);
    }
  });
};

const shippingTemplateOptions = ref<{ label: string; value: number }[]>([]);
const loadShippingTemplateOptions = async () => {
  const res = await listShippingTemplateOptions();
  shippingTemplateOptions.value = res;
};
const craftsmanshipOptions = ref<{ label: string; value: number }[]>([]);
const loadCraftsmanshipOptions = async () => {
  const res = await craftsmanshipEnum();
  craftsmanshipOptions.value = res;
};
const step = ref(1);
const handleNextStep = () => {
  step.value++;
};
const editOpen = ref(false);
const editForm = reactive<Partial<Row>>({});
function openAdd() {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  editForm.name = '';
  editForm.classId = undefined;
  editForm.attrs = [];
  editForm.description = '';
  editForm.image = '';
  editForm.weight = 0;
  editForm.volume = 0;
  editForm.bleedRange = 0;
  editForm.priceType = GOODS_PRICE_TYPE.SQUARE;
  editForm.shippingType = GOODS_SHIPPING_TYPE.TEMPLATE;
  editForm.shippingFee = 0;
  editForm.shippingAddress = '';
  editForm.shippingTemplateIds = [];
  editForm.basePackingFee = 0;
  editForm.isCustomization = false;
  editForm.showPrice = 0;
  editForm.categoryId = undefined;
  editForm.classId = undefined;
  editForm.deptId = undefined;
  editForm.craftsmanship = [];
  editForm.uploadType = GOODS_UPLOAD_TYPE.CARD;
  step.value = 1;
  editOpen.value = true;
  loadCategoryTree();
  loadClassTree();
  loadShippingTemplateOptions();
  loadCraftsmanshipOptions();
}

async function openEdit(row: Row) {
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  // const detail = await getCategory(row.categoryId as any);
  // // Object.assign(editForm, detail as object);
  // editForm.categoryId = detail.categoryId;
  // editForm.name = detail.name;
  // editForm.parentId = detail.parentId;
  // editForm.sort = detail.sort;
  // editForm.description = detail.description;
  editOpen.value = true;
}

// async function submitEdit() {
//   await (editForm.categoryId ? updateCategory(editForm as any) : addCategory(editForm as any));
//   message.success('保存成功');
//   editOpen.value = false;
//   await fetchList();
// }
fetchList();
</script>

<template>
  <Page auto-content-height content-stable-layout>
    <SystemProShell
      table-title="商品分类"
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
        row-key="categoryId"
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
      :title="editForm.goodsId ? '修改商品' : '新增商品'"
      width="1200px"
      :mask-closable="false"
      class="goods-drawer"
    >
      <template #extra>
        <div class="translate-x-[-50%]">
          <Space>
            <div class="flex items-center gap-1">
              <TypographyText type="success" :level="5">当前所选分类</TypographyText>
              <TypographyText type="success" v-if="class_type_text">
                ({{ class_type_text }})：
              </TypographyText>
            </div>
            <Breadcrumb separator=">">
              <BreadcrumbItem v-for="item in checkedList" :key="item.classId">
                {{ item.name }}
              </BreadcrumbItem>
            </Breadcrumb>
          </Space>
        </div>
      </template>
      <div class="size-full">
        <ClassSelector
          v-model="editForm.classId as number"
          :class-tree="classTreeList"
          :class-circle-data="classCircleData"
          v-if="step === 1"
        />
        <Form :model="editForm" :label-col="{ style: { width: '100px' } }" v-if="step === 2">
          <div class="flex">
            <div class="flex-1">
              <FormItem
                label="商品名称"
                name="name"
                :rules="[{ required: true, message: '请输入商品名称' }]"
              >
                <Input v-model:value="editForm.name" placeholder="请输入名称" class="w-[300px]!" />
              </FormItem>
            </div>
            <div class="flex-1">
              <FormItem
                label="商品分类"
                name="name"
                :rules="[{ required: true, message: '请选择商品分类' }]"
              >
                <TreeSelect
                  v-model:value="editForm.categoryId"
                  placeholder="请选择商品分类"
                  :tree-data="categoryTree"
                  :field-names="{ value: 'categoryId', label: 'name', children: 'children' }"
                  class="w-[300px]!"
                />
              </FormItem>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1">
              <FormItem label="商品图片" name="weight"> </FormItem>
            </div>
            <div class="flex-1">
              <FormItem
                label="计价方式"
                name="name"
                :rules="[{ required: true, message: '请选择计价方式' }]"
              >
                <RadioGroup v-model:value="editForm.priceType">
                  <Radio
                    v-for="item in goods_price_type_options"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </Radio>
                </RadioGroup>
              </FormItem>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1">
              <FormItem label="商品重量" name="weight">
                <Space>
                  <InputNumber
                    v-model:value="editForm.weight"
                    placeholder="请输入商品重量"
                    class="w-[300px]!"
                  />
                  <TypographyText type="secondary">g</TypographyText>
                </Space>
              </FormItem>
            </div>
            <div class="flex-1">
              <FormItem label="发货地址" name="shippingAddress">
                <Input
                  v-model:value="editForm.shippingAddress"
                  placeholder="请输入发货地址"
                  class="w-[300px]!"
                />
              </FormItem>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1">
              <FormItem label="图片出血范围" name="bleedRange">
                <Space>
                  <InputNumber
                    v-model:value="editForm.bleedRange"
                    placeholder="请输入图片出血范围"
                    class="w-[300px]!"
                  />
                  <TypographyText type="secondary">mm</TypographyText>
                </Space>
              </FormItem>
            </div>
            <div class="flex-1">
              <FormItem label="运费按照">
                <RadioGroup v-model:value="editForm.shippingType">
                  <div class="flex flex-col gap-2">
                    <div class="flex-1 flex items-center">
                      <Radio :value="GOODS_SHIPPING_TYPE.TEMPLATE">运费模板</Radio>
                      <Select
                        v-if="editForm.shippingType === GOODS_SHIPPING_TYPE.TEMPLATE"
                        v-model:value="editForm.shippingTemplateIds"
                        placeholder="请选择运费模板"
                        class="w-[350px]!"
                        :options="shippingTemplateOptions"
                        mode="multiple"
                      />
                    </div>
                    <div class="flex-1 flex items-center">
                      <Radio :value="GOODS_SHIPPING_TYPE.FIXED">固定运费</Radio>
                      <Space v-if="editForm.shippingType === GOODS_SHIPPING_TYPE.FIXED">
                        <InputNumber
                          v-model:value="editForm.shippingFee"
                          placeholder="请输入固定运费"
                        />
                        <TypographyText type="success">元</TypographyText>
                      </Space>
                    </div>
                  </div>
                </RadioGroup>
              </FormItem>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1">
              <FormItem label="商品显示价格">
                <Space direction="vertical" :size="1">
                  <Space>
                    <InputNumber
                      v-model:value="editForm.showPrice"
                      placeholder="商品上架公共池时，显示的价格"
                    />
                    <TypographyText type="success">元</TypographyText>
                  </Space>
                  <TypographyText type="secondary" size="small" class="!text-xs">
                    商品上架公共池时，显示的价格
                  </TypographyText>
                </Space>
              </FormItem>
            </div>
            <div class="flex-1">
              <FormItem label="商品上传模板">
                <RadioGroup v-model:value="editForm.uploadType">
                  <Radio :value="GOODS_UPLOAD_TYPE.CARD">卡片</Radio>
                  <Radio :value="GOODS_UPLOAD_TYPE.PHOTO">照片</Radio>
                  <Radio :value="GOODS_UPLOAD_TYPE.ROLL">条幅</Radio>
                </RadioGroup>
              </FormItem>
            </div>
          </div>
          <div class="bg-gray-200 h-[10px]!"></div>
          <div class="h-[10px]!"></div>
          <GoodsCraftsmanship v-model="editForm.craftsmanship" :craftsmanship-options="craftsmanshipOptions" />
          <!-- <FormItem label="商品工艺">
            <div class="bg-[#f7f8fa] p-[10px]! w-full">
              <Button type="primary">添加工艺</Button>
            </div>
          </FormItem> -->
        </Form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="editOpen = false">取消</Button>
          <Button
            type="primary"
            @click="handleNextStep"
            v-if="step === 1"
            :disabled="!editForm.classId"
          >
            下一步
          </Button>
        </div>
      </template>
    </Drawer>
  </Page>
</template>

<style lang="scss">
.goods-drawer {
  display: block;
  .ant-drawer-header {
    .ant-drawer-extra {
      flex: 1;
      display: flex;
    }
  }
}
</style>
