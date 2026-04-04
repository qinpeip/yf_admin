<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  captchaSvg?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'refresh'): void;
}>();

const model = computed({
  get() {
    return props.modelValue ?? '';
  },
  set(v: any) {
    emit('update:modelValue', String(v ?? ''));
  },
});
</script>

<template>
  <div class="captcha-input">
    <input
      v-model="model"
      class="captcha-native-input"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <button
      type="button"
      class="captcha-addon"
      :disabled="disabled"
      @click="emit('refresh')"
      title="点击刷新验证码"
    >
      <span v-if="captchaSvg" class="captcha-svg" v-html="captchaSvg" />
      <span v-else class="captcha-fallback">刷新</span>
    </button>
  </div>
</template>

<style scoped>
.captcha-input {
  display: flex;
  width: 100%;
  height: 40px;
  border: 1px solid hsl(var(--input));
  border-radius: 6px;
  overflow: hidden; /* 统一边框，避免遮挡/重叠 */
  background: hsl(var(--background));
}

.captcha-native-input {
  border: 0;
  background: transparent;
  color: hsl(var(--foreground));
  outline: none;
  height: 100%;
  width: 100%;
  padding: 0 12px;
  font-size: 14px;
}

.captcha-native-input::placeholder {
  color: hsl(var(--muted-foreground));
  opacity: 0.6;
}

.captcha-native-input:focus {
  /* 外层容器负责边框，这里只做可见的 focus ring */
  box-shadow: inset 0 0 0 1px hsl(var(--ring));
}

.captcha-native-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.captcha-addon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 100%;
  border: 0;
  border-left: 1px solid hsl(var(--input)); /* 仅分割线 */
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.captcha-addon:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.captcha-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 120px;
}

.captcha-svg :deep(svg) {
  height: 40px;
  width: 120px;
}

.captcha-fallback {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>

