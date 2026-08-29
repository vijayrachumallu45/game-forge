import { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/soundEngine';
import { saveHighScore, checkAchievement } from '../../utils/storage';
import TouchControls from '../TouchControls';

export default function NeonBreaker({ onBack }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameover, win
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isHighScore, setIsHighScore] = useState(false);

  const stateRef = useRef({
    keys: {},
    paddle: { x: 350, y: 550, width: 100, height: 16, speed: 8, laserTimer: 0 },
    balls: [{ x: 400, y: 530, vx: 4, vy: -5, radius: 8, active: true }],
    bricks: [],
    powerups: [],
    lasers: [],
    particles: [],
    score: 0,
    lives: 3,
    level: 1
  });

  const createLevel = (lvl) => {
    const bricks = [];
    const rows = 5 + Math.min(lvl, 3);
    const cols = 9;
    const brickWidth = 74;
    const brickHeight = 24;
    const padding = 10;
    const offsetLeft = 25;
    const offsetTop = 50;

    const colors = ['#00f0ff', '#ff007f', '#00ff66', '#ffbb00', '#aa00ff'];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let type = 'normal';
        let hp = 1;
        if (r === 0 && Math.random() < 0.3) { type = 'tnt'; hp = 1; }
        else if (r === 1 && Math.random() < 0.4) { type = 'hard'; hp = 2; }

        bricks.push({
          x: offsetLeft + c * (brickWidth + padding),
          y: offsetTop + r * (brickHeight + padding),
          width: brickWidth,
          height: brickHeight,
          type,
          hp,
          maxHp: hp,
          color: type === 'tnt' ? '#ff0033' : colors[r % colors.length]
        });
      }
    }
    return bricks;
  };

  const startGame = () => {
    stateRef.current = {
      keys: {},
      paddle: { x: 350, y: 550, width: 100, height: 16, speed: 8, laserTimer: 0 },
      balls: [{ x: 400, y: 530, vx: (Math.random() > 0.5 ? 4 : -4), vy: -5, radius: 8, active: true }],
      bricks: createLevel(1),
      powerups: [],
      lasers: [],
      particles: [],
      score: 0,
      lives: 3,
      level: 1
    };

    setScore(0);
    setLives(3);
    setLevel(1);
    setIsHighScore(false);
    setGameState('playing');
    sound.playSound('powerup');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      stateRef.current.keys[e.code] = true;

      if (e.code === 'KeyP' && (gameState === 'playing' || gameState === 'paused')) {
        setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };

    const handleKeyUp = (e) => {
      stateRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const handleTouchDirection = (dir, active) => {
    if (dir === 'left') stateRef.current.keys['ArrowLeft'] = active;
    if (dir === 'right') stateRef.current.keys['ArrowRight'] = active;
  };

  const handleTouchAction = (active) => {
    stateRef.current.keys['Space'] = active;
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const addParticles = (x, y, color, count = 8) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 4 + 1,
          color,
          alpha: 1,
          life: 0.04
        });
      }
    };

    const triggerTntExplosion = (brick) => {
      sound.playSound('explosion');
      addParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, '#ff0000', 30);

      stateRef.current.bricks.forEach((b) => {
        if (
          Math.abs(b.x - brick.x) <= brick.width + 15 &&
          Math.abs(b.y - brick.y) <= brick.height + 15
        ) {
          b.hp = 0;
          addParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 10);
        }
      });
    };

    const loop = () => {
      const s = stateRef.current;

      ctx.fillStyle = '#0a0a16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Move Paddle
      const p = s.paddle;
      if ((s.keys['ArrowLeft'] || s.keys['KeyA']) && p.x > 0) p.x -= p.speed;
      if ((s.keys['ArrowRight'] || s.keys['KeyD']) && p.x < canvas.width - p.width) p.x += p.speed;

      // Mouse Move Paddle support
      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        p.x = Math.max(0, Math.min(canvas.width - p.width, mouseX - p.width / 2));
      };
      canvas.onmousemove = handleMouseMove;

      // Paddle Lasers
      if (p.laserTimer > 0) {
        p.laserTimer--;
        if (s.keys['Space'] && Math.random() < 0.2) {
          sound.playSound('laser');
          s.lasers.push(
            { x: p.x + 10, y: p.y, vy: -10 },
            { x: p.x + p.width - 10, y: p.y, vy: -10 }
          );
        }
      }

      // Move & Draw Lasers
      s.lasers.forEach((l, lIdx) => {
        l.y += l.vy;
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(l.x - 2, l.y, 4, 12);

        s.bricks.forEach((b) => {
          if (b.hp > 0 && l.x > b.x && l.x < b.x + b.width && l.y > b.y && l.y < b.y + b.height) {
            b.hp--;
            s.lasers.splice(lIdx, 1);
            addParticles(l.x, l.y, '#ff0055', 4);
            sound.playSound('hit');
            if (b.hp <= 0) {
              s.score += 150;
              setScore(s.score);
            }
          }
        });

        if (l.y < 0) s.lasers.splice(lIdx, 1);
      });

      // Draw Paddle
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.laserTimer > 0 ? '#ff0055' : '#00f0ff';
      ctx.fillStyle = p.laserTimer > 0 ? '#ff0055' : '#00f0ff';
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.shadowBlur = 0;

      // Move & Draw Balls
      s.balls.forEach((ball) => {
        if (!ball.active) return;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall Collisions
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.vx *= -1;
          sound.playSound('bounce');
        }
        if (ball.y - ball.radius < 0) {
          ball.vy *= -1;
          sound.playSound('bounce');
        }

        // Paddle Collision with curve calculation
        if (
          ball.y + ball.radius >= p.y &&
          ball.x >= p.x &&
          ball.x <= p.x + p.width &&
          ball.vy > 0
        ) {
          sound.playSound('bounce');
          const hitPos = (ball.x - (p.x + p.width / 2)) / (p.width / 2);
          ball.vx = hitPos * 7;
          ball.vy = -Math.abs(ball.vy);
        }

        // Brick Collisions
        let hitCount = 0;
        s.bricks.forEach((b) => {
          if (b.hp <= 0) return;

          if (
            ball.x + ball.radius > b.x &&
            ball.x - ball.radius < b.x + b.width &&
            ball.y + ball.radius > b.y &&
            ball.y - ball.radius < b.y + b.height
          ) {
            ball.vy *= -1;
            b.hp--;
            hitCount++;
            addParticles(ball.x, ball.y, b.color, 6);
            sound.playSound('hit');

            if (b.type === 'tnt') {
              triggerTntExplosion(b);
            }

            if (b.hp <= 0) {
              s.score += b.type === 'hard' ? 250 : 100;
              setScore(s.score);

              // Powerup drop chance
              if (Math.random() < 0.15) {
                const types = ['multiball', 'laser', 'wide'];
                s.powerups.push({
                  x: b.x + b.width / 2,
                  y: b.y + b.height / 2,
                  type: types[Math.floor(Math.random() * types.length)],
                  vy: 2.5
                });
              }
            }
          }
        });

        if (hitCount > 0) checkAchievement('breaker_master');

        // Ball falls past bottom
        if (ball.y > canvas.height + 20) {
          ball.active = false;
        }

        // Draw Ball
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Filter active balls
      const activeBalls = s.balls.filter((b) => b.active);
      if (activeBalls.length === 0) {
        s.lives--;
        setLives(s.lives);
        sound.playSound('gameover');

        if (s.lives <= 0) {
          const isRecord = saveHighScore('breaker', s.score);
          setIsHighScore(isRecord);
          setGameState('gameover');
        } else {
          s.balls = [{ x: p.x + p.width / 2, y: p.y - 20, vx: 4, vy: -5, radius: 8, active: true }];
        }
      }

      // Move & Draw Powerups
      s.powerups.forEach((pow, powIdx) => {
        pow.y += pow.vy;
        ctx.font = '20px sans-serif';
        ctx.fillText(pow.type === 'multiball' ? '🥎' : pow.type === 'laser' ? '⚡' : '📏', pow.x, pow.y);

        if (
          pow.x > p.x &&
          pow.x < p.x + p.width &&
          pow.y > p.y &&
          pow.y < p.y + p.height + 15
        ) {
          s.powerups.splice(powIdx, 1);
          sound.playSound('powerup');

          if (pow.type === 'multiball') {
            s.balls.push(
              { x: p.x + p.width / 2, y: p.y - 15, vx: -5, vy: -5, radius: 8, active: true },
              { x: p.x + p.width / 2, y: p.y - 15, vx: 5, vy: -5, radius: 8, active: true }
            );
          } else if (pow.type === 'laser') {
            p.laserTimer = 400; // 7 seconds
          } else if (pow.type === 'wide') {
            p.width = 160;
            setTimeout(() => { p.width = 100; }, 8000);
          }
        }
      });

      // Draw Bricks
      let remainingBricks = 0;
      s.bricks.forEach((b) => {
        if (b.hp <= 0) return;
        remainingBricks++;

        ctx.fillStyle = b.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);

        if (b.type === 'hard' && b.hp === 2) {
          ctx.strokeStyle = '#ffffff';
          ctx.strokeRect(b.x + 2, b.y + 2, b.width - 4, b.height - 4);
        }

        if (b.type === 'tnt') {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.fillText('TNT', b.x + 24, b.y + 16);
        }
      });
      ctx.shadowBlur = 0;

      // Check level cleared
      if (remainingBricks === 0) {
        sound.playSound('powerup');
        s.level++;
        setLevel(s.level);
        s.bricks = createLevel(s.level);
        s.balls = [{ x: p.x + p.width / 2, y: p.y - 20, vx: 4 + s.level, vy: -(5 + s.level), radius: 8, active: true }];
      }

      // Particles
      s.particles.forEach((part, idx) => {
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= part.life;
        if (part.alpha <= 0) s.particles.splice(idx, 1);
        else {
          ctx.fillStyle = part.color;
          ctx.globalAlpha = part.alpha;
          ctx.fillRect(part.x, part.y, part.size, part.size);
        }
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="game-container">
      <div className="game-hud">
        <button className="back-btn" onClick={onBack}>◀ CATALOG</button>
        <div className="hud-stat">SCORE: <span>{score.toLocaleString()}</span></div>
        <div className="hud-stat">LEVEL: <span>{level}</span></div>
        <div className="hud-stat">LIVES: <span>{'❤️'.repeat(Math.max(0, lives))}</span></div>
        <button className="pause-btn" onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}>
          {gameState === 'paused' ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={800} height={600} className="game-canvas" />

        {gameState === 'menu' && (
          <div className="canvas-overlay">
            <h1>🧱 NEON BREAKER</h1>
            <p>Demolish high-tech cyber brick walls with energy sphere physics!</p>
            <div className="controls-hint">
              <span>🖱️ Mouse or AD / Arrows to Move Paddle</span>
              <span>⚡ SPACE to Fire Lasers (when powered up)</span>
            </div>
            <button className="start-game-btn" onClick={startGame}>START DEMOLITION ▶</button>
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
            <h1>💀 PADDLE DESTROYED</h1>
            <p>FINAL SCORE: <strong>{score.toLocaleString()}</strong> (LEVEL {level})</p>
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
