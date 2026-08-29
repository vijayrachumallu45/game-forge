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

import {
  getHighScores,
  saveHighScore,
  getPlayerName,
  setPlayerName,
  clearAllData,
  exportGameData,
  importGameData,
  resetHighScores
} from '../src/utils/storage';

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

  it('should reset high scores for a specific game', () => {
    saveHighScore('cosmic', 5000);
    const resetResult = resetHighScores('cosmic');
    expect(resetResult).toBe(true);
    expect(getHighScores('cosmic')).toEqual([]);
  });

  it('should export and import game data successfully', () => {
    setPlayerName('GamerX');
    saveHighScore('breaker', 12345);

    const exportedJSON = exportGameData();
    expect(typeof exportedJSON).toBe('string');

    clearAllData();
    const importSuccess = importGameData(exportedJSON);
    expect(importSuccess).toBe(true);
    expect(getPlayerName()).toBe('GamerX');
  });

  it('should return false when importing invalid JSON data', () => {
    const importSuccess = importGameData('invalid_json_string');
    expect(importSuccess).toBe(false);
  });
});

