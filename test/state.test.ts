import { describe, expect, it } from 'vitest';
import { MAX_PLAYERS } from '../src/config/gameConfig';
import { createInitialState, resetPlayingState } from '../src/core/state';

describe('state initialization', () => {
  it('creates fixed player slots', () => {
    const state = createInitialState();
    expect(state.players).toHaveLength(MAX_PLAYERS);
    expect(state.players.map((p) => p.id)).toEqual([0, 1, 2, 3]);
  });

  it('resets runtime values but keeps tracked positions', () => {
    const state = createInitialState();
    state.players[0].x = 0.2;
    state.players[0].y = 0.7;
    state.players[0].score = 123;
    state.players[0].active = true;
    state.players[0].enrolled = true;

    resetPlayingState(state);

    expect(state.scene).toBe('playing');
    expect(state.players[0].x).toBe(0.2);
    expect(state.players[0].y).toBe(0.7);
    expect(state.players[0].score).toBe(0);
    expect(state.players[0].active).toBe(false);
    expect(state.players[0].enrolled).toBe(false);
  });
});
