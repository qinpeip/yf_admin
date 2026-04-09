<script lang="ts" setup>
import { computed } from 'vue';

import { isEqual, keys } from 'lodash-es';

import { useArea } from '#/hooks/use-area';

const props = withDefaults(
  defineProps<{
    cityIds?: number[];
  }>(),
  {
    cityIds: () => [],
  },
);

const { provinceList, cityList } = useArea();

const allCityIds = computed(() => {
  return cityList.value.map((item) => item.value).toSorted((a, b) => a - b);
});

const isCheckAll = computed(() => {
  return (
    allCityIds.value.length === props.cityIds.length &&
    isEqual(
      allCityIds.value,
      props.cityIds.toSorted((a, b) => a - b),
    )
  );
});

const checkedProvice = computed(() => {
  const list: Record<string, string[]> = {};
  for (const cityId of props.cityIds) {
    const city = cityList.value.find((item) => item.value === cityId);
    if (city) {
      const province = provinceList.value.find((item) => item.value === city.pid);
      if (province) {
        list[province.label] = [];
      }
    }
  }
  for (const key of keys(list)) {
    const province = provinceList.value.find((item) => item.label === key);
    if (province) {
      const allCityIds = cityList.value
        .filter((item) => item.pid === province.value)
        .map((item) => item.value);
      const hasAll = allCityIds.every((id) => props.cityIds.includes(id));
      if (!hasAll) {
        const checkedCityids = props.cityIds.filter((id) => allCityIds.includes(id));
        list[key] = checkedCityids.map(
          (id) => cityList.value.find((item) => item.value === id)?.label ?? '',
        );
      }
    }
  }
  return list;
});
// const cityNames = computed(() => {
//   return proviceCityTree.value.find((item) => item.value === props.cityIds[0])?.label;
// });
</script>

<template>
  <div v-if="isCheckAll" class="text-[12px] text-[#333]">全国</div>
  <div v-else class="flex flex-wrap text-[12px] text-[#333]">
    <template v-for="(item, index) in keys(checkedProvice)" :key="item">
      {{ item }}
      <template v-if="checkedProvice[item] && checkedProvice[item].length > 0">
        (
        <em
          v-for="(city, subIndex) in checkedProvice[item]"
          :key="city"
          class="text-[12px] text-[#999]"
        >
          {{ city }}
          <template v-if="subIndex < checkedProvice[item].length - 1"> 、 </template>
        </em>
        )
      </template>
      <template v-if="index < keys(checkedProvice).length - 1">&nbsp;&nbsp;</template>
    </template>
  </div>
</template>
