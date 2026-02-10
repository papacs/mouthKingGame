import { describe, expect, it } from 'vitest';
import { BALANCE_BY_PLAYERS } from '../src/config/gameConfig';

describe('multi-player balance table', () => {
  it('has profile from 1 to 4 players', () => {
    expect(BALANCE_BY_PLAYERS[1]).toBeTruthy();
    expect(BALANCE_BY_PLAYERS[2]).toBeTruthy();
    expect(BALANCE_BY_PLAYERS[3]).toBeTruthy();
    expect(BALANCE_BY_PLAYERS[4]).toBeTruthy();
  });

  it('reduces trap weight and increases fall speed as players increase', () => {
    expect(BALANCE_BY_PLAYERS[4].trapWeightMultiplier).toBeLessThan(BALANCE_BY_PLAYERS[1].trapWeightMultiplier);
    expect(BALANCE_BY_PLAYERS[4].fallSpeedMultiplier).toBeGreaterThan(BALANCE_BY_PLAYERS[1].fallSpeedMultiplier);
  });
});
