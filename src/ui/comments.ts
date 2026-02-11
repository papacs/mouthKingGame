const TWIKOO_CDN_CANDIDATES = [
  'https://cdn.staticfile.net/twikoo/1.6.44/twikoo.all.min.js',
  'https://cdn.jsdelivr.net/npm/twikoo@1.6.44/dist/twikoo.all.min.js',
  'https://unpkg.com/twikoo@1.6.44/dist/twikoo.all.min.js'
];
const COMMENT_CONTAINER_ID = 'twikoo-comments';
const COMMENT_SERVER_URL =
  (import.meta.env.VITE_TWIKOO_ENV_ID as string | undefined) ?? `${window.location.origin}/twikoo`;
const COMMENT_SITE_ID = 'mouthKingGame';

type TwikooInitConfig = {
  envId: string;
  el: string;
  lang?: string;
  siteId?: string;
};

type TwikooGlobal = {
  init: (config: TwikooInitConfig) => void;
};

declare global {
  interface Window {
    twikoo?: TwikooGlobal;
  }
}

function ensureTwikooScript(): Promise<void> {
  const existed = document.querySelector('script[data-plugin="twikoo"]') as HTMLScriptElement | null;
  if (existed) {
    if (window.twikoo) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existed.addEventListener('load', () => resolve(), { once: true });
      existed.addEventListener('error', () => reject(new Error('Twikoo script load failed')), { once: true });
    });
  }

  const tryLoad = (index: number, resolve: () => void, reject: (error: Error) => void): void => {
    const src = TWIKOO_CDN_CANDIDATES[index];
    if (!src) {
      reject(new Error('Twikoo script load failed on all CDNs'));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.plugin = 'twikoo';
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      tryLoad(index + 1, resolve, reject);
    };
    document.head.appendChild(script);
  };

  return new Promise((resolve, reject) => {
    tryLoad(0, resolve, reject);
  });
}

export async function initComments(): Promise<void> {
  const container = document.getElementById(COMMENT_CONTAINER_ID);
  if (!container) return;

  try {
    await ensureTwikooScript();
    window.twikoo?.init({
      envId: COMMENT_SERVER_URL,
      el: `#${COMMENT_CONTAINER_ID}`,
      lang: 'zh-CN',
      siteId: COMMENT_SITE_ID
    });
  } catch (error) {
    container.innerHTML = '<p>评论区加载失败，请稍后重试。</p>';
    console.error(error);
  }
}
