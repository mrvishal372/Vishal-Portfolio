import React, { useState, useEffect } from 'react';
import { VyronTypingLogo } from './VyronTypingLogo';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Moon, 
  Sun, 
  Settings2, 
  LayoutGrid, 
  Keyboard, 
  BookOpen, 
  Code2, 
  Award, 
  BarChart2, 
  Sparkles,
  Heart
} from 'lucide-react';
import { SoundProfile, soundEngine } from '../modules/typing/soundEffects';

export type TypingViewTab = 'test' | 'lessons' | 'code' | 'exam' | 'analytics';
export type TypingTab = TypingViewTab | string;

interface VyronTypingHeaderProps {
  activeTab: TypingViewTab;
  onSelectTab: (tab: TypingViewTab) => void;
  onOpenHub: () => void;
  onOpenSettings: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  soundProfile: SoundProfile;
  onChangeSoundProfile: (profile: SoundProfile) => void;
  isPandaEnabled: boolean;
  onTogglePanda: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const VyronTypingHeader: React.FC<VyronTypingHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenHub,
  onOpenSettings,
  isFullscreen,
  onToggleFullscreen,
  soundProfile,
  onChangeSoundProfile,
  isPandaEnabled,
  onTogglePanda,
  theme,
  onToggleTheme,
}) => {
  const isMuted = soundProfile === 'mute';

  const toggleSoundMute = () => {
    if (isMuted) {
      onChangeSoundProfile('cherry-blue');
      soundEngine.playKeyClick();
    } else {
      onChangeSoundProfile('mute');
    }
  };

  return (
    <header className="w-full backdrop-blur-xl bg-white/95 dark:bg-slate-950/95 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
      <div className="w-full px-3 sm:px-5 lg:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 flex-wrap lg:flex-nowrap">
        
        {/* Zone 1: Brand Wordmark (Clean single logo lockup without duplicate name text) */}
        <button
          type="button"
          onClick={() => onSelectTab('test')}
          className="focus:outline-hidden text-left cursor-pointer transition-transform active:scale-98 shrink-0 flex items-center"
          title="VYRON TYPING - Speed & Accuracy Lab"
        >
          <VyronTypingLogo size="sm" showSubtitle={true} />
        </button>

        {/* Zone 2: Primary Navigation Tabs (Pill style with overflow protection) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs font-semibold overflow-x-auto scrollbar-none py-0.5 max-w-full">
          <button
            type="button"
            onClick={() => onSelectTab('test')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'test'
                ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 font-bold shadow-xs border border-sky-200/80 dark:border-sky-800/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 shrink-0" />
            <span>Test</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('lessons')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'lessons'
                ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 font-bold shadow-xs border border-sky-200/80 dark:border-sky-800/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Lessons</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('code')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'code'
                ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 font-bold shadow-xs border border-sky-200/80 dark:border-sky-800/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span>Code & Quotes</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('exam')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'exam'
                ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 font-bold shadow-xs border border-sky-200/80 dark:border-sky-800/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span>Exam Mode</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 font-bold shadow-xs border border-sky-200/80 dark:border-sky-800/80'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 shrink-0" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Toggles (Compact, neatly wrapped, never cut off) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Panda Companion Toggle */}
          <button
            type="button"
            onClick={onTogglePanda}
            title={isPandaEnabled ? "Panda Companion Active (Click to Hide)" : "Enable Panda Companion"}
            className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 border shrink-0 ${
              isPandaEnabled 
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800/60 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <span className="text-xs sm:text-sm">🐼</span>
            <span className="hidden 2xl:inline text-[11px] font-bold">
              {isPandaEnabled ? 'Panda On' : 'Panda Off'}
            </span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={toggleSoundMute}
            title={isMuted ? "Unmute mechanical switches" : `Sound on: ${soundProfile}`}
            className={`p-1.5 sm:p-2 rounded-xl text-xs transition-all cursor-pointer border shrink-0 ${
              !isMuted 
                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 border-sky-200 dark:border-sky-800 shadow-xs'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen"}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer border shrink-0 ${
              isFullscreen
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Typing Preferences & Settings"
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer shrink-0"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Vyron Hub Drawer Button */}
          <button
            type="button"
            onClick={onOpenHub}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 whitespace-nowrap active:scale-95 shrink-0"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vyron Hub</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (Horizontal scroll with nice touch feedback) */}
      <div className="md:hidden flex items-center gap-1 border-t border-slate-200/60 dark:border-slate-800/60 px-3 py-1.5 bg-slate-50/60 dark:bg-slate-900/60 text-xs font-medium overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectTab('test')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'test'
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Test
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('lessons')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'lessons'
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Lessons
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('code')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'code'
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Code & Quotes
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('exam')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'exam'
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Exam Mode
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={`px-3 py-1 rounded-lg whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'analytics'
              ? 'bg-sky-600 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
