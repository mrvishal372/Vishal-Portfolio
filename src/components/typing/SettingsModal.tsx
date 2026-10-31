import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings2, 
  Volume2, 
  Type, 
  Eye, 
  Sparkles, 
  SlidersHorizontal,
  RotateCcw,
  Moon,
  Sun
} from 'lucide-react';
import { SoundProfile, soundEngine } from '../modules/typing/soundEffects';

export interface TypingSettings {
  theme: 'light' | 'dark';
  soundProfile: SoundProfile;
  soundVolume: number;
  caretStyle: 'line' | 'block' | 'underline';
  fontFamily: 'sans' | 'mono';
  fontSize: 'compact' | 'normal' | 'large';
  pandaMode: 'active' | 'minimal' | 'off';
  blindMode: boolean;
  strictBackspace: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TypingSettings;
  onUpdateSettings: (newSettings: Partial<TypingSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/70 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative text-left"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Typing Preferences & Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize tactile sound, caret mechanics, and UI layout.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Interface Color Scheme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-slate-800 text-white border-sky-500 shadow-xs ring-1 ring-sky-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-4 h-4 text-sky-400" />
                  <span>Dark Navy / Charcoal</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-sky-50 text-sky-700 border-sky-500 shadow-xs ring-1 ring-sky-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Clean Light Mode</span>
                </button>
              </div>
            </div>

            {/* Tactile Sound Profile */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mechanical Switch Sound
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Web Audio Synthesizer
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cherry-blue' as SoundProfile, name: 'Cherry Blue' },
                  { id: 'thock' as SoundProfile, name: 'Thocky Cream' },
                  { id: 'typewriter' as SoundProfile, name: 'Typewriter' },
                  { id: 'bubble' as SoundProfile, name: 'Soft Bubble' },
                  { id: 'mute' as SoundProfile, name: 'Muted (Silent)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ soundProfile: s.id });
                      soundEngine.setProfile(s.id);
                      if (s.id !== 'mute') soundEngine.playKeyClick('a');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      settings.soundProfile === s.id
                        ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 border-sky-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Caret Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Typing Caret Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'line' as const, name: '| Smooth Line' },
                  { id: 'block' as const, name: '▮ Solid Block' },
                  { id: 'underline' as const, name: '— Underline' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onUpdateSettings({ caretStyle: c.id })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      settings.caretStyle === c.id
                        ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 border-sky-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Font Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Text Scale
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact' as const, name: 'Compact (18px)' },
                  { id: 'normal' as const, name: 'Standard (22px)' },
                  { id: 'large' as const, name: 'Large (28px)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onUpdateSettings({ fontSize: f.id })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      settings.fontSize === f.id
                        ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-300 border-sky-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Panda Companion Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Panda Companion Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'active' as const, name: '🐼 Active Walking' },
                  { id: 'minimal' as const, name: '🐾 Corner Pill' },
                  { id: 'off' as const, name: 'Off (Focus)' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onUpdateSettings({ pandaMode: p.id })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                      settings.pandaMode === p.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Blind Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Blind Practice Mode
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hides the live speedometer & timer while typing to help you focus on pure rhythm.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.blindMode}
                onChange={(e) => onUpdateSettings({ blindMode: e.target.checked })}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onResetSettings}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
