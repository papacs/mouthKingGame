export type ItemType = 'healthy' | 'junk' | 'trap' | 'buff';

export interface ItemConfig {
  id: string;
  emoji: string;
  name: string;
  score: number;
  type: ItemType;
  weight: number;
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
}

export interface PlayerState {
  id: number;
  x: number;
  y: number;
  mouthOpen: boolean;
  lostFrames: number;
  enrolled: boolean;
  score: number;
  hp: number;
  sugar: number;
  balance: number;
  combo: number;
  shieldFrames: number;
  feverFrames: number;
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
}
