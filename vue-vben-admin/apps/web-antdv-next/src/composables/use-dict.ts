import { reactive, toRefs } from 'vue';

import { listDictDataByType } from '#/api/system/dict';
import type { DictOption } from '#/store/ruoyi-dict';
import { useRuoyiDictStore } from '#/store/ruoyi-dict';

export type { DictOption } from '#/store/ruoyi-dict';

/**
 * 对齐 admin-vue3 `utils/dict.js`：按字典类型拉取选项并缓存（Pinia）。
 */
export function useDict(...dictTypes: string[]) {
  const res = reactive<Record<string, DictOption[]>>({});
  const store = useRuoyiDictStore();

  for (const dictType of dictTypes) {
    res[dictType] = [];
    const cached = store.getDict(dictType);
    if (cached) {
      res[dictType] = cached;
    }
    /** 始终再请求一次：字典在后台改过（如删掉某项）时不能只读 Pinia 旧缓存 */
    listDictDataByType(dictType)
      .then((raw) => {
        const rows = Array.isArray(raw) ? raw : [];
        const opts: DictOption[] = rows.map((p: any) => ({
          dictSort: p.dictSort,
          elTagClass: p.cssClass,
          elTagType: p.listClass || 'default',
          label: p.dictLabel,
          value: String(p.dictValue),
        }));
        res[dictType] = opts;
        store.setDict(dictType, opts);
      })
      .catch(() => {
        if (!cached) {
          res[dictType] = [];
        }
      });
  }

  return toRefs(res);
}
