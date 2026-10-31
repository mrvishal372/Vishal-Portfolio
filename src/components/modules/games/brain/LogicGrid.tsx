import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GameShell } from '../shared/GameShell';
import { playPop, playMatch, playGameOver } from '../shared/soundEngine';

interface Props {
  onBack: () => void;
}

const SHAPES = ['Square', 'Circle', 'Triangle', 'Star', 'Diamond'];
const COLORS = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];

const generateLogicPuzzle = (level: number) => {
  // Simple deduction puzzles
  // "If Red is left of Blue, and Green is right of Blue, what is in the middle?"
  
  const types = ['order', 'math', 'comparison'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  if (type === 'order' || level === 1) {
    const c1 = COLORS[Math.floor(Math.random() * COLORS.length)];
    let c2 = COLORS[Math.floor(Math.random() * COLORS.length)];
    while (c2 === c1) c2 = COLORS[Math.floor(Math.random() * COLORS.length)];
    let c3 = COLORS[Math.floor(Math.random() * COLORS.length)];
    while (c3 === c1 || c3 === c2) c3 = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    return {
      question: `If the ${c1} shape is to the left of the ${c2} shape, and the ${c3} shape is to the right of the ${c2} shape, which shape is in the middle?`,
      answer: c2,
      options: [c1, c2, c3, COLORS.find(c => c !== c1 && c !== c2 && c !== c3)].sort(() => Math.random() - 0.5)
    };
  } else if (type === 'comparison') {
    const s1 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let s2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    while (s2 === s1) s2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let s3 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    while (s3 === s1 || s3 === s2) s3 = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    return {
      question: `A ${s1} is heavier than a ${s2}. A ${s3} is lighter than a ${s2}. Which shape is the heaviest?`,
      answer: s1,
      options: [s1, s2, s3, "Cannot be determined"].sort(() => Math.random() - 0.5)
    };
  } else {
    // Simple math logic
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 5) + 2;
    const res = a * b;
    return {
      question: `If A + A = ${a * 2}, and A * B = ${res}, what is the value of B?`,
      answer: b.toString(),
      options: [b.toString(), (b + 1).toString(), (b - 1).toString(), (b + 2).toString()].sort(() => Math.random() - 0.5)
    };
  }
};

export const LogicGrid: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [puzzle, setPuzzle] = useState<any>(null);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vishal_logic_best');
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setPuzzle(generateLogicPuzzle(1));
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const handleOptionClick = (opt: any) => {
    if (isGameOver) return;

    if (opt === puzzle.answer) {
      // Correct
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('vishal_logic_best', newScore.toString());
      }
      
      const nextLvl = level + 1;
      setLevel(nextLvl);
      playMatch();
      setPuzzle(generateLogicPuzzle(nextLvl));
    } else {
      // Wrong
      setShake(true);
      playPop();
      setTimeout(() => setShake(false), 500);
      setTimeout(() => {
        setIsGameOver(true);
        setIsPlaying(false);
        playGameOver();
      }, 500);
    }
  };

  return (
    <GameShell
      title="Logic Grid"
      score={score}
      bestScore={bestScore}
      isPlaying={isPlaying}
      isGameOver={isGameOver}
      onBack={onBack}
      onRestart={startGame}
      onPlay={startGame}
      instructions="Read the statement carefully and deduce the correct answer based on logic."
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Score</p>
            <p className="text-3xl font-black text-blue-600 dark:text-amber-400">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase">Best</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{bestScore}</p>
          </div>
        </div>

        <div className="w-full relative bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 min-h-[350px] flex flex-col items-center justify-center">
          
          {isPlaying && !isGameOver && puzzle ? (
            <motion.div 
              key={level}
              initial={{ opacity: 0, x: 20 }} 
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : { opacity: 1, x: 0 }} 
              className="w-full flex flex-col"
            >
              <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-widest text-center">Question {level}</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-8 text-center leading-relaxed">
                "{puzzle.question}"
              </p>

              <div className="flex flex-col gap-3 w-full">
                {puzzle.options.map((opt: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    className="w-full py-4 px-6 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-95 transition-all text-left"
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
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Logic Grid</h3>
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
