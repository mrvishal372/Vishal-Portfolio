import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

const generatePath = (level: number) => {
  const size = level < 3 ? 3 : level < 6 ? 4 : 5;
  const path: number[] = [];
  const length = 3 + level;
  
  let current = Math.floor(Math.random() * (size * size));
  path.push(current);

  const getNeighbors = (idx: number, sz: number) => {
    const neighbors = [];
    const r = Math.floor(idx / sz);
    const c = idx % sz;
    if (r > 0) neighbors.push(idx - sz); // up
    if (r < sz - 1) neighbors.push(idx + sz); // down
    if (c > 0) neighbors.push(idx - 1); // left
    if (c < sz - 1) neighbors.push(idx + 1); // right
    return neighbors;
  };

  for (let i = 1; i < length; i++) {
    const neighbors = getNeighbors(current, size).filter(n => !path.includes(n));
    if (neighbors.length === 0) break; // Trapped, just stop path here
    current = neighbors[Math.floor(Math.random() * neighbors.length)];
    path.push(current);
  }

  return { path, size };
};

export const PathMemory: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gridData, setGridData] = useState(() => generatePath(1));
  const [playerPath, setPlayerPath] = useState<number[]>([]);
  
  const [phase, setPhase] = useState<'idle' | 'showing' | 'playing' | 'result'>('idle');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  
  // GameShell states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_path_best');
    if (saved) setBestScore(parseInt(saved, 10));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setIsPlaying(true);
    setIsGameOver(false);
    startLevel(1);
  };

  const startLevel = (lvl: number) => {
    const newGrid = generatePath(lvl);
    setGridData(newGrid);
    setPlayerPath([]);
    setPhase('showing');
    setActiveIdx(null);
    showPath(newGrid.path);
  };

  const showPath = async (path: number[]) => {
    await new Promise(r => setTimeout(r, 600));
    for (let i = 0; i < path.length; i++) {
      if (timerRef.current === undefined) return; // unmounted
      setActiveIdx(path[i]);
      playPop();
      await new Promise(r => setTimeout(r, 400));
      setActiveIdx(null);
      await new Promise(r => setTimeout(r, 100));
    }
    setPhase('playing');
  };

  const handleCellClick = (idx: number) => {
    if (phase !== 'playing') return;

    const currentStep = playerPath.length;
    
    if (gridData.path[currentStep] === idx) {
      // Correct step
      playPop();
      const newPlayerPath = [...playerPath, idx];
      setPlayerPath(newPlayerPath);
      
      if (newPlayerPath.length === gridData.path.length) {
        // Level complete
        setPhase('result');
        playMatch();
        const nextLvl = level + 1;
        setScore(level);
        if (level > bestScore) {
          setBestScore(level);
          localStorage.setItem('vishal_path_best', level.toString());
        }
        setTimeout(() => startLevel(nextLvl), 1000);
      }
    } else {
      // Wrong step
      setPhase('result');
      setPlayerPath([...playerPath, idx]); // Add wrong for render
      setIsGameOver(true);
      setIsPlaying(false);
      playGameOver();
    }
  };

  return (
    <GameShell
      title="Path Memory"
      score={level}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Memorize the hidden path and trace it from start to finish."
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Level</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{level}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Best</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{bestScore}</p>
          </div>
        </div>

        <div className="relative bg-slate-200 dark:bg-slate-800 p-4 rounded-3xl mb-8 touch-none w-full max-w-[320px] mx-auto aspect-square flex items-center justify-center">
          
          {phase !== 'idle' ? (
            <div 
              className="w-full h-full"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${gridData.size}, minmax(0, 1fr))`, 
                gap: '6px' 
              }}
            >
              {Array(gridData.size * gridData.size).fill(null).map((_, idx) => {
                const isTargetPath = phase === 'showing' && activeIdx === idx;
                const isPlayerCorrect = playerPath.includes(idx) && gridData.path.includes(idx);
                const isPlayerWrong = playerPath.includes(idx) && !gridData.path.includes(idx);
                
                let bgClass = 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600';
                if (isTargetPath) bgClass = 'bg-blue-500 dark:bg-amber-400 scale-95';
                else if (isPlayerWrong) bgClass = 'bg-red-500 dark:bg-red-500 scale-95';
                else if (isPlayerCorrect) bgClass = 'bg-emerald-500 dark:bg-emerald-500 scale-95';

                return (
                  <motion.div
                    key={idx}
                    onPointerDown={() => handleCellClick(idx)}
                    className={`w-full h-full rounded-xl shadow-sm border border-black/5 dark:border-white/5 cursor-pointer transition-all duration-150 ${bgClass}`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Follow the Path</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">Memorize the hidden path and trace it from start to finish.</p>
              <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                Start
              </button>
            </div>
          )}

          {/* Game Over overlay */}
          {phase === 'result' && playerPath.length > 0 && !gridData.path.includes(playerPath[playerPath.length - 1]) && (
            <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
              <h3 className="text-2xl font-black text-red-500 mb-2">Wrong Path!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">You reached Level {level}</p>
              <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
};
