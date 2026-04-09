import { computed, ref } from 'vue';

import { getCityList, getProvinceList } from '#/api/system/region';

type ProvinceOption = { label: string; value: number };
type CityOption = { label: string; pid: number; value: number };

// Module-level cache: ensure all useArea() callers share one request + one result.
const provinceList = ref<ProvinceOption[]>([]);
const cityList = ref<CityOption[]>([]);
const provinceLoading = ref(false);
const cityLoading = ref(false);

let initPromise: Promise<void> | undefined;

async function loadProvinceList() {
  if (provinceLoading.value || provinceList.value.length > 0) return;
  provinceLoading.value = true;
  try {
    const res = await getProvinceList();
    provinceList.value = res.map((item) => ({ value: item.id, label: item.name }));
  } finally {
    provinceLoading.value = false;
  }
}

async function loadCityList() {
  if (cityLoading.value || cityList.value.length > 0) return;
  cityLoading.value = true;
  try {
    const res = await getCityList();
    cityList.value = res.map((item) => ({ value: item.id, label: item.name, pid: item.pid }));
  } finally {
    cityLoading.value = false;
  }
}

function ensureLoadedOnce() {
  if (provinceList.value.length > 0 && cityList.value.length > 0) return;
  if (!initPromise) {
    initPromise = Promise.all([loadProvinceList(), loadCityList()]).then(() => undefined);
  }
}

export const useArea = () => {
  ensureLoadedOnce();
  const proviceCityTree = computed(() => {
    return provinceList.value.map((item) => {
      return {
        label: item.label,
        value: item.value,
        children: cityList.value.filter((city) => city.pid === item.value),
      };
    });
  });
  return {
    provinceList,
    cityList,
    proviceCityTree,
  };
};
