<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { Button, TabPane, Tabs } from 'antdv-next';

import CrontabDay from './day.vue';
import CrontabHour from './hour.vue';
import CrontabMin from './min.vue';
import CrontabMonth from './month.vue';
import CrontabResult from './result.vue';
import CrontabSecond from './second.vue';
import CrontabWeek from './week.vue';
import CrontabYear from './year.vue';

const props = withDefaults(
  defineProps<{
    expression?: string;
    hideComponent?: string[];
  }>(),
  {
    hideComponent: () => [],
    expression: '',
  },
);

const emit = defineEmits<{
  fill: [value: string];
  hide: [];
}>();

const tabTitles = ['秒', '分钟', '小时', '日', '月', '周', '年'];
const hideList = ref<string[]>([]);
const expressionInner = ref('');

const crontabValueObj = ref({
  second: '*',
  min: '*',
  hour: '*',
  day: '*',
  month: '*',
  week: '?',
  year: '',
});

const crontabValueString = computed(() => {
  const obj = crontabValueObj.value;
  const y = obj.year === '' ? '' : ` ${obj.year}`;
  return `${obj.second} ${obj.min} ${obj.hour} ${obj.day} ${obj.month} ${obj.week}${y}`;
});

function shouldHide(key: string) {
  return !(hideList.value.length > 0 && hideList.value.includes(key));
}

function resolveExp() {
  if (expressionInner.value) {
    const arr = expressionInner.value.trim().split(/\s+/);
    if (arr.length >= 6) {
      crontabValueObj.value = {
        second: arr[0]!,
        min: arr[1]!,
        hour: arr[2]!,
        day: arr[3]!,
        month: arr[4]!,
        week: arr[5]!,
        year: arr[6] ?? '',
      };
    }
  } else {
    clearCron();
  }
}

function updateCrontabValue(name: string, value: string, _from: string) {
  crontabValueObj.value = {
    ...crontabValueObj.value,
    [name]: value,
  } as typeof crontabValueObj.value;
}

function checkNumber(value: number, minLimit: number, maxLimit: number) {
  let v = Math.floor(value);
  if (v < minLimit) v = minLimit;
  else if (v > maxLimit) v = maxLimit;
  return v;
}

function hidePopup() {
  emit('hide');
}

function submitFill() {
  emit('fill', crontabValueString.value);
  hidePopup();
}

function clearCron() {
  crontabValueObj.value = {
    second: '*',
    min: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: '',
  };
}

watch(expressionInner, () => resolveExp());

watch(
  () => props.expression,
  (v) => {
    expressionInner.value = v ?? '';
    resolveExp();
  },
  { immediate: true },
);

onMounted(() => {
  hideList.value = props.hideComponent ?? [];
});
</script>

<template>
  <div class="ruoyi-crontab-root">
    <Tabs type="card" class="crontab-tabs">
      <TabPane v-if="shouldHide('second')" key="second" tab="秒">
        <CrontabSecond :check="checkNumber" :cron="crontabValueObj" @update="updateCrontabValue" />
      </TabPane>
      <TabPane v-if="shouldHide('min')" key="min" tab="分钟">
        <CrontabMin :check="checkNumber" :cron="crontabValueObj" @update="updateCrontabValue" />
      </TabPane>
      <TabPane v-if="shouldHide('hour')" key="hour" tab="小时">
        <CrontabHour :check="checkNumber" :cron="crontabValueObj" @update="updateCrontabValue" />
      </TabPane>
      <TabPane v-if="shouldHide('day')" key="day" tab="日">
        <CrontabDay :check="checkNumber" :cron="crontabValueObj" @update="updateCrontabValue" />
      </TabPane>
      <TabPane v-if="shouldHide('month')" key="month" tab="月">
        <CrontabMonth :check="checkNumber" :cron="crontabValueObj" @update="updateCrontabValue" />
      </TabPane>
      <TabPane v-if="shouldHide('week')" key="week" tab="周">
        <CrontabWeek :check="checkNumber" :cron="crontabValueObj" @update="updateCrontabValue" />
      </TabPane>
      <TabPane v-if="shouldHide('year')" key="year" tab="年">
        <CrontabYear :check="checkNumber" :cron="crontabValueObj" @update="updateCrontabValue" />
      </TabPane>
    </Tabs>

    <div class="popup-main">
      <div class="popup-result">
        <p class="title">时间表达式</p>
        <table>
          <thead>
            <tr>
              <th v-for="item of tabTitles" :key="item">{{ item }}</th>
              <th>Cron 表达式</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span class="cron-cell" :title="crontabValueObj.second">{{ crontabValueObj.second }}</span>
              </td>
              <td>
                <span class="cron-cell" :title="crontabValueObj.min">{{ crontabValueObj.min }}</span>
              </td>
              <td>
                <span class="cron-cell" :title="crontabValueObj.hour">{{ crontabValueObj.hour }}</span>
              </td>
              <td>
                <span class="cron-cell" :title="crontabValueObj.day">{{ crontabValueObj.day }}</span>
              </td>
              <td>
                <span class="cron-cell" :title="crontabValueObj.month">{{ crontabValueObj.month }}</span>
              </td>
              <td>
                <span class="cron-cell" :title="crontabValueObj.week">{{ crontabValueObj.week }}</span>
              </td>
              <td>
                <span class="cron-cell" :title="crontabValueObj.year">{{ crontabValueObj.year }}</span>
              </td>
              <td class="result">
                <span class="cron-cell cron-cell-wide" :title="crontabValueString">{{ crontabValueString }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <CrontabResult :ex="crontabValueString" />

      <div class="pop_btn">
        <Button type="primary" @click="submitFill">确定</Button>
        <Button danger @click="clearCron">重置</Button>
        <Button @click="hidePopup">取消</Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ruoyi-crontab-root {
  :deep(.crontab-tabs .ant-tabs-nav) {
    margin-bottom: 8px;
  }
}
.pop_btn {
  text-align: center;
  margin-top: 20px;
}
.popup-main {
  position: relative;
  margin: 10px auto;
  background: #fff;
  border-radius: 5px;
  font-size: 12px;
  overflow: hidden;
}
.popup-result {
  box-sizing: border-box;
  line-height: 24px;
  margin: 25px auto;
  padding: 15px 10px 10px;
  border: 1px solid #ccc;
  position: relative;
}
.popup-result .title {
  position: absolute;
  top: -28px;
  left: 50%;
  width: 140px;
  font-size: 14px;
  margin-left: -70px;
  text-align: center;
  line-height: 30px;
  background: #fff;
}
.popup-result table {
  text-align: center;
  width: 100%;
  margin: 0 auto;
}
.popup-result table td:not(.result) {
  width: 3.5rem;
  min-width: 3.5rem;
  max-width: 3.5rem;
}
.cron-cell {
  display: block;
  width: 100%;
  font-family: arial, sans-serif;
  line-height: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
td.result .cron-cell-wide {
  max-width: none;
}
.popup-result-scroll {
  font-size: 12px;
  line-height: 24px;
  height: 10em;
  overflow-y: auto;
}
</style>
