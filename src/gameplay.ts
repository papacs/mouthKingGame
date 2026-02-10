import { BALANCE_BY_PLAYERS, ITEMS, MAX_HP, MAX_PLAYERS, MAX_SUGAR, TUNING } from './config';
import type { FallingItem, GameState, ItemConfig, PlayerState } from './types';

function weightedPick(pool: ItemConfig[]): ItemConfig {
  const total = pool.reduce((acc, item) => acc + item.weight, 0);
  let r = Math.random() * total;
  for (const item of pool) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return pool[0];
}

function spawnItems(state: GameState, width: number): void {
  const activeCount = state.players.filter((p) => p.active && p.hp > 0).length;
  if (activeCount === 0) return;
  const balance = BALANCE_BY_PLAYERS[Math.min(MAX_PLAYERS, activeCount)] ?? BALANCE_BY_PLAYERS[1];

  const baseInterval = Math.max(
    TUNING.spawnMinInterval,
    TUNING.spawnBaseInterval - state.level * TUNING.spawnLevelSpeedup
  );
  const interval = Math.max(
    TUNING.spawnMinInterval,
    Math.floor(baseInterval / (1 + (activeCount - 1) * TUNING.spawnPlayerFactor))
  );

  if (state.frame % Math.floor(interval) !== 0) return;

  const burst = activeCount >= 4 ? 3 : activeCount >= 2 ? 2 : 1;
  for (let i = 0; i < burst; i += 1) {
    const weightedPool = ITEMS.map((item) => ({
      ...item,
      weight: item.type === 'trap' ? Math.max(1, Math.floor(item.weight * balance.trapWeightMultiplier)) : item.weight
    }));
    const selected = weightedPick(weightedPool);
    const item: FallingItem = {
      ...selected,
      x: Math.random() * (width - 60) + 30,
      y: -30 - i * 22,
      vy: (2.8 + state.level * 0.45 + Math.random() * 0.7) * balance.fallSpeedMultiplier
    };

    state.items.push(item);
  }
}

function applyPlayerHit(player: PlayerState, item: FallingItem, state: GameState): void {
  const hasFever = player.feverFrames > 0;
  let gained = item.score;
  if (hasFever && gained > 0) gained = Math.floor(gained * 1.5);
  if (gained > 0) {
    player.combo += 1;
    gained += Math.min(player.combo * 4, 40);
  } else {
    player.combo = 0;
  }

  player.score = Math.max(0, player.score + gained);

  let trapDamage = 0;
  if (item.type === 'healthy') {
    player.balance = Math.max(-50, player.balance - 6);
    player.hp = Math.min(MAX_HP, player.hp + 6);
  }
  if (item.type === 'junk') {
    player.balance = Math.min(50, player.balance + 8);
    player.sugar = Math.min(MAX_SUGAR, player.sugar + 12);
  }

  switch (item.id) {
    case 'bomb':
      trapDamage = 28;
      break;
    case 'poop':
      trapDamage = 16;
      break;
    case 'rotten':
      trapDamage = 14;
      break;
    case 'water':
      player.hp = Math.min(MAX_HP, player.hp + 10);
      player.sugar = Math.max(0, player.sugar - 20);
      break;
    case 'clock':
      player.feverFrames = TUNING.feverFrames;
      break;
    case 'shield':
      player.shieldFrames = TUNING.shieldFrames;
      break;
    case 'brush':
      player.sugar = 0;
      break;
    case 'golden':
      player.hp = MAX_HP;
      player.sugar = 0;
      player.score += 300;
      break;
    default:
      break;
  }

  if (trapDamage > 0) {
    if (player.shieldFrames > 0) {
      player.shieldFrames = Math.max(0, player.shieldFrames - 60);
      state.floatTexts.push({
        text: `P${player.id + 1} BLOCK`,
        x: item.x,
        y: item.y - 22,
        color: '#6dd5ff',
        life: 28
      });
    } else {
      player.hp -= trapDamage;
    }
  }

  state.floatTexts.push({
    text: gained >= 0 ? `P${player.id + 1} +${gained}` : `P${player.id + 1} ${gained}`,
    x: item.x,
    y: item.y,
    color: gained >= 0 ? '#2ecc71' : '#e74c3c',
    life: 35
  });
}

export function updateGameplay(state: GameState, width: number, height: number): void {
  if (state.scene !== 'playing' || state.isPaused) return;

  state.frame += 1;
  const totalScore = state.players.reduce((acc, p) => acc + p.score, 0);
  state.level = 1 + Math.floor(totalScore / TUNING.levelScoreStep);

  for (const p of state.players) {
    if (!p.active) continue;
    p.hp -= TUNING.hungerBaseDecay + state.level * TUNING.hungerLevelDecay;
    p.hp = Math.max(0, p.hp);
    p.shieldFrames = Math.max(0, p.shieldFrames - 1);
    p.feverFrames = Math.max(0, p.feverFrames - 1);
  }

  spawnItems(state, width);

  for (const item of state.items) {
    item.y += item.vy;
  }
  state.items = state.items.filter((item) => item.y < height + 40);

  for (let i = state.items.length - 1; i >= 0; i -= 1) {
    const item = state.items[i];

    let consumed = false;
    for (let pid = 0; pid < MAX_PLAYERS; pid += 1) {
      const p = state.players[pid];
      if (!p.active || !p.mouthOpen || p.hp <= 0) continue;
      const px = p.x * width;
      const py = p.y * height;
      const dist = Math.hypot(px - item.x, py - item.y);
      if (dist <= TUNING.mouthRadius) {
        applyPlayerHit(p, item, state);
        consumed = true;
        break;
      }
    }

    if (consumed) state.items.splice(i, 1);
  }

  for (const ft of state.floatTexts) {
    ft.y -= 1;
    ft.life -= 1;
  }
  state.floatTexts = state.floatTexts.filter((ft) => ft.life > 0);

  const participants = state.players.filter((p) => p.enrolled);
  const aliveParticipants = participants.some((p) => p.hp > 0);
  if (participants.length > 0 && !aliveParticipants) {
    state.scene = 'gameover';
  }
}
