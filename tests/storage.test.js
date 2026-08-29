import { describe, it, expect, beforeEach, beforeAll } from 'vitest';

// Mock localStorage for Vitest Node environment
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    const store = {};
    globalThis.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); }
    };
  }
});

import { getHighScores, saveHighScore, getPlayerName, setPlayerName, clearAllData } from '../src/utils/storage';

describe('Storage Manager Unit Tests', () => {
  beforeEach(() => {
    clearAllData();
  });

  it('should manage player name tag', () => {
    setPlayerName('CyberAce');
    expect(getPlayerName()).toBe('CyberAce');
  });

  it('should record high scores correctly', () => {
    const isNewRecord = saveHighScore('cosmic', 99999);
    expect(isNewRecord).toBe(true);

    const scores = getHighScores('cosmic');
    expect(scores[0].score).toBe(99999);
  });
});
