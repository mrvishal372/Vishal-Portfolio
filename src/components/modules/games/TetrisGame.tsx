import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { GameShell } from './shared/GameShell';
import { playHit, playPop, playGameOver } from './shared/soundEngine';
import { loadGameSettings, subscribeToGameSettings, BaseGameSettings } from '../../../lib/gameSettingsStorage';

interface TetrisProps {
  onBack: () => void;
}

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;

const SHAPES = [
  [],
  [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ], // I
  [
    [1,1],
    [1,1]
  ], // O
  [
    [0,1,0],
    [1,1,1],
    [0,0,0]
  ], // T
  [
    [0,0,1],
    [1,1,1],
    [0,0,0]
  ], // L
  [
    [1,0,0],
    [1,1,1],
    [0,0,0]
  ], // J
  [
    [0,1,1],
    [1,1,0],
    [0,0,0]
  ], // S
  [
    [1,1,0],
    [0,1,1],
    [0,0,0]
  ], // Z
];

const COLORS = [
  '#000000',
  '#06b6d4', // cyan
  '#eab308', // yellow
  '#a855f7', // purple
  '#f97316', // orange
  '#3b82f6', // blue
  '#22c55e', // green
  '#ef4444', // red
];

export const TetrisGame: React.FC<TetrisProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const settingsRef = useRef<BaseGameSettings>(loadGameSettings('tetris'));

  const getDropInterval = (spd: string) => {
    if (spd === 'slow') return 1400;
    if (spd === 'fast') return 600;
    if (spd === 'extreme') return 300;
    return 1000;
  };

  const gameState = useRef({
    board: Array.from({length: ROWS}, () => Array(COLS).fill(0)),
    piece: { matrix: [[]] as number[][], x: 0, y: 0, type: 0 },
    dropCounter: 0,
    dropInterval: 1000,
    lastTime: 0,
    animationId: 0
  });

  // Subscribe to real-time settings updates
  useEffect(() => {
    const unsub = subscribeToGameSettings('tetris', (newSettings) => {
      settingsRef.current = newSettings;
      gameState.current.dropInterval = getDropInterval(newSettings.speed);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vishal_tetris_best');
      if (saved) setBestScore(parseInt(saved, 10));
    } catch(e){}
  }, []);

  const createPiece = () => {
    const type = Math.floor(Math.random() * 7) + 1;
    const matrix = SHAPES[type];
    return {
      matrix,
      x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2),
      y: 0,
      type
    };
  };

  const collide = (board: number[][], piece: any) => {
    for (let y = 0; y < piece.matrix.length; y++) {
      for (let x = 0; x < piece.matrix[y].length; x++) {
        if (piece.matrix[y][x] !== 0 &&
           (board[y + piece.y] && board[y + piece.y][x + piece.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  };

  const merge = (board: number[][], piece: any) => {
    piece.matrix.forEach((row: number[], y: number) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          board[y + piece.y][x + piece.x] = piece.type;
        }
      });
    });
  };

  const rotate = (matrix: number[][]) => {
    const N = matrix.length;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - 1 - j][i])
    );
    // for non-square matrices like I-piece, a simple transpose+reverse might not be enough, 
    // but keeping it simple.
    return result;
  };

  const sweep = () => {
    const board = gameState.current.board;
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y >= 0; y--) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] === 0) continue outer;
      }
      const row = board.splice(y, 1)[0].fill(0);
      board.unshift(row);
      y++;
      linesCleared++;
    }
    if (linesCleared > 0) {
      playPop();
      setScore(s => {
        const newScore = s + [0, 40, 100, 300, 1200][linesCleared] * level;
        if (newScore > bestScore) {
          setBestScore(newScore);
          try { localStorage.setItem('vishal_tetris_best', newScore.toString()); } catch(e){}
        }
        return newScore;
      });
    }
  };

  const resetGame = useCallback(() => {
    gameState.current = {
      board: Array.from({length: ROWS}, () => Array(COLS).fill(0)),
      piece: createPiece(),
      dropCounter: 0,
      dropInterval: getDropInterval(settingsRef.current.speed),
      lastTime: performance.now(),
      animationId: gameState.current.animationId
    };
    setScore(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    
    // Draw board
    gameState.current.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[value];
          ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
        }
      });
    });

    // Draw piece
    const p = gameState.current.piece;
    p.matrix.forEach((row: number[], y: number) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.fillStyle = COLORS[p.type];
          ctx.fillRect((x + p.x) * BLOCK_SIZE, (y + p.y) * BLOCK_SIZE, BLOCK_SIZE-1, BLOCK_SIZE-1);
        }
      });
    });
  }, []);

  const playerDrop = useCallback(() => {
    const state = gameState.current;
    state.piece.y++;
    if (collide(state.board, state.piece)) {
      state.piece.y--;
      merge(state.board, state.piece);
      playHit();
      sweep();
      state.piece = createPiece();
      if (collide(state.board, state.piece)) {
        playGameOver();
        setIsGameOver(true);
        setIsPlaying(false);
      }
    }
    state.dropCounter = 0;
  }, [collide, merge, sweep, createPiece]);

  const playerMove = useCallback((dir: number) => {
    const state = gameState.current;
    state.piece.x += dir;
    if (collide(state.board, state.piece)) {
      state.piece.x -= dir;
    }
  }, [collide]);

  const playerRotate = useCallback(() => {
    const state = gameState.current;
    const pos = state.piece.x;
    let offset = 1;
    const originalMatrix = state.piece.matrix;
    state.piece.matrix = rotate(state.piece.matrix);
    
    while (collide(state.board, state.piece)) {
      state.piece.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > state.piece.matrix[0].length) {
        state.piece.matrix = originalMatrix;
        state.piece.x = pos;
        return;
      }
    }
  }, [collide, rotate]);

  const update = useCallback((time: number = 0) => {
    const state = gameState.current;
    if (!isPlaying || isPaused || isGameOver) return;
    
    const deltaTime = time - state.lastTime;
    state.lastTime = time;
    state.dropCounter += deltaTime;
    
    if (state.dropCounter > state.dropInterval) {
      playerDrop();
    }
    
    // adjust level
    const currentScore = score;
    const newLevel = Math.floor(currentScore / 1000) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      state.dropInterval = Math.max(100, 1000 - (newLevel - 1) * 100);
    }
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }
    
    state.animationId = requestAnimationFrame(update);
  }, [isPlaying, isPaused, isGameOver, playerDrop, draw, score, level]);

  useEffect(() => {
    if (isPlaying && !isPaused && !isGameOver) {
      gameState.current.lastTime = performance.now();
      gameState.current.animationId = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(gameState.current.animationId);
  }, [isPlaying, isPaused, isGameOver, update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || isGameOver) return;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case 'ArrowLeft': playerMove(-1); break;
        case 'ArrowRight': playerMove(1); break;
        case 'ArrowDown': playerDrop(); break;
        case 'ArrowUp': playerRotate(); break;
        case ' ': 
          // hard drop
          while (!collide(gameState.current.board, gameState.current.piece)) {
            gameState.current.piece.y++;
          }
          gameState.current.piece.y--;
          playerDrop();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, isGameOver, playerMove, playerDrop, playerRotate]);

  // Touch controls
  const handleTouchControl = (action: string) => {
    if (!isPlaying || isPaused || isGameOver) return;
    switch(action) {
      case 'left': playerMove(-1); break;
      case 'right': playerMove(1); break;
      case 'down': playerDrop(); break;
      case 'rotate': playerRotate(); break;
      case 'drop': 
        while (!collide(gameState.current.board, gameState.current.piece)) {
            gameState.current.piece.y++;
        }
        gameState.current.piece.y--;
        playerDrop();
        break;
    }
  };

  return (
    <GameShell
      title="Tetris"
      gameId="tetris"
      score={score}
      bestScore={bestScore}
      level={level}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onBack={onBack}
      onRestart={resetGame}
      onPauseToggle={setIsPaused}
      instructions="Use arrow keys to move/rotate, space to hard drop. Or use on-screen buttons."
    >
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl inline-block">
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK_SIZE}
            height={ROWS * BLOCK_SIZE}
            className="block bg-[#0f172a]"
            style={{ width: '100%', maxWidth: `${COLS * BLOCK_SIZE}px`, height: 'auto' }}
          />

          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
              {isGameOver ? (
                <>
                  <h3 className="text-3xl font-black text-red-400 mb-2">Game Over</h3>
                  <p className="mb-6 font-medium text-slate-200">Final Score: {score}</p>
                  <button 
                    onClick={resetGame}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
                  >
                    <RotateCcw className="w-5 h-5" /> Play Again
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => score === 0 ? resetGame() : setIsPlaying(true)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Play className="w-5 h-5" /> Start Game
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Controls */}
        <div className="md:hidden grid grid-cols-3 gap-2 p-2">
          <div />
          <button onTouchStart={(e) => { e.preventDefault(); handleTouchControl('rotate')}} className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg active:bg-slate-300 dark:active:bg-slate-600 font-bold">↻</button>
          <div />
          <button onTouchStart={(e) => { e.preventDefault(); handleTouchControl('left')}} className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg active:bg-slate-300 dark:active:bg-slate-600 font-bold">←</button>
          <button onTouchStart={(e) => { e.preventDefault(); handleTouchControl('down')}} className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg active:bg-slate-300 dark:active:bg-slate-600 font-bold">↓</button>
          <button onTouchStart={(e) => { e.preventDefault(); handleTouchControl('right')}} className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg active:bg-slate-300 dark:active:bg-slate-600 font-bold">→</button>
          <div />
          <button onTouchStart={(e) => { e.preventDefault(); handleTouchControl('drop')}} className="p-4 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg active:bg-red-500/40 font-bold col-span-1">⇓</button>
          <div />
        </div>
      </div>
    </GameShell>
  );
};
