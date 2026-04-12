<script setup lang="ts">
import { ElCascaderPanel } from 'element-plus';

const props = withDefaults(
  defineProps<{
    classCircleData?: any[];
    classTree?: any[];
  }>(),
  {
    classTree: () => [],
    classCircleData: () => [],
  },
);

const modelValue = defineModel<number | undefined>({ required: true });
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden gap-2">
    <div class="flex-1 overflow-hidden class-selector-panel">
      <ElCascaderPanel
        v-model="modelValue"
        :options="props.classTree"
        :props="{
          label: 'name',
          value: 'classId',
          emitPath: false,
          checkStrictly: true,
        }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.class-selector-panel {
  :deep(.el-cascader-panel) {
    height: 100%;
    .el-cascader-menu__wrap.el-scrollbar__wrap {
      height: 100%;
    }
  }
}
</style>
