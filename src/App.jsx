import { useState } from 'react';
import Header from './components/Header';
import GameCatalog from './components/GameCatalog';
import LeaderboardModal from './components/LeaderboardModal';
import AchievementsModal from './components/AchievementsModal';

import CosmicDefender from './components/games/CosmicDefender';
import NeonBreaker from './components/games/NeonBreaker';
import CyberRunner from './components/games/CyberRunner';
import RetroSnake from './components/games/RetroSnake';

import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, cosmic, breaker, runner, snake
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <div className="gameforge-app">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLeaderboard={() => setShowLeaderboard(true)}
        openAchievements={() => setShowAchievements(true)}
      />

      <main className="main-content">
        {activeTab === 'catalog' && (
          <GameCatalog onSelectGame={(gameId) => setActiveTab(gameId)} />
        )}

        {activeTab === 'cosmic' && (
          <CosmicDefender onBack={() => setActiveTab('catalog')} />
        )}

        {activeTab === 'breaker' && (
          <NeonBreaker onBack={() => setActiveTab('catalog')} />
        )}

        {activeTab === 'runner' && (
          <CyberRunner onBack={() => setActiveTab('catalog')} />
        )}

        {activeTab === 'snake' && (
          <RetroSnake onBack={() => setActiveTab('catalog')} />
        )}
      </main>

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showAchievements && (
        <AchievementsModal onClose={() => setShowAchievements(false)} />
      )}

      <footer className="arcade-footer">
        <p>⚡ <strong>GAMEFORGE ARCADE</strong> • Built with HTML5 Canvas & React • 100% Offline Client-Side</p>
      </footer>
    </div>
  );
}
