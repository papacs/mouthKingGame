import type { ItemConfig } from './types';

export const MAX_PLAYERS = 4;
export const MAX_HP = 100;
export const MAX_SUGAR = 100;

export const TUNING = {
  mouthOpenThreshold: 0.05,
  mouthRadius: 50,
  trackingMaxDistance: 0.2,
  trackingLostGraceFrames: 18,
  hungerBaseDecay: 0.06,
  hungerLevelDecay: 0.012,
  levelScoreStep: 1500,
  spawnBaseInterval: 52,
  spawnMinInterval: 9,
  spawnLevelSpeedup: 3,
  spawnPlayerFactor: 0.25,
  feverFrames: 240,
  shieldFrames: 180
};

export const BALANCE_BY_PLAYERS: Record<number, { trapWeightMultiplier: number; fallSpeedMultiplier: number }> = {
  1: { trapWeightMultiplier: 1.0, fallSpeedMultiplier: 1.0 },
  2: { trapWeightMultiplier: 0.92, fallSpeedMultiplier: 1.06 },
  3: { trapWeightMultiplier: 0.86, fallSpeedMultiplier: 1.12 },
  4: { trapWeightMultiplier: 0.8, fallSpeedMultiplier: 1.2 }
};

export const ITEMS: ItemConfig[] = [
  { id: 'apple', emoji: '🍎', name: '苹果', score: 10, type: 'healthy', weight: 16 },
  { id: 'broccoli', emoji: '🥦', name: '西兰花', score: 8, type: 'healthy', weight: 12 },
  { id: 'cucumber', emoji: '🥒', name: '黄瓜', score: 6, type: 'healthy', weight: 10 },
  { id: 'burger', emoji: '🍔', name: '汉堡', score: 45, type: 'junk', weight: 10 },
  { id: 'donut', emoji: '🍩', name: '甜甜圈', score: 35, type: 'junk', weight: 9 },
  { id: 'candy', emoji: '🍬', name: '糖果', score: 25, type: 'junk', weight: 8 },
  { id: 'bomb', emoji: '💣', name: '炸弹', score: -35, type: 'trap', weight: 7 },
  { id: 'poop', emoji: '💩', name: '便便', score: -25, type: 'trap', weight: 8 },
  { id: 'rotten', emoji: '🧟', name: '烂果', score: -20, type: 'trap', weight: 6 },
  { id: 'water', emoji: '💧', name: '水', score: 8, type: 'buff', weight: 4 },
  { id: 'clock', emoji: '🕒', name: '怀表', score: 8, type: 'buff', weight: 3 },
  { id: 'shield', emoji: '🛡️', name: '护盾', score: 8, type: 'buff', weight: 3 },
  { id: 'brush', emoji: '🪥', name: '牙刷', score: 8, type: 'buff', weight: 3 },
  { id: 'golden', emoji: '🌟', name: '金苹果', score: 150, type: 'buff', weight: 1 }
];
