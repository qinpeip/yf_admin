<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { generateUUID } from '@vben/utils';

import {
  Image as AntdvImage,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Drawer,
  Form,
  type FormInstance,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Space,
  Spin,
  Tag,
  TreeSelect,
  TypographyText,
} from 'antdv-next';
import Decimal from 'decimal.js';
import { cloneDeep, isArray } from 'lodash-es';

import { listCategoryTree } from '#/api/goods/category';
import { type ClassRow, getClass, listClass } from '#/api/goods/class';
import { craftsmanshipEnum } from '#/api/goods/craftsmanship';
import {
  addGoods,
  deleteGoods,
  getGoods,
  getGoodsSku,
  GOODS_PRICE_TYPE,
  GOODS_PUBLIC_STATUS,
  GOODS_SHIPPING_TYPE,
  GOODS_STATUS,
  GOODS_UPLOAD_TYPE,
  type GoodsRow,
  type GoodsSku,
  listGoods,
  updateGoods,
} from '#/api/goods/goods';
import { listShippingTemplateOptions } from '#/api/system/shipping-template';
import { SystemProShell, SystemProTable } from '#/components/system-pro';
import ImageUploader from '#/components/uploader/image-uploader.vue';
import { useDict } from '#/composables/use-dict';

import ClassSelector from './components/class-selector.vue';
import GoodsCraftsmanship from './components/goods-craftsmanship.vue';
import GoodsSkuComponent from './components/goods-sku.vue';
import GoodsSpec from './components/goods-spec.vue';
import {
  GOODS_CLASS_ATTRS_KS,
  GOODS_CLASS_ATTRS_NUM,
  GOODS_CLASS_ATTRS_SIZE,
} from './goods.constant';
import { buildGoodsSkuSpecFingerprint } from './goods.helper';

/** 商品 */
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
    const data = await listGoods({
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
      await deleteGoods(selectedRowKeys.value as any);
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
      await deleteGoods(row.goodsId as any);
      message.success('删除成功');
      await fetchList();
    },
  });
}

const columns = computed(() => [
  { title: '商品ID', dataIndex: 'goodsId', width: 90 },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '商品状态', dataIndex: 'status', key: 'status' },
  { title: '公共池状态', dataIndex: 'public', key: 'public' },
  { title: '创建人', dataIndex: 'createBy' },
  { title: '创建时间', dataIndex: 'createTime' },
  { title: '更新人', dataIndex: 'updateBy' },
  { title: '更新时间', dataIndex: 'updateTime' },
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
const currentClass = ref<ClassRow | null>(null);
const handleNextStep = () => {
  step.value++;
  getClass(editForm.classId as any).then((res) => {
    currentClass.value = res as ClassRow;
  });
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
  editForm.craftsmanship = [];
  editForm.uploadType = GOODS_UPLOAD_TYPE.CARD;
  editForm.skus = [];
  step.value = 1;
  editOpen.value = true;
  loadCategoryTree();
  loadClassTree();
  loadShippingTemplateOptions();
  loadCraftsmanshipOptions();
}

function combineArrays(...arrays: any[]) {
  let acc: any[] = [[]];
  for (const array of arrays) {
    const next: any[] = [];
    for (const item of acc) {
      for (const subItem of array) {
        next.push([...item, subItem]);
      }
    }
    acc = next;
  }
  return acc;
}
// 根据属性生成sku
const generateSku = async () => {
  const arr: any[] = [];
  editForm.attrs
    ?.filter((item) => item.key)
    ?.forEach((item) => {
      if (item.key === GOODS_CLASS_ATTRS_SIZE) {
        item.attrsOptions?.forEach((o) => {
          if (o.num1 && o.num2 && o.remark) {
            o.optionName = `${o.remark}(${o.num1} * ${o.num2})`;
          }
        });
      }
      const hasValue = item.attrsOptions?.some((o) => o.optionName);
      if (hasValue) {
        arr.push(
          item.attrsOptions
            ?.filter((o) => o.optionName)
            .map((o) => ({
              ...o,
              key: item.key,
              attrName: item.attrName,
            })),
        );
      }
    });
  const combos = combineArrays(...arr);
  Promise.all(
    combos.map(async (item, i) => {
      const obj: GoodsSku = {
        sortOrder: i + 1,
        price: 0,
        stock: 0,
        specFingerprint: '',
        skuCode: '',
        spec: item.map((p: any) => {
          return {
            key: p.key,
            optionName: p.optionName,
            imgUrl: p.imgUrl,
            price: p.price,
            num1: p.num1,
            num2: p.num2,
            attrName: p.attrName,
          };
        }),
      };
      let square = Decimal(0);
      let num = Decimal(1);
      let total_price = Decimal(0);
      obj.spec.forEach((s) => {
        if (s.key === GOODS_CLASS_ATTRS_SIZE) {
          square = Decimal(s.num1 || '0').mul(s.num2 || '0');
        } else if ([GOODS_CLASS_ATTRS_KS, GOODS_CLASS_ATTRS_NUM].includes(s.key)) {
          num = Decimal(s.optionName || '1').mul(num);
        } else {
          total_price = Decimal(s.price || '0').plus(total_price);
        }
      });
      if (editForm.priceType === GOODS_PRICE_TYPE.SQUARE) {
        // 1平方米等于1000000平方毫米
        const square_m = Decimal(square).div(1_000_000);
        obj.price = +square_m.mul(num).mul(total_price).toFixed(4);
      } else {
        obj.price = 0;
      }
      obj.specFingerprint = await buildGoodsSkuSpecFingerprint(obj.spec);
      return obj;
    }),
  ).then((res) => {
    const seen = new Set<string>();
    const deduped: GoodsSku[] = [];
    for (const sku of res) {
      if (seen.has(sku.specFingerprint)) continue;
      seen.add(sku.specFingerprint);
      deduped.push(sku);
    }
    editForm.skus = deduped.map((sku, i) => ({ ...sku, sortOrder: i + 1 }));
  });
};

const editLoading = ref(false);
async function openEdit(row: Row) {
  editOpen.value = true;
  step.value = 2;
  editLoading.value = true;
  Object.keys(editForm).forEach((k) => delete (editForm as any)[k]);
  editForm.image = '';
  editForm.craftsmanship = [];
  editForm.attrs = [];
  editForm.skus = [];
  const detail = await getGoods(row.goodsId as any);
  Object.assign(editForm, detail);
  editForm.craftsmanship = detail.craftsmanship?.map((item) => ({
    ...item,
    childCraftsmanship: [
      ...(item.childCraftsmanship?.map((c) => ({
        ...c,
        name: c.name,
      })) ?? []),
      { name: '', price: undefined },
    ],
  }));
  editForm.attrs = detail.attrs?.map((item) => ({
    ...item,
    _k: generateUUID(),
    attrsOptions: [
      ...(item.attrsOptions?.map((o) => ({
        ...o,
        optionName: o.optionName,
      })) ?? []),
      {
        optionName: '',
        imgUrl: '',
        remark: '',
        price: undefined,
        num1: undefined,
        num2: undefined,
      },
    ],
  }));
  // const skuRes = await getGoodsSku(row.goodsId as any);
  // editForm.skus = skuRes;
  loadCategoryTree();
  loadClassTree();
  loadShippingTemplateOptions();
  loadCraftsmanshipOptions();
  getClass(editForm.classId as any).then((res) => {
    currentClass.value = res as ClassRow;
  });
  editLoading.value = false;
}

// async function submitEdit() {
//   await (editForm.categoryId ? updateCategory(editForm as any) : addCategory(editForm as any));
//   message.success('保存成功');
//   editOpen.value = false;
//   await fetchList();
// }

const formRef = ref<FormInstance>();
const submitting = ref(false);
const handleSubmit = async () => {
  await formRef.value?.validate();
  const params = cloneDeep(editForm);
  params.craftsmanship = params.craftsmanship?.map((item) => {
    return {
      ...item,
      childCraftsmanship: item.childCraftsmanship?.filter((c) => c.name),
    };
  });
  params.attrs = params.attrs?.map((item) => {
    return {
      attrName: item.attrName,
      customValue: item.customValue,
      hasImg: item.hasImg,
      joinNormalPrice: item.joinNormalPrice,
      joinSquarePrice: item.joinSquarePrice,
      key: item.key,
      goodsAttrsId: item.goodsAttrsId,
      attrsOptions: item.attrsOptions
        ?.filter((o) => o.optionName)
        .map((o) => {
          return {
            ...o,
            optionName: String(o.optionName),
          };
        }),
    };
  });
  if (params.goodsId) {
    params.weight = Decimal(params.weight || '0').toNumber();
    params.volume = Decimal(params.volume || '0').toNumber();
    params.showPrice = Decimal(params.showPrice || '0').toNumber();
    params.shippingFee = Decimal(params.shippingFee || '0').toNumber();
    params.basePackingFee = Decimal(params.basePackingFee || '0').toNumber();
    params.craftsmanship = params.craftsmanship?.map((c) => ({
      ...c,
      childCraftsmanship: c.childCraftsmanship?.map((cc) => ({
        ...cc,
        price: Decimal(cc.price || '0').toNumber(),
      })),
    }));
    params.attrs = params.attrs?.map((a) => ({
      ...a,
      attrsOptions: a.attrsOptions?.map((ao) => ({
        ...ao,
        price: Decimal(ao.price || '0').toNumber(),
      })),
    }));
    // @ts-ignore
    params.skus = params.skus?.map((s) => ({
      ...s,
      price: Decimal(s.price || '0').toNumber(),
      spec: undefined
      // spec: s.spec?.map((ss) => ({
      //   ...ss,
      //   price: Decimal(ss.price || '0').toNumber(),
      // })),
    }));
    updateGoods(params).then((res) => {
      console.log('res', res);
    });
  } else {
    addGoods(params).then((res) => {
      console.log('res', res);
    });
  }
};
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
          <template v-if="column.key === 'name'">
            <Space direction="vertical" :size="0">
              <AntdvImage :src="record.image" width="50px" height="50px" />
              <TypographyText :ellipsis="true" type="secondary" class="text-xs!">
                {{ record.name }}
              </TypographyText>
            </Space>
          </template>
          <template v-if="column.key === 'status'">
            <Tag v-if="record.status === GOODS_STATUS.ON_SALE" color="success">上架中</Tag>
            <Tag v-else color="error">下架</Tag>
          </template>
          <template v-if="column.key === 'public'">
            <Tag v-if="!record.public">未上架</Tag>
            <Tag v-else-if="record.public === GOODS_PUBLIC_STATUS.PENDING" color="warning">
              待审核
            </Tag>
            <Space direction="vertical" :size="1" v-else-if="record.public === GOODS_PUBLIC_STATUS.ON_SALE">
              <Tag color="success"> 已上架 </Tag>
              <Space :size="0">
                <TypographyText type="secondary" class="text-xs!">
                  &nbsp;&nbsp;&nbsp;溢价：
                </TypographyText>
                <TypographyText type="success" class="text-xs!">
                  ￥ {{ record.public.premiumFee }}
                </TypographyText>
              </Space>
              <!-- <Space :size="0">
                <TypographyText type="secondary" class="text-xs!">已绑定：</TypographyText>
                <TypographyText type="success" class="text-xs!">
                  {{ record.public.supplierPublicGoods.length }}
                </TypographyText>
              </Space> -->
            </Space>
            <Space direction="vertical" :size="1" v-else-if="record.public === GOODS_PUBLIC_STATUS.REJECTED">
              <Tag color="error">驳回</Tag>
              <Space :size="0">
                <TypographyText type="secondary" class="text-xs!"> 驳回原因：</TypographyText>
                <TypographyText type="danger" class="text-xs!">
                  {{ record.public?.remark ?? '--' }}
                </TypographyText>
              </Space>
            </Space>
          </template>
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center gap-1">
              <Button type="link" size="small" class="!px-1" @click="openEdit(asRow(record))">
                修改
              </Button>
              <Button type="link" size="small" danger class="!px-1" @click="onDelete(asRow(record))">
                删除
              </Button>
            </div>
          </template>
        </template>
      </SystemProTable>
    </SystemProShell>
    <Drawer v-model:open="editOpen" :title="editForm.goodsId ? '修改商品' : '新增商品'" width="1280px" :mask-closable="false"
      class="goods-drawer">
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
        <ClassSelector v-model="editForm.classId as number" :class-tree="classTreeList"
          :class-circle-data="classCircleData" v-if="step === 1" />
        <Form :model="editForm" :label-col="{ style: { width: '100px' } }" v-if="step === 2" ref="formRef">
          <Spin />
          <div class="flex">
            <div class="flex-1">
              <FormItem label="商品名称" name="name" :rules="[{ required: true, message: '请输入商品名称' }]">
                <Input v-model:value="editForm.name" placeholder="请输入名称" class="w-[300px]!" />
              </FormItem>
            </div>
            <div class="flex-1">
              <FormItem label="商品分类" name="categoryId" :rules="[{ required: true, message: '请选择商品分类' }]">
                <TreeSelect v-model:value="editForm.categoryId" placeholder="请选择商品分类" :tree-data="categoryTree"
                  :field-names="{ value: 'categoryId', label: 'name', children: 'children' }" class="w-[300px]!" />
              </FormItem>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1">
              <FormItem label="商品图片" name="weight">
                <ImageUploader v-model="editForm.image as string" size="102px" />
              </FormItem>
            </div>
            <div class="flex-1">
              <FormItem label="计价方式" name="name" :rules="[{ required: true, message: '请选择计价方式' }]">
                <RadioGroup v-model:value="editForm.priceType">
                  <Radio v-for="item in goods_price_type_options" :key="item.value" :value="item.value"
                    @change="generateSku">
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
                  <InputNumber v-model:value="editForm.weight" placeholder="请输入商品重量" class="w-[300px]!" />
                  <TypographyText type="secondary">g</TypographyText>
                </Space>
              </FormItem>
            </div>
            <div class="flex-1">
              <FormItem label="发货地址" name="shippingAddress">
                <Input v-model:value="editForm.shippingAddress" placeholder="请输入发货地址" class="w-[300px]!" />
              </FormItem>
            </div>
          </div>
          <div class="flex">
            <div class="flex-1">
              <FormItem label="图片出血范围" name="bleedRange">
                <Space>
                  <InputNumber v-model:value="editForm.bleedRange" placeholder="请输入图片出血范围" class="w-[300px]!" />
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
                      <Select v-if="editForm.shippingType === GOODS_SHIPPING_TYPE.TEMPLATE"
                        v-model:value="editForm.shippingTemplateIds" placeholder="请选择运费模板" class="w-[350px]!"
                        :options="shippingTemplateOptions" mode="multiple" />
                    </div>
                    <div class="flex-1 flex items-center">
                      <Radio :value="GOODS_SHIPPING_TYPE.FIXED">固定运费</Radio>
                      <Space v-if="editForm.shippingType === GOODS_SHIPPING_TYPE.FIXED">
                        <InputNumber v-model:value="editForm.shippingFee" placeholder="请输入固定运费" />
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
                    <InputNumber v-model:value="editForm.showPrice" placeholder="请输入" />
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
          <GoodsCraftsmanship v-model="editForm.craftsmanship!" :craftsmanship-options="craftsmanshipOptions" />
          <GoodsSpec v-model="editForm.attrs!" :class-data="currentClass" v-if="currentClass"
            @generate-sku="generateSku" />
          <GoodsSkuComponent v-model="editForm.skus!" />
          <div class="h-[30px]!"></div>
        </Form>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button @click="editOpen = false">取消</Button>
          <Button type="primary" @click="handleNextStep" v-if="step === 1" :disabled="!editForm.classId">
            下一步
          </Button>
          <Button type="primary" @click="handleSubmit" v-if="step === 2" :loading="submitting">
            提交
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
