import { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/soundEngine';
import { saveHighScore, checkAchievement } from '../../utils/storage';
import TouchControls from '../TouchControls';

export default function RetroSnake({ onBack }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameover
  const [score, setScore] = useState(0);
  const [length, setLength] = useState(3);
  const [wrapWalls, setWrapWalls] = useState(true);
  const [isHighScore, setIsHighScore] = useState(false);

  const stateRef = useRef({
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 10, type: 'standard' },
    score: 0,
    speed: 100, // ms per tick
    turbo: false,
    particles: [],
    wrapWalls: true
  });

  const gridSize = 20; // 800/20 = 40 cols, 600/20 = 30 rows

  const spawnFood = () => {
    const cols = 40;
    const rows = 30;
    let x, y, occupied;

    do {
      x = Math.floor(Math.random() * cols);
      y = Math.floor(Math.random() * rows);
      occupied = stateRef.current.snake.some((seg) => seg.x === x && seg.y === y);
    } while (occupied);

    const rand = Math.random();
    let type = 'standard';
    if (rand < 0.2) type = 'gold';
    else if (rand < 0.35) type = 'freeze';

    stateRef.current.food = { x, y, type };
  };

  const startGame = () => {
    stateRef.current = {
      snake: [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: { x: 15, y: 10, type: 'standard' },
      score: 0,
      speed: 100,
      turbo: false,
      particles: [],
      wrapWalls
    };

    spawnFood();
    setScore(0);
    setLength(3);
    setIsHighScore(false);
    setGameState('playing');
    sound.playSound('powerup');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      const dir = stateRef.current.dir;

      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && dir.y === 0) {
        stateRef.current.nextDir = { x: 0, y: -1 };
      } else if ((e.code === 'ArrowDown' || e.code === 'KeyS') && dir.y === 0) {
        stateRef.current.nextDir = { x: 0, y: 1 };
      } else if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && dir.x === 0) {
        stateRef.current.nextDir = { x: -1, y: 0 };
      } else if ((e.code === 'ArrowRight' || e.code === 'KeyD') && dir.x === 0) {
        stateRef.current.nextDir = { x: 1, y: 0 };
      }

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        stateRef.current.turbo = true;
      }

      if (e.code === 'KeyP' && (gameState === 'playing' || gameState === 'paused')) {
        setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        stateRef.current.turbo = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const handleTouchDirection = (dir) => {
    const current = stateRef.current.dir;
    if (dir === 'up' && current.y === 0) stateRef.current.nextDir = { x: 0, y: -1 };
    if (dir === 'down' && current.y === 0) stateRef.current.nextDir = { x: 0, y: 1 };
    if (dir === 'left' && current.x === 0) stateRef.current.nextDir = { x: -1, y: 0 };
    if (dir === 'right' && current.x === 0) stateRef.current.nextDir = { x: 1, y: 0 };
  };

  const handleTouchAction = (active) => {
    stateRef.current.turbo = active;
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let timerId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const cols = 40;
    const rows = 30;

    const addParticles = (x, y, color, count = 8) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 3 + 1,
          color,
          alpha: 1,
          life: 0.05
        });
      }
    };

    const gameTick = () => {
      const s = stateRef.current;
      s.dir = s.nextDir;

      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

      // Wall Wrapping or Collision
      if (s.wrapWalls) {
        if (head.x < 0) head.x = cols - 1;
        if (head.x >= cols) head.x = 0;
        if (head.y < 0) head.y = rows - 1;
        if (head.y >= rows) head.y = 0;
      } else {
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
          triggerGameOver();
          return;
        }
      }

      // Self Collision
      const selfHit = s.snake.some((seg) => seg.x === head.x && seg.y === head.y);
      if (selfHit) {
        triggerGameOver();
        return;
      }

      s.snake.unshift(head);

      // Check Food Collision
      if (head.x === s.food.x && head.y === s.food.y) {
        sound.playSound('score');
        const pts = s.food.type === 'gold' ? 50 : s.food.type === 'freeze' ? 30 : 10;
        s.score += pts;
        setScore(s.score);
        setLength(s.snake.length);

        if (s.snake.length >= 20) checkAchievement('snake_grower');

        addParticles(head.x * gridSize + 10, head.y * gridSize + 10, s.food.type === 'gold' ? '#ffbb00' : '#00f0ff', 12);
        spawnFood();
      } else {
        s.snake.pop();
      }

      renderCanvas();

      const delay = s.turbo ? 40 : s.speed;
      timerId = setTimeout(gameTick, delay);
    };

    const renderCanvas = () => {
      const s = stateRef.current;

      // Dark Neon Background & Grid lines
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * gridSize, 0);
        ctx.lineTo(c * gridSize, canvas.height);
        ctx.stroke();
      }
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * gridSize);
        ctx.lineTo(canvas.width, r * gridSize);
        ctx.stroke();
      }

      // Render Food
      ctx.shadowBlur = 12;
      const foodColor = s.food.type === 'gold' ? '#ffbb00' : s.food.type === 'freeze' ? '#00f0ff' : '#ff007f';
      ctx.shadowColor = foodColor;
      ctx.fillStyle = foodColor;
      ctx.beginPath();
      ctx.arc(s.food.x * gridSize + 10, s.food.y * gridSize + 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Render Snake Segments
      s.snake.forEach((seg, idx) => {
        ctx.shadowBlur = idx === 0 ? 15 : 6;
        ctx.shadowColor = idx === 0 ? '#00ff66' : '#00b347';
        ctx.fillStyle = idx === 0 ? '#00ff66' : '#00d655';

        ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });
      ctx.shadowBlur = 0;

      // Render Particles
      s.particles.forEach((part, pIdx) => {
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= part.life;
        if (part.alpha <= 0) s.particles.splice(pIdx, 1);
        else {
          ctx.fillStyle = part.color;
          ctx.globalAlpha = part.alpha;
          ctx.fillRect(part.x, part.y, part.size, part.size);
        }
      });
      ctx.globalAlpha = 1;
    };

    const triggerGameOver = () => {
      sound.playSound('gameover');
      const isRecord = saveHighScore('snake', stateRef.current.score);
      setIsHighScore(isRecord);
      setGameState('gameover');
    };

    gameTick();
    return () => clearTimeout(timerId);
  }, [gameState]);

  return (
    <div className="game-container">
      <div className="game-hud">
        <button className="back-btn" onClick={onBack}>◀ CATALOG</button>
        <div className="hud-stat">SCORE: <span>{score.toLocaleString()}</span></div>
        <div className="hud-stat">LENGTH: <span>{length}</span></div>
        <div className="hud-stat">
          MODE:{' '}
          <button className="toggle-mode-btn" onClick={() => setWrapWalls(!wrapWalls)}>
            {wrapWalls ? '🌐 WRAP WALLS' : '🧱 SOLID WALLS'}
          </button>
        </div>
        <button className="pause-btn" onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}>
          {gameState === 'paused' ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={800} height={600} className="game-canvas" />

        {gameState === 'menu' && (
          <div className="canvas-overlay">
            <h1>🐍 RETRO SNAKE 2099</h1>
            <p>Reimagined cyber snake! Consume glowing energy food & activate turbo boost.</p>
            <div className="controls-hint">
              <span>⌨️ WASD / Arrows to Turn</span>
              <span>⚡ SHIFT for Turbo Speed</span>
            </div>
            <button className="start-game-btn" onClick={startGame}>START SLITHER ▶</button>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="canvas-overlay">
            <h1>⏸️ GAME PAUSED</h1>
            <button className="start-game-btn" onClick={() => setGameState('playing')}>RESUME ▶</button>
            <button className="secondary-btn" onClick={onBack}>EXIT TO MENU</button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="canvas-overlay">
            <h1>💀 SNAKE CRASHED</h1>
            <p>FINAL SCORE: <strong>{score.toLocaleString()}</strong> (LENGTH {length})</p>
            {isHighScore && <div className="new-record-badge">🎉 NEW HIGH SCORE RECORD!</div>}
            <button className="start-game-btn" onClick={startGame}>RETRY ▶</button>
            <button className="secondary-btn" onClick={onBack}>CATALOG</button>
          </div>
        )}
      </div>

      <TouchControls
        onDirection={handleTouchDirection}
        onAction={handleTouchAction}
      />
    </div>
  );
}
