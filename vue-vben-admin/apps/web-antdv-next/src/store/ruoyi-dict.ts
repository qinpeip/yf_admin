import { defineStore } from 'pinia';

/** 对齐若依字典选项（DictTag / useDict） */
export interface DictOption {
  dictSort?: number;
  elTagClass?: string;
  elTagType?: string;
  label: string;
  value: string;
}

export const useRuoyiDictStore = defineStore('ruoyi-dict', {
  actions: {
    cleanDict() {
      this.entries = [];
    },
    getDict(key: string): DictOption[] | null {
      if (key == null || key === '') {
        return null;
      }
      const row = this.entries.find((e) => e.key === key);
      return row ? row.value : null;
    },
    removeDict(key: string) {
      const i = this.entries.findIndex((e) => e.key === key);
      if (i !== -1) {
        this.entries.splice(i, 1);
        return true;
      }
      return false;
    },
    setDict(key: string, value: DictOption[]) {
      if (key !== null && key !== '') {
        const i = this.entries.findIndex((e) => e.key === key);
        if (i !== -1) {
          this.entries[i] = { key, value };
        } else {
          this.entries.push({ key, value });
        }
      }
    },
  },
  state: () => ({
    entries: [] as { key: string; value: DictOption[] }[],
  }),
});
