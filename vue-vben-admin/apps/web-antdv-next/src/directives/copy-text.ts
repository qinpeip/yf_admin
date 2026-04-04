import type { Directive } from 'vue';

type CopyHost = HTMLElement & {
  $copyCallback?: (v: string) => void;
  $copyDestroy?: () => void;
  $copyValue?: string;
};

function copyTextToClipboard(
  input: string,
  { target = document.body }: { target?: HTMLElement } = {},
) {
  const element = document.createElement('textarea');
  const previouslyFocused = document.activeElement as HTMLElement | null;

  element.value = input;
  element.setAttribute('readonly', '');
  element.style.contain = 'strict';
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.fontSize = '12pt';

  const selection = document.getSelection();
  const originalRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  target.append(element);
  element.select();
  element.selectionStart = 0;
  element.selectionEnd = input.length;

  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }

  element.remove();

  if (originalRange && selection) {
    selection.removeAllRanges();
    selection.addRange(originalRange);
  }
  previouslyFocused?.focus();
  return ok;
}

/** 对齐 admin-vue3 `v-copyText` */
export const vCopyText: Directive<CopyHost, string> = {
  beforeMount(el, { arg, value }) {
    if (arg === 'callback') {
      el.$copyCallback = value as unknown as (v: string) => void;
    } else {
      el.$copyValue = value;
      const handler = () => {
        if (el.$copyValue != null) {
          copyTextToClipboard(String(el.$copyValue));
          el.$copyCallback?.(String(el.$copyValue));
        }
      };
      el.addEventListener('click', handler);
      el.$copyDestroy = () => el.removeEventListener('click', handler);
    }
  },
  updated(el, { arg, value }) {
    if (arg === 'callback') {
      el.$copyCallback = value as unknown as (v: string) => void;
    } else {
      el.$copyValue = value;
    }
  },
  unmounted(el) {
    el.$copyDestroy?.();
  },
};
