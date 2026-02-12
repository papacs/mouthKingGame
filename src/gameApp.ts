import { createFaceTracker } from './ai/faceTracker';
import { MAX_PLAYERS, TUNING } from './config/gameConfig';
import { updateGameplay } from './gameplay/gameplaySystem';
import { createAudioSystem, drainSfxQueue } from './core/audioSystem';
import { createInitialState, resetAllState, resetPlayingState } from './core/state';
import { mountUI, renderDebugInfo, renderHud, renderThemeText, setDebugPanelVisible, setScene } from './ui/hudOverlay';
import { renderGame } from './ui/render';

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app');
app.innerHTML = mountUI();

const video = document.getElementById('video-input') as HTMLVideoElement;
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctxOrNull = canvas.getContext('2d');
if (!ctxOrNull) throw new Error('Canvas context not available');
const ctx: CanvasRenderingContext2D = ctxOrNull;

const state = createInitialState();
const audio = createAudioSystem();
let tracker: Awaited<ReturnType<typeof createFaceTracker>> | null = null;
let mediaStream: MediaStream | null = null;
let lastVideoTime = -1;
let showDebug = false;
let fpsValue = 0;
let fpsFrames = 0;
let fpsLastTs = performance.now();
let lastScene = state.scene;
let pendingCandidates: { x: number; y: number; frames: number; age: number }[] = [];

function resizeCanvas(): void {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
}

function syncPlayersFromDetection(): void {
  if (!tracker || video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;

  const rawDetections = tracker.detect(video);
  const merged: typeof rawDetections = [];
  for (const d of rawDetections) {
    const hit = merged.find((m) => Math.hypot(m.x - d.x, m.y - d.y) <= TUNING.trackingMergeDistance);
    if (hit) {
      hit.x = (hit.x + d.x) * 0.5;
      hit.y = (hit.y + d.y) * 0.5;
      hit.openRatio = Math.max(hit.openRatio, d.openRatio);
    } else {
      merged.push({ ...d });
    }
  }

  const remainingDetections = merged.map((d, index) => ({ ...d, index }));
  const takenDetections = new Set<number>();
  const enrolledPlayers = state.players.filter((p) => p.enrolled);
  const maxAllowedPlayers = Math.min(MAX_PLAYERS, remainingDetections.length);

  // First enrollment: assign IDs from left to right.
  if (enrolledPlayers.length === 0 && remainingDetections.length > 0) {
    const sorted = [...remainingDetections].sort((a, b) => a.x - b.x);
    for (let i = 0; i < MAX_PLAYERS; i += 1) {
      const p = state.players[i];
      const next = sorted[i];
      if (!next) {
        p.active = false;
        p.mouthOpen = false;
        continue;
      }
      takenDetections.add(next.index);
      p.active = true;
      p.enrolled = true;
      p.lostFrames = 0;
      p.x = next.x;
      p.y = next.y;
      p.mouthOpen = next.openRatio > TUNING.mouthOpenThreshold;
    }
    return;
  }

  // Match detections to enrolled players by global nearest pairs to reduce swaps.
  const pairs: { playerIndex: number; detectionIndex: number; dist: number }[] = [];
  for (let i = 0; i < MAX_PLAYERS; i += 1) {
    const p = state.players[i];
    if (!p.enrolled) continue;
    const maxDist = TUNING.trackingMaxDistance * (p.active ? 1 : 1.6);
    for (const d of remainingDetections) {
      const dist = Math.hypot(p.x - d.x, p.y - d.y);
      if (dist <= maxDist) {
        pairs.push({ playerIndex: i, detectionIndex: d.index, dist });
      }
    }
  }
  pairs.sort((a, b) => a.dist - b.dist);

  const assignedPlayers = new Set<number>();
  for (const pair of pairs) {
    if (assignedPlayers.has(pair.playerIndex)) continue;
    if (takenDetections.has(pair.detectionIndex)) continue;
    assignedPlayers.add(pair.playerIndex);
    takenDetections.add(pair.detectionIndex);

    const p = state.players[pair.playerIndex];
    const match = remainingDetections.find((d) => d.index === pair.detectionIndex);
    if (!match) continue;
        p.x = match.x;
        p.y = match.y;
    p.mouthOpen = match.openRatio > TUNING.mouthOpenThreshold;
    p.active = true;
    p.enrolled = true;
    p.lostFrames = 0;
  }

  // Update enrolled players that were not matched this frame.
  for (let i = 0; i < MAX_PLAYERS; i += 1) {
    const p = state.players[i];
    if (!p.enrolled || assignedPlayers.has(i)) continue;
    p.lostFrames += 1;
    p.mouthOpen = false;
    if (p.lostFrames > TUNING.trackingLostGraceFrames) {
      p.active = false;
    }
  }

  const unmatchedDetections = remainingDetections.filter((d) => !takenDetections.has(d.index));
  const updatedCandidates = new Set<number>();
  const nextCandidates: typeof pendingCandidates = [];

  for (const d of unmatchedDetections) {
    let bestIndex = -1;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < pendingCandidates.length; i += 1) {
      if (updatedCandidates.has(i)) continue;
      const c = pendingCandidates[i];
      const dist = Math.hypot(c.x - d.x, c.y - d.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    }
    if (bestIndex >= 0 && bestDist <= TUNING.trackingCandidateMergeDistance) {
      const c = pendingCandidates[bestIndex];
      updatedCandidates.add(bestIndex);
      nextCandidates.push({
        x: (c.x + d.x) * 0.5,
        y: (c.y + d.y) * 0.5,
        frames: c.frames + 1,
        age: 0
      });
    } else {
      nextCandidates.push({ x: d.x, y: d.y, frames: 1, age: 0 });
    }
  }

  for (let i = 0; i < pendingCandidates.length; i += 1) {
    if (updatedCandidates.has(i)) continue;
    const c = pendingCandidates[i];
    const age = c.age + 1;
    if (age <= TUNING.trackingCandidateMaxAge) {
      nextCandidates.push({ ...c, age });
    }
  }

  pendingCandidates = nextCandidates;
  const readyCandidates = pendingCandidates
    .filter((c) => c.frames >= TUNING.trackingNewPlayerFrames)
    .filter((c) => {
      for (const p of state.players) {
        if (!p.enrolled) continue;
        const dist = Math.hypot(p.x - c.x, p.y - c.y);
        if (dist < TUNING.trackingCandidateMinDistance) return false;
      }
      return true;
    })
    .sort((a, b) => b.frames - a.frames);

  // Fill un-enrolled slots only when detections exceed enrolled count.
  let remainingSlots = maxAllowedPlayers - enrolledPlayers.length;
  if (remainingSlots > 0) {
    for (let i = 0; i < MAX_PLAYERS; i += 1) {
      if (remainingSlots <= 0) break;
      const p = state.players[i];
      if (p.enrolled) continue;
      const next = readyCandidates.shift();
      if (!next) break;
      pendingCandidates = pendingCandidates.filter((c) => c !== next);
      p.active = true;
      p.enrolled = true;
      p.lostFrames = 0;
    p.x = next.x;
    p.y = next.y;
      p.mouthOpen = false;
      remainingSlots -= 1;
    }
  } else if (unmatchedDetections.length > 0) {
    const reclaimable = state.players
      .map((p, index) => ({ p, index }))
      .filter((entry) => entry.p.enrolled && !entry.p.active && entry.p.lostFrames > TUNING.trackingLostGraceFrames)
      .sort((a, b) => b.p.lostFrames - a.p.lostFrames);

    let reclaimIndex = 0;
    for (const d of readyCandidates) {
      const entry = reclaimable[reclaimIndex];
      if (!entry) break;
      pendingCandidates = pendingCandidates.filter((c) => c !== d);
      reclaimIndex += 1;
      const p = entry.p;
      p.active = true;
      p.enrolled = true;
      p.lostFrames = 0;
      p.x = d.x;
      p.y = d.y;
      p.mouthOpen = false;
    }
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
  if (state.isPaused) {
    state.isPaused = false;
  }
  updateGameplay(state, canvas.width, canvas.height);
  drainSfxQueue(audio, state.sfxQueue);
  renderGame(ctx, video, state);
  renderHud(state);
  renderDebugInfo({
    fps: fpsValue,
    activePlayers: state.players.filter((p) => p.active).length,
    threshold: TUNING.mouthOpenThreshold,
    paused: state.isPaused
  });

  if (lastScene !== state.scene && state.scene === 'gameover') {
    audio.play('game_over');
  }
  lastScene = state.scene;
  if (state.scene === 'gameover') setScene('gameover');

  requestAnimationFrame(loop);
}

async function boot(): Promise<void> {
  setScene('loading');

  const cameraProfiles: MediaStreamConstraints[] = [
    { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false },
    { video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: 'user' }, audio: false },
    { video: { facingMode: 'user' }, audio: false },
    { video: true, audio: false }
  ];

  let stream: MediaStream | null = null;
  let lastError: unknown = null;
  for (const profile of cameraProfiles) {
    try {
      stream = await navigator.mediaDevices.getUserMedia(profile);
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!stream) throw lastError instanceof Error ? lastError : new Error('摄像头初始化失败');
  mediaStream = stream;

  video.srcObject = stream;
  await video.play();
  resizeCanvas();

  const modelPath = `${import.meta.env.BASE_URL}face_landmarker.task`;
  tracker = await createFaceTracker(modelPath);

  state.scene = 'intro';
  setScene('intro');
  renderThemeText();
  renderHud(state);

  const startButton = document.getElementById('btn-start') as HTMLButtonElement;
  const restartButton = document.getElementById('btn-restart') as HTMLButtonElement;
  const resetAllButton = document.getElementById('btn-reset-all') as HTMLButtonElement | null;
  const resetAllOverButton = document.getElementById('btn-reset-all-over') as HTMLButtonElement | null;
  const backHomeButton = document.getElementById('btn-back-home') as HTMLButtonElement | null;

  const start = (): void => {
    const isRestart = state.scene === 'gameover';
    audio.unlock();
    audio.play(isRestart ? 'ui_restart' : 'ui_start');
    pendingCandidates = [];
    resetPlayingState(state);
    state.scene = 'playing';
    state.isPaused = false;
    setScene('playing');
  };

  startButton.addEventListener('click', start);
  restartButton.addEventListener('click', start);
  const resetAll = (): void => {
    audio.unlock();
    audio.play('ui_restart');
    pendingCandidates = [];
    resetAllState(state);
    lastScene = state.scene;
    setScene('intro');
  };
  resetAllButton?.addEventListener('click', resetAll);
  resetAllOverButton?.addEventListener('click', resetAll);
  backHomeButton?.addEventListener('click', () => {
    for (const track of mediaStream?.getTracks() ?? []) {
      track.stop();
    }
    window.location.href = import.meta.env.BASE_URL;
  });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'F3') {
      showDebug = !showDebug;
      setDebugPanelVisible(showDebug);
      return;
    }
    if (event.key.toLowerCase() === 'r') {
      resetAll();
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
