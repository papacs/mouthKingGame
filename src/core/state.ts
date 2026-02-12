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
    eliminated: false,
    loserMark: null,
    score: 0,
    hp: MAX_HP,
    sugar: 0,
    balance: 0,
    combo: 0,
    maxCombo: 0,
    shieldFrames: 0,
    feverFrames: 0,
    magnetFrames: 0,
    reflectFrames: 0,
    scoreBoostFrames: 0,
    dizzyFrames: 0,
    maskFrames: 0,
    sunglassesFrames: 0,
    healthyStreak: 0,
    survivalFrames: 0,
    active: false
  };
}

function createPairMatrix(): number[][] {
  return Array.from({ length: MAX_PLAYERS }, () => Array.from({ length: MAX_PLAYERS }, () => 0));
}

export function createInitialState(): GameState {
  return {
    scene: 'loading',
    isPaused: false,
    frame: 0,
    level: 1,
    items: [],
    floatTexts: [],
    players: Array.from({ length: MAX_PLAYERS }, (_, i) => createPlayer(i)),
    sfxQueue: [],
    kissCooldowns: createPairMatrix(),
    shakeFrames: 0,
    stormFrames: 0,
    endgameFrames: 0,
    slowFrames: 0,
    audienceCooldownFrames: 0,
    poopStormFrames: 0,
    trapFlashFrames: 0,
    poopSplats: [],
    reverseFrames: 0,
    surpriseFrames: 0,
    surpriseType: null
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
  state.sfxQueue = [];
  state.kissCooldowns = createPairMatrix();
  state.shakeFrames = 0;
  state.stormFrames = 0;
  state.endgameFrames = 0;
  state.slowFrames = 0;
  state.audienceCooldownFrames = 0;
  state.poopStormFrames = 0;
  state.trapFlashFrames = 0;
  state.poopSplats = [];
  state.reverseFrames = 0;
  state.surpriseFrames = 0;
  state.surpriseType = null;
}

export function resetAllState(state: GameState): void {
  state.scene = 'intro';
  state.isPaused = false;
  state.frame = 0;
  state.level = 1;
  state.items = [];
  state.floatTexts = [];
  state.players = Array.from({ length: MAX_PLAYERS }, (_, i) => createPlayer(i));
  state.sfxQueue = [];
  state.kissCooldowns = createPairMatrix();
  state.shakeFrames = 0;
  state.stormFrames = 0;
  state.endgameFrames = 0;
  state.slowFrames = 0;
  state.audienceCooldownFrames = 0;
  state.poopStormFrames = 0;
  state.trapFlashFrames = 0;
  state.poopSplats = [];
  state.reverseFrames = 0;
  state.surpriseFrames = 0;
  state.surpriseType = null;
}
