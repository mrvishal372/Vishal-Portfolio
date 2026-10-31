import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { GameShell } from './shared/GameShell';
import { playShoot, playExplosion, playGameOver } from './shared/soundEngine';

interface Props {
  onBack: () => void;
}

export const SpaceShooter: React.FC<Props> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const gameState = useRef({
    player: { x: 150, y: 350, width: 30, height: 30, speed: 5 },
    projectiles: [] as {x: number, y: number, speed: number}[],
    enemies: [] as {x: number, y: number, width: number, height: number, speed: number}[],
    particles: [] as {x: number, y: number, vx: number, vy: number, life: number, color: string}[],
    keys: {} as Record<string, boolean>,
    frames: 0,
    animationId: 0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vishal_shooter_best');
      if (saved) setBestScore(parseInt(saved, 10));
    } catch(e){}
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      player: { x: 150, y: 350, width: 30, height: 30, speed: 5 },
      projectiles: [],
      enemies: [],
      particles: [],
      keys: {},
      frames: 0,
      animationId: gameState.current.animationId
    };
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const shoot = useCallback(() => {
    if (!isPlaying || isPaused || isGameOver) return;
    const state = gameState.current;
    state.projectiles.push({
      x: state.player.x + state.player.width / 2 - 2,
      y: state.player.y,
      speed: 7
    });
    playShoot();
  }, [isPlaying, isPaused, isGameOver]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const state = gameState.current;
    
    // Background
    ctx.fillStyle = '#020617'; // slate-950
    ctx.fillRect(0, 0, width, height);
    
    // Stars effect
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<20; i++) {
      ctx.fillRect(Math.random() * width, (state.frames + i * 20) % height, 1, 1);
    }

    // Player
    ctx.fillStyle = '#3b82f6'; // blue-500
    ctx.beginPath();
    ctx.moveTo(state.player.x + state.player.width / 2, state.player.y);
    ctx.lineTo(state.player.x + state.player.width, state.player.y + state.player.height);
    ctx.lineTo(state.player.x, state.player.y + state.player.height);
    ctx.closePath();
    ctx.fill();

    // Projectiles
    ctx.fillStyle = '#fbbf24'; // amber-400
    state.projectiles.forEach(p => {
      ctx.fillRect(p.x, p.y, 4, 10);
    });

    // Enemies
    ctx.fillStyle = '#ef4444'; // red-500
    state.enemies.forEach(e => {
      ctx.fillRect(e.x, e.y, e.width, e.height);
    });

    // Particles
    state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1;
    });

  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    const state = gameState.current;
    for(let i=0; i<10; i++) {
      state.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color
      });
    }
  };

  const update = useCallback((width: number, height: number) => {
    const state = gameState.current;
    state.frames++;

    // Player movement
    if (state.keys['ArrowLeft'] || state.keys['a']) {
      state.player.x = Math.max(0, state.player.x - state.player.speed);
    }
    if (state.keys['ArrowRight'] || state.keys['d']) {
      state.player.x = Math.min(width - state.player.width, state.player.x + state.player.speed);
    }

    // Projectiles
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i];
      p.y -= p.speed;
      if (p.y < 0) state.projectiles.splice(i, 1);
    }

    // Enemies spawn
    if (state.frames % (Math.max(20, 60 - Math.floor(score / 5))) === 0) {
      state.enemies.push({
        x: Math.random() * (width - 30),
        y: -30,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 2 + (score / 50)
      });
    }

    // Enemies update
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.y += e.speed;
      
      // Collision with player
      if (
        state.player.x < e.x + e.width &&
        state.player.x + state.player.width > e.x &&
        state.player.y < e.y + e.height &&
        state.player.y + state.player.height > e.y
      ) {
        createExplosion(state.player.x, state.player.y, '#3b82f6');
        return true; // Game Over
      }

      // Off screen
      if (e.y > height) {
        state.enemies.splice(i, 1);
      }
    }

    // Collisions: Projectiles & Enemies
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const p = state.projectiles[i];
        const e = state.enemies[j];
        if (!p || !e) continue;

        if (
          p.x < e.x + e.width &&
          p.x + 4 > e.x &&
          p.y < e.y + e.height &&
          p.y + 10 > e.y
        ) {
          // Hit
          createExplosion(e.x + 15, e.y + 15, '#ef4444');
          playExplosion();
          state.projectiles.splice(i, 1);
          state.enemies.splice(j, 1);
          setScore(s => {
            const newScore = s + 10;
            if (newScore > bestScore) {
              setBestScore(newScore);
              try { localStorage.setItem('vishal_shooter_best', newScore.toString()); } catch(err){}
            }
            return newScore;
          });
          break; // Projectile destroyed
        }
      }
    }

    // Particles update
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    return false;
  }, [score, bestScore]);

  const loop = useCallback(() => {
    const state = gameState.current;
    if (!isPlaying || isPaused || isGameOver) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const gameOver = update(canvas.width, canvas.height);
      if (gameOver) {
        playGameOver();
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx, canvas.width, canvas.height);
    }
    
    state.animationId = requestAnimationFrame(loop);
  }, [isPlaying, isPaused, isGameOver, update, draw]);

  useEffect(() => {
    if (isPlaying && !isPaused && !isGameOver) {
      gameState.current.animationId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(gameState.current.animationId);
  }, [isPlaying, isPaused, isGameOver, loop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameState.current.keys[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (isGameOver) resetGame();
        else if (!isPlaying) setIsPlaying(true);
        else shoot();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.current.keys[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isGameOver, isPaused, resetGame, shoot]);

  return (
    <GameShell
      title="Space Shooter"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onBack={onBack}
      onRestart={resetGame}
      onPauseToggle={setIsPaused}
      instructions="Arrow keys to move, Space to shoot. Tap and drag on mobile."
    >
      <div 
        className="w-full max-w-sm relative bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl mx-auto"
        onPointerMove={(e) => {
          if (!isPlaying || isPaused || isGameOver) return;
          const rect = e.currentTarget.getBoundingClientRect();
          let x = e.clientX - rect.left - 15;
          x = Math.max(0, Math.min(x, rect.width - 30));
          gameState.current.player.x = x * (320 / rect.width);
        }}
        onPointerDown={(e) => {
          if (isGameOver) resetGame();
          else if (!isPlaying) setIsPlaying(true);
          else shoot();
        }}
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={480}
          className="w-full aspect-[2/3] block bg-[#020617] cursor-crosshair"
        />

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-6 text-center pointer-events-none">
            {isGameOver ? (
              <>
                <h3 className="text-4xl font-black text-red-500 mb-2 drop-shadow-md">Game Over</h3>
                <p className="mb-6 font-bold text-2xl drop-shadow-md">Score: {score}</p>
                <div className="px-6 py-3 bg-amber-400 text-slate-900 font-black rounded-xl flex items-center gap-2 shadow-lg">
                  <RotateCcw className="w-5 h-5" /> Tap to Restart
                </div>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-black mb-6 drop-shadow-md">Defend Space</h3>
                <div className="px-6 py-3 bg-blue-500 text-white font-black rounded-xl flex items-center gap-2 shadow-lg animate-pulse">
                  <Play className="w-5 h-5" /> Start Mission
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
};
