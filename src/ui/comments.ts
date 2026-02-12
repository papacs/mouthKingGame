const CWD_CDN_CANDIDATES = [
  'https://unpkg.com/cwd-widget@latest/dist/cwd.js',
  'https://cdn.jsdelivr.net/npm/cwd-widget@latest/dist/cwd.js'
];
const COMMENT_CONTAINER_ID = 'twikoo-comments';
function resolveCommentApiBaseUrl(): string {
  const explicit = (import.meta.env.VITE_COMMENT_API_BASE_URL as string | undefined)?.trim();
  if (explicit) return explicit;

  const legacy = (import.meta.env.VITE_TWIKOO_ENV_ID as string | undefined)?.trim();
  if (legacy && /^https?:\/\//i.test(legacy)) return legacy;

  return 'https://cwd.liucfamily.cn';
}
const COMMENT_API_BASE_URL = resolveCommentApiBaseUrl();
const COMMENT_SITE_ID = 'mouthKingGame';

type CwdCommentsConfig = {
  el: string | HTMLElement;
  apiBaseUrl: string;
  lang?: string;
  siteId?: string;
  postSlug?: string;
};

type CwdCommentsInstance = {
  mount: () => void;
};

type CwdCommentsCtor = new (config: CwdCommentsConfig) => CwdCommentsInstance;

declare global {
  interface Window {
    CWDComments?: CwdCommentsCtor;
  }
}

function ensureCwdScript(): Promise<void> {
  const existed = document.querySelector('script[data-plugin="cwd-comments"]') as HTMLScriptElement | null;
  if (existed) {
    if (window.CWDComments) return Promise.resolve();
    return new Promise((resolve, reject) => {
      existed.addEventListener('load', () => resolve(), { once: true });
      existed.addEventListener('error', () => reject(new Error('CWD comments script load failed')), { once: true });
    });
  }

  const tryLoad = (index: number, resolve: () => void, reject: (error: Error) => void): void => {
    const src = CWD_CDN_CANDIDATES[index];
    if (!src) {
      reject(new Error('CWD comments script load failed on all CDNs'));
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.plugin = 'cwd-comments';
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
    await ensureCwdScript();
    const CWDComments = window.CWDComments;
    if (!CWDComments) throw new Error('CWDComments not found on window');
    const comments = new CWDComments({
      el: `#${COMMENT_CONTAINER_ID}`,
      apiBaseUrl: COMMENT_API_BASE_URL,
      lang: 'zh-CN',
      siteId: COMMENT_SITE_ID,
      postSlug: window.location.pathname || '/'
    });
    comments.mount();
  } catch (error) {
    container.innerHTML = '<p>评论区加载失败，请稍后重试。</p>';
    console.error(error);
  }
}
