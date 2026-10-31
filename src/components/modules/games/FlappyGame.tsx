import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { GameShell } from './shared/GameShell';
import { playJump, playGameOver, playPop } from './shared/soundEngine';
import { loadGameSettings, subscribeToGameSettings, BaseGameSettings } from '../../../lib/gameSettingsStorage';

interface Props {
  onBack: () => void;
}

export const FlappyGame: React.FC<Props> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const settingsRef = useRef<BaseGameSettings>(loadGameSettings('flappy'));

  // Subscribe to real-time settings updates
  useEffect(() => {
    const unsub = subscribeToGameSettings('flappy', (newSettings) => {
      settingsRef.current = newSettings;
    });
    return () => unsub();
  }, []);

  const gameState = useRef({
    bird: { y: 200, velocity: 0, radius: 12 },
    pipes: [] as {x: number, topHeight: number, passed: boolean}[],
    frames: 0,
    animationId: 0,
    lastTime: 0
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vishal_flappy_best');
      if (saved) setBestScore(parseInt(saved, 10));
    } catch(e){}
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      bird: { y: 200, velocity: 0, radius: 12 },
      pipes: [],
      frames: 0,
      animationId: gameState.current.animationId,
      lastTime: performance.now()
    };
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const PIPE_WIDTH = 50;

  const flap = useCallback(() => {
    if (!isPlaying || isPaused || isGameOver) return;
    const impulse = settingsRef.current.jumpImpulse || -8;
    gameState.current.bird.velocity = impulse;
    if (settingsRef.current.soundEnabled) playJump();
  }, [isPlaying, isPaused, isGameOver]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const state = gameState.current;
    const pipeGap = settingsRef.current.pipeGap || 150;
    
    // Background
    ctx.fillStyle = '#38bdf8'; // Sky blue
    ctx.fillRect(0, 0, width, height);
    
    // Ground
    ctx.fillStyle = '#22c55e'; // Green
    ctx.fillRect(0, height - 20, width, 20);

    // Pipes
    ctx.fillStyle = '#16a34a';
    state.pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, PIPE_WIDTH, height - pipe.topHeight - pipeGap - 20);
    });

    // Bird
    ctx.fillStyle = '#facc15'; // Yellow
    ctx.beginPath();
    ctx.arc(100, state.bird.y, state.bird.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  const update = useCallback((width: number, height: number) => {
    const state = gameState.current;
    const pipeGap = settingsRef.current.pipeGap || 150;
    const gravity = settingsRef.current.speed === 'slow' ? 0.38 : settingsRef.current.speed === 'fast' ? 0.65 : settingsRef.current.speed === 'extreme' ? 0.85 : 0.5;
    const pipeSpeed = settingsRef.current.speed === 'slow' ? 2 : settingsRef.current.speed === 'fast' ? 4 : settingsRef.current.speed === 'extreme' ? 5.5 : 3;
    
    // Bird physics
    state.bird.velocity += gravity;
    state.bird.y += state.bird.velocity;
    
    // Floor/Ceiling collision
    if (state.bird.y + state.bird.radius >= height - 20 || state.bird.y - state.bird.radius <= 0) {
      if (settingsRef.current.soundEnabled) playGameOver();
      return true; // Game over
    }

    // Pipe generation
    state.frames++;
    if (state.frames % 100 === 0) {
      const minPipeHeight = 50;
      const maxPipeHeight = height - 20 - pipeGap - minPipeHeight;
      const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);
      state.pipes.push({ x: width, topHeight, passed: false });
    }

    // Pipe movement and collision
    for (let i = 0; i < state.pipes.length; i++) {
      const pipe = state.pipes[i];
      pipe.x -= pipeSpeed;
      
      // Collision
      const birdX = 100;
      if (
        birdX + state.bird.radius > pipe.x && 
        birdX - state.bird.radius < pipe.x + PIPE_WIDTH
      ) {
        if (
          state.bird.y - state.bird.radius < pipe.topHeight || 
          state.bird.y + state.bird.radius > pipe.topHeight + pipeGap
        ) {
          if (settingsRef.current.soundEnabled) playGameOver();
          return true; // Hit pipe
        }
      }
      
      // Score
      if (pipe.x + PIPE_WIDTH < birdX && !pipe.passed) {
        pipe.passed = true;
        playPop();
        setScore(s => {
          const newScore = s + 1;
          if (newScore > bestScore) {
            setBestScore(newScore);
            try { localStorage.setItem('vishal_flappy_best', newScore.toString()); } catch(e){}
          }
          return newScore;
        });
      }
    }
    
    // Remove off-screen pipes
    if (state.pipes.length > 0 && state.pipes[0].x + PIPE_WIDTH < 0) {
      state.pipes.shift();
    }
    
    return false;
  }, [bestScore]);

  const loop = useCallback((time: number) => {
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
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (isGameOver) {
          resetGame();
        } else if (!isPlaying) {
          setIsPlaying(true);
        } else {
          flap();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, isPaused, resetGame, flap]);

  return (
    <GameShell
      title="Flappy Style"
      gameId="flappy"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onBack={onBack}
      onRestart={resetGame}
      onPauseToggle={setIsPaused}
      instructions="Tap, click, or press Space to flap. Avoid the pipes!"
    >
      <div 
        className="w-full max-w-sm relative bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl mx-auto"
        onPointerDown={(e) => {
          e.preventDefault();
          if (isGameOver) resetGame();
          else if (!isPlaying) setIsPlaying(true);
          else flap();
        }}
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          width={320}
          height={480}
          className="w-full aspect-[2/3] block bg-[#38bdf8] cursor-pointer"
        />

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-6 text-center pointer-events-none">
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
                <h3 className="text-3xl font-black mb-6 drop-shadow-md">Ready?</h3>
                <div className="px-6 py-3 bg-blue-500 text-white font-black rounded-xl flex items-center gap-2 shadow-lg animate-pulse">
                  <Play className="w-5 h-5" /> Tap to Flap
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
};
