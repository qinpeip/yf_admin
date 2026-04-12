/**
 * 登录用户 redis key 过期时间
 * 24h
 */
export const LOGIN_TOKEN_EXPIRESIN = 1000 * 60 * 60 * 24;

/**
 * 用户类型
 * 00系统用户,10自定义用户
 *
 * 20 客户端用户
 */
export const enum SYS_USER_TYPE {
  SYS = '00',
  CUSTOM = '10',
  CLIENT = '20',
}

/**
 * 平台类型
 */
export enum PLATFORM_TYPE {
  PDD = '100',
  TB = '200',
  DY = '300',
  KS = '400',
  JD = '500',
}
