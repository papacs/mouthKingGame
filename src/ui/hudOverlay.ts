import type { GameState } from '../core/types';

export function mountUI(): string {
  return `
  <main id="game-root">
    <video id="video-input" autoplay playsinline muted></video>
    <canvas id="game-canvas"></canvas>

    <section id="hud">
      <div class="hud-title">张嘴吃水果</div>
      <div id="hud-level">等级 1</div>
      <div id="players"></div>
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
        <h1>最多 4 人同屏</h1>
        <p>每个人独立血量、分数、状态。张嘴吃道具冲分。</p>
        <button id="btn-start">开始</button>
      </div>
    </section>
    <section id="overlay-gameover" class="overlay hidden">
      <div>
        <h2>游戏结束</h2>
        <div id="final-board"></div>
        <button id="btn-restart">再来一局</button>
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
  level.textContent = `等级 ${state.level}`;

  players.innerHTML = state.players
    .filter((p) => p.active)
    .map(
      (p) =>
        `<div class="player-row">玩家${p.id + 1} | 体力 ${Math.max(0, Math.floor(p.hp))} | 分数 ${Math.floor(
          p.score
        )} | 连击 ${p.combo} | 护盾 ${Math.floor(p.shieldFrames / 60)}秒 | 狂热 ${Math.floor(
          p.feverFrames / 60
        )}秒</div>`
    )
    .join('');

  if (state.scene === 'gameover') {
    const board = document.getElementById('final-board') as HTMLElement;
    board.innerHTML = state.players
      .filter((p) => p.enrolled)
      .sort((a, b) => b.score - a.score)
      .map((p) => `<div>玩家${p.id + 1}: ${Math.floor(p.score)} 分</div>`)
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
