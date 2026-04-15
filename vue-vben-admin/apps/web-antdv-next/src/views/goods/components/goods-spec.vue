<script lang="ts" setup>
import type { ClassRow } from '#/api/goods/class';

import { computed, onMounted } from 'vue';

import { GripVertical } from '@vben/icons';
import { generateUUID } from '@vben/utils';

import { useDebounceFn } from '@vueuse/core';
import { Button, FormItem, Input, InputNumber, Select, Space } from 'antdv-next';
import { ElButton, ElCheckbox } from 'element-plus';
import Sortable from 'sortablejs';

import ImageUploader from '#/components/uploader/image-uploader.vue';

import {
  GOODS_CLASS_ATTRS_KS,
  GOODS_CLASS_ATTRS_NUM,
  GOODS_CLASS_ATTRS_SIZE,
} from '../goods.constant';

const props = withDefaults(
  defineProps<{
    classData?: ClassRow;
  }>(),
  {
    classData: () => ({
      attrs: [],
    }),
  },
);

const emits = defineEmits(['generateSku']);

const renderAttrs = computed(() => {
  const attrs = props.classData?.attrs ?? [];
  return attrs
    .filter((item) => item.enable)
    .map((item) => ({
      label: item.attrName,
      value: item.key,
    }));
});

const modelValue = defineModel<any[]>({ required: true });

function ensureRowKeys() {
  for (const row of modelValue.value) {
    if (row && !row._k) row._k = generateUUID();
  }
}

const handleDeleteSpec = (i: number) => {
  modelValue.value.splice(i, 1);
};

const handleAddSpec = () => {
  modelValue.value.push({
    _k: generateUUID(),
    attrName: '',
    key: '',
    joinNormalPrice: true,
    joinSquarePrice: true,
    hasImg: false,
    customValue: false,
    attrsOptions: [],
  });
};

const handleChangeSpec = (item: any) => {
  if (item.key) {
    const attr = props.classData.attrs?.find((a) => a.key === item.key);
    if (attr) {
      item.hasImg = false;
      item.customValue = false;
      item.joinNormalPrice = attr.joinNormalPrice;
      item.joinSquarePrice = attr.joinSquarePrice;
      item.attrName = attr.attrName;
      item.attrsOptions = [
        {
          optionName: '',
          imgUrl: '',
          price: 0,
          num1: 0,
          num2: 0,
          remark: '',
        },
      ];
    }
  } else {
    item.attrsOptions = [];
  }
};

const handleOptionChange = (options: any[], index: number) => {
  if (options.length - 1 === index) {
    options.push({
      optionName: '',
      imgUrl: '',
      price: 0,
      num1: 0,
      num2: 0,
      remark: '',
    });
  }
  notifyChange();
};

const handleDeleteOption = (options: any[], index: number) => {
  options.splice(index, 1);
  notifyChange();
};

const notifyChange = useDebounceFn(() => {
  emits('generateSku');
}, 200);

onMounted(() => {
  ensureRowKeys();
  const host = document.querySelector('.spec-sort-list') as HTMLElement | null;
  if (!host) return;

  const sortable = Sortable.create(host, {
    animation: 150,
    draggable: '.spec-item',
    handle: '.spec-move-item',
    onEnd: (event) => {
      const oldIndex = event.oldIndex!;
      const newIndex = event.newIndex!;
      const attr = modelValue.value[oldIndex];
      modelValue.value.splice(oldIndex, 1);
      modelValue.value.splice(newIndex, 0, attr);
    },
  });
  return () => {
    sortable.destroy();
  };
});

const handleHasImgChange = (item: any) => {
  item.attrsOptions.forEach((o: any) => {
    o.imgUrl = '';
  });
};
</script>
<template>
  <FormItem label="商品规格">
    <div class="bg-[#f7f8fa] p-[10px]! w-full spec-sort-wrap">
      <div class="spec-sort-list">
        <div
          class="bg-white spec-item"
          v-for="(item, i) in modelValue"
          :key="item._k"
          :class="{ 'mt-2': i > 0 }"
        >
          <div class="bg-white p-[10px]! flex justify-between items-center w-full">
            <div class="flex gap-2">
              <div class="flex justify-center items-center cursor-move select-none spec-move-item">
                <GripVertical />
              </div>
              <div class="w-[250px]">
                <Select
                  v-model:value="item.key"
                  allow-clear
                  placeholder="请选择规格类型"
                  :options="
                    renderAttrs.filter(
                      (a) =>
                        a.value === item.key ||
                        !modelValue
                          .map((m) => m.key)
                          .filter(Boolean)
                          .includes(a.value),
                    )
                  "
                  @change="handleChangeSpec(item)"
                />
              </div>
              <ElCheckbox
                v-model="item.hasImg"
                v-if="
                  item.key &&
                  ![GOODS_CLASS_ATTRS_SIZE, GOODS_CLASS_ATTRS_KS, GOODS_CLASS_ATTRS_NUM].includes(
                    item.key,
                  )
                "
                @change="handleHasImgChange(item)"
              >
                是否有图片
              </ElCheckbox>
              <ElCheckbox
                v-model="item.customValue"
                v-if="
                  item.key &&
                  (item.key === GOODS_CLASS_ATTRS_KS || item.key === GOODS_CLASS_ATTRS_NUM)
                "
              >
                是否支持自定义值
              </ElCheckbox>
            </div>
            <Button type="link" size="small" danger @click="handleDeleteSpec(i)">
              删除规格类型
            </Button>
          </div>
          <div class="bg-white p-[10px]! border-t border-[#eff0f4]" v-if="item.key">
            <Space wrap>
              <template v-for="(o, j) in item.attrsOptions" :key="j">
                <!-- 款数和数量 -->
                <div
                  class="flex gap-1"
                  v-if="item.key === GOODS_CLASS_ATTRS_KS || item.key === GOODS_CLASS_ATTRS_NUM"
                >
                  <InputNumber
                    v-model:value="o.optionName"
                    :controls="false"
                    :precision="0"
                    :placeholder="`自定义${item.attrName}`"
                    size="small"
                    class="w-[90px]!"
                    @change="handleOptionChange(item.attrsOptions, Number(j))"
                  />
                  <ElButton
                    type="danger"
                    link
                    size="small"
                    v-if="Number(o.optionName) > 0"
                    @click="handleDeleteOption(item.attrsOptions, Number(j))"
                  >
                    删除
                  </ElButton>
                </div>
                <!-- 尺寸 -->
                <Space v-else-if="item.key === GOODS_CLASS_ATTRS_SIZE">
                  <Input
                    v-model:value="o.remark"
                    placeholder="备注"
                    size="small"
                    class="w-[70px]!"
                    @change="handleOptionChange(item.attrsOptions, Number(j))"
                  />
                  <div>
                    (
                    <InputNumber
                      v-model:value="o.num1"
                      size="small"
                      :min="0"
                      :step="1"
                      :controls="false"
                      @input="handleOptionChange(item.attrsOptions, Number(j))"
                      class="size-input-number"
                      style="width: 60px"
                      placeholder="尺寸1"
                    />
                    *
                    <InputNumber
                      v-model:value="o.num2"
                      size="small"
                      :min="0"
                      :step="1"
                      :controls="false"
                      @input="handleOptionChange(item.attrsOptions, Number(j))"
                      class="size-input-number"
                      style="width: 60px"
                      placeholder="尺寸2"
                    />)
                  </div>
                  <ElButton
                    :style="{ visibility: o.optionName?.trim() ? 'visible' : 'hidden' }"
                    type="danger"
                    link
                    size="small"
                    @click="handleDeleteOption(item.attrsOptions, Number(j))"
                  >
                    删除
                  </ElButton>
                </Space>
                <Space v-else>
                  <Input
                    v-model:value="o.optionName"
                    :placeholder="`自定义${item.attrName}`"
                    placeholder-class="input-placeholder"
                    @input="handleOptionChange(item.attrsOptions, Number(j))"
                    size="small"
                    class="w-[100px]!"
                  />
                  <ImageUploader v-if="item.hasImg" v-model="o.imgUrl" size="58px" />
                  <InputNumber
                    v-model:value="o.price"
                    size="small"
                    :min="0"
                    :step="1"
                    :controls="false"
                    :precision="2"
                    @input="handleOptionChange(item.attrsOptions, Number(j))"
                    placeholder="价格"
                  />
                  <ElButton
                    type="danger"
                    link
                    size="small"
                    v-if="o.optionName?.trim()"
                    @click="handleDeleteOption(item.attrsOptions, Number(j))"
                  >
                    删除
                  </ElButton>
                </Space>
              </template>
            </Space>
          </div>
        </div>
      </div>

      <Button type="primary" class="mt-2" @click="handleAddSpec">添加规格类型</Button>
    </div>
  </FormItem>
</template>
