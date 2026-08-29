import { useState } from 'react';
import { sound } from '../utils/soundEngine';
import { getPlayerName, setPlayerName } from '../utils/storage';

export default function Header({ activeTab, setActiveTab, openLeaderboard, openAchievements, openShortcuts }) {
  const [muted, setMuted] = useState(false);
  const [bgmOn, setBgmOn] = useState(false);
  const [name, setName] = useState(getPlayerName());
  const [isEditingName, setIsEditingName] = useState(false);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
  };

  const toggleMusic = () => {
    const isMusicOn = sound.toggleBgm();
    setBgmOn(isMusicOn);
  };

  const handleNameSave = () => {
    setPlayerName(name);
    setIsEditingName(false);
  };

  return (
    <header className="arcade-header">
      <div className="header-container">
        <div className="brand" onClick={() => setActiveTab('catalog')}>
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            <span className="brand-primary">GAME</span>
            <span className="brand-accent">FORGE</span>
            <span className="brand-badge">ARCADE</span>
          </div>
        </div>

        <nav className="arcade-nav">
          <button
            className={`nav-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => {
              sound.playSound('bounce');
              setActiveTab('catalog');
            }}
          >
            🕹️ Catalog
          </button>
          <button
            className="nav-btn"
            onClick={() => {
              sound.playSound('bounce');
              openLeaderboard();
            }}
          >
            🏆 Leaderboards
          </button>
          <button
            className="nav-btn"
            onClick={() => {
              sound.playSound('bounce');
              openAchievements();
            }}
          >
            🎖️ Badges
          </button>
          {openShortcuts && (
            <button
              className="nav-btn"
              onClick={() => {
                sound.playSound('bounce');
                openShortcuts();
              }}
            >
              ⌨️ Controls
            </button>
          )}
        </nav>


        <div className="header-controls">
          <div className="player-badge">
            {isEditingName ? (
              <div className="name-edit-form">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={12}
                  className="name-input"
                  autoFocus
                />
                <button className="save-name-btn" onClick={handleNameSave}>✓</button>
              </div>
            ) : (
              <div className="name-display" onClick={() => setIsEditingName(true)} title="Click to change player tag">
                <span className="player-icon">👤</span>
                <span className="player-name">{name}</span>
                <span className="edit-hint">✏️</span>
              </div>
            )}
          </div>

          <button
            className={`audio-btn ${bgmOn ? 'on' : 'off'}`}
            onClick={toggleMusic}
            title="Toggle Arcade Music"
          >
            🎵 {bgmOn ? 'BGM ON' : 'BGM OFF'}
          </button>

          <button
            className={`audio-btn ${muted ? 'off' : 'on'}`}
            onClick={toggleSound}
            title="Toggle Sound Effects"
          >
            {muted ? '🔇 MUTE' : '🔊 SFX ON'}
          </button>
        </div>
      </div>
    </header>
  );
}
