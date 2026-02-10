import './style.css';
import { createFaceTracker } from './ai';
import { MAX_PLAYERS, TUNING } from './config';
import { updateGameplay } from './gameplay';
import { renderGame } from './render';
import { createInitialState, resetPlayingState } from './state';
import { mountUI, renderDebugInfo, renderHud, setDebugPanelVisible, setPausedOverlay, setScene } from './ui';

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app');
app.innerHTML = mountUI();

const video = document.getElementById('video-input') as HTMLVideoElement;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctxOrNull = canvas.getContext('2d');
if (!ctxOrNull) throw new Error('Canvas context not available');
const ctx: CanvasRenderingContext2D = ctxOrNull;

const state = createInitialState();
let tracker: Awaited<ReturnType<typeof createFaceTracker>> | null = null;
let lastVideoTime = -1;
let showDebug = false;
let fpsValue = 0;
let fpsFrames = 0;
let fpsLastTs = performance.now();

function resizeCanvas(): void {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
}

function syncPlayersFromDetection(): void {
  if (!tracker || video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;

  const detections = tracker.detect(video).sort((a, b) => a.x - b.x);
  const remainingDetections = detections.map((d, index) => ({ ...d, index }));
  const taken = new Set<number>();
  const anyEnrolled = state.players.some((p) => p.enrolled);

  // First enrollment: assign IDs from left to right.
  if (!anyEnrolled && remainingDetections.length > 0) {
    for (let i = 0; i < MAX_PLAYERS; i += 1) {
      const p = state.players[i];
      const next = remainingDetections[i];
      if (!next) {
        p.active = false;
        p.mouthOpen = false;
        continue;
      }
      taken.add(next.index);
      p.active = true;
      p.enrolled = true;
      p.lostFrames = 0;
      p.x = next.x;
      p.y = next.y;
      p.mouthOpen = next.openRatio > TUNING.mouthOpenThreshold;
    }
    return;
  }

  // Keep identity stable by matching active players to nearest face first.
  for (let i = 0; i < MAX_PLAYERS; i += 1) {
    const p = state.players[i];
    if (!p.active) continue;

    let bestIndex = -1;
    let bestDist = Number.POSITIVE_INFINITY;

    for (const d of remainingDetections) {
      if (taken.has(d.index)) continue;
      const dist = Math.hypot(p.x - d.x, p.y - d.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = d.index;
      }
    }

    if (bestIndex >= 0 && bestDist <= TUNING.trackingMaxDistance) {
      const match = remainingDetections.find((d) => d.index === bestIndex);
      if (match) {
        taken.add(match.index);
        p.x = match.x;
        p.y = match.y;
        p.mouthOpen = match.openRatio > TUNING.mouthOpenThreshold;
        p.active = true;
        p.enrolled = true;
        p.lostFrames = 0;
      }
    } else {
      p.lostFrames += 1;
      p.mouthOpen = false;
      if (p.lostFrames > TUNING.trackingLostGraceFrames) {
        p.active = false;
      }
    }
  }

  // Fill empty slots with new detections.
  for (let i = 0; i < MAX_PLAYERS; i += 1) {
    const p = state.players[i];
    if (p.active) continue;

    const next = remainingDetections.find((d) => !taken.has(d.index));
    if (!next) {
      p.mouthOpen = false;
      continue;
    }

    taken.add(next.index);
    p.active = true;
    p.enrolled = true;
    p.lostFrames = 0;
    p.x = next.x;
    p.y = next.y;
    p.mouthOpen = next.openRatio > TUNING.mouthOpenThreshold;
  }
}

function loop(): void {
  fpsFrames += 1;
  const now = performance.now();
  if (now - fpsLastTs >= 500) {
    fpsValue = (fpsFrames * 1000) / (now - fpsLastTs);
    fpsFrames = 0;
    fpsLastTs = now;
  }

  syncPlayersFromDetection();
  updateGameplay(state, canvas.width, canvas.height);
  renderGame(ctx, video, state);
  renderHud(state);
  renderDebugInfo({
    fps: fpsValue,
    activePlayers: state.players.filter((p) => p.active).length,
    threshold: TUNING.mouthOpenThreshold,
    paused: state.isPaused
  });

  if (state.scene === 'gameover') setScene('gameover');

  requestAnimationFrame(loop);
}

async function boot(): Promise<void> {
  setScene('loading');

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720, facingMode: 'user' }
  });

  video.srcObject = stream;
  await video.play();
  resizeCanvas();

  tracker = await createFaceTracker('/face_landmarker.task');

  state.scene = 'intro';
  setScene('intro');
  renderHud(state);

  const startButton = document.getElementById('btn-start') as HTMLButtonElement;
  const restartButton = document.getElementById('btn-restart') as HTMLButtonElement;

  const start = (): void => {
    resetPlayingState(state);
    state.scene = 'playing';
    setScene('playing');
    setPausedOverlay(false);
  };

  startButton.addEventListener('click', start);
  restartButton.addEventListener('click', start);
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'F3') {
      showDebug = !showDebug;
      setDebugPanelVisible(showDebug);
      return;
    }
    if (event.code === 'Space' || event.key.toLowerCase() === 'p') {
      if (state.scene !== 'playing') return;
      if (event.code === 'Space') event.preventDefault();
      state.isPaused = !state.isPaused;
      setPausedOverlay(state.isPaused);
    }
  });

  loop();
}

boot().catch((err: unknown) => {
  console.error(err);
  setScene('loading');
  const loading = document.getElementById('overlay-loading');
  if (loading) loading.textContent = `初始化失败: ${err instanceof Error ? err.message : '未知错误'}`;
});
