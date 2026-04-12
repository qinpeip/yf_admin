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

const radioValue = ref(2);
const cycle01 = ref(2);
const cycle02 = ref(3);
const average01 = ref(1);
const average02 = ref(2);
const weekday = ref(2);
const checkboxList = ref<number[]>([]);
const checkCopy = ref([2]);

const weekList = [
  { value: 1, label: '星期日' },
  { value: 2, label: '星期一' },
  { value: 3, label: '星期二' },
  { value: 4, label: '星期三' },
  { value: 5, label: '星期四' },
  { value: 6, label: '星期五' },
  { value: 7, label: '星期六' },
];

const weekOptionsCycle1 = weekList.map((o) => ({
  ...o,
  disabled: o.value === 7,
}));

const weekOptionsCycle2 = computed(() =>
  weekList.map((o) => ({
    ...o,
    disabled: o.value <= cycle01.value,
  })),
);

const cycleTotal = computed(() => {
  cycle01.value = props.check(cycle01.value, 1, 6);
  cycle02.value = props.check(cycle02.value, cycle01.value + 1, 7);
  return `${cycle01.value}-${cycle02.value}`;
});
const averageTotal = computed(() => {
  average01.value = props.check(average01.value, 1, 4);
  average02.value = props.check(average02.value, 1, 7);
  return `${average02.value}#${average01.value}`;
});
const weekdayTotal = computed(() => {
  weekday.value = props.check(weekday.value, 1, 7);
  return `${weekday.value}L`;
});
const checkboxString = computed(() => checkboxList.value.join(','));

watch(
  () => props.cron.week,
  (value) => changeRadioValue(value ?? ''),
);
watch(
  checkboxList,
  (v) => {
    if (v.length > 6) checkboxList.value = v.slice(0, 6);
  },
  { deep: true },
);
watch([radioValue, cycleTotal, averageTotal, weekdayTotal, checkboxString], () => onRadioChange());

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
  } else if (value.includes('#')) {
    const indexArr = value.split('#');
    average01.value = Number(indexArr[1]);
    average02.value = Number(indexArr[0]);
    radioValue.value = 4;
  } else if (value.includes('L')) {
    const indexArr = value.split('L');
    weekday.value = Number(indexArr[0]);
    radioValue.value = 5;
  } else {
    checkboxList.value = [...new Set(value.split(',').map(Number))];
    radioValue.value = 6;
  }
}

function onRadioChange() {
  if (radioValue.value === 2 && props.cron.day === '?') {
    emit('update', 'day', '*', 'week');
  }
  if (radioValue.value !== 2 && props.cron.day !== '?') {
    emit('update', 'day', '?', 'week');
  }
  switch (radioValue.value) {
    case 1: {
      emit('update', 'week', '*', 'week');
      break;
    }
    case 2: {
      emit('update', 'week', '?', 'week');
      break;
    }
    case 3: {
      emit('update', 'week', cycleTotal.value, 'week');
      break;
    }
    case 4: {
      emit('update', 'week', averageTotal.value, 'week');
      break;
    }
    case 5: {
      emit('update', 'week', weekdayTotal.value, 'week');
      break;
    }
    case 6: {
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]!);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit('update', 'week', checkboxString.value, 'week');
      break;
    }
  }
}
</script>

<template>
  <Form layout="vertical" size="small" class="ruoyi-crontab-part">
    <RadioGroup v-model:value="radioValue">
      <div class="mb-2">
        <Radio :value="1">周，允许的通配符[, - * ? / L #]</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="2">不指定</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="3">
          <span class="mr-2">周期从</span>
          <Select
            v-model:value="cycle01"
            allow-clear
            :options="weekOptionsCycle1"
            class="!inline-block !w-[120px]"
            @click.stop
          />
          <span class="mx-1">-</span>
          <Select
            v-model:value="cycle02"
            allow-clear
            :options="weekOptionsCycle2"
            class="!inline-block !w-[120px]"
            @click.stop
          />
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="4">
          第
          <InputNumber v-model:value="average01" :min="1" :max="4" size="small" class="mx-1 w-[72px]" />
          周的
          <Select v-model:value="average02" allow-clear :options="weekList" class="!ml-2 !w-[120px]" />
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="5">
          本月最后一个
          <Select v-model:value="weekday" allow-clear :options="weekList" class="!ml-2 !w-[120px]" />
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="6">
          指定
          <Select
            v-model:value="checkboxList"
            mode="multiple"
            allow-clear
            placeholder="可多选"
            :options="weekList"
            class="!ml-2 !w-[280px] max-w-full"
            :max-tag-count="3"
          />
        </Radio>
      </div>
    </RadioGroup>
  </Form>
</template>
