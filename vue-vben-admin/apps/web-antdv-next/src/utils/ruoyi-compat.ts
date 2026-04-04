/**
 * 与 admin-vue3 `utils/ruoyi.js` 对齐的通用方法（供 globalProperties 与业务复用）
 */

export function parseTime(time: any, pattern?: string): null | string {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date: Date;
  if (typeof time === 'object') {
    date = time as Date;
  } else {
    let t = time;
    if (typeof t === 'string' && /^[0-9]+$/.test(t)) {
      t = Number.parseInt(t, 10);
    } else if (typeof t === 'string') {
      t = t
        .replaceAll('-', '/')
        .replace('T', ' ')
        .replace(/\.[\d]{3}/g, '');
    }
    if (typeof t === 'number' && t.toString().length === 10) {
      t = t * 1000;
    }
    date = new Date(t);
  }
  const formatObj: Record<string, number> = {
    a: date.getDay(),
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    m: date.getMonth() + 1,
    s: date.getSeconds(),
    y: date.getFullYear(),
  };
  return format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key: string) => {
    let value: number | string = formatObj[key] as number;
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value as number] ?? '';
    }
    if (result.length > 0 && (value as number) < 10) {
      value = `0${value}`;
    }
    return String(value || 0);
  });
}

export function resetForm(this: any, refName: string) {
  if (this?.$refs?.[refName]?.resetFields) {
    this.$refs[refName].resetFields();
  }
}

export function addDateRange(
  params: any,
  dateRange: any,
  propName?: string,
): any {
  const search = params;
  search.params =
    typeof search.params === 'object' &&
    search.params !== null &&
    !Array.isArray(search.params)
      ? search.params
      : {};
  const range = Array.isArray(dateRange) ? dateRange : [];
  if (typeof propName === 'undefined') {
    search.params.beginTime = range[0];
    search.params.endTime = range[1];
  } else {
    search.params[`begin${propName}`] = range[0];
    search.params[`end${propName}`] = range[1];
  }
  return search;
}

export function selectDictLabel(datas: Record<string, any>, value: unknown) {
  if (value === undefined) {
    return '';
  }
  const actions: string[] = [];
  Object.keys(datas).some((key) => {
    if (datas[key].value === `${value}`) {
      actions.push(datas[key].label);
      return true;
    }
    return false;
  });
  if (actions.length === 0) {
    actions.push(String(value));
  }
  return actions.join('');
}

export function selectDictLabels(
  datas: Record<string, any>,
  value: unknown,
  separator?: string,
) {
  if (value === undefined || (Array.isArray(value) && value.length === 0)) {
    return '';
  }
  let v = value;
  if (Array.isArray(v)) {
    v = v.join(',');
  }
  const actions: string[] = [];
  const sep = separator === undefined ? ',' : separator;
  const temp = String(v).split(sep);
  for (let i = 0; i < temp.length; i++) {
    let match = false;
    Object.keys(datas).some((key) => {
      if (datas[key].value === `${temp[i]}`) {
        actions.push(datas[key].label + sep);
        match = true;
        return true;
      }
      return false;
    });
    if (!match) {
      actions.push(temp[i] + sep);
    }
  }
  const joined = actions.join('');
  return joined.length > 0 ? joined.slice(0, -1) : '';
}

export function sprintf(str: string, ...args: any[]) {
  let flag = true;
  let i = 1;
  const out = str.replaceAll('%s', () => {
    const arg = args[i++];
    if (typeof arg === 'undefined') {
      flag = false;
      return '';
    }
    return String(arg);
  });
  return flag ? out : '';
}

export function parseStrEmpty(str: unknown) {
  if (!str || str === 'undefined' || str === 'null') {
    return '';
  }
  return String(str);
}

export function mergeRecursive(source: any, target: any) {
  for (const p in target) {
    try {
      if (target[p].constructor === Object) {
        source[p] = mergeRecursive(source[p] || {}, target[p]);
      } else {
        source[p] = target[p];
      }
    } catch {
      source[p] = target[p];
    }
  }
  return source;
}

export function handleTree(
  data: any[],
  id?: string,
  parentId?: string,
  children?: string,
) {
  const config = {
    childrenList: children || 'children',
    id: id || 'id',
    parentId: parentId || 'parentId',
  };

  const childrenListMap: Record<string, any[]> = {};
  const nodeIds: Record<string, any> = {};
  const tree: any[] = [];

  for (const d of data) {
    const pid = d[config.parentId];
    if (childrenListMap[pid] == null) {
      childrenListMap[pid] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[pid].push(d);
  }

  for (const d of data) {
    const pid = d[config.parentId];
    if (nodeIds[pid] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o: any) {
    if (childrenListMap[o[config.id]] != null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
}

export function tansParams(params: Record<string, any>) {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = `${encodeURIComponent(propName)}=`;
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (
            value[key] !== null &&
            value[key] !== '' &&
            typeof value[key] !== 'undefined'
          ) {
            const subKey = `${propName}[${key}]`;
            const subPart = `${encodeURIComponent(subKey)}=`;
            result += subPart + encodeURIComponent(value[key]) + '&';
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&';
      }
    }
  }
  return result;
}

export function getNormalPath(p: string) {
  if (p.length === 0 || !p || p === 'undefined') {
    return p;
  }
  let res = p.replace('//', '/');
  if (res[res.length - 1] === '/') {
    return res.slice(0, res.length - 1);
  }
  return res;
}

export function blobValidate(data: Blob) {
  return data.type !== 'application/json';
}
