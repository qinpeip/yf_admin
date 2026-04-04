import type { Directive } from 'vue';

import { useUserStore } from '@vben/stores';

const SUPER = 'admin';

/** 对齐 admin-vue3 `v-hasRole` */
export const vHasRole: Directive<HTMLElement, string[]> = {
  mounted(el, binding) {
    const { value } = binding;
    const roles = useUserStore().userRoles;

    if (value && Array.isArray(value) && value.length > 0) {
      const required = value;
      const has = roles.some((r) => SUPER === r || required.includes(r));
      if (!has) {
        el.parentNode?.removeChild(el);
      }
    } else {
      throw new Error('请设置角色权限标签值');
    }
  },
};
