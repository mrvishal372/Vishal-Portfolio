import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, RotateCcw, Check, Sparkles, Sliders, Gauge, ShieldAlert,
  Volume2, VolumeX, Eye, Zap, Flame, Clock, Award, HelpCircle
} from 'lucide-react';
import { 
  BaseGameSettings, 
  GameSpeed, 
  GameDifficulty,
  loadGameSettings, 
  saveGameSettings, 
  resetGameSettings 
} from '../../../../lib/gameSettingsStorage';
import { playPop, playSuccess } from './soundEngine';

interface GameCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
  onSettingsSaved?: (settings: BaseGameSettings) => void;
}

export const GameCustomizationModal: React.FC<GameCustomizationModalProps> = ({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  onSettingsSaved
}) => {
  const [settings, setSettings] = useState<BaseGameSettings>(() => loadGameSettings(gameId));
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadGameSettings(gameId));
      setSavedToast(false);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, gameId]);

  const handleSpeedSelect = (speed: GameSpeed) => {
    playPop();
    setSettings(prev => ({ ...prev, speed }));
  };

  const handleDifficultySelect = (difficulty: GameDifficulty) => {
    playPop();
    setSettings(prev => ({ ...prev, difficulty }));
  };

  const handleSave = () => {
    playSuccess();
    const updated = saveGameSettings(gameId, settings);
    if (onSettingsSaved) {
      onSettingsSaved(updated);
    }
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 450);
  };

  const handleReset = () => {
    playPop();
    const reset = resetGameSettings(gameId);
    setSettings(reset);
    if (onSettingsSaved) {
      onSettingsSaved(reset);
    }
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3.5 sm:p-5 select-none font-['Poppins',sans-serif]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                    <span>{gameTitle}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Settings
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time dynamics & difficulty customization
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 scrollbar-thin">
              {/* Speed Settings */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-sky-500" />
                    <span>Game Speed</span>
                  </label>
                  <span className="text-xs font-semibold capitalize text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-900">
                    {settings.speed}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  {(['slow', 'normal', 'fast', 'extreme'] as GameSpeed[]).map((spd) => {
                    const isSelected = settings.speed === spd;
                    return (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedSelect(spd)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl transition-all capitalize text-center ${
                          isSelected
                            ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {spd === 'extreme' ? '🔥 Turbo' : spd}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Settings */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>Difficulty</span>
                  </label>
                  <span className="text-xs font-semibold capitalize text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                    {settings.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                  {(['easy', 'normal', 'hard', 'unbeatable'] as GameDifficulty[]).map((diff) => {
                    const isSelected = settings.difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => handleDifficultySelect(diff)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl transition-all capitalize text-center ${
                          isSelected
                            ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {diff === 'unbeatable' ? 'Master' : diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visuals & Audio Toggles */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Audio & Visuals</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setSettings(p => ({ ...p, soundEnabled: !p.soundEnabled }));
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      settings.soundEnabled
                        ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-100'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4" />}
                      <span className="text-xs font-semibold">Sound FX</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase">{settings.soundEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playPop();
                      setSettings(p => ({ ...p, animationsEnabled: !p.animationsEnabled }));
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      settings.animationsEnabled
                        ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-100'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-semibold">Animations</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase">{settings.animationsEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Game Specific Enhancements */}
              {/* Snake Specific */}
              {gameId === 'snake' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Snake Mechanics
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Wall Wrapping</div>
                      <div className="text-[11px] text-slate-500">Wrap across edges instead of dying on wall hit</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setSettings(p => ({ ...p, wallWrap: !p.wallWrap }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        settings.wallWrap
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {settings.wallWrap ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tetris Specific */}
              {gameId === 'tetris' && (
                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    Tetris Aids
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Ghost Piece</div>
                      <div className="text-[11px] text-slate-500">Show projection shadow where piece will land</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setSettings(p => ({ ...p, ghostPiece: !p.ghostPiece }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        settings.ghostPiece
                          ? 'bg-blue-500 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {settings.ghostPiece ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
              )}

              {/* Flappy Specific */}
              {gameId === 'flappy' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Flight Physics
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Pipe Gap Clearance</div>
                      <div className="text-[11px] text-slate-500">Wider gap makes passing easier</div>
                    </div>
                    <div className="flex gap-1">
                      {[140, 160, 190].map(gap => (
                        <button
                          key={gap}
                          type="button"
                          onClick={() => {
                            playPop();
                            setSettings(p => ({ ...p, pipeGap: gap }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            (settings.pipeGap || 160) === gap
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {gap === 140 ? 'Tight' : gap === 160 ? 'Norm' : 'Wide'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Ping Pong Specific */}
              {gameId === 'pingpong' && (
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-3">
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                    Rally Dynamics
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Target Score</div>
                      <div className="text-[11px] text-slate-500">Points needed to conclude the match</div>
                    </div>
                    <div className="flex gap-1">
                      {[5, 7, 11].map(pts => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => {
                            playPop();
                            setSettings(p => ({ ...p, maxScore: pts }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            (settings.maxScore || 7) === pts
                              ? 'bg-rose-500 text-white border-rose-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {pts} pts
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2048 Specific */}
              {gameId === '2048' && (
                <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 space-y-3">
                  <div className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
                    Tile Rules
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Undo Moves</div>
                      <div className="text-[11px] text-slate-500">Allow reverting accidental swipe decisions</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setSettings(p => ({ ...p, undoAllowed: !p.undoAllowed }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        settings.undoAllowed
                          ? 'bg-orange-500 text-white border-orange-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {settings.undoAllowed ? 'Permitted' : 'Hardcore'}
                    </button>
                  </div>
                </div>
              )}

              {/* Sudoku & Brain Puzzle Specific */}
              {(gameId === 'sudoku' || gameId === 'logic') && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
                  <div className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                    Assistance Tools
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Live Error Highlighting</div>
                      <div className="text-[11px] text-slate-500">Highlight rule conflicts immediately</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setSettings(p => ({ ...p, errorCheck: !p.errorCheck }));
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        settings.errorCheck
                          ? 'bg-indigo-500 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {settings.errorCheck ? 'Active' : 'Off'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                >
                  {savedToast ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Apply Real-Time</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
