<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';

import { preferences } from '@vben/preferences';

import { Button, Result } from 'antdv-next';

defineOptions({ name: 'Ruoyi401' });

const route = useRoute();
const router = useRouter();

function back() {
  if (route.query.noGoBack) {
    router.push(preferences.app.defaultHomePath);
  } else {
    router.go(-1);
  }
}

function goHome() {
  router.push(preferences.app.defaultHomePath);
}
</script>

<template>
  <div class="ruoyi-401">
    <Result
      status="403"
      sub-title="对不起，您没有访问权限，请不要进行非法操作！您可以返回主页面。"
      title="401"
    >
      <template #extra>
        <Button type="primary" @click="back">返回</Button>
        <Button @click="goHome">回首页</Button>
      </template>
    </Result>
  </div>
</template>

<style scoped>
.ruoyi-401 {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 24px;
}
</style>
