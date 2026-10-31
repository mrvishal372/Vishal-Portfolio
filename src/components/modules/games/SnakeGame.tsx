import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameShell } from './shared/GameShell';
import { playPop, playGameOver } from './shared/soundEngine';
import { loadGameSettings, subscribeToGameSettings, BaseGameSettings } from '../../../lib/gameSettingsStorage';

interface SnakeGameProps {
  onBack: () => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export const SnakeGame: React.FC<SnakeGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const settingsRef = useRef<BaseGameSettings>(loadGameSettings('snake'));
  
  const getSpeedForSetting = (spd: string) => {
    if (spd === 'slow') return 180;
    if (spd === 'fast') return 80;
    if (spd === 'extreme') return 48;
    return 120;
  };

  const gameState = useRef({
    snake: INITIAL_SNAKE,
    direction: INITIAL_DIRECTION,
    nextDirection: INITIAL_DIRECTION,
    food: { x: 5, y: 5 },
    speed: 120, // ms per frame
    lastRender: 0,
    animationId: 0
  });

  // Subscribe to real-time settings updates
  useEffect(() => {
    const unsub = subscribeToGameSettings('snake', (newSettings) => {
      settingsRef.current = newSettings;
      gameState.current.speed = getSpeedForSetting(newSettings.speed);
    });
    return () => unsub();
  }, []);

  // Load best score on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vishal_snake_best');
      if (saved) setBestScore(parseInt(saved, 10));
    } catch (e) {}
  }, []);

  const spawnFood = useCallback((snake: {x:number, y:number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // eslint-disable-next-line no-loop-func
      if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const currentSpeed = getSpeedForSetting(settingsRef.current.speed);
    gameState.current = {
      snake: [{ x: 10, y: 10 }],
      direction: { x: 0, y: -1 },
      nextDirection: { x: 0, y: -1 },
      food: spawnFood([{ x: 10, y: 10 }]),
      speed: currentSpeed,
      lastRender: performance.now(),
      animationId: gameState.current.animationId
    };
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, [spawnFood]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const state = gameState.current;
    const cellW = width / GRID_SIZE;
    const cellH = height / GRID_SIZE;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw Food
    ctx.fillStyle = '#ef4444'; // Red-500
    ctx.beginPath();
    ctx.arc(
      state.food.x * cellW + cellW / 2, 
      state.food.y * cellH + cellH / 2, 
      (cellW / 2) - 2, 
      0, 2 * Math.PI
    );
    ctx.fill();

    // Draw Snake
    state.snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#10b981' : '#34d399'; // Emerald
      ctx.fillRect(
        segment.x * cellW + 1, 
        segment.y * cellH + 1, 
        cellW - 2, 
        cellH - 2
      );
    });
  }, []);

  const update = useCallback(() => {
    const state = gameState.current;
    state.direction = state.nextDirection;
    
    const head = { ...state.snake[0] };
    head.x += state.direction.x;
    head.y += state.direction.y;

    // Wall collision or wrapping based on settings
    if (settingsRef.current.wallWrap) {
      if (head.x < 0) head.x = GRID_SIZE - 1;
      else if (head.x >= GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = GRID_SIZE - 1;
      else if (head.y >= GRID_SIZE) head.y = 0;
    } else {
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (settingsRef.current.soundEnabled) playGameOver();
        return true; // Game Over
      }
    }

    // Self collision
    if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      if (settingsRef.current.soundEnabled) playGameOver();
      return true; // Game Over
    }

    state.snake.unshift(head);

    // Food collision
    if (head.x === state.food.x && head.y === state.food.y) {
      if (settingsRef.current.soundEnabled) playPop();
      setScore(s => {
        const newScore = s + 10;
        if (newScore > bestScore) {
          setBestScore(newScore);
          try { localStorage.setItem('vishal_snake_best', newScore.toString()); } catch(e){}
        }
        return newScore;
      });
      state.food = spawnFood(state.snake);
      state.speed = Math.max(50, state.speed - 2); // Increase speed slightly
    } else {
      state.snake.pop();
    }

    return false;
  }, [bestScore, spawnFood]);

  const loop = useCallback((timestamp: number) => {
    const state = gameState.current;
    
    if (!isPlaying || isGameOver || isPaused) return;

    if (timestamp - state.lastRender >= state.speed) {
      const gameOver = update();
      if (gameOver) {
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx, canvas.width, canvas.height);
      }
      
      state.lastRender = timestamp;
    }
    
    state.animationId = requestAnimationFrame(loop);
  }, [isPlaying, isGameOver, isPaused, update, draw]);

  // Handle Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
        e.preventDefault();
      }

      const state = gameState.current;
      
      if (e.key === ' ' && (isGameOver || !isPlaying || isPaused)) {
        if (isGameOver) resetGame();
        else if (isPaused) setIsPaused(false);
        else setIsPlaying(true);
        return;
      }

      if (!isPlaying || isPaused) return;

      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && state.direction.y !== 1) {
        state.nextDirection = { x: 0, y: -1 };
      } else if ((key === 'arrowdown' || key === 's') && state.direction.y !== -1) {
        state.nextDirection = { x: 0, y: 1 };
      } else if ((key === 'arrowleft' || key === 'a') && state.direction.x !== 1) {
        state.nextDirection = { x: -1, y: 0 };
      } else if ((key === 'arrowright' || key === 'd') && state.direction.x !== -1) {
        state.nextDirection = { x: 1, y: 0 };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver, isPaused, resetGame]);

  // Game Loop Lifecycle
  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      gameState.current.lastRender = performance.now();
      gameState.current.animationId = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(gameState.current.animationId);
    };
  }, [isPlaying, isGameOver, isPaused, loop]);

  // Touch Controls
  let touchStartX = 0;
  let touchStartY = 0;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isPlaying || isPaused) return;
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    const state = gameState.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal
      if (dx > 30 && state.direction.x !== -1) state.nextDirection = { x: 1, y: 0 };
      else if (dx < -30 && state.direction.x !== 1) state.nextDirection = { x: -1, y: 0 };
    } else {
      // Vertical
      if (dy > 30 && state.direction.y !== -1) state.nextDirection = { x: 0, y: 1 };
      else if (dy < -30 && state.direction.y !== 1) state.nextDirection = { x: 0, y: -1 };
    }
  };

  return (
    <GameShell
      title="Snake"
      gameId="snake"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onBack={onBack}
      onRestart={resetGame}
      onPlay={() => setIsPlaying(true)}
      onPauseToggle={setIsPaused}
      instructions="Use arrow keys, WASD, or swipe to move. Eat food to grow and score points. Don't hit the walls or yourself!"
    >
      <div 
        className="w-full relative bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl touch-none mx-auto max-w-sm"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full aspect-square block bg-[#0f172a]"
        />

        {/* Overlays */}
        {(!isPlaying && !isGameOver && score === 0) && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
            <h3 className="text-2xl font-black mb-4">Ready to Play?</h3>
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}
        
        {isGameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
            <h3 className="text-3xl font-black text-red-400 mb-2">Game Over</h3>
            <button 
              onClick={resetGame}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95 mt-6"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
};

