// Storage Manager for GameForge High Scores & Achievements

const STORAGE_KEYS = {
  HIGH_SCORES: 'gameforge_high_scores',
  STATS: 'gameforge_stats',
  ACHIEVEMENTS: 'gameforge_achievements',
  PLAYER_NAME: 'gameforge_player_name'
};

const DEFAULT_SCORES = {
  cosmic: [
    { name: 'AcePilot', score: 15000, date: '2026-08-20' },
    { name: 'StarLord', score: 9800, date: '2026-08-22' },
    { name: 'Vanguard', score: 5400, date: '2026-08-25' }
  ],
  breaker: [
    { name: 'BrickSmash', score: 12400, date: '2026-08-18' },
    { name: 'PaddlePro', score: 8700, date: '2026-08-21' },
    { name: 'NeonMaster', score: 4500, date: '2026-08-24' }
  ],
  runner: [
    { name: 'SpeedDemon', score: 1890, date: '2026-08-19' },
    { name: 'CyberDash', score: 1200, date: '2026-08-23' },
    { name: 'NeonRunner', score: 750, date: '2026-08-26' }
  ],
  snake: [
    { name: 'PythonKing', score: 850, date: '2026-08-20' },
    { name: 'Cobra99', score: 620, date: '2026-08-22' },
    { name: 'ViperWave', score: 390, date: '2026-08-25' }
  ]
};

const ACHIEVEMENTS_LIST = [
  { id: 'first_play', title: 'First Drop', desc: 'Play your first game on GameForge Arcade', icon: '🎮' },
  { id: 'high_score', title: 'High Roller', desc: 'Score over 5,000 points in any game', icon: '🔥' },
  { id: 'cosmic_boss', title: 'Alien Annihilator', desc: 'Reach Wave 5 in Cosmic Defender', icon: '🛸' },
  { id: 'breaker_master', title: 'Brick Demolisher', desc: 'Clear 30 bricks in a single Neon Breaker game', icon: '🧱' },
  { id: 'runner_distance', title: 'Cyber Sprint', desc: 'Survive 1,000 meters in Cyber Runner', icon: '🏃' },
  { id: 'snake_grower', title: 'Mega Python', desc: 'Grow your snake body to length 20+', icon: '🐍' },
  { id: 'all_played', title: 'Arcade Champion', desc: 'Play all 4 games in GameForge Arcade', icon: '👑' }
];

export const getPlayerName = () => {
  return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || 'Player 1';
};

export const setPlayerName = (name) => {
  localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.trim() || 'Player 1');
};

export const getHighScores = (gameId) => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    const scores = data ? JSON.parse(data) : DEFAULT_SCORES;
    return gameId ? scores[gameId] || [] : scores;
  } catch {
    return DEFAULT_SCORES[gameId] || [];
  }
};

export const saveHighScore = (gameId, score) => {
  if (score <= 0) return false;
  const name = getPlayerName();
  const allScores = getHighScores();
  const gameScores = allScores[gameId] || [];

  const newEntry = {
    name,
    score,
    date: new Date().toISOString().split('T')[0]
  };

  gameScores.push(newEntry);
  gameScores.sort((a, b) => b.score - a.score);
  allScores[gameId] = gameScores.slice(0, 10); // Top 10

  localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(allScores));

  // Check achievement
  checkAchievement('first_play');
  if (score >= 5000) {
    checkAchievement('high_score');
  }

  return gameScores[0].score === score; // Returns true if new #1 record!
};

export const getUnlockedAchievements = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const checkAchievement = (achievementId) => {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(achievementId)) {
    unlocked.push(achievementId);
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(unlocked));
    return true; // Newly unlocked
  }
  return false;
};

export const getAllAchievements = () => {
  const unlocked = getUnlockedAchievements();
  return ACHIEVEMENTS_LIST.map((item) => ({
    ...item,
    unlocked: unlocked.includes(item.id)
  }));
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.HIGH_SCORES);
  localStorage.removeItem(STORAGE_KEYS.STATS);
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
};

export const resetHighScores = (gameId) => {
  const allScores = getHighScores();
  if (gameId && allScores[gameId]) {
    delete allScores[gameId];
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(allScores));
    return true;
  }
  return false;
};

export const exportGameData = () => {
  const data = {
    scores: getHighScores(),
    achievements: getUnlockedAchievements(),
    playerName: getPlayerName(),
    exportedAt: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importGameData = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') return false;

    if (parsed.scores) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(parsed.scores));
    }
    if (parsed.achievements && Array.isArray(parsed.achievements)) {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(parsed.achievements));
    }
    if (parsed.playerName) {
      setPlayerName(parsed.playerName);
    }
    return true;
  } catch {
    return false;
  }
};

