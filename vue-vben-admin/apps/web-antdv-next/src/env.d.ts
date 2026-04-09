// / <reference types="vite/client" />

import 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    $download: typeof import('#/plugins/ruoyi-globals').ruoyiDownload;
    $modal: typeof import('#/plugins/ruoyi-globals').ruoyiModal;
    $tab: typeof import('#/plugins/ruoyi-globals').ruoyiTab;
    addDateRange: typeof import('#/utils/ruoyi-compat').addDateRange;
    download: typeof import('#/plugins/ruoyi-globals').ruoyiDownload;
    handleTree: typeof import('#/utils/ruoyi-compat').handleTree;
    parseTime: typeof import('#/utils/ruoyi-compat').parseTime;
    resetForm: typeof import('#/utils/ruoyi-compat').resetForm;
    selectDictLabel: typeof import('#/utils/ruoyi-compat').selectDictLabel;
    selectDictLabels: typeof import('#/utils/ruoyi-compat').selectDictLabels;
    useDict: typeof import('#/composables/use-dict').useDict;
  }
}


