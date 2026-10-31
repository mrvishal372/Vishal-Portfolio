import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver, playError, playSuccess } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

export const TenToOne: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [targetNumber, setTargetNumber] = useState(10);
  const [grid, setGrid] = useState<{ id: number, val: number, clicked: boolean }[]>([]);
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  // GameShell states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_ten_to_one_best');
    if (saved) setBestTime(parseFloat(saved));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateGrid = (lvl: number) => {
    const maxNumber = 10 + (lvl - 1) * 5; // L1: 10, L2: 15, L3: 20
    const nums = Array.from({ length: maxNumber }, (_, i) => i + 1);
    
    // Shuffle array
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    return nums.map((val, i) => ({ id: i, val, clicked: false }));
  };

  const startGame = () => {
    setLevel(1);
    setTargetNumber(10);
    setGrid(generateGrid(1));
    setIsGameOver(false);
    setIsPlaying(true);
    setTime(0);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 0.1);
    }, 100);
  };

  const handleNextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setTargetNumber(10 + (nextLvl - 1) * 5);
    setGrid(generateGrid(nextLvl));
  };

  const handleCellClick = (val: number, id: number) => {
    if (!isPlaying || isGameOver) return;

    if (val === targetNumber) {
      setGrid(prev => prev.map(cell => cell.id === id ? { ...cell, clicked: true } : cell));
      if (val === 1) {
        // Round won
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (level === 3) {
           // Complete 3 levels to finish the game
           playSuccess();
           setIsGameOver(true);
           setIsPlaying(false);
           if (!bestTime || time < bestTime) {
             setBestTime(time);
             localStorage.setItem('vishal_ten_to_one_best', time.toFixed(1));
           }
        } else {
           playMatch();
           setTimeout(handleNextLevel, 500);
        }
      } else {
        playPop();
        setTargetNumber(val - 1);
      }
    } else {
       // Time penalty for wrong click
       playError();
       setTime(prev => prev + 2.0);
    }
  };

  const maxNumForLevel = 10 + (level - 1) * 5;
  const gridCols = level === 1 ? 'grid-cols-4' : level === 2 ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-5';

  return (
    <GameShell
      title="Countdown Challenge"
      score={time.toFixed(1)}
      bestScore={bestTime ? bestTime.toFixed(1) : undefined}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Tap the numbers in descending order (highest down to 1). Wrong taps add +2 seconds!"
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-4 sm:gap-8 mb-6 w-full justify-center">
          <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Find</p>
            <p className="text-2xl font-black text-blue-600 dark:text-amber-400">{targetNumber}</p>
          </div>
          <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{time.toFixed(1)}s</p>
          </div>
          {bestTime !== null && (
            <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Best</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{bestTime.toFixed(1)}s</p>
            </div>
          )}
        </div>

        <div className="w-full relative bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-6 min-h-[350px] flex items-center justify-center">
          
          {isPlaying && !isGameOver ? (
            <motion.div 
              key={level}
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className={`w-full grid ${gridCols} gap-2 sm:gap-3`}
            >
              {grid.map((cell) => (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(cell.val, cell.id)}
                  disabled={cell.clicked}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-sm transition-all active:scale-95
                    ${cell.clicked 
                      ? 'bg-slate-200 dark:bg-slate-800 text-transparent opacity-0 scale-75' 
                      : cell.val === targetNumber && time > 0 && (time * 10) % 30 > 25 // Quick hint pulse logic
                        ? 'bg-blue-200 dark:bg-amber-900 text-blue-800 dark:text-amber-200 ring-2 ring-blue-500 dark:ring-amber-500'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                    }
                  `}
                >
                  {!cell.clicked && cell.val}
                </button>
              ))}
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10">
              {isGameOver ? (
                <>
                  <h3 className="text-3xl font-black text-emerald-500 mb-2">Completed!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Your total time: {time.toFixed(1)}s</p>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Countdown Challenge</h3>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                    Start
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
};
