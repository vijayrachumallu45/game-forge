import { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/soundEngine';
import { saveHighScore, checkAchievement } from '../../utils/storage';
import TouchControls from '../TouchControls';

export default function CyberRunner({ onBack }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameover
  const [distance, setDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [isHighScore, setIsHighScore] = useState(false);

  const stateRef = useRef({
    keys: {},
    player: {
      x: 120,
      y: 420,
      width: 36,
      height: 54,
      vy: 0,
      groundY: 420,
      isGrounded: true,
      jumpsRemaining: 2,
      isSliding: false,
      slideTimer: 0
    },
    obstacles: [],
    orbs: [],
    particles: [],
    groundTiles: [],
    speed: 6,
    distance: 0,
    score: 0,
    spawnTimer: 0
  });

  const startGame = () => {
    stateRef.current = {
      keys: {},
      player: {
        x: 120,
        y: 420,
        width: 36,
        height: 54,
        vy: 0,
        groundY: 420,
        isGrounded: true,
        jumpsRemaining: 2,
        isSliding: false,
        slideTimer: 0
      },
      obstacles: [],
      orbs: [],
      particles: [],
      speed: 6,
      distance: 0,
      score: 0,
      spawnTimer: 0
    };

    setDistance(0);
    setScore(0);
    setIsHighScore(false);
    setGameState('playing');
    sound.playSound('powerup');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'Space', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
      }

      const p = stateRef.current.player;

      if ((e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') && p.jumpsRemaining > 0) {
        p.vy = -12;
        p.isGrounded = false;
        p.jumpsRemaining--;
        sound.playSound('jump');
      }

      if ((e.code === 'ArrowDown' || e.code === 'KeyS') && p.isGrounded) {
        p.isSliding = true;
        p.slideTimer = 25;
        sound.playSound('bounce');
      }

      if (e.code === 'KeyP' && (gameState === 'playing' || gameState === 'paused')) {
        setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleTouchDirection = (dir, active) => {
    const p = stateRef.current.player;
    if (dir === 'up' && active && p.jumpsRemaining > 0) {
      p.vy = -12;
      p.isGrounded = false;
      p.jumpsRemaining--;
      sound.playSound('jump');
    }
    if (dir === 'down' && active && p.isGrounded) {
      p.isSliding = true;
      p.slideTimer = 25;
      sound.playSound('bounce');
    }
  };

  const handleTouchAction = (active) => {
    const p = stateRef.current.player;
    if (active && p.jumpsRemaining > 0) {
      p.vy = -12;
      p.isGrounded = false;
      p.jumpsRemaining--;
      sound.playSound('jump');
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const addParticles = (x, y, color, count = 6) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 5 - stateRef.current.speed * 0.3,
          vy: (Math.random() - 0.5) * 5,
          size: Math.random() * 3 + 1,
          color,
          alpha: 1,
          life: 0.04
        });
      }
    };

    const loop = () => {
      const s = stateRef.current;

      // Dark Cyberpunk Synthwave Background
      ctx.fillStyle = '#0b0b1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Grid City Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let x = (s.distance * 2) % 40; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width - x, 474);
        ctx.lineTo(canvas.width - x * 1.5, canvas.height);
        ctx.stroke();
      }

      // Draw Ground Floor
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';
      ctx.fillRect(0, 474, canvas.width, 6);
      ctx.fillStyle = '#060614';
      ctx.fillRect(0, 480, canvas.width, canvas.height - 480);
      ctx.shadowBlur = 0;

      // Player Gravity & Jump Physics
      const p = s.player;
      p.vy += 0.65; // Gravity
      p.y += p.vy;

      if (p.y >= p.groundY) {
        p.y = p.groundY;
        p.vy = 0;
        p.isGrounded = true;
        p.jumpsRemaining = 2;
      }

      // Handle Slide Duration
      if (p.isSliding) {
        p.slideTimer--;
        p.height = 28;
        if (p.slideTimer <= 0) {
          p.isSliding = false;
          p.height = 54;
        }
      } else {
        p.height = 54;
      }

      // Draw Cyber Runner Sprite
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff66';
      ctx.fillStyle = '#00ff66';

      const renderY = p.isSliding ? p.y + 26 : p.y;
      ctx.fillRect(p.x, renderY, p.width, p.height);

      // Running particles trail
      if (p.isGrounded) {
        addParticles(p.x, p.y + p.height, '#00ff66', 1);
      }

      // Speed Scaling & Distance Increment
      s.distance += Math.floor(s.speed * 0.2);
      s.score += Math.floor(s.speed * 0.3);
      s.speed = Math.min(14, 6 + s.distance * 0.002);
      setDistance(s.distance);
      setScore(s.score);

      if (s.distance >= 1000) checkAchievement('runner_distance');

      // Obstacle Spawning Logic
      s.spawnTimer++;
      if (s.spawnTimer > Math.max(35, 90 - s.speed * 4)) {
        s.spawnTimer = 0;
        const rand = Math.random();

        if (rand < 0.4) {
          // Low Barrier Spike (Jump over)
          s.obstacles.push({ x: canvas.width, y: 434, width: 30, height: 40, type: 'spike', color: '#ff0055' });
        } else if (rand < 0.7) {
          // High Flying Laser (Slide under)
          s.obstacles.push({ x: canvas.width, y: 360, width: 60, height: 45, type: 'laser', color: '#ff00aa' });
        } else {
          // Double Obstacle
          s.obstacles.push({ x: canvas.width, y: 424, width: 40, height: 50, type: 'block', color: '#ffbb00' });
        }

        // Spawn Energy Orbs in air
        if (Math.random() < 0.6) {
          s.orbs.push({
            x: canvas.width + 100,
            y: 340 - Math.random() * 80,
            radius: 10,
            collected: false
          });
        }
      }

      // Move & Draw Obstacles
      s.obstacles.forEach((obs, obsIdx) => {
        obs.x -= s.speed;

        ctx.shadowBlur = 10;
        ctx.shadowColor = obs.color;
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Check Collision with Player
        const pY = renderY;
        if (
          p.x < obs.x + obs.width &&
          p.x + p.width > obs.x &&
          pY < obs.y + obs.height &&
          pY + p.height > obs.y
        ) {
          sound.playSound('explosion');
          addParticles(p.x, pY, '#ff0000', 30);
          const isRecord = saveHighScore('runner', s.score);
          setIsHighScore(isRecord);
          setGameState('gameover');
        }

        if (obs.x < -100) s.obstacles.splice(obsIdx, 1);
      });

      // Move & Draw Energy Orbs
      s.orbs.forEach((orb, orbIdx) => {
        orb.x -= s.speed;

        if (!orb.collected) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00f0ff';
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();

          // Collect Orb
          const pY = renderY;
          if (
            p.x < orb.x + orb.radius &&
            p.x + p.width > orb.x - orb.radius &&
            pY < orb.y + orb.radius &&
            pY + p.height > orb.y - orb.radius
          ) {
            orb.collected = true;
            sound.playSound('score');
            s.score += 250;
            addParticles(orb.x, orb.y, '#00f0ff', 8);
          }
        }

        if (orb.x < -50) s.orbs.splice(orbIdx, 1);
      });

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
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="game-container">
      <div className="game-hud">
        <button className="back-btn" onClick={onBack}>◀ CATALOG</button>
        <div className="hud-stat">DISTANCE: <span>{distance}m</span></div>
        <div className="hud-stat">SCORE: <span>{score.toLocaleString()}</span></div>
        <button className="pause-btn" onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}>
          {gameState === 'paused' ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={800} height={600} className="game-canvas" />

        {gameState === 'menu' && (
          <div className="canvas-overlay">
            <h1>🏃 CYBER RUNNER</h1>
            <p>Dash through neon skyscrapers! Double jump & slide past security barriers.</p>
            <div className="controls-hint">
              <span>🚀 UP / SPACE to Jump (Double Jump!)</span>
              <span>⚡ DOWN / S to Slide Dash</span>
            </div>
            <button className="start-game-btn" onClick={startGame}>START SPRINT ▶</button>
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
            <h1>💀 CRASHED!</h1>
            <p>DISTANCE SURVIVED: <strong>{distance}m</strong> (SCORE {score.toLocaleString()})</p>
            {isHighScore && <div className="new-record-badge">🎉 NEW HIGH SCORE RECORD!</div>}
            <button className="start-game-btn" onClick={startGame}>TRY AGAIN ▶</button>
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
