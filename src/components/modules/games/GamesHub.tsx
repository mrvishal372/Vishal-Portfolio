import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Grid3X3, ArrowRightLeft, Square, Blocks, Activity } from 'lucide-react';
import { appleSpringFast } from '../../../lib/motionTokens';

// Game Components
import { SnakeGame } from './SnakeGame';
import { TicTacToe } from './TicTacToe';
import { Game2048 } from './Game2048';
import { MemoryGame } from './MemoryGame';
import { PingPong } from './PingPong';
import { BrainGamesHub } from './brain/BrainGamesHub';
import { TetrisGame } from './TetrisGame';
import { FlappyGame } from './FlappyGame';
import { SpaceShooter } from './SpaceShooter';
import { BattleRoyale3D } from './battle-royale/BattleRoyale3D';

export type GameId = 'none' | 'snake' | 'tictactoe' | '2048' | 'memory' | 'pingpong' | 'tetris' | 'flappy' | 'shooter' | 'battleroyale';
export type GameTab = 'fun' | 'brain';

interface GamesHubProps {
  initialGame?: GameId;
  isAuthenticated?: boolean;
}

const GAMES = [
  {
    id: 'battleroyale',
    title: 'Battle Royale 3D',
    description: 'Land • Loot • Survive • Win. 3D Survival.',
    icon: <Gamepad2 className="w-8 h-8 text-rose-500" />,
    color: 'from-rose-500/20 to-orange-500/20',
    borderColor: 'border-rose-500/30'
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Classic block-stacking puzzle challenge.',
    icon: <Gamepad2 className="w-8 h-8 text-blue-500" />,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'flappy',
    title: 'Flappy Style',
    description: 'Tap to fly through the endless pipes.',
    icon: <Gamepad2 className="w-8 h-8 text-amber-500" />,
    color: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'shooter',
    title: 'Space Shooter',
    description: 'Defend the galaxy from endless waves.',
    icon: <Gamepad2 className="w-8 h-8 text-indigo-500" />,
    color: 'from-indigo-500/20 to-purple-500/20',
    borderColor: 'border-indigo-500/30'
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Classic retro arcade challenge. Eat and grow!',
    icon: <Square className="w-8 h-8 text-emerald-500" />,
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    description: 'Play against a smart AI or a friend locally.',
    icon: <Grid3X3 className="w-8 h-8 text-blue-500" />,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: '2048',
    title: '2048',
    description: 'Slide and combine tiles to reach 2048.',
    icon: <Blocks className="w-8 h-8 text-amber-500" />,
    color: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Test your memory by flipping and matching cards.',
    icon: <ArrowRightLeft className="w-8 h-8 text-purple-500" />,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'pingpong',
    title: 'Ping Pong',
    description: 'Survive the endless rally against a smart AI paddle.',
    icon: <Activity className="w-8 h-8 text-rose-500" />,
    color: 'from-rose-500/20 to-pink-500/20',
    borderColor: 'border-rose-500/30'
  }
];

export const GamesHub: React.FC<GamesHubProps> = ({ initialGame = 'none', isAuthenticated }) => {
  const [activeTab, setActiveTab] = useState<GameTab>('fun');
  const [activeGame, setActiveGame] = useState<GameId>(initialGame);
  const [isBrainGameActive, setIsBrainGameActive] = useState(false);

  React.useEffect(() => {
    if (initialGame && initialGame !== 'none') {
      setActiveGame(initialGame);
      setActiveTab('fun');
    }
  }, [initialGame]);

  React.useEffect(() => {
    if (activeGame !== 'none' || isBrainGameActive) {
      document.body.classList.add('game-active');
    } else {
      document.body.classList.remove('game-active');
    }
    return () => {
      document.body.classList.remove('game-active');
    };
  }, [activeGame, isBrainGameActive]);

  // Active game rendering for Fun Games
  if (activeTab === 'fun') {
    if (activeGame === 'tetris') return <TetrisGame onBack={() => setActiveGame('none')} />;
    if (activeGame === 'flappy') return <FlappyGame onBack={() => setActiveGame('none')} />;
    if (activeGame === 'shooter') return <SpaceShooter onBack={() => setActiveGame('none')} />;
    if (activeGame === 'snake') return <SnakeGame onBack={() => setActiveGame('none')} />;
    if (activeGame === 'tictactoe') return <TicTacToe onBack={() => setActiveGame('none')} />;
    if (activeGame === '2048') return <Game2048 onBack={() => setActiveGame('none')} />;
    if (activeGame === 'memory') return <MemoryGame onBack={() => setActiveGame('none')} />;
    if (activeGame === 'pingpong') return <PingPong onBack={() => setActiveGame('none')} />;
    if (activeGame === 'battleroyale') return <BattleRoyale3D onBack={() => setActiveGame('none')} />;
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Category Tabs */}
      {activeGame === 'none' && !isBrainGameActive && (
        <div className="flex justify-center mb-6 mt-2 w-full">
          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex w-full sm:w-auto shadow-inner overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('fun')}
              className={`flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                activeTab === 'fun'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-amber-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Fun Games
            </button>
            <button
              onClick={() => setActiveTab('brain')}
              className={`flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
                activeTab === 'brain'
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Brain Games
            </button>
          </div>
        </div>
      )}

      {activeTab === 'fun' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-600 dark:to-purple-700 p-6 sm:p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 border border-blue-500/30 dark:border-white/10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner z-10">
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-sm" />
            </div>
            <div className="flex-1 z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-sm">Fun Games</h2>
              <p className="text-blue-100 sm:text-lg max-w-xl font-medium drop-shadow-sm">Take a quick break and play exciting games right from your browser.</p>
            </div>
            
            {/* Decorative background icon */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10 pointer-events-none rotate-12">
              <Gamepad2 className="w-64 h-64" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-10">
            {GAMES.map((game, idx) => (
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
      )}

      {activeTab === 'brain' && (
        <BrainGamesHub onGameActive={setIsBrainGameActive} />
      )}
    </div>
  );
};
