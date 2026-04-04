import type { App } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import { useAppConfig } from '@vben/hooks';
import { useTabbarStore } from '@vben/stores';
import { downloadFileFromBlob } from '@vben/utils';
import { message, Modal, notification } from 'antdv-next';

import { useDict } from '#/composables/use-dict';
import DictTag from '#/components/ruoyi/DictTag.vue';
import { router } from '#/router';
import {
  addDateRange,
  blobValidate,
  handleTree,
  parseTime,
  resetForm,
  selectDictLabel,
  selectDictLabels,
} from '#/utils/ruoyi-compat';

let loadingHide: (() => void) | null = null;

/** 对齐 admin-vue3 `plugins/modal.js`（Ant Design Vue 实现） */
export const ruoyiModal = {
  alert(content: string) {
    Modal.info({ title: '系统提示', content });
  },
  alertError(content: string) {
    Modal.error({ title: '系统提示', content });
  },
  alertSuccess(content: string) {
    Modal.success({ title: '系统提示', content });
  },
  alertWarning(content: string) {
    Modal.warning({ title: '系统提示', content });
  },
  closeLoading() {
    loadingHide?.();
    loadingHide = null;
  },
  confirm(content: string) {
    return new Promise<void>((resolve, reject) => {
      Modal.confirm({
        title: '系统提示',
        content,
        okText: '确定',
        cancelText: '取消',
        onCancel: () => reject(new Error('cancel')),
        onOk: () => resolve(),
      });
    });
  },
  loading(content?: string) {
    loadingHide?.();
    loadingHide = message.loading(content || '加载中…', 0);
  },
  msg(content: string) {
    message.info(content);
  },
  msgError(content: string) {
    message.error(content);
  },
  msgSuccess(content: string) {
    message.success(content);
  },
  msgWarning(content: string) {
    message.warning(content);
  },
  notify(content: string) {
    notification.info({ title: '系统提示', description: content });
  },
  notifyError(content: string) {
    notification.error({ title: '系统提示', description: content });
  },
  notifySuccess(content: string) {
    notification.success({ title: '系统提示', description: content });
  },
  notifyWarning(content: string) {
    notification.warning({ title: '系统提示', description: content });
  },
  prompt(content: string) {
    return new Promise<string>((resolve, reject) => {
      const v = window.prompt(`系统提示\n${content}`, '');
      if (v === null) {
        reject(new Error('cancel'));
      } else {
        resolve(v);
      }
    });
  },
};

function apiBase() {
  return useAppConfig(import.meta.env, import.meta.env.PROD).apiURL.replace(
    /\/$/,
    '',
  );
}

async function printErrMsg(blob: Blob) {
  const resText = await blob.text();
  try {
    const rspObj = JSON.parse(resText) as { msg?: string };
    message.error(rspObj.msg || '请求失败');
  } catch {
    message.error('下载失败');
  }
}

async function downloadGet(
  url: string,
  fallbackName?: string,
  zipMime?: string,
) {
  const { useAccessStore } = await import('@vben/stores');
  const token = useAccessStore().accessToken;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const blob = await res.blob();
  if (blobValidate(blob)) {
    const fn = res.headers.get('download-filename');
    const name = fn
      ? decodeURIComponent(fn)
      : fallbackName || `download_${Date.now()}`;
    const out = zipMime ? new Blob([blob], { type: zipMime }) : blob;
    downloadFileFromBlob({ fileName: name, source: out });
  } else {
    await printErrMsg(blob);
  }
}

/** 对齐 admin-vue3 `plugins/download.js` */
export const ruoyiDownload = {
  name(fileName: string, isDelete = true) {
    const base = apiBase();
    const url = `${base}/common/download?fileName=${encodeURIComponent(fileName)}&delete=${isDelete}`;
    return downloadGet(url);
  },
  resource(resource: string) {
    const base = apiBase();
    const url = `${base}/common/download/resource?resource=${encodeURIComponent(resource)}`;
    return downloadGet(url);
  },
  printErrMsg,
  saveAs(blob: Blob, name: string) {
    downloadFileFromBlob({ fileName: name, source: blob });
  },
  zip(path: string, name: string) {
    const base = apiBase();
    const p = path.startsWith('/') ? path : `/${path}`;
    return downloadGet(`${base}${p}`, name, 'application/zip');
  },
};

/** 对齐 admin-vue3 `plugins/tab.js`（映射到 Vben Tabbar） */
export const ruoyiTab = {
  async closeAllPage() {
    await useTabbarStore().closeAllTabs(router);
  },
  async closeLeftPage(obj?: any) {
    const tab = obj || router.currentRoute.value;
    await useTabbarStore().closeLeftTabs(tab);
  },
  async closeOpenPage(obj?: RouteLocationRaw) {
    await useTabbarStore().closeTab(router.currentRoute.value, router);
    if (obj !== undefined) {
      return router.push(obj);
    }
  },
  async closeOtherPage(obj?: any) {
    const tab = obj || router.currentRoute.value;
    await useTabbarStore().closeOtherTabs(tab);
  },
  async closePage(obj?: any) {
    const tabbarStore = useTabbarStore();
    if (obj === undefined) {
      await tabbarStore.closeTab(router.currentRoute.value, router);
    } else {
      await tabbarStore.closeTab(obj, router);
    }
  },
  async closeRightPage(obj?: any) {
    const tab = obj || router.currentRoute.value;
    await useTabbarStore().closeRightTabs(tab);
  },
  openPage(url: RouteLocationRaw) {
    return router.push(url);
  },
  async refreshPage(obj?: { name?: string }) {
    const tabbarStore = useTabbarStore();
    if (obj?.name) {
      await tabbarStore.refreshByName(obj.name);
      return;
    }
    await tabbarStore.refresh(router);
  },
  async updatePage(obj: { fullPath?: string; meta?: any; path?: string; title?: string }) {
    const tabbarStore = useTabbarStore();
    const path = obj.fullPath || obj.path;
    if (!path || !obj.title) {
      return;
    }
    const tab = tabbarStore.tabs.find(
      (t) => t.fullPath === path || t.path === path,
    );
    if (tab) {
      await tabbarStore.setTabTitle(tab, obj.title);
    }
  },
};

export function installRuoYiGlobals(app: App) {
  app.config.globalProperties.$modal = ruoyiModal;
  app.config.globalProperties.$tab = ruoyiTab;
  app.config.globalProperties.$download = ruoyiDownload;

  app.config.globalProperties.useDict = useDict;
  app.config.globalProperties.parseTime = parseTime;
  app.config.globalProperties.resetForm = resetForm;
  app.config.globalProperties.handleTree = handleTree;
  app.config.globalProperties.addDateRange = addDateRange;
  app.config.globalProperties.selectDictLabel = selectDictLabel;
  app.config.globalProperties.selectDictLabels = selectDictLabels;

  app.config.globalProperties.download = ruoyiDownload;

  app.component('DictTag', DictTag);
}
