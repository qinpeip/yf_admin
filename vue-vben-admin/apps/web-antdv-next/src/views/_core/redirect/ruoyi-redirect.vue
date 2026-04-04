<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/** 与 admin-vue3 `views/redirect/index.vue` 一致：用于标签页刷新等场景 */
defineOptions({ name: 'RuoyiPathRedirect' });

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const { params, query } = route;
  const path = params.path as string;
  router.replace({ path: `/${path}`, query });
});
</script>

<template>
  <div />
</template>
