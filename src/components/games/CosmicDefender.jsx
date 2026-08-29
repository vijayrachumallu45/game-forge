import { useEffect, useRef, useState } from 'react';
import { sound } from '../../utils/soundEngine';
import { saveHighScore, checkAchievement } from '../../utils/storage';
import TouchControls from '../TouchControls';

export default function CosmicDefender({ onBack }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameover
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [shield, setShield] = useState(100);
  const [isHighScore, setIsHighScore] = useState(false);
  const [powerupActive, setPowerupActive] = useState(null);

  // References for game loop state
  const stateRef = useRef({
    keys: {},
    player: { x: 400, y: 500, width: 44, height: 44, speed: 6, shield: 100, weaponType: 'single', weaponTimer: 0 },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    powerups: [],
    particles: [],
    stars: [],
    score: 0,
    wave: 1,
    lives: 3,
    spawnTimer: 0,
    boss: null,
    shake: 0
  });

  useEffect(() => {
    // Generate initial starfield
    const stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random()
      });
    }
    stateRef.current.stars = stars;
  }, []);

  const startGame = () => {
    stateRef.current = {
      keys: {},
      player: { x: 380, y: 500, width: 44, height: 44, speed: 6, shield: 100, weaponType: 'single', weaponTimer: 0 },
      bullets: [],
      enemyBullets: [],
      enemies: [],
      powerups: [],
      particles: [],
      stars: stateRef.current.stars,
      score: 0,
      wave: 1,
      lives: 3,
      spawnTimer: 0,
      boss: null,
      shake: 0
    };

    setScore(0);
    setWave(1);
    setLives(3);
    setShield(100);
    setIsHighScore(false);
    setGameState('playing');
    sound.playSound('powerup');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
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

  // Touch Controller Listeners
  const handleTouchDirection = (dir, active) => {
    const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
    if (keyMap[dir]) {
      stateRef.current.keys[keyMap[dir]] = active;
    }
  };

  const handleTouchAction = (active) => {
    stateRef.current.keys['Space'] = active;
  };

  // Main Canvas Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spawnEnemyWave = (s) => {
      if (s.boss || s.enemies.length > 10 + s.wave * 2) return;

      // Boss Wave every 5 waves
      if (s.wave % 5 === 0 && !s.boss && s.enemies.length === 0) {
        s.boss = {
          x: 300,
          y: -100,
          targetY: 80,
          width: 200,
          height: 100,
          hp: 100 + s.wave * 30,
          maxHp: 100 + s.wave * 30,
          shootTimer: 0,
          dir: 1
        };
        sound.playSound('explosion');
        return;
      }

      s.spawnTimer++;
      if (s.spawnTimer > Math.max(20, 70 - s.wave * 5)) {
        s.spawnTimer = 0;
        const types = ['scout', 'fighter'];
        if (s.wave >= 2) types.push('dreadnought');
        const type = types[Math.floor(Math.random() * types.length)];

        let width = 36, height = 36, hp = 1, speed = 3;
        if (type === 'fighter') { width = 44; height = 44; hp = 2; speed = 2.5; }
        if (type === 'dreadnought') { width = 56; height = 56; hp = 5; speed = 1.5; }

        s.enemies.push({
          x: Math.random() * (canvas.width - width),
          y: -height,
          type,
          width,
          height,
          hp,
          maxHp: hp,
          speed,
          shootTimer: Math.random() * 60,
          angle: 0
        });
      }
    };

    const addParticles = (x, y, color, count = 10) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          size: Math.random() * 4 + 1,
          color,
          alpha: 1,
          life: 0.03 + Math.random() * 0.03
        });
      }
    };

    const loop = () => {
      const s = stateRef.current;

      // Handle Screen Shake
      let offsetX = 0, offsetY = 0;
      if (s.shake > 0) {
        offsetX = (Math.random() - 0.5) * s.shake;
        offsetY = (Math.random() - 0.5) * s.shake;
        s.shake *= 0.9;
        if (s.shake < 0.5) s.shake = 0;
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Background Starfield
      ctx.fillStyle = '#0a0a18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      s.stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.globalAlpha = star.opacity;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1;

      // Player Movement
      const p = s.player;
      if ((s.keys['ArrowLeft'] || s.keys['KeyA']) && p.x > 0) p.x -= p.speed;
      if ((s.keys['ArrowRight'] || s.keys['KeyD']) && p.x < canvas.width - p.width) p.x += p.speed;
      if ((s.keys['ArrowUp'] || s.keys['KeyW']) && p.y > 0) p.y -= p.speed;
      if ((s.keys['ArrowDown'] || s.keys['KeyS']) && p.y < canvas.height - p.height) p.y += p.speed;

      // Weapon Timer
      if (p.weaponTimer > 0) {
        p.weaponTimer--;
        if (p.weaponTimer === 0) p.weaponType = 'single';
      }

      // Player Shooting
      if (s.keys['Space']) {
        if (!p.lastShot || Date.now() - p.lastShot > 150) {
          p.lastShot = Date.now();
          sound.playSound('shoot');

          if (p.weaponType === 'triple') {
            s.bullets.push(
              { x: p.x + p.width / 2 - 3, y: p.y, vx: 0, vy: -10, color: '#00ffff' },
              { x: p.x + 5, y: p.y + 10, vx: -2, vy: -9, color: '#00ffff' },
              { x: p.x + p.width - 11, y: p.y + 10, vx: 2, vy: -9, color: '#00ffff' }
            );
          } else {
            s.bullets.push({
              x: p.x + p.width / 2 - 3,
              y: p.y,
              vx: 0,
              vy: -10,
              color: '#00ffff'
            });
          }
        }
      }

      // Draw Player Ship (Neon Cyber Starfighter)
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';
      ctx.fillStyle = '#00f0ff';

      // Wings & Body
      ctx.beginPath();
      ctx.moveTo(p.x + p.width / 2, p.y);
      ctx.lineTo(p.x + p.width, p.y + p.height);
      ctx.lineTo(p.x + p.width / 2, p.y + p.height - 10);
      ctx.lineTo(p.x, p.y + p.height);
      ctx.closePath();
      ctx.fill();

      // Engine Thruster Glow
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(p.x + p.width / 2 - 6, p.y + p.height - 5, 12, 8 + Math.random() * 6);
      ctx.shadowBlur = 0;

      // Draw Shield Aura if active
      if (p.shield > 0) {
        ctx.strokeStyle = `rgba(0, 240, 255, ${p.shield / 100})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Move & Draw Player Bullets
      s.bullets.forEach((b, index) => {
        b.x += b.vx;
        b.y += b.vy;

        ctx.fillStyle = b.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.fillRect(b.x, b.y, 6, 14);

        if (b.y < -20 || b.x < 0 || b.x > canvas.width) {
          s.bullets.splice(index, 1);
        }
      });
      ctx.shadowBlur = 0;

      // Enemy Spawning & Logic
      spawnEnemyWave(s);

      // Boss Logic
      if (s.boss) {
        const b = s.boss;
        if (b.y < b.targetY) b.y += 2;
        else {
          b.x += 3 * b.dir;
          if (b.x <= 50 || b.x + b.width >= canvas.width - 50) b.dir *= -1;

          // Boss Attacks
          b.shootTimer++;
          if (b.shootTimer > 40) {
            b.shootTimer = 0;
            sound.playSound('laser');
            s.enemyBullets.push(
              { x: b.x + 30, y: b.y + b.height, vx: -2, vy: 5, color: '#ff0055' },
              { x: b.x + b.width / 2, y: b.y + b.height, vx: 0, vy: 6, color: '#ff0055' },
              { x: b.x + b.width - 30, y: b.y + b.height, vx: 2, vy: 5, color: '#ff0055' }
            );
          }
        }

        // Draw Boss
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0055';
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Boss Health Bar
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(200, 20, 400, 14);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(200, 20, (b.hp / b.maxHp) * 400, 14);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(200, 20, 400, 14);

        // Boss Bullets Hit Player
        s.bullets.forEach((bullet, bIdx) => {
          if (
            bullet.x > b.x &&
            bullet.x < b.x + b.width &&
            bullet.y > b.y &&
            bullet.y < b.y + b.height
          ) {
            s.bullets.splice(bIdx, 1);
            b.hp -= 1;
            addParticles(bullet.x, bullet.y, '#ff0055', 4);
            sound.playSound('hit');

            if (b.hp <= 0) {
              addParticles(b.x + b.width / 2, b.y + b.height / 2, '#ff0055', 50);
              s.shake = 15;
              sound.playSound('explosion');
              s.score += 2500;
              s.wave += 1;
              setWave(s.wave);
              setScore(s.score);
              checkAchievement('cosmic_boss');
              s.boss = null;
            }
          }
        });
      }

      // Regular Enemies Logic
      s.enemies.forEach((e, eIdx) => {
        e.y += e.speed;

        // Enemy Shooting
        e.shootTimer++;
        if (e.shootTimer > 90) {
          e.shootTimer = 0;
          if (e.type === 'fighter' || e.type === 'dreadnought') {
            s.enemyBullets.push({
              x: e.x + e.width / 2,
              y: e.y + e.height,
              vx: 0,
              vy: 4.5,
              color: '#ff3300'
            });
          }
        }

        // Draw Enemy Ships
        ctx.fillStyle = e.type === 'scout' ? '#ffbb00' : e.type === 'fighter' ? '#ff0055' : '#aa00ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.fillStyle;

        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + e.width, e.y);
        ctx.lineTo(e.x + e.width / 2, e.y + e.height);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;

        // Player Bullets hitting Enemy
        s.bullets.forEach((b, bIdx) => {
          if (
            b.x > e.x &&
            b.x < e.x + e.width &&
            b.y > e.y &&
            b.y < e.y + e.height
          ) {
            s.bullets.splice(bIdx, 1);
            e.hp -= 1;
            addParticles(b.x, b.y, '#ffff00', 5);
            sound.playSound('hit');

            if (e.hp <= 0) {
              addParticles(e.x + e.width / 2, e.y + e.height / 2, '#ffaa00', 15);
              sound.playSound('explosion');
              s.enemies.splice(eIdx, 1);
              s.score += e.type === 'scout' ? 100 : e.type === 'fighter' ? 250 : 500;
              setScore(s.score);

              // Chance to drop powerup
              if (Math.random() < 0.2) {
                const types = ['triple', 'shield', 'nuke'];
                s.powerups.push({
                  x: e.x + e.width / 2,
                  y: e.y + e.height / 2,
                  type: types[Math.floor(Math.random() * types.length)],
                  vy: 2
                });
              }
            }
          }
        });

        // Enemy Colliding with Player
        if (
          p.x < e.x + e.width &&
          p.x + p.width > e.x &&
          p.y < e.y + e.height &&
          p.y + p.height > e.y
        ) {
          s.enemies.splice(eIdx, 1);
          addParticles(p.x + p.width / 2, p.y + p.height / 2, '#ff0000', 20);
          s.shake = 10;
          sound.playSound('explosion');

          if (p.shield > 0) {
            p.shield = Math.max(0, p.shield - 40);
          } else {
            s.lives -= 1;
            setLives(s.lives);
            if (s.lives <= 0) triggerGameOver();
          }
          setShield(p.shield);
        }

        if (e.y > canvas.height + 50) {
          s.enemies.splice(eIdx, 1);
        }
      });

      // Enemy Bullets Logic
      s.enemyBullets.forEach((eb, ebIdx) => {
        eb.x += eb.vx;
        eb.y += eb.vy;

        ctx.fillStyle = eb.color;
        ctx.fillRect(eb.x, eb.y, 5, 10);

        // Enemy bullet hits player
        if (
          eb.x > p.x &&
          eb.x < p.x + p.width &&
          eb.y > p.y &&
          eb.y < p.y + p.height
        ) {
          s.enemyBullets.splice(ebIdx, 1);
          sound.playSound('hit');
          addParticles(eb.x, eb.y, '#ff0000', 6);

          if (p.shield > 0) {
            p.shield = Math.max(0, p.shield - 20);
          } else {
            s.lives -= 1;
            setLives(s.lives);
            if (s.lives <= 0) triggerGameOver();
          }
          setShield(p.shield);
        }

        if (eb.y > canvas.height + 20) {
          s.enemyBullets.splice(ebIdx, 1);
        }
      });

      // Powerups Logic
      s.powerups.forEach((pow, powIdx) => {
        pow.y += pow.vy;

        ctx.fillStyle = pow.type === 'triple' ? '#00ffff' : pow.type === 'shield' ? '#00ff66' : '#ffaa00';
        ctx.font = '20px sans-serif';
        ctx.fillText(pow.type === 'triple' ? '⚡' : pow.type === 'shield' ? '🛡️' : '💣', pow.x, pow.y);

        if (
          pow.x > p.x - 10 &&
          pow.x < p.x + p.width + 10 &&
          pow.y > p.y - 10 &&
          pow.y < p.y + p.height + 10
        ) {
          s.powerups.splice(powIdx, 1);
          sound.playSound('powerup');

          if (pow.type === 'triple') {
            p.weaponType = 'triple';
            p.weaponTimer = 300; // 5 seconds
            setPowerupActive('TRIPLE LASER (5s)');
            setTimeout(() => setPowerupActive(null), 5000);
          } else if (pow.type === 'shield') {
            p.shield = Math.min(100, p.shield + 50);
            setShield(p.shield);
          } else if (pow.type === 'nuke') {
            s.enemies.forEach((e) => addParticles(e.x, e.y, '#ffbb00', 10));
            s.enemies = [];
            s.enemyBullets = [];
            s.shake = 12;
            sound.playSound('explosion');
            s.score += 500;
            setScore(s.score);
          }
        }

        if (pow.y > canvas.height + 20) s.powerups.splice(powIdx, 1);
      });

      // Particles Logic
      s.particles.forEach((part, partIdx) => {
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= part.life;

        if (part.alpha <= 0) {
          s.particles.splice(partIdx, 1);
        } else {
          ctx.fillStyle = part.color;
          ctx.globalAlpha = part.alpha;
          ctx.fillRect(part.x, part.y, part.size, part.size);
        }
      });
      ctx.globalAlpha = 1;

      ctx.restore();

      // Check wave progression
      if (s.enemies.length === 0 && !s.boss && s.spawnTimer > 40) {
        s.wave += 1;
        setWave(s.wave);
      }

      animId = requestAnimationFrame(loop);
    };

    const triggerGameOver = () => {
      sound.playSound('gameover');
      const isRecord = saveHighScore('cosmic', stateRef.current.score);
      setIsHighScore(isRecord);
      setGameState('gameover');
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="game-container">
      <div className="game-hud">
        <button className="back-btn" onClick={onBack}>◀ CATALOG</button>
        <div className="hud-stat">SCORE: <span>{score.toLocaleString()}</span></div>
        <div className="hud-stat">WAVE: <span>{wave}</span></div>
        <div className="hud-stat">LIVES: <span>{'❤️'.repeat(Math.max(0, lives))}</span></div>
        <div className="hud-stat">SHIELD: <span style={{ color: shield > 30 ? '#00f0ff' : '#ff0055' }}>{shield}%</span></div>
        <button className="pause-btn" onClick={() => setGameState(gameState === 'playing' ? 'paused' : 'playing')}>
          {gameState === 'paused' ? 'RESUME' : 'PAUSE'}
        </button>
      </div>

      {powerupActive && <div className="powerup-banner">{powerupActive}</div>}

      <div className="canvas-wrapper">
        <canvas ref={canvasRef} width={800} height={600} className="game-canvas" />

        {gameState === 'menu' && (
          <div className="canvas-overlay">
            <h1>🚀 COSMIC DEFENDER</h1>
            <p>Command your starfighter and save the galaxy from alien waves!</p>
            <div className="controls-hint">
              <span>⌨️ WASD / Arrows to Move</span>
              <span>⚡ SPACE to Fire Lasers</span>
            </div>
            <button className="start-game-btn" onClick={startGame}>START MISSION ▶</button>
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
            <h1>💀 MISSION FAILED</h1>
            <p>FINAL SCORE: <strong>{score.toLocaleString()}</strong> (WAVE {wave})</p>
            {isHighScore && <div className="new-record-badge">🎉 NEW HIGH SCORE RECORD!</div>}
            <button className="start-game-btn" onClick={startGame}>RETRY MISSION 🔄</button>
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
