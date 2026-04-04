<script lang="ts" setup>
import { RouterView } from 'vue-router';

/** 与若依 ParentView 一致：多级目录占位，仅渲染子路由 */
defineOptions({ name: 'RuoYiParentView' });
</script>

<template>
  <RouterView />
</template>
