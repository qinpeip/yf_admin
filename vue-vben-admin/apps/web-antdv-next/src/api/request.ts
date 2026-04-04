/**
 * 请求客户端：兼容 Vben（code=0）与 若依（code=200、msg、data/根级字段）
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { message } from 'antdv-next';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

/** 若依成功码为 200，Vben Mock 为 0，二者同时视为成功 */
function isBizSuccess(code: unknown): boolean {
  return code === 0 || code === 200;
}

/**
 * 解析业务数据：优先使用 data 字段；否则去掉 code/msg 后的根级字段（如 token、img、uuid）
 */
function pickBizData(responseData: Record<string, unknown>): unknown {
  if (!responseData || typeof responseData !== 'object') {
    return responseData;
  }
  if ('data' in responseData && responseData.data !== undefined) {
    return responseData.data;
  }
  const { code: _c, msg: _m, ...rest } = responseData;
  return Object.keys(rest).length > 0 ? rest : responseData;
}

function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}

/** 与 requestClient 一致：导出 / 二进制请求走 baseRequestClient 时也必须带 Token，否则后端 JwtAuthGuard 返回 403 */
function addAuthRequestInterceptor(client: RequestClient) {
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();
      const skipAuth = (config.headers as Record<string, unknown>)?.isToken === false;
      if (skipAuth) {
        delete config.headers.Authorization;
      } else {
        config.headers.Authorization = formatToken(accessStore.accessToken);
      }
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });
}

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
    }
  }

  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  addAuthRequestInterceptor(client);

  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: (responseData: Record<string, unknown>) =>
        pickBizData(responseData) as any,
      successCode: isBizSuccess,
    }),
  );

  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msgText: string, error) => {
      const responseData = error?.response?.data ?? {};
      const errorMessage =
        responseData?.msg ??
        responseData?.message ??
        responseData?.error ??
        '';
      message.error(errorMessage || msgText);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
addAuthRequestInterceptor(baseRequestClient);
