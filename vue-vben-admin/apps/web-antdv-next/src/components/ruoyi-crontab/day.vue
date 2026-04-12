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
const cycle01 = ref(1);
const cycle02 = ref(2);
const average01 = ref(1);
const average02 = ref(1);
const workday = ref(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([1]);

const dayOpts = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));

const cycleTotal = computed(() => {
  cycle01.value = props.check(cycle01.value, 1, 30);
  cycle02.value = props.check(cycle02.value, cycle01.value + 1, 31);
  return `${cycle01.value}-${cycle02.value}`;
});
const averageTotal = computed(() => {
  average01.value = props.check(average01.value, 1, 30);
  average02.value = props.check(average02.value, 1, 31 - average01.value);
  return `${average01.value}/${average02.value}`;
});
const workdayTotal = computed(() => {
  workday.value = props.check(workday.value, 1, 31);
  return `${workday.value}W`;
});
const checkboxString = computed(() => checkboxList.value.join(','));

watch(
  () => props.cron.day,
  (value) => changeRadioValue(value ?? ''),
);
watch(
  checkboxList,
  (v) => {
    if (v.length > 10) checkboxList.value = v.slice(0, 10);
  },
  { deep: true },
);
watch([radioValue, cycleTotal, averageTotal, workdayTotal, checkboxString], () => onRadioChange());

function changeRadioValue(value: string) {
  if (value === '*') {
    radioValue.value = 1;
  } else if (value === '?') {
    radioValue.value = 2;
  } else if (value.includes('-')) {
    const indexArr = value.split('-');
    cycle01.value = Number(indexArr[0]);
    cycle02.value = Number(indexArr[1]);
    radioValue.value = 3;
  } else if (value.includes('/')) {
    const indexArr = value.split('/');
    average01.value = Number(indexArr[0]);
    average02.value = Number(indexArr[1]);
    radioValue.value = 4;
  } else if (value.includes('W')) {
    const indexArr = value.split('W');
    workday.value = Number(indexArr[0]);
    radioValue.value = 5;
  } else if (value === 'L') {
    radioValue.value = 6;
  } else {
    checkboxList.value = [...new Set(value.split(',').map(Number))];
    radioValue.value = 7;
  }
}

function onRadioChange() {
  if (radioValue.value === 2 && props.cron.week === '?') {
    emit('update', 'week', '*', 'day');
  }
  if (radioValue.value !== 2 && props.cron.week !== '?') {
    emit('update', 'week', '?', 'day');
  }
  switch (radioValue.value) {
    case 1: {
      emit('update', 'day', '*', 'day');
      break;
    }
    case 2: {
      emit('update', 'day', '?', 'day');
      break;
    }
    case 3: {
      emit('update', 'day', cycleTotal.value, 'day');
      break;
    }
    case 4: {
      emit('update', 'day', averageTotal.value, 'day');
      break;
    }
    case 5: {
      emit('update', 'day', workdayTotal.value, 'day');
      break;
    }
    case 6: {
      emit('update', 'day', 'L', 'day');
      break;
    }
    case 7: {
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]!);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit('update', 'day', checkboxString.value, 'day');
      break;
    }
  }
}
</script>

<template>
  <Form layout="vertical" size="small" class="ruoyi-crontab-part">
    <RadioGroup v-model:value="radioValue">
      <div class="mb-2">
        <Radio :value="1">日，允许的通配符[, - * ? / L W]</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="2">不指定</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="3">
          周期从
          <InputNumber v-model:value="cycle01" :min="1" :max="30" size="small" class="mx-1 w-[88px]" />
          -
          <InputNumber v-model:value="cycle02" :min="cycle01 + 1" :max="31" size="small" class="mx-1 w-[88px]" />
          日
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="4">
          从
          <InputNumber v-model:value="average01" :min="1" :max="30" size="small" class="mx-1 w-[88px]" />
          号开始，每
          <InputNumber v-model:value="average02" :min="1" :max="31 - average01" size="small" class="mx-1 w-[88px]" />
          日执行一次
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="5">
          每月
          <InputNumber v-model:value="workday" :min="1" :max="31" size="small" class="mx-1 w-[88px]" />
          号最近的那个工作日
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="6">本月最后一天</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="7">
          指定
          <Select
            v-model:value="checkboxList"
            mode="multiple"
            allow-clear
            placeholder="可多选"
            :options="dayOpts"
            class="!ml-2 !w-[300px] max-w-full"
            :max-tag-count="3"
          />
        </Radio>
      </div>
    </RadioGroup>
  </Form>
</template>
