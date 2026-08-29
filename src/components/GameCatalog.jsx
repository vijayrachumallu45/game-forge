import { sound } from '../utils/soundEngine';
import { getHighScores } from '../utils/storage';

const GAMES = [
  {
    id: 'cosmic',
    title: 'Cosmic Defender',
    subtitle: 'Galactic Space Shooter',
    desc: 'Defend the galaxy against alien invaders! Command your starfighter, collect power-ups, defeat giant bosses, and survive endless space waves.',
    icon: '🚀',
    accentColor: '#00f0ff',
    badge: 'ACTION',
    controls: 'WASD / Arrows to Move • SPACE to Shoot',
    features: ['Boss Battles', 'Triple Laser', 'Energy Shields', 'Particle Explosions']
  },
  {
    id: 'breaker',
    title: 'Neon Breaker',
    subtitle: 'Cyber Brick Demolition',
    desc: 'Smash through high-tech cyber brick walls! Bounce the energy sphere, catch multi-ball power-ups, trigger explosive TNT bricks, and unlock paddle lasers.',
    icon: '🧱',
    accentColor: '#ff007f',
    badge: 'ARCADE',
    controls: 'Mouse / AD / Arrows to Move Paddle • SPACE to Launch',
    features: ['Multi-Ball', 'Paddle Lasers', 'TNT Bricks', 'Dynamic Curve Physics']
  },
  {
    id: 'runner',
    title: 'Cyber Runner',
    subtitle: 'Neon Platform Dash',
    desc: 'Sprint through a dystopian cyber city! Double jump across energy chasms, slide under security lasers, collect energy cubes, and master infinite speed.',
    icon: '🏃',
    accentColor: '#00ff66',
    badge: 'RUNNER',
    controls: 'UP / SPACE to Jump • DOWN / S to Slide',
    features: ['Double Jump', 'Slide Dash', 'Energy Orbs', 'Speed Ramp']
  },
  {
    id: 'snake',
    title: 'Retro Snake 2099',
    subtitle: 'Cyber Grid Survival',
    desc: 'Reimagined arcade snake in neon cyberspace! Consume energy nodes, activate turbo boost, avoid grid collisions, and grow to record-breaking lengths.',
    icon: '🐍',
    accentColor: '#ffbb00',
    badge: 'CLASSIC',
    controls: 'WASD / Arrow Keys to Turn • SHIFT for Turbo Boost',
    features: ['Turbo Boost', 'Golden Multipliers', 'Freeze Time Items', 'Grid Wrap Option']
  }
];

export default function GameCatalog({ onSelectGame }) {
  const scores = getHighScores();

  return (
    <div className="catalog-container">
      <div className="catalog-hero">
        <h1 className="hero-title">
          WELCOME TO <span className="neon-text">GAMEFORGE</span> ARCADE
        </h1>
        <p className="hero-tagline">
          Select an arcade title below to jump straight into the action! High scores and badges are saved locally.
        </p>
      </div>

      <div className="games-grid">
        {GAMES.map((game) => {
          const gameTopScore = scores[game.id]?.[0]?.score || 0;

          return (
            <div
              key={game.id}
              className="game-card"
              style={{ '--accent-color': game.accentColor }}
            >
              <div className="card-badge">{game.badge}</div>

              <div className="card-header">
                <div className="card-icon">{game.icon}</div>
                <div className="card-titles">
                  <h2 className="game-title">{game.title}</h2>
                  <span className="game-subtitle">{game.subtitle}</span>
                </div>
              </div>

              <p className="game-desc">{game.desc}</p>

              <div className="feature-tags">
                {game.features.map((feat, idx) => (
                  <span key={idx} className="feature-tag">{feat}</span>
                ))}
              </div>

              <div className="card-footer">
                <div className="score-badge">
                  <span className="score-label">BEST:</span>
                  <span className="score-val">{gameTopScore.toLocaleString()} pts</span>
                </div>

                <button
                  className="play-btn"
                  onClick={() => {
                    sound.playSound('powerup');
                    onSelectGame(game.id);
                  }}
                >
                  PLAY NOW ▶
                </button>
              </div>

              <div className="card-controls-hint">
                🕹️ {game.controls}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
