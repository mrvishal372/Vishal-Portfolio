import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

export const NumberMemory: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [targetNumber, setTargetNumber] = useState('');
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'idle' | 'memorize' | 'input' | 'result'>('idle');
  const [progress, setProgress] = useState(100);
  const [bestLevel, setBestLevel] = useState(1);
  
  // GameShell states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_num_mem_best');
    if (saved) setBestLevel(parseInt(saved, 10));
    return () => cleanupTimers();
  }, []);

  const cleanupTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startGame = () => {
    setLevel(1);
    setIsPlaying(true);
    setIsGameOver(false);
    startRound(1);
  };

  const startRound = (lvl: number) => {
    cleanupTimers();
    setInput('');
    const length = lvl + 1; // Level 1 = 2 digits, Level 2 = 3 digits
    let num = '';
    for (let i = 0; i < length; i++) {
      num += Math.floor(Math.random() * 10).toString();
    }
    // Prevent starting with 0 if length > 1 for better readability, but it's fine for simple game.
    if (num[0] === '0' && length > 1) {
      num = (Math.floor(Math.random() * 9) + 1).toString() + num.slice(1);
    }
    
    setTargetNumber(num);
    setPhase('memorize');
    setProgress(100);

    const displayTime = Math.max(1500, 1000 + (length * 400));
    const step = 50;
    const decrements = 100 / (displayTime / step);

    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p <= 0) {
          clearInterval(intervalRef.current!);
          setPhase('input');
          return 0;
        }
        return p - decrements;
      });
    }, step);

    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setPhase('input');
    }, displayTime);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'input') return;

    if (input === targetNumber) {
      // Success
      const nextLvl = level + 1;
      setLevel(nextLvl);
      if (nextLvl > bestLevel) {
        setBestLevel(nextLvl);
        localStorage.setItem('vishal_num_mem_best', nextLvl.toString());
      }
      setPhase('result');
      playMatch();
      setTimeout(() => startRound(nextLvl), 1500); // auto start next
    } else {
      // Fail
      setPhase('result');
      setIsGameOver(true);
      setIsPlaying(false);
      playGameOver();
    }
  };

  return (
    <GameShell
      title="Number Memory"
      score={level}
      bestScore={bestLevel}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Memorize the number shown on the screen, then type it in when it disappears."
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

        <div className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Remember the Number</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">The average person can remember 7 digits.</p>
                <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all mx-auto">
                  Start
                </button>
              </motion.div>
            )}

            {phase === 'memorize' && (
              <motion.div key="memorize" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} className="text-center w-full">
                <p className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-[0.2em] mb-8 font-mono break-all px-2">{targetNumber}</p>
                <div className="w-full max-w-[200px] mx-auto h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 dark:bg-amber-400 transition-all duration-75" style={{ width: `${progress}%` }} />
                </div>
              </motion.div>
            )}

            {phase === 'input' && (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-[250px]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <p className="text-center text-sm font-bold text-slate-500">What was the number?</p>
                  <input 
                    type="number" 
                    autoFocus
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="w-full text-center text-3xl font-black p-4 rounded-xl border-2 border-blue-500/30 focus:border-blue-500 dark:bg-slate-900 dark:text-white dark:focus:border-amber-400 outline-none font-mono"
                    placeholder="?"
                  />
                  <button type="submit" disabled={!input} className="w-full py-3 bg-blue-500 dark:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl disabled:opacity-50">
                    Submit
                  </button>
                </form>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                {input === targetNumber ? (
                  <>
                    <h3 className="text-3xl font-black text-emerald-500 mb-2">Correct!</h3>
                    <p className="text-slate-600 dark:text-slate-400 font-mono text-xl">{targetNumber}</p>
                    <p className="text-xs text-slate-400 mt-4">Next level starting...</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-red-500 mb-2">Incorrect</h3>
                    <div className="mb-6">
                      <p className="text-sm text-slate-500 mb-1">Number was</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white font-mono break-all">{targetNumber}</p>
                    </div>
                    <div className="mb-6">
                      <p className="text-sm text-slate-500 mb-1">Your answer</p>
                      <p className="text-xl font-bold text-red-400 line-through font-mono break-all">{input}</p>
                    </div>
                    <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all mx-auto">
                      Try Again
                    </button>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </GameShell>
  );
};
