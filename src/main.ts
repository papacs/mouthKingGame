import './style.css';
import { getActiveTheme, getItems, setActiveTheme, type ThemeId } from './config/gameConfig';
import { ITEM_EFFECT_GUIDE } from './config/itemGuide';
import { listThemeOptions } from './config/themes/springFestivalHorse';
import { initComments } from './ui/comments';

const appElement = document.getElementById('app') as HTMLElement | null;
if (!appElement) throw new Error('Missing #app');
const appRoot: HTMLElement = appElement;

let cameraReady = false;
let commentsInited = false;

function typeLabel(type: string): string {
  if (type === 'healthy') return '健康';
  if (type === 'junk') return '高分';
  if (type === 'trap') return '陷阱';
  return '功能';
}

function effectLabel(id: string, type: string, score: number): string {
  const known = ITEM_EFFECT_GUIDE[id];
  if (known) return known;
  if (type === 'healthy') return '稳态回血，降低风险';
  if (type === 'junk') return '高收益，但会推高糖分';
  if (type === 'trap') return '负面道具，优先规避';
  return score > 0 ? '功能增益道具' : '功能型扰动道具';
}

function renderFoodTable(): string {
  const rows = getItems()
    .sort((a, b) => b.weight - a.weight)
    .map((item) => {
      return `<tr>
        <td>${item.emoji}</td>
        <td>${item.name}</td>
        <td><span class="type-tag type-${item.type}">${typeLabel(item.type)}</span></td>
        <td>${item.score > 0 ? `+${item.score}` : item.score}</td>
        <td>${item.weight}</td>
        <td>${effectLabel(item.id, item.type, item.score)}</td>
      </tr>`;
    })
    .join('');

  return `<div class="rules-content">
    <p>规则：张嘴吃正向道具冲高分，吃到陷阱会掉血，血量归零直接淘汰。</p>
    <p>模式：支持 1-4 人同屏，每位玩家独立计分与状态，抢节奏、拼连击、拼运营。</p>
    <p>当前模式：<strong>${getActiveTheme().displayName}</strong>（下表按当前模式动态计算）</p>
    <div class="table-wrap">
      <table class="food-table">
        <thead>
          <tr><th>道具</th><th>名称</th><th>类别</th><th>分值</th><th>权重</th><th>功能/特效说明</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function setCameraStatus(
  state: 'checking' | 'granted' | 'denied' | 'unsupported',
  text: string
): void {
  const badge = document.getElementById('camera-status-badge') as HTMLElement | null;
  const desc = document.getElementById('camera-status-text') as HTMLElement | null;
  const enterButton = document.getElementById('btn-enter-game') as HTMLButtonElement | null;
  if (badge) {
    badge.className = `cam-badge ${state}`;
    badge.textContent = state === 'granted' ? '已就绪' : state === 'checking' ? '📷 检测中' : '📷 未就绪';
  }
  if (desc) desc.textContent = text;
  cameraReady = state === 'granted';
  if (enterButton) {
    enterButton.disabled = !cameraReady;
    enterButton.title = cameraReady ? '摄像头可用，点击进入游戏' : '摄像头未就绪，无法开始';
  }
}

async function checkCameraAuthorization(): Promise<void> {
  setCameraStatus('checking', '正在检查摄像头授权状态...');

  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus('unsupported', '当前浏览器不支持摄像头访问，请使用最新 Chrome/Edge。');
    return;
  }

  try {
    if ('permissions' in navigator && navigator.permissions?.query) {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (result.state === 'denied') {
        setCameraStatus('denied', '摄像头权限已被拒绝，请在浏览器地址栏权限中改为允许。');
        return;
      }
    }
  } catch {
    // ignore permissions api failure and fallback to actual media check
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 360, facingMode: 'user' },
      audio: false
    });
    for (const track of stream.getTracks()) {
      track.stop();
    }
    setCameraStatus('granted', '摄像头授权正常，可立即进入游戏。');
    void prefetchGameAssets();
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误';
    setCameraStatus('denied', `摄像头检测失败：${message}`);
  }
}

async function prefetchGameAssets(): Promise<void> {
  const modelPath = `${import.meta.env.BASE_URL}face_landmarker.task`;
  try {
    await fetch(modelPath, { cache: 'force-cache' });
  } catch {
    // silent; gameplay page still performs normal load
  }
}

function updateModeSummary(): void {
  const summary = document.getElementById('mode-summary') as HTMLElement | null;
  if (!summary) return;
  summary.textContent = `选择模式（当前：${getActiveTheme().displayName}）`;
}

function mountHome(): void {
  document.body.classList.remove('game-page');
  commentsInited = false;

  const activeTheme = getActiveTheme();
  const themeCards = listThemeOptions()
    .map((theme) => {
      const selectedClass = theme.id === activeTheme.id ? ' selected' : '';
      return `<button class="mode-card${selectedClass}" type="button" data-theme-id="${theme.id}">
        <div class="mode-card-icon">${theme.previewIcon}</div>
        <div class="mode-card-name">${theme.displayName}</div>
        <div class="mode-card-text">${theme.previewText}</div>
      </button>`;
    })
    .join('');

  appRoot.innerHTML = `
  <main id="home-root" class="home-layout">
    <section class="home-hero">
      <h1>嘴强王者</h1>
      <p class="hero-lead">张嘴开吃，极速抢分，陷阱反转。1-4 人同屏对抗，30 秒就能打出一局高能名场面。</p>
      <div class="camera-row">
        <span id="camera-status-badge" class="cam-badge checking">检测中</span>
        <span id="camera-status-text" class="camera-status-text">正在检查摄像头授权状态...</span>
        <button id="btn-recheck-camera" class="ghost-btn" type="button">重新检测</button>
      </div>
      <details id="mode-details" class="mode-details" open>
        <summary id="mode-summary" class="mode-summary">选择模式（当前：${activeTheme.displayName}）</summary>
        <div id="mode-cards" class="mode-cards">${themeCards}</div>
      </details>
      <button id="btn-enter-game" class="enter-game-btn" disabled>进入游戏</button>
    </section>

    <section class="rules-root">
      <details class="rules-details">
        <summary>游戏规则与食物属性说明</summary>
        <div id="rules-content-host">${renderFoodTable()}</div>
      </details>
    </section>

    <section class="comments-root">
      <details id="comments-details" class="comments-details">
        <summary class="comments-title">留言区</summary>
        <div id="twikoo-comments"></div>
      </details>
    </section>

    <footer class="home-footer">
      <p class="footer-copy">如果这个项目让你玩得开心，欢迎点个 Star，给我们一点继续打磨玩法的动力。</p>
      <p class="project-link">
        项目地址：
        <a href="https://github.com/papacs/mouthKingGame" target="_blank" rel="noopener noreferrer">
          https://github.com/papacs/mouthKingGame
        </a>
      </p>
    </footer>
  </main>`;

  const rulesHost = document.getElementById('rules-content-host') as HTMLElement | null;
  const modeCards = Array.from(document.querySelectorAll('.mode-card')) as HTMLButtonElement[];
  for (const card of modeCards) {
    card.addEventListener('click', () => {
      const themeId = card.dataset.themeId as ThemeId | undefined;
      if (!themeId) return;
      setActiveTheme(themeId);
      for (const target of modeCards) {
        target.classList.toggle('selected', target === card);
      }
      updateModeSummary();
      if (rulesHost) rulesHost.innerHTML = renderFoodTable();
    });
  }

  const commentsDetails = document.getElementById('comments-details') as HTMLDetailsElement | null;
  commentsDetails?.addEventListener('toggle', () => {
    if (!commentsDetails.open || commentsInited) return;
    commentsInited = true;
    void initComments();
  });

  const recheckButton = document.getElementById('btn-recheck-camera') as HTMLButtonElement | null;
  recheckButton?.addEventListener('click', () => {
    void checkCameraAuthorization();
  });

  const enterButton = document.getElementById('btn-enter-game') as HTMLButtonElement | null;
  enterButton?.addEventListener('click', () => {
    if (!cameraReady) return;
    void enterGame();
  });

  void checkCameraAuthorization();
}

async function enterGame(): Promise<void> {
  document.body.classList.add('game-page');
  appRoot.innerHTML = '<main id="game-root"><section id="overlay-loading" class="overlay">正在异步加载游戏依赖并启动...</section></main>';
  await import('./gameApp');
}

mountHome();
