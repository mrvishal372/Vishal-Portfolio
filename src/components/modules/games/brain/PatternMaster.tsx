import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

const generatePattern = (level: number) => {
  const types = ['add', 'multiply', 'fibonacci', 'letters'];
  // Limit complex types for early levels
  const availableTypes = level < 3 ? ['add'] : level < 6 ? ['add', 'multiply'] : types;
  const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  
  let sequence: any[] = [];
  let answer: any;
  let options: any[] = [];

  if (type === 'add') {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 5) + 1;
    sequence = [start, start + step, start + step * 2, start + step * 3];
    answer = start + step * 4;
    options = [answer, answer - 1, answer + step, answer + 2].sort(() => Math.random() - 0.5);
  } else if (type === 'multiply') {
    const start = Math.floor(Math.random() * 3) + 2;
    const step = Math.floor(Math.random() * 2) + 2;
    sequence = [start, start * step, start * step * step, start * step * step * step];
    answer = start * step * step * step * step;
    options = [answer, answer + step, answer * 2, answer - start].sort(() => Math.random() - 0.5);
  } else if (type === 'fibonacci') {
    const start1 = Math.floor(Math.random() * 3) + 1;
    const start2 = start1 + Math.floor(Math.random() * 2) + 1;
    sequence = [start1, start2, start1 + start2, start1 + start2 * 2];
    answer = sequence[2] + sequence[3];
    options = [answer, answer + 1, answer - 1, answer + 2].sort(() => Math.random() - 0.5);
  } else {
    // Letters
    const startCode = 65 + Math.floor(Math.random() * 15); // A-O
    const step = Math.floor(Math.random() * 2) + 1;
    sequence = [
      String.fromCharCode(startCode),
      String.fromCharCode(startCode + step),
      String.fromCharCode(startCode + step * 2),
      String.fromCharCode(startCode + step * 3)
    ];
    answer = String.fromCharCode(startCode + step * 4);
    options = [
      answer, 
      String.fromCharCode(startCode + step * 5),
      String.fromCharCode(startCode + step * 4 + 1),
      String.fromCharCode(startCode + step * 4 - 1)
    ].sort(() => Math.random() - 0.5);
  }

  return { sequence, answer, options };
};

export const PatternMaster: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [patternData, setPatternData] = useState(() => generatePattern(1));
  const [timeLeft, setTimeLeft] = useState(15);
  const [shake, setShake] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<any>(null);

  // GameShell states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_pattern_best');
    if (saved) setBestScore(parseInt(saved, 10));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setPatternData(generatePattern(1));
    setIsPlaying(true);
    setIsGameOver(false);
    startTimer();
  };

  const startTimer = () => {
    setTimeLeft(15);
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

  const handleOptionClick = (opt: any) => {
    if (isGameOver || selectedOpt !== null) return;
    setSelectedOpt(opt);

    if (opt === patternData.answer) {
      // Correct
      playMatch();
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('vishal_pattern_best', newScore.toString());
      }
      setTimeout(() => {
        const nextLvl = level + 1;
        setLevel(nextLvl);
        setPatternData(generatePattern(nextLvl));
        setSelectedOpt(null);
        startTimer();
      }, 500);
    } else {
      // Wrong
      playPop();
      if (timerRef.current) clearInterval(timerRef.current);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => {
        setIsGameOver(true);
        setIsPlaying(false);
        playGameOver();
        setSelectedOpt(null);
      }, 800);
    }
  };

  return (
    <GameShell
      title="Pattern Master"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Identify the logic in the sequence and select the correct missing item before time runs out."
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-4 sm:gap-8 mb-6 w-full justify-center">
          <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score</p>
            <p className="text-2xl font-black text-blue-600 dark:text-amber-400">{score}</p>
          </div>
          <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Time</p>
            <p className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{timeLeft}s</p>
          </div>
          <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Best</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{bestScore}</p>
          </div>
        </div>

        <div className="w-full relative bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 min-h-[350px] flex flex-col items-center justify-center">
          
          {isPlaying && !isGameOver ? (
            <motion.div 
              key={level}
              initial={{ opacity: 0, y: 10 }} 
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, y: 0 }} 
              className="w-full flex flex-col items-center"
            >
              <p className="text-sm text-slate-500 font-bold mb-4 uppercase tracking-widest">Find the missing item</p>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {patternData.sequence.map((item, idx) => (
                  <div key={idx} className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600">
                    {item}
                  </div>
                ))}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-2xl font-black text-blue-500 dark:text-amber-400 border-2 border-dashed border-blue-400 dark:border-amber-500/50">
                  ?
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                {patternData.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    disabled={selectedOpt !== null}
                    className={`py-4 rounded-xl font-black text-xl sm:text-2xl shadow-sm transition-all active:scale-95 border
                      ${selectedOpt === opt 
                        ? opt === patternData.answer 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'bg-red-500 border-red-600 text-white'
                        : selectedOpt !== null && opt === patternData.answer
                          ? 'bg-emerald-500 border-emerald-600 text-white opacity-50' // Highlight correct if wrong was picked
                          : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                      }
                    `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center z-10">
              {isGameOver ? (
                <>
                  <h3 className="text-3xl font-black text-red-500 mb-2">Game Over</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Final Score: {score}</p>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all">
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Pattern Master</h3>
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
