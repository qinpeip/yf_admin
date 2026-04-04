import { defineConfig } from '@vben/vite-config';
import ElementPlus from 'unplugin-element-plus/vite';
import { loadEnv } from 'vite';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode ?? 'development', process.cwd());
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8080';
  const stripApi = env.VITE_PROXY_STRIP_API !== 'false';

  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            target: proxyTarget,
            ws: true,
            rewrite: stripApi
              ? (path: string) => path.replace(/^\/api/, '')
              : (path: string) => path,
          },
        },
      },
    },
  };
});
