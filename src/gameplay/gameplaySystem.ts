import { BALANCE_BY_PLAYERS, LOSER_MARKS, MAX_HP, MAX_PLAYERS, MAX_SUGAR, TUNING, getActiveTheme, getItems } from '../config/gameConfig';
import type { FallingItem, GameState, ItemConfig, PlayerState } from '../core/types';

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
  let interval = Math.max(
    TUNING.spawnMinInterval,
    Math.floor(baseInterval / (1 + (activeCount - 1) * TUNING.spawnPlayerFactor))
  );
  if (state.stormFrames > 0) {
    interval = Math.max(TUNING.spawnMinInterval, Math.floor(interval * TUNING.stormSpawnMultiplier));
  }

  if (state.frame % Math.floor(interval) !== 0) return;

  const burst = activeCount >= 4 ? 3 : activeCount >= 2 ? 2 : 1;
  for (let i = 0; i < burst; i += 1) {
    const weightedPool = getItems().map((item) => {
      let weight = item.weight;
      if (state.surpriseType === 'golden_rush' && item.id === 'golden') {
        weight = Math.max(1, Math.floor(weight * TUNING.surpriseGoldenMultiplier));
      }
      if (item.type === 'trap') {
        weight = Math.max(1, Math.floor(weight * balance.trapWeightMultiplier));
        if (state.endgameFrames > 0) {
          weight = Math.max(1, Math.floor(weight * TUNING.endgameTrapWeightMultiplier));
        }
        if (state.surpriseType === 'trap_scare') {
          weight = Math.max(1, Math.floor(weight * TUNING.surpriseTrapMultiplier));
        }
      }
      return { ...item, weight };
    });
    const selected = weightedPick(weightedPool);
    const item: FallingItem = {
      ...selected,
      x: Math.random() * (width - 60) + 30,
      y: -30 - i * 22,
      vy:
        (2.8 + state.level * 0.45 + Math.random() * 0.7) *
        balance.fallSpeedMultiplier *
        (state.surpriseType === 'double_drop' ? TUNING.dropSpeedMultiplier : 1)
    };

    state.items.push(item);
  }
}

function markEliminated(player: PlayerState): void {
  if (player.eliminated || player.hp > 0) return;
  player.eliminated = true;
  if (!player.loserMark) {
    player.loserMark = LOSER_MARKS[player.id % LOSER_MARKS.length] ?? '😷';
  }
}

function applyPlayerHit(player: PlayerState, item: FallingItem, state: GameState): void {
  state.sfxQueue.push({ key: item.sfxKey });
  const hasFever = player.feverFrames > 0;
  let gained = item.score;
  const previousCombo = player.combo;
  if (hasFever && gained > 0) gained = Math.floor(gained * 1.5);
  if (gained > 0) {
    player.combo += 1;
    gained += Math.min(player.combo * 4, 40);
  } else {
    player.combo = 0;
  }
  if (player.combo > player.maxCombo) {
    player.maxCombo = player.combo;
  }

  let trapDamage = 0;
  if (item.type === 'healthy') {
    player.balance = Math.max(-50, player.balance - 6);
    player.hp = Math.min(MAX_HP, player.hp + 6);
    player.healthyStreak += 1;
    if (player.healthyStreak >= TUNING.healthyStreakForSunglasses) {
      player.healthyStreak = 0;
      player.sunglassesFrames = TUNING.sunglassesFrames;
      state.floatTexts.push({
        text: '😎',
        x: item.x,
        y: item.y - 18,
        color: '#f5c542',
        life: 45,
        size: 32
      });
    }
  }
  if (item.type === 'junk') {
    player.balance = Math.min(50, player.balance + 8);
    player.sugar = Math.min(MAX_SUGAR, player.sugar + 12);
    player.healthyStreak = 0;
  }
  if (item.type === 'trap') {
    player.healthyStreak = 0;
    state.floatTexts.push({
      text: '⚠️',
      x: item.x,
      y: item.y - 28,
      color: '#ff6b6b',
      life: 30,
      size: 24
    });
  }

  switch (item.id) {
    case 'bomb':
      trapDamage = 28;
      state.shakeFrames = Math.max(state.shakeFrames, TUNING.bombShakeFrames);
      state.trapFlashFrames = Math.max(state.trapFlashFrames, TUNING.trapFlashFrames);
      state.sfxQueue.push({ key: 'explosion' });
      state.floatTexts.push({
        text: '💥',
        x: item.x,
        y: item.y - 20,
        color: '#ffd166',
        life: 40,
        size: 36
      });
      break;
    case 'poop':
      trapDamage = 16;
      if (state.poopStormFrames === 0) {
        state.poopSplats = Array.from({ length: 8 }, () => ({
          x: Math.random(),
          y: Math.random(),
          r: 40 + Math.random() * 80,
          alpha: 0.18 + Math.random() * 0.18
        }));
      }
      state.poopStormFrames = Math.max(state.poopStormFrames, TUNING.poopStormFrames);
      state.sfxQueue.push({ key: 'poop_spray' });
      state.floatTexts.push({
        text: '💩',
        x: item.x,
        y: item.y - 18,
        color: '#8f6b2c',
        life: 40,
        size: 34
      });
      break;
    case 'rotten':
      trapDamage = 14;
      player.dizzyFrames = TUNING.dizzyFrames;
      state.sfxQueue.push({ key: 'dizzy' });
      state.floatTexts.push({
        text: '💫',
        x: item.x,
        y: item.y - 18,
        color: '#b0a1ff',
        life: 45,
        size: 30
      });
      break;
    case 'bee':
      trapDamage = 12;
      player.maskFrames = TUNING.maskFrames;
      state.floatTexts.push({
        text: '😷',
        x: item.x,
        y: item.y - 18,
        color: '#c2f0ff',
        life: 45,
        size: 32
      });
      break;
    case 'water':
      player.hp = Math.min(MAX_HP, player.hp + 10);
      player.sugar = Math.max(0, player.sugar - 20);
      break;
    case 'clock':
      player.feverFrames = TUNING.feverFrames;
      state.floatTexts.push({
        text: '🔥',
        x: item.x,
        y: item.y - 18,
        color: '#ff8c42',
        life: 45,
        size: 28
      });
      state.sfxQueue.push({ key: 'fever_on' });
      break;
    case 'shield':
      player.shieldFrames = TUNING.shieldFrames;
      state.floatTexts.push({
        text: '🛡️',
        x: item.x,
        y: item.y - 18,
        color: '#6dd5ff',
        life: 45,
        size: 26
      });
      state.sfxQueue.push({ key: 'shield_on' });
      break;
    case 'brush':
      player.sugar = 0;
      break;
    case 'golden':
      player.hp = MAX_HP;
      player.sugar = 0;
      player.score += 300;
      break;
    case 'slow':
      state.slowFrames = Math.max(state.slowFrames, TUNING.powerupSlowFrames);
      state.floatTexts.push({
        text: '⏳',
        x: item.x,
        y: item.y - 18,
        color: '#9fd3ff',
        life: 45,
        size: 30
      });
      break;
    case 'magnet':
      player.magnetFrames = Math.max(player.magnetFrames, TUNING.powerupMagnetFrames);
      state.floatTexts.push({
        text: '🧲',
        x: item.x,
        y: item.y - 18,
        color: '#ff6f61',
        life: 45,
        size: 30
      });
      break;
    case 'clear':
      state.items = [];
      state.floatTexts.push({
        text: '💥',
        x: item.x,
        y: item.y - 18,
        color: '#ffd166',
        life: 45,
        size: 30
      });
      break;
    case 'reflect':
      player.reflectFrames = Math.max(player.reflectFrames, TUNING.powerupReflectFrames);
      state.floatTexts.push({
        text: '🔁',
        x: item.x,
        y: item.y - 18,
        color: '#c3f0ca',
        life: 45,
        size: 30
      });
      break;
    case 'red_packet':
      player.score += 80;
      if (Math.random() < 0.2) {
        state.surpriseType = 'golden_rush';
        state.surpriseFrames = Math.max(state.surpriseFrames, TUNING.surpriseDurationFrames);
      }
      state.floatTexts.push({
        text: '🧧',
        x: item.x,
        y: item.y - 18,
        color: '#ffcf5c',
        life: 45,
        size: 30
      });
      break;
    case 'orange':
      player.hp = Math.min(MAX_HP, player.hp + 8);
      player.combo = Math.max(1, player.combo);
      break;
    case 'dumpling':
      player.hp = Math.min(MAX_HP, player.hp + 5);
      player.shieldFrames = Math.max(player.shieldFrames, 90);
      break;
    case 'horse_cake':
      player.magnetFrames = Math.max(player.magnetFrames, 180);
      break;
    case 'firecracker':
      trapDamage = 18;
      state.shakeFrames = Math.max(state.shakeFrames, 14);
      state.trapFlashFrames = Math.max(state.trapFlashFrames, TUNING.trapFlashFrames);
      state.floatTexts.push({
        text: '🧨',
        x: item.x,
        y: item.y - 20,
        color: '#ff8a5c',
        life: 40,
        size: 32
      });
      break;
    default:
      break;
  }

  if (trapDamage > 0) {
    state.trapFlashFrames = Math.max(state.trapFlashFrames, TUNING.trapFlashFrames);
    state.sfxQueue.push({ key: 'trap_hit' });
    if (player.shieldFrames > 0) {
      player.shieldFrames = Math.max(0, player.shieldFrames - 60);
      state.sfxQueue.push({ key: 'trap_block' });
      state.floatTexts.push({
        text: `P${player.id + 1} BLOCK`,
        x: item.x,
        y: item.y - 22,
        color: '#6dd5ff',
        life: 28,
        size: 18
      });
    } else {
      if (player.reflectFrames > 0) {
        gained += trapDamage;
      } else {
        player.hp -= trapDamage;
        state.sfxQueue.push({ key: 'player_hurt' });
      }
    }
  }

  let multiplier = 1;
  if (state.stormFrames > 0) multiplier *= TUNING.stormScoreMultiplier;
  if (state.endgameFrames > 0) multiplier *= TUNING.endgameScoreMultiplier;
  if (player.scoreBoostFrames > 0) multiplier *= TUNING.comboScoreBoostMultiplier;
  if (gained > 0 && multiplier !== 1) {
    gained = Math.floor(gained * multiplier);
  }

  player.score = Math.max(0, player.score + gained);

  markEliminated(player);

  if (
    player.combo > 0 &&
    player.combo !== previousCombo &&
    (player.combo === 3 || player.combo % 5 === 0)
  ) {
    state.sfxQueue.push({ key: 'combo_up' });
  }

  if (player.combo === 5 && previousCombo < 5) {
    player.scoreBoostFrames = Math.max(player.scoreBoostFrames, TUNING.comboScoreBoostFrames);
    state.floatTexts.push({
      text: '✨',
      x: item.x,
      y: item.y - 20,
      color: '#ffe066',
      life: 40,
      size: 28
    });
  }
  if (player.combo === 10 && previousCombo < 10) {
    player.shieldFrames = Math.max(player.shieldFrames, TUNING.comboShieldFrames);
    state.floatTexts.push({
      text: '🛡️',
      x: item.x,
      y: item.y - 20,
      color: '#6dd5ff',
      life: 40,
      size: 26
    });
  }
  if (player.combo === 15 && previousCombo < 15) {
    player.feverFrames = Math.max(player.feverFrames, TUNING.comboFeverFrames);
    state.floatTexts.push({
      text: '🔥',
      x: item.x,
      y: item.y - 20,
      color: '#ff8c42',
      life: 40,
      size: 26
    });
  }

  state.floatTexts.push({
    text: gained >= 0 ? `P${player.id + 1} +${gained}` : `P${player.id + 1} ${gained}`,
    x: item.x,
    y: item.y,
    color: gained >= 0 ? '#2ecc71' : '#e74c3c',
    life: 35,
    size: 20
  });
}

export function updateGameplay(state: GameState, width: number, height: number): void {
  if (state.scene !== 'playing' || state.isPaused) return;

  state.frame += 1;
  if (state.frame > 0 && state.frame % TUNING.surpriseIntervalFrames === 0) {
    const roll = Math.random();
    if (roll < 0.25) {
      state.surpriseType = 'golden_rush';
    } else if (roll < 0.5) {
      state.surpriseType = 'double_drop';
    } else if (roll < 0.75) {
      state.surpriseType = 'trap_scare';
    } else {
      state.surpriseType = 'freeze';
      state.slowFrames = Math.max(state.slowFrames, TUNING.surpriseFreezeFrames);
    }
    state.surpriseFrames = TUNING.surpriseDurationFrames;
    const festivalSurprise =
      getActiveTheme().id === 'spring_festival_horse'
        ? state.surpriseType === 'golden_rush'
          ? '🎆'
          : state.surpriseType === 'double_drop'
            ? '🐎'
            : state.surpriseType === 'trap_scare'
              ? '🧨'
              : '🧊'
        : null;
    state.floatTexts.push({
      text:
        festivalSurprise ??
        (state.surpriseType === 'golden_rush'
          ? '🌟'
          : state.surpriseType === 'double_drop'
            ? '🎉'
            : state.surpriseType === 'trap_scare'
              ? '👻'
              : '🧊'),
      x: width * 0.5,
      y: height * 0.18,
      color: '#ffffff',
      life: 45,
      size: 34
    });
    if (state.surpriseType === 'trap_scare') {
      state.trapFlashFrames = Math.max(state.trapFlashFrames, TUNING.surpriseScareFrames);
    }
  }
  if (state.frame > 0 && state.frame % TUNING.stormIntervalFrames === 0) {
    state.stormFrames = Math.max(state.stormFrames, TUNING.stormDurationFrames);
  }
  if (
    state.frame >= TUNING.matchDurationFrames - TUNING.endgameDurationFrames &&
    state.endgameFrames === 0
  ) {
    state.endgameFrames = TUNING.endgameDurationFrames;
  }
  if (state.frame >= TUNING.matchDurationFrames) {
    state.scene = 'gameover';
  }

  const totalScore = state.players.reduce((acc, p) => acc + p.score, 0);
  state.level = 1 + Math.floor(totalScore / TUNING.levelScoreStep);

  for (const p of state.players) {
    if (!p.active) continue;
    p.hp -= TUNING.hungerBaseDecay + state.level * TUNING.hungerLevelDecay;
    p.hp = Math.max(0, p.hp);
    p.shieldFrames = Math.max(0, p.shieldFrames - 1);
    p.feverFrames = Math.max(0, p.feverFrames - 1);
    p.magnetFrames = Math.max(0, p.magnetFrames - 1);
    p.reflectFrames = Math.max(0, p.reflectFrames - 1);
    p.scoreBoostFrames = Math.max(0, p.scoreBoostFrames - 1);
    p.dizzyFrames = Math.max(0, p.dizzyFrames - 1);
    p.maskFrames = Math.max(0, p.maskFrames - 1);
    p.sunglassesFrames = Math.max(0, p.sunglassesFrames - 1);
    if (p.hp > 0) p.survivalFrames += 1;
    if (p.dizzyFrames > 0) {
      const jitter = Math.min(0.006, 0.002 + (p.dizzyFrames % 6) * 0.0006);
      p.x = Math.min(0.98, Math.max(0.02, p.x + (Math.random() - 0.5) * jitter));
      p.y = Math.min(0.98, Math.max(0.02, p.y + (Math.random() - 0.5) * jitter));
    }
    markEliminated(p);
  }

  if (state.stormFrames > 0) state.stormFrames -= 1;
  if (state.endgameFrames > 0) state.endgameFrames -= 1;
  if (state.slowFrames > 0) state.slowFrames -= 1;
  if (state.audienceCooldownFrames > 0) state.audienceCooldownFrames -= 1;
  if (state.poopStormFrames > 0) {
    state.poopStormFrames -= 1;
    if (state.poopStormFrames === 0) {
      state.poopSplats = [];
    }
  }
  if (state.trapFlashFrames > 0) state.trapFlashFrames -= 1;
  if (state.surpriseFrames > 0) {
    state.surpriseFrames -= 1;
    if (state.surpriseFrames === 0) {
      state.surpriseType = null;
    }
  }

  if (state.audienceCooldownFrames === 0) {
    const roll = Math.random();
    if (roll < 0.34) {
      state.stormFrames = Math.max(state.stormFrames, TUNING.stormDurationFrames);
      state.floatTexts.push({ text: '🌪️', x: width * 0.5, y: height * 0.22, color: '#b9f2ff', life: 45, size: 34 });
    } else if (roll < 0.67) {
      state.shakeFrames = Math.max(state.shakeFrames, TUNING.audienceQuakeFrames);
      state.floatTexts.push({ text: '💥', x: width * 0.5, y: height * 0.22, color: '#ffd166', life: 45, size: 34 });
    } else {
      state.players.forEach((p) => {
        if (!p.enrolled) return;
        p.sugar = Math.min(MAX_SUGAR, p.sugar + TUNING.audienceSugarBoost);
      });
      state.floatTexts.push({ text: '🍬', x: width * 0.5, y: height * 0.22, color: '#ff7ad9', life: 45, size: 34 });
    }
    state.audienceCooldownFrames = TUNING.audienceIntervalFrames;
  }

  // Handle close-range kiss gag between players.
  for (let i = 0; i < MAX_PLAYERS; i += 1) {
    for (let j = i + 1; j < MAX_PLAYERS; j += 1) {
      const p1 = state.players[i];
      const p2 = state.players[j];
      const cooldown = state.kissCooldowns[i][j];
      if (cooldown > 0) {
        state.kissCooldowns[i][j] = cooldown - 1;
      }
      if (!p1.active || !p2.active) {
        continue;
      }
      const dx = (p1.x - p2.x) * width;
      const dy = (p1.y - p2.y) * height;
      const dist = Math.hypot(dx, dy);
      if (dist <= TUNING.mouthRadius * 2 && state.kissCooldowns[i][j] === 0) {
        state.kissCooldowns[i][j] = TUNING.kissCooldownFrames;
        state.shakeFrames = Math.max(state.shakeFrames, 12);
        state.sfxQueue.push({ key: 'kiss' });
        state.floatTexts.push({
          text: '💋',
          x: (p1.x + p2.x) * 0.5 * width,
          y: (p1.y + p2.y) * 0.5 * height - 20,
          color: '#ff86c8',
          life: 50,
          size: 46
        });
      }
    }
  }

  spawnItems(state, width);

  const fallMultiplier = state.slowFrames > 0 ? TUNING.powerupSlowFallMultiplier : 1;
  for (const item of state.items) {
    item.y += item.vy * fallMultiplier;
  }
  state.items = state.items.filter((item) => item.y < height + 40);

  for (let i = state.items.length - 1; i >= 0; i -= 1) {
    const item = state.items[i];
    if (!item) continue;

    let consumed = false;
    for (let pid = 0; pid < MAX_PLAYERS; pid += 1) {
      const p = state.players[pid];
      if (!p.active || !p.mouthOpen || p.hp <= 0 || p.maskFrames > 0) continue;
      const px = p.x * width;
      const py = p.y * height;
      let localX = px;
      let localY = py;
      if (p.dizzyFrames > 0) {
        localX = width - px;
        localY = height - py;
      }
      const radius = TUNING.mouthRadius * (p.magnetFrames > 0 ? TUNING.powerupMagnetMultiplier : 1);
      const dist = Math.hypot(localX - item.x, localY - item.y);
      if (dist <= radius) {
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

  if (state.shakeFrames > 0) {
    state.shakeFrames -= 1;
  }

  const participants = state.players.filter((p) => p.enrolled);
  const aliveParticipants = participants.some((p) => p.hp > 0);
  if (participants.length > 0 && !aliveParticipants) {
    state.scene = 'gameover';
  }
}
