import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { VyronTypingHeader, TypingViewTab } from './VyronTypingHeader';
import { TypingTestEngine } from './TypingTestEngine';
import { LessonsView } from './LessonsView';
import { CodeQuotesView } from './CodeQuotesView';
import { ExamModeView } from './ExamModeView';
import { AnalyticsView } from './AnalyticsView';
import { SettingsModal, TypingSettings } from './SettingsModal';
import { VyronHubDrawer } from './VyronHubDrawer';
import { TouchTypingLesson } from '../modules/typing/typingData';
import { soundEngine, SoundProfile } from '../modules/typing/soundEffects';
import { ModuleId, UserProfile } from '../../types';

interface VyronTypingPlatformProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSelectModule: (moduleId: ModuleId, query?: string) => void;
  onOpenExploreCategory: (cat: string) => void;
  onOpenProfile: () => void;
}

export const VyronTypingPlatform: React.FC<VyronTypingPlatformProps> = ({
  profile,
  onUpdateProfile,
  onSelectModule,
  onOpenExploreCategory,
  onOpenProfile,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TypingViewTab>('test');
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // External Text State for drill launched from Lessons or Code
  const [externalText, setExternalText] = useState<{
    text: string;
    title: string;
    mode: string;
  } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<TypingSettings>(() => {
    try {
      const saved = localStorage.getItem('vyron_typing_settings_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: profile.theme || 'dark',
      soundProfile: 'cherry-blue' as SoundProfile,
      soundVolume: 0.5,
      caretStyle: 'line',
      fontFamily: 'mono',
      fontSize: 'normal',
      pandaMode: 'active',
      blindMode: false,
      strictBackspace: false,
    };
  });

  // Sync settings sound engine
  useEffect(() => {
    soundEngine.setProfile(settings.soundProfile);
    soundEngine.setVolume(settings.soundVolume);
  }, [settings.soundProfile, settings.soundVolume]);

  // Persist settings
  const handleUpdateSettings = (newSettings: Partial<TypingSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      try {
        localStorage.setItem('vyron_typing_settings_v2', JSON.stringify(next));
      } catch {}
      if (newSettings.theme && newSettings.theme !== profile.theme) {
        onUpdateProfile({ theme: newSettings.theme });
      }
      return next;
    });
  };

  const handleResetSettings = () => {
    const defaults: TypingSettings = {
      theme: 'dark',
      soundProfile: 'cherry-blue',
      soundVolume: 0.5,
      caretStyle: 'line',
      fontFamily: 'mono',
      fontSize: 'normal',
      pandaMode: 'active',
      blindMode: false,
      strictBackspace: false,
    };
    handleUpdateSettings(defaults);
  };

  // Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ theme: nextTheme });
  };

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Launch lesson into typing test
  const handleStartLesson = (lesson: TouchTypingLesson) => {
    const combinedDrills = lesson.drills.join(' ');
    setExternalText({
      text: combinedDrills,
      title: lesson.title,
      mode: 'lesson'
    });
    setActiveTab('test');
  };

  // Launch code snippet into typing test
  const handleStartCodeOrQuote = (text: string, title: string, mode: string) => {
    setExternalText({
      text,
      title,
      mode
    });
    setActiveTab('test');
  };

  // Launch official exam passage into typing test
  const handleStartExam = (passageObj: any, durationSeconds: number, strictBackspace: boolean) => {
    handleUpdateSettings({ strictBackspace });
    setExternalText({
      text: passageObj.passage,
      title: passageObj.title,
      mode: 'exam'
    });
    setActiveTab('test');
  };

  return (
    <div className={`w-full rounded-3xl overflow-hidden flex flex-col transition-colors duration-200 shadow-md border border-slate-200/80 dark:border-slate-800/80 ${settings.theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Top Navigation Bar */}
      <VyronTypingHeader
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHub={() => setIsHubOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        soundProfile={settings.soundProfile}
        onChangeSoundProfile={(prof) => handleUpdateSettings({ soundProfile: prof })}
        isPandaEnabled={settings.pandaMode === 'active'}
        onTogglePanda={() => {
          handleUpdateSettings({
            pandaMode: settings.pandaMode === 'active' ? 'off' : 'active'
          });
        }}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6">
        
        {/* Breadcrumb banner if external drill loaded */}
        {externalText && activeTab === 'test' && (
          <div className="mb-4 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs text-left">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase px-2 py-0.5 rounded bg-sky-600 text-white text-[10px]">
                {externalText.mode}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {externalText.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExternalText(null)}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Reset to Standard Mode
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'test' && (
            <motion.div
              key="test-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <TypingTestEngine
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                externalText={externalText}
                onClearExternalText={() => setExternalText(null)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            </motion.div>
          )}

          {activeTab === 'lessons' && (
            <motion.div
              key="lessons-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <LessonsView onStartLesson={handleStartLesson} />
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <CodeQuotesView onSelectText={handleStartCodeOrQuote} />
            </motion.div>
          )}

          {activeTab === 'exam' && (
            <motion.div
              key="exam-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <ExamModeView
                onStartExam={handleStartExam}
                candidateName={profile.name}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics-view"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsView />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />

      {/* Vyron Super Hub Drawer (Access to all other app modules) */}
      <VyronHubDrawer
        isOpen={isHubOpen}
        onClose={() => setIsHubOpen(false)}
        onSelectModule={(id) => {
          onSelectModule(id);
        }}
        onOpenExploreCategory={(cat) => {
          onOpenExploreCategory(cat);
        }}
        onOpenProfile={onOpenProfile}
      />

      {/* Refined Minimalist Footer with mobile clearance */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 pb-6 sm:pb-4 text-xs text-slate-500 dark:text-slate-400 text-center">
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">VYRON TYPING</span>
            <span>·</span>
            <span>Created & Developed by Vishal Yadav</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span>Tab: Quick Restart</span>
            <span>·</span>
            <span>Esc: Exit Fullscreen</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsHubOpen(true)}
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
            >
              Open Other AI Tools →
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
