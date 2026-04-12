import { initPreferences, updatePreferences } from '@vben/preferences';
import { unmountGlobalLoading } from '@vben/utils';

import { overridesPreferences } from './preferences';

import 'element-plus/dist/index.css';

/**
 * 应用初始化完成之后再进行页面加载渲染
 */
async function initApplication() {
  // name用于指定项目唯一标识
  // 用于区分不同项目的偏好设置以及存储数据的key前缀以及其他一些需要隔离的数据
  const env = import.meta.env.PROD ? 'prod' : 'dev';
  const appVersion = import.meta.env.VITE_APP_VERSION;
  const namespace = `${import.meta.env.VITE_APP_NAMESPACE}-${appVersion}-${env}`;

  // app偏好设置初始化
  await initPreferences({
    namespace,
    overrides: overridesPreferences,
  });

  /**
   * `PreferenceManager` 使用 defu 合并时：**已缓存的 preferences 会覆盖 overrides**。
   * 旧缓存里若仍是 vben 默认 `accessMode: 'frontend'`，将永远不会请求 `/getRouters`。
   * 若依项目固定走后端菜单，启动后强制写回 `mixed` 并持久化，避免被脏缓存锁死。
   */
  updatePreferences({ app: { accessMode: 'mixed' } });

  // 启动应用并挂载
  // vue应用主要逻辑及视图
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(namespace);

  // 移除并销毁loading
  unmountGlobalLoading();
}

initApplication();
