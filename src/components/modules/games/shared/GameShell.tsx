import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Maximize2, Minimize2, Volume2, VolumeX, Pause, Play, RotateCcw, Sliders } from 'lucide-react';
import { getSoundEnabled, setSoundEnabled } from './soundEngine';
import { motion } from 'motion/react';
import { useGameFullscreen } from '../../../../hooks/useGameFullscreen';
import { GameCustomizationModal } from './GameCustomizationModal';
import { BaseGameSettings } from '../../../../lib/gameSettingsStorage';
import { hasAdminSession } from '../../../../lib/adminAuth';

interface GameShellProps {
  title: string;
  gameId?: string;
  isAuthenticated?: boolean;
  onSettingsChange?: (settings: BaseGameSettings) => void;
  score?: number | string | null;
  bestScore?: number | string | null;
  level?: number | string | null;
  isPlaying?: boolean;
  isGameOver?: boolean;
  isPaused?: boolean;
  onBack: () => void;
  onRestart?: () => void;
  onPauseToggle?: (paused: boolean) => void;
  onPlay?: () => void;
  children: React.ReactNode;
  instructions?: string;
  className?: string;
}

export const GameShell: React.FC<GameShellProps> = ({
  title,
  gameId,
  isAuthenticated,
  onSettingsChange,
  score,
  bestScore,
  level,
  isPlaying,
  isGameOver,
  isPaused,
  onBack,
  onRestart,
  onPauseToggle,
  children,
  instructions,
  className = ''
}) => {
  const [sound, setSound] = useState(getSoundEnabled());
  const [size, setSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen: expanded, toggleFullscreen: toggleExpand, viewportSize } = useGameFullscreen(containerRef);

  // Map title to standardized gameId if not explicitly supplied
  const effectiveGameId = useMemo(() => {
    if (gameId) return gameId;
    const lower = (title || '').toLowerCase();
    if (lower.includes('snake')) return 'snake';
    if (lower.includes('tetris')) return 'tetris';
    if (lower.includes('flappy')) return 'flappy';
    if (lower.includes('space') || lower.includes('shooter')) return 'shooter';
    if (lower.includes('ping') || lower.includes('pong')) return 'pingpong';
    if (lower.includes('2048')) return '2048';
    if (lower.includes('memory') && !lower.includes('sequence') && !lower.includes('number') && !lower.includes('path')) return 'memory';
    if (lower.includes('tic')) return 'tictactoe';
    if (lower.includes('battle') || lower.includes('royale')) return 'battleroyale';
    if (lower.includes('sudoku')) return 'sudoku';
    if (lower.includes('sequence')) return 'sequence';
    if (lower.includes('number')) return 'number';
    if (lower.includes('difference')) return 'difference';
    if (lower.includes('pattern')) return 'pattern';
    if (lower.includes('10 to 1') || lower.includes('ten')) return 'tentoone';
    if (lower.includes('color') || lower.includes('trap')) return 'colortrap';
    if (lower.includes('word')) return 'word';
    if (lower.includes('odd')) return 'oddone';
    if (lower.includes('path')) return 'path';
    if (lower.includes('logic')) return 'logic';
    return lower.replace(/[^a-z0-9]/g, '');
  }, [gameId, title]);

  // Determine if user has authenticated access (admin or logged-in member)
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    if (isAuthenticated !== undefined) return isAuthenticated;
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
    if (isAuthenticated !== undefined) {
      setIsAuth(isAuthenticated);
    } else {
      try {
        const admin = hasAdminSession();
        const profileRaw = localStorage.getItem('bharatjugaad_user_profile_v1');
        const p = profileRaw ? JSON.parse(profileRaw) : null;
        setIsAuth(Boolean(admin || p?.isLoggedIn || p?.email || p?.mobile));
      } catch {}
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      const savedSize = localStorage.getItem('vishal_game_size');
      if (savedSize && ['small', 'normal', 'large'].includes(savedSize)) {
        setSize(savedSize as any);
      }
    } catch (e) {}
  }, []);

  const handleSoundToggle = () => {
    const newVal = !sound;
    setSound(newVal);
    setSoundEnabled(newVal);
  };

  const cycleSize = () => {
    const next = size === 'small' ? 'normal' : size === 'normal' ? 'large' : 'small';
    setSize(next);
    try {
      localStorage.setItem('vishal_game_size', next);
    } catch (e) {}
  };

  const sizeClass = expanded ? 'max-w-none w-full pt-4 sm:pt-8' : 
                    size === 'small' ? 'max-w-md' : 
                    size === 'large' ? 'max-w-4xl' : 'max-w-2xl';

  const shellContent = (
    <motion.div 
      layout={!expanded}
      transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
      ref={containerRef} 
      style={{ minHeight: expanded ? `${viewportSize.height}px` : undefined }}
      className={`game-shell mx-auto flex flex-col items-center bg-white dark:bg-slate-900 ${sizeClass} ${
        expanded 
          ? 'z-[99999] fixed inset-0 w-screen h-screen overflow-y-auto px-4 py-4 sm:py-6 shadow-2xl border-none m-0' 
          : 'relative w-full p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden'
      }`}
    >
      {/* Header */}
      <div className="game-toolbar w-full flex items-center justify-between mb-4 gap-2">
        <button onClick={onBack} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer">
          <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-white" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate flex-1 text-center">{title}</h2>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button onClick={handleSoundToggle} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer" title={sound ? 'Sound On' : 'Sound Off'}>
            {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          {isAuth && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all shadow-xs cursor-pointer"
              title="Game Customization & Settings"
              aria-label="Game Settings"
            >
              <Sliders className="w-5 h-5" />
            </button>
          )}
          {!expanded && (
            <button onClick={cycleSize} className="px-3 min-w-[44px] min-h-[44px] flex items-center justify-center py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer" title="Change Size">
              {size}
            </button>
          )}
          <button 
            onClick={toggleExpand} 
            className="px-2.5 py-2 sm:px-3 sm:py-2 min-w-[44px] min-h-[44px] rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 transition-colors flex items-center justify-center gap-1.5 font-bold shadow-sm active:scale-95 text-xs cursor-pointer" 
            title={expanded ? "Exit Full Screen" : "Enter Full Screen"}
            aria-label={expanded ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {expanded ? (
              <>
                <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      {(score !== undefined || bestScore !== undefined || level !== undefined) && (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4 w-full">
          {score !== undefined && score !== null && (
            <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl min-w-[80px] shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score</p>
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-amber-400">{score}</p>
            </div>
          )}
          {level !== undefined && level !== null && (
            <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl min-w-[80px] shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Level</p>
              <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{level}</p>
            </div>
          )}
          {bestScore !== undefined && bestScore !== null && (
            <div className="text-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl min-w-[80px] shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Best</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{bestScore}</p>
            </div>
          )}
        </div>
      )}

      {/* Game Content */}
      <div className={`w-full relative flex-1 flex flex-col items-center ${className}`}>
        {children}
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 w-full">
        {onPauseToggle && isPlaying && !isGameOver && (
          <button onClick={() => onPauseToggle(!isPaused)} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-2 transition-colors active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer">
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        {onRestart && (
          <button onClick={onRestart} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-2 transition-colors active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer">
            <RotateCcw className="w-5 h-5" /> Restart
          </button>
        )}
      </div>
      
      {instructions && (
        <p className="mt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center max-w-lg mx-auto leading-relaxed">
          {instructions}
        </p>
      )}

      {/* Game Customization Modal for Authenticated Users */}
      {isAuth && (
        <GameCustomizationModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          gameId={effectiveGameId}
          gameTitle={title}
          onSettingsSaved={(newSettings) => {
            if (onSettingsChange) onSettingsChange(newSettings);
          }}
        />
      )}
    </motion.div>
  );

  if (expanded && typeof document !== 'undefined') {
    return createPortal(shellContent, document.body);
  }

  return shellContent;
};
