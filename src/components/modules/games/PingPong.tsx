import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameShell } from './shared/GameShell';
import { playPop, playGameOver } from './shared/soundEngine';
import { loadGameSettings, subscribeToGameSettings, BaseGameSettings } from '../../../lib/gameSettingsStorage';

interface PingPongProps {
  onBack: () => void;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED_X = 5;
const INITIAL_BALL_SPEED_Y = 3;

export const PingPong: React.FC<PingPongProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const settingsRef = useRef<BaseGameSettings>(loadGameSettings('pingpong'));

  useEffect(() => {
    const unsub = subscribeToGameSettings('pingpong', (newSettings) => {
      settingsRef.current = newSettings;
    });
    return () => unsub();
  }, []);

  const gameState = useRef({
    playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    computerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballSpeedX: INITIAL_BALL_SPEED_X,
    ballSpeedY: INITIAL_BALL_SPEED_Y,
    keys: { ArrowUp: false, ArrowDown: false },
    animationId: 0,
    lastHitAt: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('vishal_pingpong_best');
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const resetGame = useCallback(() => {
    gameState.current = {
      playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      computerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballSpeedX: INITIAL_BALL_SPEED_X,
      ballSpeedY: INITIAL_BALL_SPEED_Y,
      keys: { ArrowUp: false, ArrowDown: false },
      animationId: gameState.current.animationId,
      lastHitAt: 0
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const state = gameState.current;

    // Clear background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // Draw Player Paddle
    ctx.fillStyle = '#3b82f6'; // blue-500
    ctx.fillRect(10, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw Computer Paddle
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.fillRect(CANVAS_WIDTH - 20, state.computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw Ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(state.ballX, state.ballY, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const update = useCallback(() => {
    const state = gameState.current;

    // Player Movement
    if (state.keys.ArrowUp && state.playerY > 0) {
      state.playerY -= PADDLE_SPEED;
    }
    if (state.keys.ArrowDown && state.playerY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
      state.playerY += PADDLE_SPEED;
    }

    // AI Movement (Computer) with difficulty tuning
    const diff = settingsRef.current.difficulty;
    const aiMultiplier = diff === 'easy' ? 0.45 : diff === 'hard' ? 1.05 : diff === 'unbeatable' ? 1.4 : 0.75;
    const computerCenter = state.computerY + PADDLE_HEIGHT / 2;
    if (computerCenter < state.ballY - 10) {
      state.computerY += PADDLE_SPEED * aiMultiplier;
    } else if (computerCenter > state.ballY + 10) {
      state.computerY -= PADDLE_SPEED * aiMultiplier;
    }
    
    // Constrain AI
    state.computerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.computerY));

    // Ball Movement
    state.ballX += state.ballSpeedX;
    state.ballY += state.ballSpeedY;

    // Top/Bottom Collision
    if (state.ballY - BALL_SIZE < 0 || state.ballY + BALL_SIZE > CANVAS_HEIGHT) {
      state.ballSpeedY = -state.ballSpeedY;
      playPop();
    }

    // Paddle Collision - Player
    if (
      state.ballX - BALL_SIZE < 10 + PADDLE_WIDTH &&
      state.ballY > state.playerY &&
      state.ballY < state.playerY + PADDLE_HEIGHT &&
      state.ballSpeedX < 0
    ) {
      const hitPoint = state.ballY - (state.playerY + PADDLE_HEIGHT / 2);
      state.ballSpeedY = hitPoint * 0.1;
      state.ballSpeedX = -state.ballSpeedX * 1.05; // speed up slightly
      state.ballX = 10 + PADDLE_WIDTH + BALL_SIZE;
      playPop();
      
      setScore(s => {
        const newScore = s + 1;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('vishal_pingpong_best', newScore.toString());
        }
        return newScore;
      });
    }

    // Paddle Collision - Computer
    if (
      state.ballX + BALL_SIZE > CANVAS_WIDTH - 20 &&
      state.ballY > state.computerY &&
      state.ballY < state.computerY + PADDLE_HEIGHT &&
      state.ballSpeedX > 0
    ) {
      const hitPoint = state.ballY - (state.computerY + PADDLE_HEIGHT / 2);
      state.ballSpeedY = hitPoint * 0.1;
      state.ballSpeedX = -state.ballSpeedX * 1.05;
      state.ballX = CANVAS_WIDTH - 20 - BALL_SIZE;
      playPop();
    }

    // Score / Game Over Condition
    if (state.ballX < 0) {
      playGameOver();
      return true; // Player missed, game over
    }

    // If computer misses (almost impossible with current AI logic unless we cap its speed), we reset ball for player advantage
    if (state.ballX > CANVAS_WIDTH) {
      state.ballX = CANVAS_WIDTH / 2;
      state.ballY = CANVAS_HEIGHT / 2;
      state.ballSpeedX = -INITIAL_BALL_SPEED_X;
      state.ballSpeedY = INITIAL_BALL_SPEED_Y;
    }

    return false;
  }, [bestScore]);

  const loop = useCallback(() => {
    if (!isPlaying || isGameOver) return;

    const gameOver = update();
    if (gameOver) {
      setIsGameOver(true);
      setIsPlaying(false);
      return;
    }
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }
    
    gameState.current.animationId = requestAnimationFrame(loop);
  }, [isPlaying, isGameOver, update, draw]);

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        gameState.current.keys[e.key as 'ArrowUp' | 'ArrowDown'] = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        gameState.current.keys[e.key as 'ArrowUp' | 'ArrowDown'] = false;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop Lifecycle
  useEffect(() => {
    if (isPlaying && !isGameOver) {
      gameState.current.animationId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(gameState.current.animationId);
  }, [isPlaying, isGameOver, loop]);

  // Touch Handling for Mobile Paddle
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleY = CANVAS_HEIGHT / rect.height;
    const y = (touch.clientY - rect.top) * scaleY;
    
    // Center paddle on touch
    gameState.current.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, y - PADDLE_HEIGHT / 2));
  };

  return (
    <GameShell
      title="Ping Pong"
      gameId="pingpong"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={resetGame}
      onPlay={() => setIsPlaying(true)}
      onPauseToggle={(paused) => setIsPlaying(!paused)}
      instructions="Use Up/Down arrows or touch & drag to move paddle. Survive as long as possible!"
    >
      <div 
        className="relative bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl w-full max-w-[600px] mx-auto aspect-[3/2] touch-none"
        onTouchMove={handleTouchMove}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full block"
        />

        {/* Overlays */}
        {(!isPlaying && !isGameOver && score === 0) && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
            <h3 className="text-2xl font-black mb-4">Pong Survival</h3>
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};
