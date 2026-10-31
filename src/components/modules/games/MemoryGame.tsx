import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { GameShell } from './shared/GameShell';
import { playPop, playMatch, playSuccess } from './shared/soundEngine';

interface MemoryGameProps {
  onBack: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🚀', '🌟', '🎮', '🍕', '🐱', '🎸', '🎨', '🔥', '💎', '🎯', '🥑', '⚡️', '🦄', '🎧', '🍔'];

const generateCards = (difficulty: Difficulty): Card[] => {
  let pairCount = 8;
  if (difficulty === 'easy') pairCount = 6;
  if (difficulty === 'hard') pairCount = 12;

  const selectedEmojis = EMOJIS.slice(0, pairCount);
  const pairs = [...selectedEmojis, ...selectedEmojis];
  
  // Shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false
  }));
};

export const MemoryGame: React.FC<MemoryGameProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>(() => generateCards('medium'));
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const resetGame = useCallback((newDiff?: Difficulty) => {
    const diff = newDiff || difficulty;
    setDifficulty(diff);
    setCards(generateCards(diff));
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setIsGameOver(false);
    setIsLocked(false);
  }, [difficulty]);

  useEffect(() => {
    if (flippedIds.length === 2) {
      setIsLocked(true);
      const [id1, id2] = flippedIds;
      const card1 = cards.find(c => c.id === id1);
      const card2 = cards.find(c => c.id === id2);

      if (card1 && card2 && card1.emoji === card2.emoji) {
        // Match
        setCards(prev => prev.map(c => 
          c.id === id1 || c.id === id2 ? { ...c, isMatched: true } : c
        ));
        setMatches(m => m + 1);
        setFlippedIds([]);
        setIsLocked(false);
        playMatch();
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c
          ));
          setFlippedIds([]);
          setIsLocked(false);
        }, 800);
      }
    }
  }, [flippedIds, cards]);

  useEffect(() => {
    const targetMatches = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 12;
    if (matches > 0 && matches === targetMatches) {
      setIsGameOver(true);
      playSuccess();
    }
  }, [matches, difficulty]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    setFlippedIds(prev => [...prev, id]);
    playPop();
    
    if (flippedIds.length === 1) {
      setMoves(m => m + 1);
    }
  };

  const gridCols = difficulty === 'easy' ? 'grid-cols-3 sm:grid-cols-4' : difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-6';

  return (
    <GameShell
      title="Memory Match"
      onBack={onBack}
      onRestart={() => resetGame()}
      isPlaying={!isGameOver}
      isGameOver={isGameOver}
      instructions="Flip cards to find matching pairs. Complete the board in the fewest moves possible."
    >
      <div className="flex flex-col items-center w-full">
        <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => resetGame(diff)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${difficulty === diff ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {diff.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-8 mb-8 w-full justify-center">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Moves</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{moves}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Matches</p>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{matches}</p>
          </div>
        </div>

        {!isGameOver ? (
          <div className={`grid ${gridCols} gap-3 sm:gap-4 w-full max-w-2xl`}>
            {cards.map(card => (
              <div 
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="aspect-[3/4] relative perspective-1000 cursor-pointer"
              >
                <motion.div
                  initial={false}
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                  className="w-full h-full relative preserve-3d"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front (Hidden state) */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-[#000080] to-blue-600 dark:from-slate-700 dark:to-slate-800 rounded-xl shadow-md border border-white/10 flex items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-8 h-8 rounded-full border-2 border-white/20" />
                  </div>
                  
                  {/* Back (Revealed state) */}
                  <div 
                    className={`absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-md border flex items-center justify-center text-4xl sm:text-5xl backface-hidden ${card.isMatched ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    {card.emoji}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-2xl text-center max-w-md w-full"
          >
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">You Won!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Completed in <span className="font-bold text-slate-900 dark:text-white">{moves}</span> moves.</p>
            <button
              onClick={() => resetGame()}
              className="w-full py-4 bg-[#000080] hover:bg-blue-900 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </div>
    </GameShell>
  );
};
