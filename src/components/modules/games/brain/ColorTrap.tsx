import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

const COLOR_DATA = [
  { name: 'RED', colorClass: 'text-red-600 dark:text-red-400' },
  { name: 'BLUE', colorClass: 'text-blue-600 dark:text-blue-400' },
  { name: 'GREEN', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'YELLOW', colorClass: 'text-amber-500 dark:text-amber-400' },
  { name: 'PURPLE', colorClass: 'text-purple-600 dark:text-purple-400' },
  { name: 'ORANGE', colorClass: 'text-orange-500 dark:text-orange-400' }
];

export const ColorTrap: React.FC<Props> = ({ onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [currentWord, setCurrentWord] = useState(COLOR_DATA[0]);
  const [currentColor, setCurrentColor] = useState(COLOR_DATA[0]);
  const [shake, setShake] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_colortrap_best');
    if (saved) setBestScore(parseInt(saved, 10));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateQuestion = () => {
    const isMatch = Math.random() > 0.5; // 50% chance they match
    
    const wordIdx = Math.floor(Math.random() * COLOR_DATA.length);
    setCurrentWord(COLOR_DATA[wordIdx]);
    
    if (isMatch) {
      setCurrentColor(COLOR_DATA[wordIdx]);
    } else {
      let colorIdx = Math.floor(Math.random() * COLOR_DATA.length);
      while (colorIdx === wordIdx) {
        colorIdx = Math.floor(Math.random() * COLOR_DATA.length);
      }
      setCurrentColor(COLOR_DATA[colorIdx]);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setIsPlaying(true);
    generateQuestion();
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsGameOver(true);
          setIsPlaying(false);
          playGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (userSaidMatch: boolean) => {
    if (!isPlaying || isGameOver) return;
    
    const isActuallyMatch = currentWord.name === currentColor.name;
    
    if (userSaidMatch === isActuallyMatch) {
      // Correct
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('vishal_colortrap_best', newScore.toString());
      }
      // Bonus time for correct answers
      setTimeLeft(prev => prev + 1);
      playMatch();
      generateQuestion();
    } else {
      // Wrong
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setTimeLeft(prev => Math.max(0, prev - 3)); // Penalty
      playPop();
      generateQuestion();
    }
  };

  return (
    <GameShell
      title="Color Trap"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Ignore the word! Tap YES if the meaning of the word matches the color of its ink."
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-4 sm:gap-8 mb-6 w-full justify-center">
          <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score</p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{score}</p>
          </div>
          <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time</p>
            <p className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{timeLeft}s</p>
          </div>
        </div>

        <div className="w-full relative bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 min-h-[350px] flex flex-col items-center justify-center">
          
          {isPlaying && !isGameOver ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, scale: 1 }} 
              className="w-full flex flex-col items-center"
            >
              <p className="text-sm text-slate-500 font-bold mb-8 uppercase tracking-widest text-center">
                Does the word match the ink?
              </p>
              
              <div className="mb-12 flex items-center justify-center h-24">
                <h1 className={`text-5xl sm:text-6xl font-black tracking-widest uppercase ${currentColor.colorClass}`}>
                  {currentWord.name}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => handleAnswer(false)}
                  className="py-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-black text-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all flex flex-col items-center gap-2"
                >
                  <X className="w-8 h-8 text-red-500" /> NO
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="py-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-black text-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all flex flex-col items-center gap-2"
                >
                  <Check className="w-8 h-8 text-emerald-500" /> YES
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10">
              {isGameOver ? (
                <>
                  <h3 className="text-3xl font-black text-red-500 mb-2">Time's Up!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Final Score: {score}</p>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Color Trap</h3>
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
