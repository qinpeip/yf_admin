import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  export interface LoginParams {
    username?: string;
    userName?: string;
    password?: string;
    code?: string;
    uuid?: string;
  }
}

/**
 * 若依登录：POST /login，请求体 userName / password / code / uuid
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<{ token: string }>(
    '/login',
    {
      userName: data.userName ?? data.username,
      password: data.password,
      code: data.code,
      uuid: data.uuid,
    },
    { headers: { isToken: false } as any },
  );
}

/**
 * 图形验证码（若依 /captchaImage）
 */
export async function getCaptchaImage() {
  return requestClient.get<{
    captchaEnabled?: boolean;
    /** 若依常见为 SVG 片段（`<svg>...</svg>`）或 Base64（可带 `data:image/...` 前缀） */
    img?: string;
    uuid?: string;
  }>('/captchaImage', { headers: { isToken: false } as any });
}

/**
 * 若依无标准 refresh 时可保持关闭 preferences.app.enableRefreshToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<{ data: string; status: number }>('/auth/refresh', {
    withCredentials: true,
  });
}

export async function logoutApi() {
  return requestClient.post('/logout');
}
