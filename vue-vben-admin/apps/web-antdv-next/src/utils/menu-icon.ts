/**
 * 若依 / Element 菜单里存的 `icon` 多为短名或 `#`，Vben 侧栏使用 Iconify（如 `lucide:xxx`）。
 */
const FALLBACK = 'lucide:layout-dashboard';

/** 若依 vue-element-admin 常用图标名 → Iconify */
const RUOYI_ICON_MAP: Record<string, string> = {
  '#': FALLBACK,
  '': FALLBACK,
  user: 'lucide:user',
  peoples: 'lucide:users',
  person: 'lucide:user',
  password: 'lucide:key-round',
  swagger: 'lucide:braces',
  log: 'lucide:scroll-text',
  logininfor: 'lucide:log-in',
  online: 'lucide:wifi',
  'tree-table': 'lucide:table-properties',
  tree: 'lucide:git-fork',
  post: 'lucide:mails',
  dict: 'lucide:book-open',
  edit: 'lucide:pencil',
  education: 'lucide:graduation-cap',
  message: 'lucide:message-square',
  money: 'lucide:banknote',
  chart: 'lucide:bar-chart-2',
  clipboard: 'lucide:clipboard-list',
  documentation: 'lucide:file-text',
  excel: 'lucide:file-spreadsheet',
  form: 'lucide:file-text',
  guide: 'lucide:map',
  icon: 'lucide:image',
  international: 'lucide:globe',
  language: 'lucide:languages',
  link: 'lucide:link',
  list: 'lucide:list',
  lock: 'lucide:lock',
  nested: 'lucide:layers',
  number: 'lucide:hash',
  pdf: 'lucide:file-text',
  people: 'lucide:users',
  qq: 'lucide:message-circle',
  search: 'lucide:search',
  shopping: 'lucide:shopping-cart',
  size: 'lucide:move-horizontal',
  skill: 'lucide:award',
  star: 'lucide:star',
  tab: 'lucide:layout-grid',
  table: 'lucide:table',
  theme: 'lucide:palette',
  toolbox: 'lucide:wrench',
  wechat: 'lucide:message-square',
  zip: 'lucide:archive',
  dashboard: 'lucide:layout-dashboard',
  monitor: 'lucide:activity',
  system: 'lucide:settings',
  tool: 'lucide:wrench',
  phone: 'lucide:phone',
  email: 'lucide:mail',
  job: 'lucide:clock',
  druid: 'lucide:database',
  server: 'lucide:server',
  redis: 'lucide:database',
  'redis-list': 'lucide:list',
  example: 'lucide:rocket',
  bug: 'lucide:bug',
  build: 'lucide:hammer',
  component: 'lucide:component',
  date: 'lucide:calendar',
  time: 'lucide:clock',
  validcode: 'lucide:shield-check',
  row: 'lucide:rows',
  cascader: 'lucide:git-branch',
};

export function normalizeMenuIconToIconify(raw?: string | null): string {
  if (raw == null) return FALLBACK;
  const s = String(raw).trim();
  if (!s || s === '#') return FALLBACK;
  if (s.includes(':')) return s;
  const key = s
    .replace(/^el-icon-/, '')
    .replace(/^i-ep-/, '')
    .replace(/^(svg-icon|svg):/i, '')
    .toLowerCase();
  if (RUOYI_ICON_MAP[key]) return RUOYI_ICON_MAP[key];
  return `lucide:${key.replace(/_/g, '-')}`;
}
