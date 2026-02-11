import type { ItemConfig } from '../../core/types';

export type ThemeId = 'default' | 'spring_festival_horse';

export interface ThemeConfig {
  id: ThemeId;
  displayName: string;
  previewIcon: string;
  previewText: string;
  title: string;
  introHeadline: string;
  introSubtitle: string;
  eventPrefix?: string;
  itemWeightMultiplier: Partial<Record<ItemConfig['id'], number>>;
  extraItems: ItemConfig[];
}

export const DEFAULT_THEME: ThemeConfig = {
  id: 'default',
  displayName: '默认主题',
  previewIcon: '🎯',
  previewText: '经典规则，稳定上手',
  title: '嘴强王者',
  introHeadline: '最多 4 人同屏',
  introSubtitle: '每个人独立血量、分数、状态。张嘴吃道具冲分。',
  eventPrefix: '',
  itemWeightMultiplier: {},
  extraItems: []
};

export const SPRING_FESTIVAL_HORSE_THEME: ThemeConfig = {
  id: 'spring_festival_horse',
  displayName: '马上开吃',
  previewIcon: '🧧',
  previewText: '春节限时，福气加成',
  title: '嘴强王者·马上开吃',
  introHeadline: '春节限时：守住年夜饭',
  introSubtitle: '4 人同屏接福开吃，避开年兽陷阱，冲刺福气值。',
  eventPrefix: '新春',
  itemWeightMultiplier: {
    golden: 1.8,
    water: 1.2,
    bomb: 0.9
  },
  extraItems: [
    { id: 'red_packet', emoji: '🧧', name: '红包', score: 65, type: 'buff', weight: 5, sfxKey: 'item_buff' },
    { id: 'orange', emoji: '🍊', name: '福橘', score: 12, type: 'healthy', weight: 8, sfxKey: 'item_healthy' },
    { id: 'dumpling', emoji: '🥟', name: '饺子', score: 22, type: 'buff', weight: 6, sfxKey: 'item_buff' },
    { id: 'horse_cake', emoji: '🐎', name: '马蹄糕', score: 10, type: 'buff', weight: 4, sfxKey: 'item_buff' },
    { id: 'firecracker', emoji: '🧨', name: '鞭炮', score: -26, type: 'trap', weight: 5, sfxKey: 'item_trap' }
  ]
};

function resolveThemeId(): ThemeId {
  const raw = (import.meta.env.VITE_EVENT_THEME ?? '').toString().trim().toLowerCase();
  if (raw === 'spring_festival_horse') return 'spring_festival_horse';
  return 'default';
}

let activeThemeId: ThemeId = resolveThemeId();
const THEME_CATALOG: ThemeConfig[] = [DEFAULT_THEME, SPRING_FESTIVAL_HORSE_THEME];

export function setActiveTheme(id: ThemeId): void {
  activeThemeId = id;
}

export function getActiveTheme(): ThemeConfig {
  return THEME_CATALOG.find((theme) => theme.id === activeThemeId) ?? DEFAULT_THEME;
}

export function listThemeOptions(): ThemeConfig[] {
  return THEME_CATALOG;
}
