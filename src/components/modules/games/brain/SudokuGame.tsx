import React, { useState, useEffect } from 'react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playError, playSuccess } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

const generateEmptyGrid = () => Array.from({length: 9}, () => Array(9).fill(0));

// Simple pre-made grids for reliability instead of heavy generation algorithms
const EASY_GRID = [
  [5,3,0, 0,7,0, 0,0,0],
  [6,0,0, 1,9,5, 0,0,0],
  [0,9,8, 0,0,0, 0,6,0],
  
  [8,0,0, 0,6,0, 0,0,3],
  [4,0,0, 8,0,3, 0,0,1],
  [7,0,0, 0,2,0, 0,0,6],
  
  [0,6,0, 0,0,0, 2,8,0],
  [0,0,0, 4,1,9, 0,0,5],
  [0,0,0, 0,8,0, 0,7,9]
];

const EASY_SOL = [
  [5,3,4, 6,7,8, 9,1,2],
  [6,7,2, 1,9,5, 3,4,8],
  [1,9,8, 3,4,2, 5,6,7],
  
  [8,5,9, 7,6,1, 4,2,3],
  [4,2,6, 8,5,3, 7,9,1],
  [7,1,3, 9,2,4, 8,5,6],
  
  [9,6,1, 5,3,7, 2,8,4],
  [2,8,7, 4,1,9, 6,3,5],
  [3,4,5, 2,8,6, 1,7,9]
];

export const SudokuGame: React.FC<Props> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [grid, setGrid] = useState<number[][]>(generateEmptyGrid());
  const [initialGrid, setInitialGrid] = useState<number[][]>(generateEmptyGrid());
  const [solution, setSolution] = useState<number[][]>(generateEmptyGrid());
  const [selectedCell, setSelectedCell] = useState<{r:number, c:number} | null>(null);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vishal_sudoku_best');
      if (saved) setBestTime(parseInt(saved, 10));
    } catch(e){}
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying && !isGameOver && !isPaused) {
      timer = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, isPaused]);

  const startGame = () => {
    // A real implementation would rotate/shuffle these or generate them.
    // For now we just use the static easy grid.
    setGrid(EASY_GRID.map(row => [...row]));
    setInitialGrid(EASY_GRID.map(row => [...row]));
    setSolution(EASY_SOL);
    setTime(0);
    setMistakes(0);
    setSelectedCell(null);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  };

  const handleCellClick = (r: number, c: number) => {
    if (!isPlaying || isPaused || isGameOver) return;
    if (initialGrid[r][c] !== 0) return; // Can't select initial numbers
    setSelectedCell({r, c});
    playPop();
  };

  const handleInput = (num: number) => {
    if (!selectedCell || !isPlaying || isPaused || isGameOver) return;
    
    const {r, c} = selectedCell;
    const newGrid = grid.map(row => [...row]);
    
    // Check if correct
    if (solution[r][c] === num) {
      newGrid[r][c] = num;
      setGrid(newGrid);
      playMatch();
      
      // Check win
      let win = true;
      for(let i=0; i<9; i++) {
        for(let j=0; j<9; j++) {
          if (newGrid[i][j] !== solution[i][j]) win = false;
        }
      }
      if (win) {
        playSuccess();
        setIsGameOver(true);
        setIsPlaying(false);
        if (!bestTime || time < bestTime) {
          setBestTime(time);
          try { localStorage.setItem('vishal_sudoku_best', time.toString()); } catch(e){}
        }
      }
    } else {
      setMistakes(m => {
        const newM = m + 1;
        if (newM >= 3) {
          setIsGameOver(true);
          setIsPlaying(false);
        }
        return newM;
      });
      playError();
    }
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || isGameOver || !selectedCell) return;
      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // We don't support deleting correct numbers in this simple mode
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, isGameOver, selectedCell, handleInput]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <GameShell
      title="Sudoku"
      score={formatTime(time)}
      bestScore={bestTime ? formatTime(bestTime) : '--:--'}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      isPaused={isPaused}
      onBack={onBack}
      onRestart={startGame}
      onPauseToggle={setIsPaused}
      instructions="Fill the grid so every row, column, and 3x3 box contains 1-9. 3 mistakes and you lose!"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        
        {isPlaying && (
          <div className="w-full flex justify-between font-bold text-slate-600 dark:text-slate-400">
            <span>Mistakes: {mistakes}/3</span>
            <span>Time: {formatTime(time)}</span>
          </div>
        )}

        <div className="relative aspect-square w-full bg-slate-300 dark:bg-slate-700 p-1 rounded-xl shadow-xl overflow-hidden">
          <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-[1px] bg-slate-800 dark:bg-slate-900">
            {grid.map((row, r) => 
              row.map((cell, c) => {
                const isInitial = initialGrid[r][c] !== 0;
                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                
                // Bold borders for 3x3
                const borderRight = c === 2 || c === 5 ? 'border-r-2 border-r-slate-800 dark:border-r-slate-950' : '';
                const borderBottom = r === 2 || r === 5 ? 'border-b-2 border-b-slate-800 dark:border-b-slate-950' : '';

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`flex items-center justify-center font-bold text-lg sm:text-xl transition-colors select-none cursor-pointer
                      ${borderRight} ${borderBottom}
                      ${isInitial ? 'text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800' : 'text-blue-600 dark:text-amber-400 bg-white dark:bg-slate-800/80'}
                      ${isSelected ? 'bg-blue-100 dark:bg-slate-600 ring-2 ring-inset ring-blue-500' : ''}
                      ${!isInitial && !isSelected ? 'hover:bg-slate-50 dark:hover:bg-slate-700' : ''}
                    `}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                )
              })
            )}
          </div>

          {/* Overlays */}
          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-10">
              {isGameOver ? (
                <>
                  <h3 className={`text-3xl font-black mb-2 ${mistakes >= 3 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {mistakes >= 3 ? 'Game Over' : 'Solved!'}
                  </h3>
                  <p className="mb-6 font-medium text-slate-600 dark:text-slate-300">
                    {mistakes >= 3 ? 'You made 3 mistakes.' : `Time: ${formatTime(time)}`}
                  </p>
                  <button onClick={startGame} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-all">
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white">Ready to Play?</h3>
                  <button onClick={startGame} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-95 transition-all">
                    Start Game
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Numpad for mobile */}
        <div className="grid grid-cols-5 gap-2 w-full mt-2">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              disabled={!isPlaying || isGameOver || isPaused || !selectedCell}
              className="py-4 bg-white dark:bg-slate-800 rounded-xl font-bold text-xl text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
};
