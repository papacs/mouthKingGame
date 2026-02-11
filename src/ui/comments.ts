const TWIKOO_CDN = 'https://cdn.staticfile.net/twikoo/1.6.44/twikoo.all.min.js';
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

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TWIKOO_CDN;
    script.async = true;
    script.dataset.plugin = 'twikoo';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Twikoo script load failed'));
    document.head.appendChild(script);
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
