<script setup lang="ts">
/* eslint-disable vue/no-side-effects-in-computed-properties -- 与若依 Crontab 一致：computed 内钳制 InputNumber 边界 */
import { computed, ref, watch } from 'vue';

import { Form, InputNumber, Radio, RadioGroup, Select } from 'antdv-next';

const props = defineProps<{
  check: (value: number, minLimit: number, maxLimit: number) => number;
  cron: Record<string, string>;
}>();

const emit = defineEmits<{
  update: [field: string, value: string, from: string];
}>();

const radioValue = ref(1);
const cycle01 = ref(0);
const cycle02 = ref(1);
const average01 = ref(0);
const average02 = ref(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([0]);

const opts = Array.from({ length: 60 }, (_, i) => ({ label: String(i), value: i }));

const cycleTotal = computed(() => {
  cycle01.value = props.check(cycle01.value, 0, 58);
  cycle02.value = props.check(cycle02.value, cycle01.value + 1, 59);
  return `${cycle01.value}-${cycle02.value}`;
});
const averageTotal = computed(() => {
  average01.value = props.check(average01.value, 0, 58);
  average02.value = props.check(average02.value, 1, 59 - average01.value);
  return `${average01.value}/${average02.value}`;
});
const checkboxString = computed(() => checkboxList.value.join(','));

watch(
  () => props.cron.second,
  (value) => changeRadioValue(value ?? ''),
);
watch(
  checkboxList,
  (v) => {
    if (v.length > 10) checkboxList.value = v.slice(0, 10);
  },
  { deep: true },
);
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange());

function changeRadioValue(value: string) {
  if (value === '*') {
    radioValue.value = 1;
  } else if (value.includes('-')) {
    const indexArr = value.split('-');
    cycle01.value = Number(indexArr[0]);
    cycle02.value = Number(indexArr[1]);
    radioValue.value = 2;
  } else if (value.includes('/')) {
    const indexArr = value.split('/');
    average01.value = Number(indexArr[0]);
    average02.value = Number(indexArr[1]);
    radioValue.value = 3;
  } else {
    checkboxList.value = [...new Set(value.split(',').map(Number))];
    radioValue.value = 4;
  }
}

function onRadioChange() {
  switch (radioValue.value) {
    case 1: {
      emit('update', 'second', '*', 'second');
      break;
    }
    case 2: {
      emit('update', 'second', cycleTotal.value, 'second');
      break;
    }
    case 3: {
      emit('update', 'second', averageTotal.value, 'second');
      break;
    }
    case 4: {
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]!);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit('update', 'second', checkboxString.value, 'second');
      break;
    }
  }
}
</script>

<template>
  <Form layout="vertical" size="small" class="ruoyi-crontab-part">
    <RadioGroup v-model:value="radioValue">
      <div class="mb-2">
        <Radio :value="1">秒，允许的通配符[, - * /]</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="2">
          周期从
          <InputNumber v-model:value="cycle01" :min="0" :max="58" size="small" class="mx-1 w-[88px]" />
          -
          <InputNumber v-model:value="cycle02" :min="cycle01 + 1" :max="59" size="small" class="mx-1 w-[88px]" />
          秒
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="3">
          从
          <InputNumber v-model:value="average01" :min="0" :max="58" size="small" class="mx-1 w-[88px]" />
          秒开始，每
          <InputNumber v-model:value="average02" :min="1" :max="59 - average01" size="small" class="mx-1 w-[88px]" />
          秒执行一次
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="4">
          指定
          <Select
            v-model:value="checkboxList"
            mode="multiple"
            allow-clear
            placeholder="可多选"
            :options="opts"
            class="!ml-2 !w-[300px] max-w-full"
            :max-tag-count="3"
          />
        </Radio>
      </div>
    </RadioGroup>
  </Form>
</template>
