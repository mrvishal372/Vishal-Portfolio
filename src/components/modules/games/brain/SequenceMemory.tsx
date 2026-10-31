import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

export const SequenceMemory: React.FC<Props> = ({ onBack }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isShowing, setIsShowing] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [activeCell, setActiveCell] = useState<number | null>(null);

  // GameShell states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_seq_mem_best');
    if (saved) setBestScore(parseInt(saved, 10));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startGame = () => {
    setScore(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setPlayerStep(0);
    const firstCell = Math.floor(Math.random() * 9);
    setSequence([firstCell]);
  };

  useEffect(() => {
    if (sequence.length > 0 && isPlaying && !isGameOver) {
      playSequence();
    }
  }, [sequence, isPlaying, isGameOver]);

  const playSequence = async () => {
    setIsShowing(true);
    setPlayerStep(0);
    setActiveCell(null);
    
    // Initial delay before showing sequence
    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < sequence.length; i++) {
      if (!isPlaying || isGameOver) return; // Abort if exited
      setActiveCell(sequence[i]);
      playPop();
      await new Promise(r => setTimeout(r, 400));
      setActiveCell(null);
      await new Promise(r => setTimeout(r, 150));
    }
    setIsShowing(false);
  };

  const handleCellClick = (idx: number) => {
    if (isShowing || !isPlaying || isGameOver) return;

    if (sequence[playerStep] === idx) {
      // Correct tap
      playPop();
      setActiveCell(idx);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setActiveCell(null), 200);

      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);
      
      if (nextStep === sequence.length) {
        // Completed sequence
        playMatch();
        const newScore = score + 1;
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('vishal_seq_mem_best', newScore.toString());
        }
        
        // Add next step
        setTimeout(() => {
          const nextCell = Math.floor(Math.random() * 9);
          setSequence(prev => [...prev, nextCell]);
        }, 500);
      }
    } else {
      // Wrong tap
      setIsGameOver(true);
      setIsPlaying(false);
      playGameOver();
    }
  };

  return (
    <GameShell
      title="Sequence Memory"
      score={score + 1}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Watch the squares light up. When they finish, tap them in the exact same order. The sequence gets longer every round!"
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Level</p>
            <p className="text-3xl font-black text-blue-600 dark:text-amber-400">{score + 1}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Best</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{bestScore}</p>
          </div>
        </div>

        <div className="relative bg-slate-200 dark:bg-slate-800 p-4 rounded-3xl mb-8 touch-none">
          <div className="grid grid-cols-3 gap-3">
            {Array(9).fill(null).map((_, idx) => (
              <motion.div
                key={idx}
                onPointerDown={() => handleCellClick(idx)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 cursor-pointer transition-colors duration-100
                  ${activeCell === idx 
                    ? 'bg-blue-500 dark:bg-amber-400 scale-95' 
                    : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }
                `}
              />
            ))}
          </div>

          {(!isPlaying || isGameOver) && (
            <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              {isGameOver ? (
                <>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Game Over</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">You reached Level {score + 1}</p>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Remember the Sequence</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">Repeat the pattern of lit squares.</p>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                    Start Game
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
