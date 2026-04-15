import type { GoodsSkuSpec } from '#/api/goods/goods';

import CryptoJS from 'crypto-js';

/**
 * 与 Node `createHash('sha256').update(payload, 'utf8').digest('hex')` 等价（UTF-8 + 小写 hex）。
 * 不依赖 `crypto.subtle`，任意 HTTP 页面可用。
 */
export function sha256HexUtf8Sync(payload: string): string {
  return CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(payload)).toString(CryptoJS.enc.Hex);
}

async function sha256HexUtf8ViaSubtle(payload: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('crypto.subtle unavailable');
  }
  const data = new TextEncoder().encode(payload);
  const hashBuffer = await subtle.digest('SHA-256', data);
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 优先 Web Crypto（性能更好）；无 `subtle`、非安全上下文或调用失败时回退 **crypto-js**，
 * 结果与 Node 端 SHA256(utf8) 一致。
 */
export async function sha256HexUtf8(payload: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    try {
      return await sha256HexUtf8ViaSubtle(payload);
    } catch {
      // 非安全上下文等场景下 subtle.digest 会失败
    }
  }
  return sha256HexUtf8Sync(payload);
}

/**
 * 与后端 `buildGoodsSkuSpecFingerprint` 使用相同的 canonical JSON 再 SHA256。
 */
export async function buildGoodsSkuSpecFingerprint(spec: GoodsSkuSpec[]): Promise<string> {
  const sorted = spec.toSorted((a, b) => a.key.localeCompare(b.key, 'en'));
  const canonical = sorted.map((item) => ({
    k: item.key,
    n: String(item.optionName ?? ''),
    i: String(item.imgUrl ?? ''),
    p: item.price ?? 0,
    n1: item.num1 ?? 0,
    n2: item.num2 ?? 0,
    r: item.remark ?? '',
    a: item.attrName ?? '',
    pr: item.price ?? 0,
  }));
  const payload = JSON.stringify(canonical);
  return sha256HexUtf8(payload);
}
