import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Search, Puzzle, ListOrdered, Palette, Replace, ActivitySquare, LayoutGrid, Eye, Map as MapIcon, Grid3X3 } from 'lucide-react';

import { SequenceMemory } from './SequenceMemory';
import { NumberMemory } from './NumberMemory';
import { DifferenceFinder } from './DifferenceFinder';
import { PatternMaster } from './PatternMaster';
import { LogicGrid } from './LogicGrid';
import { TenToOne } from './TenToOne';
import { ColorTrap } from './ColorTrap';
import { WordRecall } from './WordRecall';
import { OddOneOut } from './OddOneOut';
import { PathMemory } from './PathMemory';
import { SudokuGame } from './SudokuGame';

type GameId = 'none' | 'sequence' | 'number' | 'difference' | 'pattern' | 'logic' | 'tentoone' | 'colortrap' | 'word' | 'oddone' | 'path' | 'sudoku';

const BRAIN_GAMES = [
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Classic number logic puzzle.',
    icon: <Grid3X3 className="w-8 h-8 text-blue-500" />,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'sequence',
    title: 'Sequence Memory',
    description: 'Remember and repeat the growing pattern of tiles.',
    icon: <LayoutGrid className="w-8 h-8 text-blue-500" />,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'number',
    title: 'Number Memory',
    description: 'Memorize increasingly long numbers before they disappear.',
    icon: <ListOrdered className="w-8 h-8 text-emerald-500" />,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'pattern',
    title: 'Pattern Master',
    description: 'Find the missing item in logical sequences.',
    icon: <Puzzle className="w-8 h-8 text-amber-500" />,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'tentoone',
    title: '10 to 1 Challenge',
    description: 'Tap numbers in descending order as fast as possible.',
    icon: <ActivitySquare className="w-8 h-8 text-rose-500" />,
    color: 'from-rose-500/20 to-red-500/20',
    borderColor: 'border-rose-500/30'
  },
  {
    id: 'colortrap',
    title: 'Color Trap',
    description: 'Does the text match its ink color? Think fast!',
    icon: <Palette className="w-8 h-8 text-purple-500" />,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'word',
    title: 'Word Recall',
    description: 'Memorize words and find them among decoys.',
    icon: <Replace className="w-8 h-8 text-cyan-500" />,
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 'oddone',
    title: 'Odd One Out',
    description: 'Quickly spot the item that doesn\'t belong.',
    icon: <Search className="w-8 h-8 text-lime-500" />,
    color: 'from-lime-500/20 to-green-500/20',
    borderColor: 'border-lime-500/30'
  },
  {
    id: 'difference',
    title: 'Difference Finder',
    description: 'Test your observation by spotting subtle changes.',
    icon: <Eye className="w-8 h-8 text-fuchsia-500" />,
    color: 'from-fuchsia-500/20 to-purple-500/20',
    borderColor: 'border-fuchsia-500/30'
  },
  {
    id: 'logic',
    title: 'Logic Grid',
    description: 'Solve short logical deduction puzzles.',
    icon: <Brain className="w-8 h-8 text-violet-500" />,
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'border-violet-500/30'
  },
  {
    id: 'path',
    title: 'Path Memory',
    description: 'Trace the hidden path through the grid.',
    icon: <MapIcon className="w-8 h-8 text-orange-500" />,
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30'
  }
];

interface BrainGamesHubProps {
  onGameActive?: (active: boolean) => void;
}

export const BrainGamesHub: React.FC<BrainGamesHubProps> = ({ onGameActive }) => {
  const [activeGame, setActiveGame] = useState<GameId>('none');

  React.useEffect(() => {
    if (onGameActive) {
      onGameActive(activeGame !== 'none');
    }
  }, [activeGame, onGameActive]);

  if (activeGame === 'sequence') return <SequenceMemory onBack={() => setActiveGame('none')} />;
  if (activeGame === 'number') return <NumberMemory onBack={() => setActiveGame('none')} />;
  if (activeGame === 'difference') return <DifferenceFinder onBack={() => setActiveGame('none')} />;
  if (activeGame === 'pattern') return <PatternMaster onBack={() => setActiveGame('none')} />;
  if (activeGame === 'logic') return <LogicGrid onBack={() => setActiveGame('none')} />;
  if (activeGame === 'tentoone') return <TenToOne onBack={() => setActiveGame('none')} />;
  if (activeGame === 'colortrap') return <ColorTrap onBack={() => setActiveGame('none')} />;
  if (activeGame === 'word') return <WordRecall onBack={() => setActiveGame('none')} />;
  if (activeGame === 'oddone') return <OddOneOut onBack={() => setActiveGame('none')} />;
  if (activeGame === 'path') return <PathMemory onBack={() => setActiveGame('none')} />;
  if (activeGame === 'sudoku') return <SudokuGame onBack={() => setActiveGame('none')} />;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-indigo-700 dark:to-purple-700 p-6 sm:p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 border border-purple-500/30 dark:border-white/10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner z-10">
          <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-sm" />
        </div>
        <div className="flex-1 z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-sm">Brain Games</h2>
          <p className="text-purple-100 sm:text-lg max-w-xl font-medium drop-shadow-sm">Exercise your memory, logic, and observation skills.</p>
        </div>
        
        {/* Decorative background icon */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10 pointer-events-none rotate-12">
          <Brain className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-10">
        {BRAIN_GAMES.map((game, idx) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => setActiveGame(game.id as GameId)}
            className={`text-left relative p-6 rounded-3xl bg-gradient-to-br ${game.color} bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border ${game.borderColor} hover:shadow-lg transition-all duration-200 group active:scale-[0.98]`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm shrink-0">
                {game.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {game.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
