export type SfxKey =
  | 'ui_start'
  | 'ui_restart'
  | 'ui_pause_on'
  | 'ui_pause_off'
  | 'item_healthy'
  | 'item_junk'
  | 'item_trap'
  | 'item_buff'
  | 'kiss'
  | 'trap_hit'
  | 'poop_spray'
  | 'explosion'
  | 'dizzy'
  | 'trap_block'
  | 'player_hurt'
  | 'fever_on'
  | 'shield_on'
  | 'combo_up'
  | 'game_over';

export interface SfxTone {
  frequency: number;
  durationMs: number;
  type?: OscillatorType;
}

export interface SfxEntry {
  src?: string;
  volume: number;
  cooldownMs: number;
  maxPolyphony: number;
  group?: string;
  rateRange?: [number, number];
  tone?: SfxTone;
}

export const SFX_GROUPS: Record<string, { cooldownMs: number }> = {
  ui: { cooldownMs: 120 },
  item: { cooldownMs: 80 },
  status: { cooldownMs: 180 },
  hurt: { cooldownMs: 160 }
};

export const SFX: Record<SfxKey, SfxEntry> = {
  ui_start: {
    volume: 0.55,
    cooldownMs: 160,
    maxPolyphony: 1,
    group: 'ui',
    tone: { frequency: 640, durationMs: 120, type: 'triangle' }
  },
  ui_restart: {
    volume: 0.55,
    cooldownMs: 160,
    maxPolyphony: 1,
    group: 'ui',
    tone: { frequency: 700, durationMs: 120, type: 'triangle' }
  },
  ui_pause_on: {
    volume: 0.45,
    cooldownMs: 140,
    maxPolyphony: 1,
    group: 'ui',
    tone: { frequency: 520, durationMs: 90, type: 'sine' }
  },
  ui_pause_off: {
    volume: 0.45,
    cooldownMs: 140,
    maxPolyphony: 1,
    group: 'ui',
    tone: { frequency: 620, durationMs: 90, type: 'sine' }
  },
  item_healthy: {
    volume: 0.5,
    cooldownMs: 60,
    maxPolyphony: 3,
    group: 'item',
    rateRange: [0.98, 1.06],
    tone: { frequency: 760, durationMs: 70, type: 'square' }
  },
  item_junk: {
    volume: 0.5,
    cooldownMs: 60,
    maxPolyphony: 3,
    group: 'item',
    rateRange: [0.96, 1.04],
    tone: { frequency: 580, durationMs: 80, type: 'square' }
  },
  item_trap: {
    volume: 0.55,
    cooldownMs: 80,
    maxPolyphony: 2,
    group: 'item',
    rateRange: [0.92, 1.0],
    tone: { frequency: 320, durationMs: 120, type: 'sawtooth' }
  },
  item_buff: {
    volume: 0.55,
    cooldownMs: 80,
    maxPolyphony: 2,
    group: 'item',
    rateRange: [0.98, 1.08],
    tone: { frequency: 880, durationMs: 110, type: 'triangle' }
  },
  trap_hit: {
    volume: 0.6,
    cooldownMs: 120,
    maxPolyphony: 2,
    group: 'hurt',
    tone: { frequency: 360, durationMs: 120, type: 'sawtooth' }
  },
  poop_spray: {
    volume: 0.7,
    cooldownMs: 400,
    maxPolyphony: 1,
    group: 'status',
    tone: { frequency: 220, durationMs: 240, type: 'square' }
  },
  explosion: {
    volume: 0.75,
    cooldownMs: 300,
    maxPolyphony: 1,
    group: 'hurt',
    tone: { frequency: 140, durationMs: 220, type: 'sawtooth' }
  },
  dizzy: {
    volume: 0.55,
    cooldownMs: 240,
    maxPolyphony: 1,
    group: 'status',
    tone: { frequency: 500, durationMs: 200, type: 'sine' }
  },
  kiss: {
    volume: 0.6,
    cooldownMs: 120,
    maxPolyphony: 1,
    group: 'status',
    tone: { frequency: 980, durationMs: 140, type: 'sine' }
  },
  trap_block: {
    volume: 0.6,
    cooldownMs: 140,
    maxPolyphony: 1,
    group: 'status',
    tone: { frequency: 880, durationMs: 140, type: 'triangle' }
  },
  player_hurt: {
    volume: 0.7,
    cooldownMs: 120,
    maxPolyphony: 2,
    group: 'hurt',
    tone: { frequency: 260, durationMs: 160, type: 'sawtooth' }
  },
  fever_on: {
    volume: 0.6,
    cooldownMs: 200,
    maxPolyphony: 1,
    group: 'status',
    tone: { frequency: 940, durationMs: 160, type: 'triangle' }
  },
  shield_on: {
    volume: 0.6,
    cooldownMs: 200,
    maxPolyphony: 1,
    group: 'status',
    tone: { frequency: 820, durationMs: 160, type: 'triangle' }
  },
  combo_up: {
    volume: 0.5,
    cooldownMs: 140,
    maxPolyphony: 1,
    group: 'status',
    tone: { frequency: 1020, durationMs: 120, type: 'sine' }
  },
  game_over: {
    volume: 0.65,
    cooldownMs: 400,
    maxPolyphony: 1,
    group: 'ui',
    tone: { frequency: 240, durationMs: 260, type: 'sine' }
  }
};
