import { MAX_HP, MAX_PLAYERS } from '../config/gameConfig';
import type { GameState, PlayerState } from './types';

function createPlayer(id: number): PlayerState {
  return {
    id,
    x: 0.5,
    y: 0.6,
    mouthOpen: false,
    lostFrames: 0,
    enrolled: false,
    score: 0,
    hp: MAX_HP,
    sugar: 0,
    balance: 0,
    combo: 0,
    shieldFrames: 0,
    feverFrames: 0,
    active: false
  };
}

export function createInitialState(): GameState {
  return {
    scene: 'loading',
    isPaused: false,
    frame: 0,
    level: 1,
    items: [],
    floatTexts: [],
    players: Array.from({ length: MAX_PLAYERS }, (_, i) => createPlayer(i))
  };
}

export function resetPlayingState(state: GameState): void {
  state.scene = 'playing';
  state.isPaused = false;
  state.frame = 0;
  state.level = 1;
  state.items = [];
  state.floatTexts = [];
  state.players = state.players.map((p) => ({ ...createPlayer(p.id), x: p.x, y: p.y }));
}
