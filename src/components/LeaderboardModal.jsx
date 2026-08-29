import { useState } from 'react';
import { getHighScores, clearAllData } from '../utils/storage';
import { sound } from '../utils/soundEngine';

const GAME_NAMES = {
  cosmic: '🚀 Cosmic Defender',
  breaker: '🧱 Neon Breaker',
  runner: '🏃 Cyber Runner',
  snake: '🐍 Retro Snake 2099'
};

export default function LeaderboardModal({ onClose }) {
  const [selectedGame, setSelectedGame] = useState('cosmic');
  const scores = getHighScores();
  const gameScores = scores[selectedGame] || [];

  const handleReset = () => {
    if (window.confirm('Reset all high scores and local data?')) {
      clearAllData();
      sound.playSound('gameover');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏆 HALL OF FAME LEADERBOARD</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="tab-selector">
          {Object.keys(GAME_NAMES).map((id) => (
            <button
              key={id}
              className={`tab-btn ${selectedGame === id ? 'active' : ''}`}
              onClick={() => {
                sound.playSound('bounce');
                setSelectedGame(id);
              }}
            >
              {GAME_NAMES[id]}
            </button>
          ))}
        </div>

        <div className="leaderboard-table-wrapper">
          {gameScores.length === 0 ? (
            <p className="no-scores">No high scores recorded yet for this game!</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>PLAYER</th>
                  <th>SCORE</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {gameScores.map((entry, idx) => (
                  <tr key={idx} className={idx === 0 ? 'gold-rank' : idx === 1 ? 'silver-rank' : idx === 2 ? 'bronze-rank' : ''}>
                    <td className="rank-cell">
                      {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `#${idx + 1}`}
                    </td>
                    <td className="name-cell">{entry.name}</td>
                    <td className="score-cell">{entry.score.toLocaleString()}</td>
                    <td className="date-cell">{entry.date || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button className="danger-btn" onClick={handleReset}>Clear All Data</button>
          <button className="action-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
