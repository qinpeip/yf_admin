<script setup lang="ts">
/* eslint-disable vue/no-side-effects-in-computed-properties -- 与若依 Crontab 一致：computed 内钳制 InputNumber 边界 */
import { computed, onMounted, ref, watch } from 'vue';

import { Form, InputNumber, Radio, RadioGroup, Select } from 'antdv-next';

const props = defineProps<{
  check: (value: number, minLimit: number, maxLimit: number) => number;
  cron: Record<string, string>;
}>();

const emit = defineEmits<{
  update: [field: string, value: string, from: string];
}>();

const fullYear = ref(0);
const maxFullYear = ref(0);
const radioValue = ref(1);
const cycle01 = ref(0);
const cycle02 = ref(0);
const average01 = ref(0);
const average02 = ref(1);
const checkboxList = ref<number[]>([]);
const checkCopy = ref<number[]>([]);

const yearOpts = computed(() => {
  const fy = fullYear.value;
  if (!fy) return [];
  return Array.from({ length: 9 }, (_, i) => {
    const y = fy + i;
    return { label: String(y), value: y };
  });
});

const cycleTotal = computed(() => {
  cycle01.value = props.check(cycle01.value, fullYear.value, maxFullYear.value - 1);
  cycle02.value = props.check(cycle02.value, cycle01.value + 1, maxFullYear.value);
  return `${cycle01.value}-${cycle02.value}`;
});
const averageTotal = computed(() => {
  average01.value = props.check(average01.value, fullYear.value, maxFullYear.value - 1);
  average02.value = props.check(average02.value, 1, 10);
  return `${average01.value}/${average02.value}`;
});
const checkboxString = computed(() => checkboxList.value.join(','));

watch(
  () => props.cron.year,
  (value) => changeRadioValue(value ?? ''),
);
watch(
  checkboxList,
  (v) => {
    if (v.length > 8) checkboxList.value = v.slice(0, 8);
  },
  { deep: true },
);
watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange());

function changeRadioValue(value: string) {
  if (value === '') {
    radioValue.value = 1;
  } else if (value === '*') {
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
  } else {
    checkboxList.value = [...new Set(value.split(',').map(Number))];
    radioValue.value = 5;
  }
}

function onRadioChange() {
  switch (radioValue.value) {
    case 1: {
      emit('update', 'year', '', 'year');
      break;
    }
    case 2: {
      emit('update', 'year', '*', 'year');
      break;
    }
    case 3: {
      emit('update', 'year', cycleTotal.value, 'year');
      break;
    }
    case 4: {
      emit('update', 'year', averageTotal.value, 'year');
      break;
    }
    case 5: {
      if (checkboxList.value.length === 0) {
        checkboxList.value.push(checkCopy.value[0]!);
      } else {
        checkCopy.value = [...checkboxList.value];
      }
      emit('update', 'year', checkboxString.value, 'year');
      break;
    }
  }
}

onMounted(() => {
  fullYear.value = new Date().getFullYear();
  maxFullYear.value = fullYear.value + 10;
  cycle01.value = fullYear.value;
  cycle02.value = cycle01.value + 1;
  average01.value = fullYear.value;
  checkCopy.value = [fullYear.value];
});
</script>

<template>
  <Form layout="vertical" size="small" class="ruoyi-crontab-part">
    <RadioGroup v-model:value="radioValue">
      <div class="mb-2">
        <Radio :value="1">不填，允许的通配符[, - * /]</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="2">每年</Radio>
      </div>
      <div class="mb-2">
        <Radio :value="3">
          周期从
          <InputNumber v-model:value="cycle01" :min="fullYear" :max="maxFullYear - 1" size="small" class="mx-1 w-[100px]" />
          -
          <InputNumber v-model:value="cycle02" :min="cycle01 + 1" :max="maxFullYear" size="small" class="mx-1 w-[100px]" />
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="4">
          从
          <InputNumber v-model:value="average01" :min="fullYear" :max="maxFullYear - 1" size="small" class="mx-1 w-[100px]" />
          年开始，每
          <InputNumber v-model:value="average02" :min="1" :max="10" size="small" class="mx-1 w-[72px]" />
          年执行一次
        </Radio>
      </div>
      <div class="mb-2">
        <Radio :value="5">
          指定
          <Select
            v-model:value="checkboxList"
            mode="multiple"
            allow-clear
            placeholder="可多选"
            :options="yearOpts"
            class="!ml-2 !w-[300px] max-w-full"
            :max-tag-count="3"
          />
        </Radio>
      </div>
    </RadioGroup>
  </Form>
</template>
