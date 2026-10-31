import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'];
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];

const generateGrid = (level: number) => {
  const size = Math.min(6, 2 + Math.floor(level / 2)); // 2x2 to 6x6 max
  const total = size * size;
  
  // Pick a base shape and color
  const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  // Pick a different variation (either shape or color)
  let diffShape = baseShape;
  let diffColor = baseColor;
  
  if (Math.random() > 0.5) {
    while (diffShape === baseShape) diffShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  } else {
    // For higher levels, just make the color slightly different using opacity or a closer tailwind color
    // But for simplicity, we just use a different primary color
    while (diffColor === baseColor) diffColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  const items = Array(total).fill({ shape: baseShape, color: baseColor });
  const oddIndex = Math.floor(Math.random() * total);
  items[oddIndex] = { shape: diffShape, color: diffColor };

  return { items, oddIndex, size };
};

export const OddOneOut: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [bestLevel, setBestLevel] = useState(1);
  const [gridData, setGridData] = useState(() => generateGrid(1));
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_odd_one_best');
    if (saved) setBestLevel(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setLevel(1);
    setGridData(generateGrid(1));
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const handleItemClick = (index: number) => {
    if (!isPlaying || isGameOver) return;

    if (index === gridData.oddIndex) {
      // Correct!
      const nextLvl = level + 1;
      setLevel(nextLvl);
      if (nextLvl > bestLevel) {
        setBestLevel(nextLvl);
        localStorage.setItem('vishal_odd_one_best', nextLvl.toString());
      }
      playMatch();
      setGridData(generateGrid(nextLvl));
    } else {
      // Wrong!
      setShake(true);
      playPop();
      setTimeout(() => setShake(false), 500);
      setIsGameOver(true);
      setIsPlaying(false);
      playGameOver();
    }
  };

  return (
    <GameShell
      title="Odd One Out"
      score={level}
      bestScore={bestLevel}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Find and tap the item that looks different from the rest."
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Level</p>
            <p className="text-3xl font-black text-blue-600 dark:text-amber-400">{level}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Best</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{bestLevel}</p>
          </div>
        </div>

        <div className="w-full relative bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-6 min-h-[350px] flex items-center justify-center">
          
          {isPlaying && !isGameOver ? (
            <motion.div 
              key={level}
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : { scale: 1, opacity: 1 }} 
              className="w-full aspect-square"
              style={{ display: 'grid', gridTemplateColumns: `repeat(${gridData.size}, minmax(0, 1fr))`, gap: '8px' }}
            >
              {gridData.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleItemClick(idx)}
                  className="w-full h-full bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center p-2 sm:p-3 hover:scale-95 transition-transform active:scale-90"
                >
                  <div className={`w-full h-full ${item.shape === 'circle' ? 'rounded-full' : item.shape === 'diamond' ? 'rotate-45 scale-75' : 'rounded-lg'} ${item.color}`} />
                </button>
              ))}
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10">
              {isGameOver ? (
                <>
                  <h3 className="text-3xl font-black text-red-500 mb-2">Game Over</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">You reached Level {level}</p>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Odd One Out</h3>
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
