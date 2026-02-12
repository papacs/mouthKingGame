import type { ItemConfig } from '../core/types';
import { TUNING } from './tuning';
import { getActiveTheme, setActiveTheme, type ThemeId } from './themes/springFestivalHorse';

export const MAX_PLAYERS = 4;
export const MAX_HP = 100;
export const MAX_SUGAR = 100;

export const BALANCE_BY_PLAYERS: Record<number, { trapWeightMultiplier: number; fallSpeedMultiplier: number }> = {
  1: { trapWeightMultiplier: 1.0, fallSpeedMultiplier: 1.0 },
  2: { trapWeightMultiplier: 0.92, fallSpeedMultiplier: 1.06 },
  3: { trapWeightMultiplier: 0.86, fallSpeedMultiplier: 1.12 },
  4: { trapWeightMultiplier: 0.8, fallSpeedMultiplier: 1.2 }
};

export const LOSER_MARKS = ['😷', '🐷', '🤐', '💀'];

const BASE_ITEMS: ItemConfig[] = [
  { id: 'apple', emoji: '🍎', name: '苹果', score: 10, type: 'healthy', weight: 16, sfxKey: 'item_healthy' },
  { id: 'broccoli', emoji: '🥦', name: '西兰花', score: 8, type: 'healthy', weight: 12, sfxKey: 'item_healthy' },
  { id: 'cucumber', emoji: '🥒', name: '黄瓜', score: 6, type: 'healthy', weight: 10, sfxKey: 'item_healthy' },
  { id: 'burger', emoji: '🍔', name: '汉堡', score: 45, type: 'junk', weight: 10, sfxKey: 'item_junk' },
  { id: 'donut', emoji: '🍩', name: '甜甜圈', score: 35, type: 'junk', weight: 9, sfxKey: 'item_junk' },
  { id: 'candy', emoji: '🍬', name: '糖果', score: 25, type: 'junk', weight: 8, sfxKey: 'item_junk' },
  { id: 'bomb', emoji: '💣', name: '炸弹', score: -35, type: 'trap', weight: 7, sfxKey: 'item_trap' },
  { id: 'poop', emoji: '💩', name: '便便', score: -25, type: 'trap', weight: 8, sfxKey: 'item_trap' },
  { id: 'rotten', emoji: '🧟', name: '烂果', score: -20, type: 'trap', weight: 6, sfxKey: 'item_trap' },
  { id: 'bee', emoji: '🐝', name: '蜜蜂', score: -18, type: 'trap', weight: 6, sfxKey: 'item_trap' },
  { id: 'water', emoji: '💧', name: '水', score: 8, type: 'buff', weight: 4, sfxKey: 'item_buff' },
  { id: 'clock', emoji: '🕒', name: '怀表', score: 8, type: 'buff', weight: 3, sfxKey: 'item_buff' },
  { id: 'shield', emoji: '🛡️', name: '护盾', score: 8, type: 'buff', weight: 3, sfxKey: 'item_buff' },
  { id: 'brush', emoji: '🧼', name: '牙刷', score: 8, type: 'buff', weight: 3, sfxKey: 'item_buff' },
  { id: 'golden', emoji: '🌟', name: '金苹果', score: 150, type: 'buff', weight: 1, sfxKey: 'item_buff' },
  { id: 'slow', emoji: '⏳', name: '时停', score: 0, type: 'buff', weight: 2, sfxKey: 'item_buff' },
  { id: 'magnet', emoji: '🧲', name: '磁吸', score: 0, type: 'buff', weight: 2, sfxKey: 'item_buff' },
  { id: 'reverse', emoji: '🌀', name: '反向风', score: 0, type: 'buff', weight: 2, sfxKey: 'item_buff' },
  { id: 'clear', emoji: '💥', name: '清屏', score: 0, type: 'buff', weight: 1, sfxKey: 'item_buff' },
  { id: 'reflect', emoji: '🔁', name: '反伤', score: 0, type: 'buff', weight: 2, sfxKey: 'item_buff' }
];

export { TUNING };

export { setActiveTheme };
export type { ThemeId };

export function getItems(): ItemConfig[] {
  const activeTheme = getActiveTheme();
  return [...BASE_ITEMS, ...activeTheme.extraItems].map((item) => {
    const multiplier = activeTheme.itemWeightMultiplier[item.id] ?? 1;
    return {
      ...item,
      weight: Math.max(1, Math.round(item.weight * multiplier))
    };
  });
}

export { getActiveTheme };
