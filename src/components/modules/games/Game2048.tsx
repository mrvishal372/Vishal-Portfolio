import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameShell } from './shared/GameShell';
import { playPop, playMatch, playGameOver, playSuccess } from './shared/soundEngine';

interface Game2048Props {
  onBack: () => void;
}

type Grid = number[][];

const GRID_SIZE = 4;

const getEmptyGrid = (): Grid => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const addRandomTile = (grid: Grid): Grid => {
  const emptyCells: { r: number, c: number }[] = [];
  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 0) emptyCells.push({ r, c });
    });
  });
  
  if (emptyCells.length === 0) return grid;
  
  const newGrid = grid.map(row => [...row]);
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const hasMoves = (grid: Grid): boolean => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (r < GRID_SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
      if (c < GRID_SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
    }
  }
  return false;
};

export const Game2048: React.FC<Game2048Props> = ({ onBack }) => {
  const [grid, setGrid] = useState<Grid>(() => addRandomTile(addRandomTile(getEmptyGrid())));
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [continued, setContinued] = useState(false); // To continue after 2048
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_2048_best');
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const resetGame = useCallback(() => {
    setGrid(addRandomTile(addRandomTile(getEmptyGrid())));
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
    setContinued(false);
    setIsPlaying(true);
  }, []);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlaying || isGameOver || (hasWon && !continued)) return;

    setGrid(prev => {
      let newGrid = prev.map(row => [...row]);
      let moved = false;
      let newScore = score;
      let merged = false;

      const slide = (row: number[]) => {
        let arr = row.filter(val => val !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            newScore += arr[i];
            arr.splice(i + 1, 1);
            merged = true;
          }
        }
        while (arr.length < GRID_SIZE) arr.push(0);
        return arr;
      };

      if (direction === 'left') {
        for (let r = 0; r < GRID_SIZE; r++) {
          const newRow = slide(newGrid[r]);
          if (newGrid[r].join(',') !== newRow.join(',')) moved = true;
          newGrid[r] = newRow;
        }
      } else if (direction === 'right') {
        for (let r = 0; r < GRID_SIZE; r++) {
          const newRow = slide([...newGrid[r]].reverse()).reverse();
          if (newGrid[r].join(',') !== newRow.join(',')) moved = true;
          newGrid[r] = newRow;
        }
      } else if (direction === 'up') {
        for (let c = 0; c < GRID_SIZE; c++) {
          const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
          const newCol = slide(col);
          for (let r = 0; r < GRID_SIZE; r++) {
            if (newGrid[r][c] !== newCol[r]) moved = true;
            newGrid[r][c] = newCol[r];
          }
        }
      } else if (direction === 'down') {
        for (let c = 0; c < GRID_SIZE; c++) {
          const col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
          const newCol = slide(col).reverse();
          for (let r = 0; r < GRID_SIZE; r++) {
            if (newGrid[r][c] !== newCol[r]) moved = true;
            newGrid[r][c] = newCol[r];
          }
        }
      }

      if (moved) {
        newGrid = addRandomTile(newGrid);
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('vishal_2048_best', newScore.toString());
        }

        if (merged) {
          playMatch();
        } else {
          playPop();
        }

        // Check Win
        if (!hasWon && newGrid.some(row => row.includes(2048))) {
          setHasWon(true);
          setIsPlaying(false);
          playSuccess();
        }

        // Check Game Over
        if (!hasMoves(newGrid)) {
          setIsGameOver(true);
          setIsPlaying(false);
          playGameOver();
        }
        
        return newGrid;
      }
      return prev;
    });
  }, [isPlaying, isGameOver, hasWon, continued, score, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); move('up'); }
      else if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); move('down'); }
      else if (['ArrowLeft', 'a', 'A'].includes(e.key)) { e.preventDefault(); move('left'); }
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) { e.preventDefault(); move('right'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, move]);

  // Touch Swipe
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isPlaying) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) {
        if (dx > 0) move('right');
        else move('left');
      }
    } else {
      if (Math.abs(dy) > 30) {
        if (dy > 0) move('down');
        else move('up');
      }
    }
    touchStartRef.current = null;
  };

  const getTileColor = (val: number) => {
    const colors: Record<number, { bg: string, text: string }> = {
      2: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200' },
      4: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-900 dark:text-blue-200' },
      8: { bg: 'bg-amber-200 dark:bg-amber-700/60', text: 'text-amber-900 dark:text-white' },
      16: { bg: 'bg-orange-400 dark:bg-orange-600', text: 'text-white dark:text-white' },
      32: { bg: 'bg-red-400 dark:bg-red-600', text: 'text-white dark:text-white' },
      64: { bg: 'bg-red-500 dark:bg-red-700', text: 'text-white dark:text-white' },
      128: { bg: 'bg-yellow-400 dark:bg-yellow-600', text: 'text-white dark:text-white' },
      256: { bg: 'bg-yellow-400 dark:bg-yellow-600 shadow-md', text: 'text-white dark:text-white' },
      512: { bg: 'bg-yellow-400 dark:bg-yellow-500 shadow-md', text: 'text-white dark:text-white' },
      1024: { bg: 'bg-yellow-500 dark:bg-yellow-500 shadow-lg', text: 'text-white dark:text-white' },
      2048: { bg: 'bg-yellow-500 dark:bg-yellow-400 shadow-xl ring-2 ring-white/50', text: 'text-white dark:text-slate-900' },
    };
    return colors[val] || { bg: 'bg-slate-900 dark:bg-slate-100', text: 'text-white dark:text-slate-900' };
  };

  return (
    <GameShell
      title="2048"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={resetGame}
      instructions="Use arrow keys or swipe to move tiles. Tiles with the same number merge into one when they touch. Add them up to reach 2048!"
    >
      <div 
        className="relative bg-slate-300 dark:bg-slate-700 p-3 rounded-2xl touch-none mx-auto w-full max-w-sm"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {grid.map((row, r) => 
            row.map((cell, c) => (
              <div 
                key={`${r}-${c}`}
                className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center relative overflow-hidden"
              >
                <AnimatePresence>
                  {cell !== 0 && (
                    <motion.div
                      layoutId={`tile-${r}-${c}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`absolute inset-0 flex items-center justify-center rounded-xl font-black text-2xl sm:text-3xl ${getTileColor(cell).bg} ${getTileColor(cell).text}`}
                    >
                      {cell}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        {/* Overlays */}
        {(isGameOver || (hasWon && !continued)) && (
          <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-center p-6 z-10">
            <h3 className={`text-4xl font-black mb-2 ${hasWon ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
              {hasWon ? 'You Win!' : 'Game Over'}
            </h3>
            <div className="flex gap-4 mt-6">
              {hasWon && !continued && (
                <button 
                  onClick={() => { setContinued(true); setIsPlaying(true); }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all"
                >
                  Continue
                </button>
              )}
              <button 
                onClick={resetGame}
                className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all active:scale-95"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
};
