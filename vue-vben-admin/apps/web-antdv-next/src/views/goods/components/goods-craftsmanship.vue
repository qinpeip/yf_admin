<script lang="ts" setup>
import { Button, FormItem, Input, InputNumber, Select, Space } from 'antdv-next';
import { ElButton, ElCheckbox } from 'element-plus';

const props = defineProps<{
  craftsmanshipOptions: { label: string; value: number }[];
}>();

const modelValue = defineModel<any[]>({ required: true });

const handleAddCraftsmanship = () => {
  modelValue.value.push({
    priceType: '1',
    craftsmanship_id: '',
    childCraftsmanship: [],
  });
};

const handleDeleteCraftsmanship = (index: number) => {
  modelValue.value.splice(index, 1);
};

const handleChangeCraftsmanship = (item: any) => {
  item.childCraftsmanship = item.craftsmanship_id
    ? [
        {
          name: '',
          price: undefined,
        },
      ]
    : [];
};

const handleOptionChange = (options: any[], index: number) => {
  if (options.length - 1 == index) {
    options.push({
      name: '',
      price: undefined,
    });
  }
};

const handleDeleteOption = (options: any[], index: number) => {
  options.splice(index, 1);
};
</script>
<template>
  <FormItem label="商品工艺">
    <div class="bg-[#f7f8fa] p-[10px]! w-full">
      <template v-for="(item, i) in modelValue" :key="i">
        <div class="bg-white p-[10px]! flex justify-between items-center w-full">
          <div class="flex gap-2">
            <div class="w-[300px]">
              <Select
                v-model:value="item.craftsmanship_id"
                :options="
                  props.craftsmanshipOptions.filter(
                    (p) =>
                      p.value === item.craftsmanship_id ||
                      !modelValue
                        .map((m) => m.craftsmanship_id)
                        .filter(Boolean)
                        .includes(p.value),
                  )
                "
                allow-clear
                placeholder="请选择工艺"
                @change="handleChangeCraftsmanship(item)"
              />
            </div>
            <ElCheckbox v-model="item.priceType" true-value="2" false-value="1">
              按平方计价
            </ElCheckbox>
          </div>
          <Button type="link" size="small" danger @click="handleDeleteCraftsmanship(i)">
            删除工艺
          </Button>
        </div>
        <div class="bg-white p-[10px]! border-t border-[#eff0f4]" v-if="item.craftsmanship_id">
          <Space wrap>
            <template v-for="(child, j) in item.childCraftsmanship" :key="j">
              <div class="w-[150px]">
                <Input
                  v-model:value="child.name"
                  placeholder="请输入子工艺名称"
                  size="small"
                  @change="handleOptionChange(item.childCraftsmanship, +j)"
                />
              </div>
              <InputNumber
                v-model:value="child.price"
                placeholder="子工艺价格"
                size="small"
                :controls="false"
                @change="handleOptionChange(item.childCraftsmanship, +j)"
                :precision="2"
              />
              <ElButton
                type="danger"
                link
                size="small"
                danger
                @click="handleDeleteOption(item.childCraftsmanship, +j)"
                v-if="child.name"
              >
                删除
              </ElButton>
              <div class="w-[20px]!"></div>
            </template>
          </Space>
        </div>
      </template>

      <Button type="primary" class="mt-2" @click="handleAddCraftsmanship">添加工艺</Button>
    </div>
  </FormItem>
</template>
