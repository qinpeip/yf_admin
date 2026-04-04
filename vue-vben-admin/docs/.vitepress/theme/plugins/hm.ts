import { inBrowser } from 'vitepress';

const SITE_ID = '2e443a834727c065877c01d89921545e';

declare global {
  interface Window {
    _hmt: any;
  }
}

