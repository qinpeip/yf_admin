import type { RouteRecordStringComponent } from '@vben/types';

/**
 * 将本仓库 Nest / 若依风格的 `GET /getRouters` 数据转为 Vben `accessMode: backend|mixed` 所需结构。
 * 来源参考：`server/src/module/system/menu/utils.ts` → `buildMenus` / `formatTreeNodeBuildMenus`。
 */
export function transformGetRoutersToVbenMenus(
  input: unknown,
): RouteRecordStringComponent[] {
  const list = normalizeRoot(input);
  if (!list.length) return [];
  let seq = 0;
  return list.map((node) => transformNode(node, '', () => ++seq));
}

function normalizeRoot(input: unknown): any[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object' && Array.isArray((input as any).data)) {
    return (input as any).data;
  }
  return [];
}

function transformNode(
  raw: any,
  parentFullPath: string,
  nextSeq: () => number,
): RouteRecordStringComponent {
  const path = typeof raw.path === 'string' ? raw.path : '';
  const fullPath = joinFullPath(parentFullPath, path);

  let name = raw.name;
  if (name === undefined || name === null || name === '') {
    name = `RuoYi_${fullPath.replace(/\//g, '_').replace(/^_|_$/g, '') || `n${nextSeq()}`}`;
  }

  const meta = normalizeMeta(raw, name as string);

  const out: RouteRecordStringComponent = {
    ...raw,
    path,
    name: name as string,
    meta,
    component: raw.component,
  };

  if (out.redirect === 'noRedirect') {
    delete (out as any).redirect;
  }

  if (Array.isArray(raw.children) && raw.children.length > 0) {
    out.children = raw.children.map((c: any) =>
      transformNode(c, fullPath, nextSeq),
    );
  } else {
    delete (out as any).children;
  }

  return out;
}

function joinFullPath(parent: string, seg: string): string {
  const s = (seg || '').replace(/^\/+/, '');
  if (!parent) return `/${s}`.replace(/\/+/g, '/');
  const p = parent.endsWith('/') ? parent.slice(0, -1) : parent;
  if (!s) return p || '/';
  return `${p}/${s}`.replace(/\/+/g, '/');
}

function normalizeMeta(raw: any, routeName: string): Record<string, any> {
  if (raw.meta === null || raw.meta === undefined) {
    return { title: routeName };
  }
  const m = { ...raw.meta };
  if (m.title === undefined || m.title === null || m.title === '') {
    m.title = routeName;
  }
  if (raw.hidden === true) {
    m.hideInMenu = true;
  }
  if (m.noCache === true) {
    m.keepAlive = false;
  } else if (m.noCache === false) {
    m.keepAlive = true;
  }
  if (raw.query && typeof raw.query === 'object' && m.query === undefined) {
    m.query = raw.query;
  }
  return m;
}
