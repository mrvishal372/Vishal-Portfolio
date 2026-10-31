import React, { useState, useRef, useMemo, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ModuleId } from '../../types';
import { 
  Sparkles, 
  Play, 
  Youtube, 
  Gamepad2, 
  Keyboard, 
  Code2, 
  Terminal, 
  ArrowRight, 
  Trophy, 
  Target, 
  Clock, 
  Layers, 
  ChevronRight,
  Flame,
  CheckCircle2,
  FolderTree,
  Laptop,
  Eye,
  Activity,
  Zap,
  ExternalLink
} from 'lucide-react';
import { ExploreHeaderAnimation } from '../TabHeroAnimations';
import { appleCardHover, appleCardTap, appleSpringFast } from '../../lib/motionTokens';

import { GamesHub, GameId } from '../modules/games/GamesHub';
import { TypingMaster } from '../modules/typing/TypingMaster';
import { VyronTypingPlatform } from '../typing/VyronTypingPlatform';
import { CodingLab } from '../modules/coding/CodingLab';
import { AppCodeViewer } from '../modules/appcode/AppCode';
import { YouTubeChannelSection } from '../modules/youtube/YouTubeChannelSection';
import { subscribeToVideoUpdates, DEFAULT_VIDEOS } from '../../lib/videoStorage';
import { YouTubeVideo } from '../../types/video';
import { ScrollReveal } from '../common/ScrollReveal';

interface ExploreViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSelectModule: (module: ModuleId, query?: string) => void;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = memo(({ 
  profile, 
  onUpdateProfile, 
  onSelectModule, 
  isAdmin = false,
  isAuthenticated = false,
  initialCategory = 'All',
  onCategoryChange
}) => {
  // 'All' is placed FIRST as requested!
  const categories = useMemo(() => {
    return isAdmin
      ? ['All', 'YouTube', 'Games', 'Typing', 'Coding Lab', 'App Code']
      : ['All', 'YouTube', 'Games', 'Typing', 'Coding Lab'];
  }, [isAdmin]);

  const [filterCategory, setFilterCategory] = useState<string>(() => {
    if (initialCategory && (initialCategory === 'All' || categories.includes(initialCategory))) {
      return initialCategory;
    }
    return 'All';
  });

  const [selectedGameId, setSelectedGameId] = useState<GameId>('none');
  const [videos, setVideos] = useState<YouTubeVideo[]>(() => DEFAULT_VIDEOS);
  const categoryNavRef = useRef<HTMLDivElement | null>(null);

  // Sync external category changes (e.g. from /admin routing or quick header menu)
  useEffect(() => {
    if (initialCategory && categories.includes(initialCategory) && initialCategory !== filterCategory) {
      setFilterCategory(initialCategory);
    }
  }, [initialCategory, categories]);

  // Keep visitor safe from App Code
  useEffect(() => {
    if (!isAdmin && filterCategory === 'App Code') {
      setFilterCategory('All');
    }
  }, [isAdmin, filterCategory]);

  // Real-time video updates from storage
  useEffect(() => {
    const unsub = subscribeToVideoUpdates((updatedVideos) => {
      if (updatedVideos && updatedVideos.length > 0) {
        setVideos(updatedVideos);
      }
    });
    return () => unsub();
  }, []);

  const handleSelectCategory = (cat: string) => {
    setFilterCategory(cat);
    onCategoryChange?.(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavWheel = (e: React.WheelEvent) => {
    if (categoryNavRef.current && Math.abs(e.deltaY) > 0) {
      categoryNavRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  // Launch specific game directly
  const launchGame = (gameId: GameId) => {
    setSelectedGameId(gameId);
    handleSelectCategory('Games');
  };

  // Top videos for compact YouTube preview in 'All'
  const previewVideos = useMemo(() => {
    return (videos || []).slice(0, 3);
  }, [videos]);

  // 9 Games preview data for 'All' view
  const previewGames = useMemo(() => [
    { id: 'battleroyale' as GameId, title: 'Battle Royale 3D', icon: '🎯', badge: '3D Action', color: 'from-rose-500/20 to-orange-500/20', border: 'border-rose-500/30' },
    { id: 'snake' as GameId, title: 'Snake Retro', icon: '🐍', badge: 'Classic', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
    { id: 'tictactoe' as GameId, title: 'Tic-Tac-Toe', icon: '❌⭕', badge: 'AI & 2P', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
    { id: '2048' as GameId, title: '2048 Puzzle', icon: '🔢', badge: 'Numbers', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30' },
    { id: 'tetris' as GameId, title: 'Tetris Block', icon: '🕹️', badge: 'Stack', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30' },
    { id: 'shooter' as GameId, title: 'Space Shooter', icon: '🚀', badge: 'Arcade', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
    { id: 'flappy' as GameId, title: 'Flappy Bird', icon: '🐤', badge: 'Tap & Fly', color: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30' },
    { id: 'pingpong' as GameId, title: 'Ping Pong', icon: '🏓', badge: 'Paddle Rally', color: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30' },
    { id: 'none' as GameId, title: 'Brain Games', icon: '🧠', badge: '10 Logic Tests', color: 'from-violet-500/20 to-fuchsia-500/20', border: 'border-violet-500/30' }
  ], []);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <ScrollReveal cascadeIndex={0} reducedMotion={profile.reducedMotion}>
        <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md text-slate-900 dark:text-white overflow-hidden">
          <ExploreHeaderAnimation />
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-white/20 text-blue-700 dark:text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entertainment & Tech Hub • By Vishal Yadav (@mr_vishal372)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Explore All Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 max-w-2xl leading-relaxed">
              YouTube videos, 9 arcade & brain games, Typing Master speed test, multi-language Coding Lab compiler{isAdmin ? ', and live App Code viewer' : ''}.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Rearranged Category Pills - 'All' is FIRST with sleek design */}
      <ScrollReveal cascadeIndex={1} reducedMotion={profile.reducedMotion}>
        <div
          ref={categoryNavRef}
          onWheel={handleNavWheel}
          className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none overscroll-x-contain touch-pan-x border-b border-slate-200 dark:border-slate-800 px-1 pt-1 select-none"
        >
        {categories.map((cat) => {
          const isActive = filterCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={(e) => {
                handleSelectCategory(cat);
                const btn = e.currentTarget;
                const parent = categoryNavRef.current;
                if (parent && btn) {
                  const targetScroll = btn.offsetLeft - (parent.clientWidth / 2) + (btn.clientWidth / 2);
                  parent.scrollTo({ left: targetScroll, behavior: 'smooth' });
                }
              }}
              className={`relative px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all duration-200 shrink-0 select-none touch-manipulation cursor-pointer ${
                isActive
                  ? 'text-white dark:text-slate-950 shadow-md'
                  : 'bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 shadow-xs'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeExploreCat"
                  className={`absolute inset-0 rounded-2xl ${
                    cat === 'YouTube' 
                      ? 'bg-red-600 shadow-red-500/25' 
                      : cat === 'Games'
                      ? 'bg-purple-600 dark:bg-purple-400'
                      : cat === 'Typing'
                      ? 'bg-emerald-600 dark:bg-emerald-400'
                      : cat === 'Coding Lab'
                      ? 'bg-blue-600 dark:bg-sky-400'
                      : cat === 'App Code'
                      ? 'bg-amber-500 dark:bg-amber-400'
                      : 'bg-[#000080] dark:bg-amber-400'
                  } shadow-md`}
                  transition={appleSpringFast}
                />
              )}
              <span className="relative z-10 font-bold flex items-center gap-1.5">
                {cat === 'All' && (
                  <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300 dark:text-slate-950' : 'text-amber-500'}`} />
                )}
                {cat === 'YouTube' && (
                  <Youtube className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-red-600'}`} />
                )}
                {cat === 'Games' && (
                  <Gamepad2 className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-purple-600 dark:text-purple-400'}`} />
                )}
                {cat === 'Typing' && (
                  <Keyboard className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-emerald-600 dark:text-emerald-400'}`} />
                )}
                {cat === 'Coding Lab' && (
                  <Code2 className={`w-3.5 h-3.5 ${isActive ? 'text-white dark:text-slate-950' : 'text-blue-600 dark:text-sky-400'}`} />
                )}
                {cat === 'App Code' && (
                  <Terminal className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-500 dark:text-amber-400'}`} />
                )}

                <span>{cat}</span>

                {cat === 'All' && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${isActive ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    Hub
                  </span>
                )}
                {cat === 'YouTube' && (
                  <span className="relative flex h-2 w-2 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
                {cat === 'Games' && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${isActive ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950' : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'}`}>
                    9
                  </span>
                )}
                {cat === 'App Code' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Admin
                  </span>
                )}
              </span>
            </button>
          );
        })}
        </div>
      </ScrollReveal>

      {/* Explore Grid & Views */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={filterCategory}
          initial={{ opacity: 0, y: profile.reducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {filterCategory === 'YouTube' ? (
            <ScrollReveal cascadeIndex={2} reducedMotion={profile.reducedMotion}>
              <YouTubeChannelSection isAdmin={isAdmin} />
            </ScrollReveal>
          ) : filterCategory === 'Games' ? (
            <ScrollReveal cascadeIndex={2} reducedMotion={profile.reducedMotion}>
              <GamesHub initialGame={selectedGameId} isAuthenticated={isAuthenticated || isAdmin} />
            </ScrollReveal>
          ) : filterCategory === 'Typing' ? (
            <ScrollReveal cascadeIndex={2} reducedMotion={profile.reducedMotion}>
              <VyronTypingPlatform
                profile={profile}
                onUpdateProfile={onUpdateProfile}
                onSelectModule={onSelectModule}
                onOpenExploreCategory={(cat) => handleSelectCategory(cat)}
                onOpenProfile={() => handleSelectCategory('All')}
              />
            </ScrollReveal>
          ) : filterCategory === 'Coding Lab' ? (
            <ScrollReveal cascadeIndex={2} reducedMotion={profile.reducedMotion}>
              <CodingLab />
            </ScrollReveal>
          ) : (filterCategory === 'App Code' && isAdmin) ? (
            <ScrollReveal cascadeIndex={2} reducedMotion={profile.reducedMotion}>
              <AppCodeViewer />
            </ScrollReveal>
          ) : (
            /* ========================================================================= */
            /* 🌟 'ALL' CATEGORY VIEW: Compact, clean, modular sections for each feature */
            /* ========================================================================= */
            <div className="space-y-6">

              {/* 1. 📺 YouTube Category Section */}
              <ScrollReveal cascadeIndex={2} duration={0.45} blur={0} yOffset={16} reducedMotion={profile.reducedMotion}>
                <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/95 via-red-50/25 to-slate-50/90 dark:from-slate-900/90 dark:via-red-950/20 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-red-500/30 dark:border-red-500/20 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-red-200/50 dark:border-red-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/30 shrink-0">
                      <Youtube className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          YouTube Videos & Shorts
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold border border-red-200 dark:border-red-900">
                          Channel
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Watch latest tech, coding tutorials & college shorts from Vishal Yadav (@mr_vishal372)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('YouTube')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <span>View All Videos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Video previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                  {previewVideos.map((vid) => (
                    <motion.div
                      key={vid.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectCategory('YouTube')}
                      className="group cursor-pointer rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 overflow-hidden shadow-xs hover:shadow-md transition-colors flex flex-col"
                    >
                      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                        <img 
                          src={vid.thumbnailUrl} 
                          alt={vid.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-bold">
                          {vid.category || 'Video'}
                        </span>
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {vid.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{vid.viewsCount || '1.2K'} views</span>
                          <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                            <span>Watch</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* 2. 🎮 Games Hub Category Section */}
            <ScrollReveal cascadeIndex={3} duration={0.45} blur={0} yOffset={16} reducedMotion={profile.reducedMotion}>
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/95 via-purple-50/25 to-slate-50/90 dark:from-slate-900/90 dark:via-purple-950/20 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-purple-500/30 dark:border-purple-500/20 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-purple-200/50 dark:border-purple-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/30 shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          Games Hub
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-900">
                          9 Games Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Arcade, 3D Battle Royale, retro classics & 10 brain cognitive challenges
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('Games')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <span>View All Games</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 9 Games Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 pt-1">
                  {previewGames.map((game) => (
                    <motion.div
                      key={game.id + game.title}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => launchGame(game.id)}
                      className={`cursor-pointer p-3 rounded-2xl bg-gradient-to-br ${game.color} backdrop-blur-md border ${game.border} flex flex-col items-center justify-between text-center space-y-2 group shadow-xs hover:shadow-md transition-colors select-none`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
                        {game.icon}
                      </span>
                      <div className="space-y-0.5 min-w-0 w-full">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {game.title}
                        </h4>
                        <span className="inline-block text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                          {game.badge}
                        </span>
                      </div>
                      <span className="w-full py-1 rounded-xl bg-white/80 dark:bg-slate-900/80 text-purple-700 dark:text-purple-300 text-[10px] font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Play</span>
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* 3. ⌨️ Typing Master Category Section */}
            <ScrollReveal cascadeIndex={4} duration={0.45} blur={0} yOffset={16} reducedMotion={profile.reducedMotion}>
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/95 via-emerald-50/25 to-slate-50/90 dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-emerald-200/50 dark:border-emerald-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
                      <Keyboard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          Typing Master Lab
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900">
                          Speed & BCA Code
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Practice 15s/30s/60s speed tests, C/Java programming syntax typing & track live WPM
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('Typing')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <span>Open Typing Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Features & Quick Launch Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                      <Clock className="w-4 h-4" />
                      <span>Timed Speed Tests</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      15-sec, 30-sec & 60-sec real-time challenge with live speed speedometer.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                      <Code2 className="w-4 h-4" />
                      <span>BCA Code Typing Mode</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Practice C, Java & Python programming symbols, brackets and keywords.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                      <Target className="w-4 h-4" />
                      <span>Accuracy & History</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Accurate percentage calculation, error highlight & local history storage.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('Typing')}
                    className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Keyboard className="w-4 h-4" />
                    <span>Start Typing Speed Test Now →</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* 4. 💻 Coding Lab Category Section */}
            <ScrollReveal cascadeIndex={5} duration={0.45} blur={0} yOffset={16} reducedMotion={profile.reducedMotion}>
              <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/95 via-blue-50/25 to-slate-50/90 dark:from-slate-900/90 dark:via-blue-950/20 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-blue-500/30 dark:border-blue-500/20 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-blue-200/50 dark:border-blue-900/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          Coding Lab & Online Compiler
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 text-[10px] font-bold border border-blue-200 dark:border-blue-900">
                          Multi-Language
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Interactive Monaco IDE to compile and execute Python, C, C++, Java, JS & Web code
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('Coding Lab')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                  >
                    <span>Open Coding Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Languages and preview tags */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['Python', 'C', 'C++', 'Java', 'JavaScript', 'HTML/CSS/JS', 'SQL'].map((lang) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/80 text-blue-700 dark:text-sky-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800 shadow-2xs"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-blue-200/60 dark:border-blue-800/40 space-y-1">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-sky-300 font-bold text-xs">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Instant Cloud Execution</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        Powered by Piston runtime engine with interactive stdin/stdout terminal support.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-blue-200/60 dark:border-blue-800/40 space-y-1">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-sky-300 font-bold text-xs">
                        <FolderTree className="w-4 h-4 text-indigo-500" />
                        <span>Built-in BCA Practical Code</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        Ready-to-run templates for arrays, linked lists, loops, sorting & matrix logic.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('Coding Lab')}
                    className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Launch Online IDE & Run Code →</span>
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* 5. 🔐 App Code Category Section (For Admin) */}
            {isAdmin && (
              <ScrollReveal cascadeIndex={6} reducedMotion={profile.reducedMotion}>
                <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/25 to-slate-50/90 dark:from-slate-900/90 dark:via-amber-950/20 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-500/40 dark:border-amber-400/30 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-amber-200/50 dark:border-amber-900/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0 font-bold">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            App Code Studio
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                            Admin Only
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Live application source code, components architecture tree & Monaco editor
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectCategory('App Code')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
                    >
                      <span>Open App Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-amber-200/60 dark:border-amber-800/40 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Laptop className="w-4 h-4 text-amber-500" />
                      <span>Full Project Architecture & Live Editing</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Inspect and edit files in real-time (`server.ts`, `src/App.tsx`, `components/`, `data/`) with secure admin token authentication.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSelectCategory('App Code')}
                      className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Open Source Code Viewer Now →</span>
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            )}

            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
