import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

const SHAPES = ['circle', 'square', 'triangle', 'diamond'];

const generateGrid = (level: number) => {
  const size = Math.min(5, 2 + Math.floor(level / 3)); 
  const total = size * size;
  
  // Pick random base properties
  const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const baseRotation = Math.floor(Math.random() * 4) * 90;
  const baseScale = 1;
  const baseRadius = baseShape === 'square' ? '12px' : '0px';

  let diffShape = baseShape;
  let diffRotation = baseRotation;
  let diffScale = baseScale;
  let diffRadius = baseRadius;
  
  // Pick what to change
  const modType = Math.floor(Math.random() * 3);
  if (modType === 0) { // Rotation
    diffRotation = baseRotation + 45;
  } else if (modType === 1) { // Scale
    diffScale = 0.8;
  } else { // Border radius (subtle)
    if (baseShape === 'square') diffRadius = '24px';
    else diffScale = 0.85; 
  }

  const items = Array(total).fill({ shape: baseShape, rotation: baseRotation, scale: baseScale, radius: baseRadius });
  const diffIndex = Math.floor(Math.random() * total);
  items[diffIndex] = { shape: diffShape, rotation: diffRotation, scale: diffScale, radius: diffRadius };

  return { items, diffIndex, size };
};

export const DifferenceFinder: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [bestLevel, setBestLevel] = useState(1);
  const [gridData, setGridData] = useState(() => generateGrid(1));
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_diff_best');
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

    if (index === gridData.diffIndex) {
      // Correct
      const nextLvl = level + 1;
      setLevel(nextLvl);
      if (nextLvl > bestLevel) {
        setBestLevel(nextLvl);
        localStorage.setItem('vishal_diff_best', nextLvl.toString());
      }
      playMatch();
      setGridData(generateGrid(nextLvl));
    } else {
      // Wrong
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsGameOver(true);
      setIsPlaying(false);
      playGameOver();
    }
  };

  return (
    <GameShell
      title="Difference Finder"
      score={level}
      bestScore={bestLevel}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Find the shape that has a subtle difference (rotation, size, or corners)."
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
              {gridData.items.map((item, idx) => {
                
                let InnerShape;
                if (item.shape === 'circle') {
                  InnerShape = <div className="bg-slate-800 dark:bg-slate-200 w-1/2 h-1/2 rounded-full" style={{ transform: `rotate(${item.rotation}deg) scale(${item.scale})` }}/>;
                } else if (item.shape === 'triangle') {
                  InnerShape = <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-transparent border-b-slate-800 dark:border-b-slate-200" style={{ transform: `rotate(${item.rotation}deg) scale(${item.scale})` }}/>;
                } else if (item.shape === 'diamond') {
                  InnerShape = <div className="bg-slate-800 dark:bg-slate-200 w-2/5 h-2/5 rotate-45" style={{ transform: `rotate(${item.rotation + 45}deg) scale(${item.scale})` }}/>;
                } else {
                  InnerShape = <div className="bg-slate-800 dark:bg-slate-200 w-1/2 h-1/2" style={{ transform: `rotate(${item.rotation}deg) scale(${item.scale})`, borderRadius: item.radius }}/>;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(idx)}
                    className="w-full h-full bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center hover:scale-95 transition-transform active:scale-90"
                  >
                    {InnerShape}
                  </button>
                );
              })}
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
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Difference Finder</h3>
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
