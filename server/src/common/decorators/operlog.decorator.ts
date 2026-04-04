import { SetMetadata } from '@nestjs/common';
import { BusinessType } from '../constant/business.constant';

export type OperlogConfig =
  | Partial<{
      businessType?: (typeof BusinessType)[keyof Omit<typeof BusinessType, 'prototype'>];
    }>
  | undefined;

/** 仅写入元数据；实际操作日志由 GlobalOperlogInterceptor 统一记录 */
export const Operlog = (logConfig?: OperlogConfig) => SetMetadata('operlog', logConfig ?? {});
