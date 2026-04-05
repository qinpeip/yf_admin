import type { InjectionKey, Ref } from 'vue';

/** SystemProShell 提供的表格 body 纵向滚动高度（像素），供 `useSystemProTableScroll` 注入 */
export const SYSTEM_PRO_SHELL_TABLE_SCROLL_Y: InjectionKey<Ref<number | undefined>> =
  Symbol('systemProShellTableScrollY');
