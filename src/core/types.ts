import type { SfxKey } from '../config/soundConfig';

export type ItemType = 'healthy' | 'junk' | 'trap' | 'buff';

export interface ItemConfig {
  id: string;
  emoji: string;
  name: string;
  score: number;
  type: ItemType;
  weight: number;
  sfxKey: SfxKey;
}

export interface FallingItem extends ItemConfig {
  x: number;
  y: number;
  vy: number;
}

export interface FloatText {
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  size?: number;
}

export interface SfxEvent {
  key: SfxKey;
  volume?: number;
  rate?: number;
}

export interface PlayerState {
  id: number;
  x: number;
  y: number;
  mouthOpen: boolean;
  lostFrames: number;
  enrolled: boolean;
  eliminated: boolean;
  loserMark: string | null;
  score: number;
  hp: number;
  sugar: number;
  balance: number;
  combo: number;
  maxCombo: number;
  shieldFrames: number;
  feverFrames: number;
  magnetFrames: number;
  reflectFrames: number;
  scoreBoostFrames: number;
  dizzyFrames: number;
  maskFrames: number;
  sunglassesFrames: number;
  healthyStreak: number;
  survivalFrames: number;
  active: boolean;
}

export interface GameState {
  scene: 'loading' | 'intro' | 'playing' | 'gameover';
  isPaused: boolean;
  frame: number;
  level: number;
  items: FallingItem[];
  floatTexts: FloatText[];
  players: PlayerState[];
  sfxQueue: SfxEvent[];
  kissCooldowns: number[][];
  shakeFrames: number;
  stormFrames: number;
  endgameFrames: number;
  slowFrames: number;
  audienceCooldownFrames: number;
  poopStormFrames: number;
  trapFlashFrames: number;
  poopSplats: { x: number; y: number; r: number; alpha: number }[];
  reverseFrames: number;
  surpriseFrames: number;
  surpriseType: 'golden_rush' | 'double_drop' | 'trap_scare' | 'freeze' | null;
}
