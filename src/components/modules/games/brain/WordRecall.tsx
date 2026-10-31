import React, { useState, useEffect } from 'react';
import { ChevronLeft, Play, RotateCcw, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCustomizationModal } from '../shared/GameCustomizationModal';
import { hasAdminSession } from '../../../../lib/adminAuth';

interface Props {
  onBack: () => void;
}

const COMMON_WORDS = [
  "APPLE", "RIVER", "CHAIR", "TABLE", "OCEAN", "CLOUD", "TRAIN", "GHOST",
  "NIGHT", "DREAM", "STONE", "WATER", "BREAD", "HEART", "LIGHT", "SMILE",
  "EARTH", "PLANT", "CLOCK", "PAPER", "HOUSE", "MOUSE", "TIGER", "EAGLE",
  "BLOOD", "SUGAR", "STORM", "NOISE", "SPACE", "FRUIT", "PIANO", "BIRD"
];

export const WordRecall: React.FC<Props> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [bestLevel, setBestLevel] = useState(1);
  
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  const [phase, setPhase] = useState<'idle' | 'memorize' | 'recall' | 'result'>('idle');
  const [timeLeft, setTimeLeft] = useState(10);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isAuth, setIsAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (hasAdminSession()) return true;
      const profileRaw = localStorage.getItem('bharatjugaad_user_profile_v1');
      if (profileRaw) {
        const p = JSON.parse(profileRaw);
        if (p.isLoggedIn || p.email || p.mobile) return true;
      }
    } catch {}
    return false;
  });

  useEffect(() => {
    const saved = localStorage.getItem('vishal_word_recall_best');
    if (saved) setBestLevel(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setLevel(1);
    startLevel(1);
  };

  const startLevel = (lvl: number) => {
    const numWords = 2 + lvl; // L1: 3, L2: 4, L3: 5...
    const shuffled = [...COMMON_WORDS].sort(() => 0.5 - Math.random());
    
    const targets = shuffled.slice(0, numWords);
    // Add decoys
    const decoys = shuffled.slice(numWords, numWords + numWords + 2); // More decoys
    const allOptions = [...targets, ...decoys].sort(() => 0.5 - Math.random());

    setTargetWords(targets);
    setOptions(allOptions);
    setSelectedWords([]);
    setPhase('memorize');
    
    const timeToMemorize = Math.max(3, numWords * 1.5);
    setTimeLeft(Math.ceil(timeToMemorize));
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'memorize' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (phase === 'memorize' && timeLeft === 0) {
      setPhase('recall');
    }
    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const handleWordSelect = (word: string) => {
    if (phase !== 'recall') return;

    if (selectedWords.includes(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
    } else {
      if (selectedWords.length < targetWords.length) {
        setSelectedWords(prev => [...prev, word]);
      }
    }
  };

  const handleSubmit = () => {
    if (phase !== 'recall') return;
    setPhase('result');
  };

  const isCorrect = () => {
    if (selectedWords.length !== targetWords.length) return false;
    return selectedWords.every(w => targetWords.includes(w));
  };

  const handleNext = () => {
    if (isCorrect()) {
      const nextLvl = level + 1;
      setLevel(nextLvl);
      if (nextLvl > bestLevel) {
        setBestLevel(nextLvl);
        localStorage.setItem('vishal_word_recall_best', nextLvl.toString());
      }
      startLevel(nextLvl);
    } else {
      setPhase('idle');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fade-in flex flex-col items-center select-none">
      <div className="w-full flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Word Recall</h2>
        <div className="w-10 flex justify-end">
          {isAuth && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all shadow-xs"
              title="Game Customization & Settings"
              aria-label="Game Settings"
            >
              <Sliders className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

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

      <div className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Word Recall</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">Memorize the list of words, then pick them out from a larger list.</p>
              <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all mx-auto">
                <Play className="w-5 h-5" /> Start
              </button>
            </motion.div>
          )}

          {phase === 'memorize' && (
            <motion.div key="memorize" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center">
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-6">Memorize these words</p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {targetWords.map((w, i) => (
                  <span key={i} className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm font-black text-slate-900 dark:text-white text-lg border border-slate-200 dark:border-slate-600">
                    {w}
                  </span>
                ))}
              </div>
              <p className="text-4xl font-black text-blue-500 dark:text-amber-400 font-mono">{timeLeft}s</p>
            </motion.div>
          )}

          {phase === 'recall' && (
            <motion.div key="recall" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6 px-2">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-bold">Select the {targetWords.length} words you saw</p>
                <p className="text-sm font-black text-blue-600 dark:text-amber-400">{selectedWords.length} / {targetWords.length}</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                {options.map((w, i) => {
                  const isSelected = selectedWords.includes(w);
                  return (
                    <button
                      key={i}
                      onClick={() => handleWordSelect(w)}
                      className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold text-sm sm:text-base border transition-all active:scale-95
                        ${isSelected 
                          ? 'bg-blue-500 border-blue-600 text-white shadow-md' 
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'
                        }
                      `}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={selectedWords.length !== targetWords.length}
                className="w-full max-w-[200px] py-3 bg-emerald-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all active:scale-95"
              >
                Submit
              </button>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
              {isCorrect() ? (
                <>
                  <h3 className="text-3xl font-black text-emerald-500 mb-2">Perfect!</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">You remembered all words correctly.</p>
                  <button onClick={handleNext} className="px-6 py-3 bg-blue-500 dark:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl active:scale-95 transition-all mx-auto">
                    Next Level
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-3xl font-black text-red-500 mb-2">Game Over</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">You selected:</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {selectedWords.map(w => (
                      <span key={w} className={`px-2 py-1 text-xs rounded-md text-white font-bold ${targetWords.includes(w) ? 'bg-emerald-500' : 'bg-red-500'}`}>{w}</span>
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-2 text-xs">Correct words were:</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6 opacity-70">
                    {targetWords.map(w => (
                      <span key={w} className="px-2 py-1 text-xs bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-md font-bold">{w}</span>
                    ))}
                  </div>
                  <button onClick={startGame} className="px-6 py-3 bg-[#000080] hover:bg-blue-900 dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all mx-auto">
                    <RotateCcw className="w-5 h-5" /> Try Again
                  </button>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Customization Modal */}
      {isAuth && (
        <GameCustomizationModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          gameId="word"
          gameTitle="Word Recall"
        />
      )}
    </div>
  );
};
