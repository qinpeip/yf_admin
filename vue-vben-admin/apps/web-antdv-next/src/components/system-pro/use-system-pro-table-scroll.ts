import { computed, inject, ref, type ComputedRef } from 'vue';

import { SYSTEM_PRO_SHELL_TABLE_SCROLL_Y } from './injection';

export type SystemProTableScroll = { x?: number | string; y?: number };

/**
 * 与 `SystemProShell` 配合：返回 Ant Table `scroll` 对象，在列表页内仅表格 body 纵向滚动。
 * 不在 Shell 内或未测量到高度时，不设置 `y`（保持原样）。
 *
 * @param x 横向滚动宽度，与原有 `:scroll="{ x: 1200 }"` 一致；可传 `undefined` 表示不限制横向
 */
export function useSystemProTableScroll(
  x?: number | string,
): ComputedRef<SystemProTableScroll | undefined> {
  const bodyY = inject(SYSTEM_PRO_SHELL_TABLE_SCROLL_Y, ref<number | undefined>(undefined));

  return computed(() => {
    const out: SystemProTableScroll = {};
    if (x !== undefined && x !== '') {
      out.x = x;
    }
    const y = bodyY.value;
    if (y != null && y > 0) {
      out.y = y;
    }
    return Object.keys(out).length ? out : undefined;
  });
}
