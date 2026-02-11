import { TUNING, getActiveTheme } from '../config/gameConfig';
import { listThemeOptions, type ThemeId, type ThemeConfig } from '../config/themes/springFestivalHorse';
import type { GameState } from '../core/types';

export function mountUI(): string {
  return `
  <main id="game-root">
    <video id="video-input" autoplay playsinline muted></video>
    <canvas id="game-canvas"></canvas>

    <section id="hud">
      <div id="hud-title" class="hud-title">嘴强王者</div>
      <div id="hud-level">等级 1</div>
      <div id="hud-theme" class="hud-theme"></div>
      <div id="hud-event" class="hud-event"></div>
      <div id="hud-countdown" class="hud-countdown"></div>
      <div id="players"></div>
      <div class="hud-actions">
        <button id="btn-reset-all">整体重开</button>
      </div>
    </section>
    <section id="debug-panel" class="debug-panel hidden">
      <div id="debug-fps">帧率: 0</div>
      <div id="debug-active">活跃玩家: 0</div>
      <div id="debug-threshold">张嘴阈值: 0.05</div>
      <div id="debug-pause">暂停: 否</div>
    </section>

    <section id="overlay-loading" class="overlay">AI 模型加载中...</section>
    <section id="overlay-intro" class="overlay hidden">
      <div>
        <h1 id="intro-headline"></h1>
        <p id="intro-subtitle"></p>
        <div class="theme-card-label">选择主题</div>
        <div id="theme-cards" class="theme-cards"></div>
        <button id="btn-start">开始</button>
      </div>
    </section>
    <section id="overlay-gameover" class="overlay hidden">
      <div>
        <h2>游戏结束</h2>
        <div id="final-board"></div>
        <div class="overlay-actions">
          <button id="btn-restart">再来一局</button>
          <button id="btn-reset-all-over">整体重开</button>
        </div>
      </div>
    </section>
    <section id="overlay-paused" class="overlay hidden">
      <div>
        <h2>已暂停</h2>
        <p>按 Space 或 P 继续</p>
      </div>
    </section>
  </main>`;
}

function renderThemeCard(theme: ThemeConfig, activeId: ThemeId): string {
  const selectedClass = theme.id === activeId ? ' selected' : '';
  return `<button class="theme-card${selectedClass}" data-theme-id="${theme.id}" type="button">
    <div class="theme-card-icon">${theme.previewIcon}</div>
    <div class="theme-card-name">${theme.displayName}</div>
    <div class="theme-card-text">${theme.previewText}</div>
  </button>`;
}

function updateThemeCardSelection(activeId: ThemeId): void {
  const cards = Array.from(document.querySelectorAll('.theme-card')) as HTMLButtonElement[];
  for (const card of cards) {
    card.classList.toggle('selected', card.dataset.themeId === activeId);
  }
}

export function initThemeSelector(onChange?: (id: ThemeId) => void): void {
  const container = document.getElementById('theme-cards') as HTMLElement | null;
  if (!container) return;
  const active = getActiveTheme();
  container.innerHTML = listThemeOptions()
    .map((theme) => renderThemeCard(theme, active.id))
    .join('');
  const cards = Array.from(container.querySelectorAll('.theme-card')) as HTMLButtonElement[];
  for (const card of cards) {
    card.onclick = () => {
      const value = card.dataset.themeId as ThemeId | undefined;
      if (!value) return;
      updateThemeCardSelection(value);
      onChange?.(value);
    };
  }
}

export function renderThemeText(): void {
  const active = getActiveTheme();
  const hudTitle = document.getElementById('hud-title') as HTMLElement | null;
  const hudTheme = document.getElementById('hud-theme') as HTMLElement | null;
  const introHeadline = document.getElementById('intro-headline') as HTMLElement | null;
  const introSubtitle = document.getElementById('intro-subtitle') as HTMLElement | null;
  if (hudTitle) hudTitle.textContent = active.title;
  if (hudTheme) hudTheme.textContent = active.displayName;
  if (introHeadline) introHeadline.textContent = active.introHeadline;
  if (introSubtitle) introSubtitle.textContent = active.introSubtitle;
}

export function setScene(scene: GameState['scene']): void {
  const loading = document.getElementById('overlay-loading') as HTMLElement;
  const intro = document.getElementById('overlay-intro') as HTMLElement;
  const gameOver = document.getElementById('overlay-gameover') as HTMLElement;

  loading.classList.add('hidden');
  intro.classList.add('hidden');
  gameOver.classList.add('hidden');

  if (scene === 'loading') loading.classList.remove('hidden');
  if (scene === 'intro') intro.classList.remove('hidden');
  if (scene === 'gameover') gameOver.classList.remove('hidden');
}

export function renderHud(state: GameState): void {
  const level = document.getElementById('hud-level') as HTMLElement;
  const players = document.getElementById('players') as HTMLElement;
  const event = document.getElementById('hud-event') as HTMLElement;
  const countdown = document.getElementById('hud-countdown') as HTMLElement;
  level.textContent = `等级 ${state.level}`;

  let eventText = '';
  const prefix = getActiveTheme().eventPrefix ? `${getActiveTheme().eventPrefix}·` : '';
  if (state.endgameFrames > 0) {
    eventText = `${prefix}疯狂模式 ${Math.ceil(state.endgameFrames / 60)}s`;
  } else if (state.stormFrames > 0) {
    eventText = `${prefix}风暴期 ${Math.ceil(state.stormFrames / 60)}s`;
  } else if (state.slowFrames > 0) {
    eventText = `${prefix}减速 ${Math.ceil(state.slowFrames / 60)}s`;
  }
  event.textContent = eventText;
  const remaining = TUNING.matchDurationFrames - state.frame;
  const countdownText = remaining > 0 && remaining <= 300 ? `倒计时 ${Math.ceil(remaining / 60)}s` : '';
  countdown.textContent = countdownText;

  players.innerHTML = state.players
    .filter((p) => p.enrolled)
    .map((p) => {
      if (!p.active && !p.eliminated) {
        return `<div class="player-row dim">玩家${p.id + 1} 重新识别中...</div>`;
      }
      const hp = Math.max(0, Math.floor(p.hp));
      const score = Math.floor(p.score);
      const statusIcons = [
        p.shieldFrames > 0 ? `🛡️${Math.floor(p.shieldFrames / 60)}s` : '',
        p.feverFrames > 0 ? `🔥${Math.floor(p.feverFrames / 60)}s` : '',
        p.scoreBoostFrames > 0 ? `✨${Math.floor(p.scoreBoostFrames / 60)}s` : '',
        p.reflectFrames > 0 ? `🔁${Math.floor(p.reflectFrames / 60)}s` : '',
        p.magnetFrames > 0 ? `🧲${Math.floor(p.magnetFrames / 60)}s` : '',
        p.dizzyFrames > 0 ? `💫${Math.floor(p.dizzyFrames / 60)}s` : '',
        p.maskFrames > 0 ? `😷${Math.floor(p.maskFrames / 60)}s` : '',
        p.sunglassesFrames > 0 ? `😎${Math.floor(p.sunglassesFrames / 60)}s` : ''
      ]
        .filter(Boolean)
        .join(' ');
      return `<div class="player-row${p.eliminated ? ' dim' : ''}">P${p.id + 1}${
        p.eliminated ? ` ${p.loserMark ?? '😷'}淘汰` : ''
      } | ❤️${hp} | ⭐${score} | ⚡${p.combo}${statusIcons ? ` | ${statusIcons}` : ''}</div>`;
    })
    .join('');

  if (state.scene === 'gameover') {
    const board = document.getElementById('final-board') as HTMLElement;
    const maxCombo = Math.max(0, ...state.players.map((p) => p.maxCombo));
    const maxSurvival = Math.max(0, ...state.players.map((p) => p.survivalFrames));
    board.innerHTML = state.players
      .filter((p) => p.enrolled)
      .sort((a, b) => b.score - a.score)
      .map((p) => {
        const tags = [
          p.maxCombo === maxCombo ? '最佳连击' : '',
          p.survivalFrames === maxSurvival ? '最佳生存' : ''
        ]
          .filter(Boolean)
          .join(' ');
        return `<div>玩家${p.id + 1}${p.eliminated ? ` ${p.loserMark ?? '😷'}淘汰` : ''}: ${Math.floor(
          p.score
        )} 分${tags ? ` (${tags})` : ''}</div>`;
      })
      .join('');
  }
}

export function setPausedOverlay(visible: boolean): void {
  const paused = document.getElementById('overlay-paused') as HTMLElement;
  paused.classList.toggle('hidden', !visible);
}

export function setDebugPanelVisible(visible: boolean): void {
  const panel = document.getElementById('debug-panel') as HTMLElement;
  panel.classList.toggle('hidden', !visible);
}

export function renderDebugInfo(input: {
  fps: number;
  activePlayers: number;
  threshold: number;
  paused: boolean;
}): void {
  const fps = document.getElementById('debug-fps') as HTMLElement;
  const active = document.getElementById('debug-active') as HTMLElement;
  const threshold = document.getElementById('debug-threshold') as HTMLElement;
  const pause = document.getElementById('debug-pause') as HTMLElement;
  fps.textContent = `帧率: ${input.fps.toFixed(1)}`;
  active.textContent = `活跃玩家: ${input.activePlayers}`;
  threshold.textContent = `张嘴阈值: ${input.threshold.toFixed(3)}`;
  pause.textContent = `暂停: ${input.paused ? '是' : '否'}`;
}
