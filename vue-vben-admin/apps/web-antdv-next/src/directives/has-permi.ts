import type { Directive } from 'vue';

import { useAccessStore } from '@vben/stores';

const ALL = '*:*:*';

/** 对齐 admin-vue3 `v-hasPermi`（权限码来自若依 `/getInfo` → accessCodes） */
export const vHasPermi: Directive<HTMLElement, string[]> = {
  mounted(el, binding) {
    const { value } = binding;
    const permissions = useAccessStore().accessCodes;

    if (value && Array.isArray(value) && value.length > 0) {
      const required = value;
      const has = permissions.some(
        (p) => ALL === p || required.includes(p),
      );
      if (!has) {
        el.parentNode?.removeChild(el);
      }
    } else {
      throw new Error('请设置操作权限标签值');
    }
  },
};
