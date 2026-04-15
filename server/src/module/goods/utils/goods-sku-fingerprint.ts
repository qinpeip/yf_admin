import { createHash } from 'node:crypto';

import type { GoodsSkuSpecJsonItem } from '../entities/goods-sku.entity';

/**
 * 同一商品下「规格组合」唯一指纹：相同选法永远相同，与数组顺序无关。
 *
 * 规则：
 * - 先按维度 key 字典序排序；
 * - 每个维度用稳定元组参与序列化：有 goodsAttrsOptionsId 时以 id 为准（改文案也不变指纹），
 *   否则用展示与业务字段兜底（无 id 的新建草稿）。
 */
export function buildGoodsSkuSpecFingerprint(spec: GoodsSkuSpecJsonItem[]): string {
  const sorted = [...spec].sort((a, b) => a.key.localeCompare(b.key, 'en'));
  const canonical = sorted.map((item) => {
    return {
      k: item.key,
      n: String(item.optionName ?? ''),
      i: String(item.imgUrl ?? ''),
      p: item.price ?? 0,
      n1: item.num1 ?? 0,
      n2: item.num2 ?? 0,
      a: item.attrName ?? '',
    };
  });
  const payload = JSON.stringify(canonical);
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}
