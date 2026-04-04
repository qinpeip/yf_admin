import type { App } from 'vue';

import { vCopyText } from './copy-text';
import { vHasPermi } from './has-permi';
import { vHasRole } from './has-role';

/** 若依风格指令：`v-hasPermi` / `v-hasRole` / `v-copyText` */
export function registerRuoYiDirectives(app: App) {
  app.directive('hasPermi', vHasPermi);
  app.directive('hasRole', vHasRole);
  app.directive('copyText', vCopyText);
}
