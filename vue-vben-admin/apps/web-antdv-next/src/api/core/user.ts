import type { UserInfo } from '@vben/types';

import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';

import { requestClient } from '#/api/request';

/** 若依 GET /getInfo 结构 */
export interface RuoYiUserSession {
  user: {
    userId: number;
    userName: string;
    nickName?: string;
    avatar?: string;
  };
  roles: string[];
  permissions: string[];
}

export async function fetchRuoYiSession() {
  return requestClient.get<RuoYiUserSession>('/getInfo');
}

export function mapRuoYiSessionToUserInfo(
  raw: RuoYiUserSession,
  token: string,
): UserInfo {
  const u = raw.user;
  const base = import.meta.env.VITE_GLOB_API_URL || '';
  let avatar = u.avatar || '';
  if (avatar && !avatar.startsWith('http') && !avatar.startsWith('//')) {
    avatar = `${base}${avatar}`;
  }
  return {
    userId: String(u.userId),
    username: u.userName,
    realName: u.nickName || u.userName,
    avatar: avatar || preferences.app.defaultAvatar,
    roles: raw.roles ?? [],
    desc: '',
    homePath: preferences.app.defaultHomePath,
    token,
  };
}

/**
 * 供个人中心等使用：拉取若依会话并映射为 UserInfo
 */
export async function getUserInfoApi(): Promise<UserInfo> {
  const raw = await fetchRuoYiSession();
  const token = useAccessStore().accessToken || '';
  return mapRuoYiSessionToUserInfo(raw, token);
}
