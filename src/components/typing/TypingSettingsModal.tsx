import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Volume2, VolumeX, Moon, Sun, Type, Sliders } from 'lucide-react';
import { UserPreferences } from '../../types/typing';

interface TypingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
}

export const TypingSettingsModal: React.FC<TypingSettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-white max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Platform Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Personalize your typing laboratory</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5 mt-5">
            {/* Theme Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Visual Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark', label: 'Dark Navy', icon: <Moon className="w-4 h-4" /> },
                  { id: 'light', label: 'Clean Light', icon: <Sun className="w-4 h-4" /> },
                  { id: 'system', label: 'System Default', icon: <Sliders className="w-4 h-4" /> },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => onUpdatePreferences({ theme: th.id as any })}
                    className={`p-3 rounded-2xl text-xs font-bold border flex flex-col items-center gap-1.5 transition-all ${
                      preferences.theme === th.id
                        ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {th.icon}
                    <span>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                {preferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <span className="text-sm font-bold block">Mechanical Keystroke Audio</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Tactile click feedback for keypresses</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.soundEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Typography & Font Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Text Font
                </label>
                <select
                  value={preferences.fontFamily}
                  onChange={(e) => onUpdatePreferences({ fontFamily: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-blue-500"
                >
                  <option value="sans">Clean Modern Sans</option>
                  <option value="mono">JetBrains / Fira Mono</option>
                  <option value="code">Consolas / Code Mono</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Font Size
                </label>
                <select
                  value={preferences.fontSize}
                  onChange={(e) => onUpdatePreferences({ fontSize: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none focus:border-blue-500"
                >
                  <option value="small">Compact (18px)</option>
                  <option value="medium">Standard (22px)</option>
                  <option value="large">Spacious (26px)</option>
                  <option value="xlarge">Extra Large (32px)</option>
                </select>
              </div>
            </div>

            {/* Cursor & Error Style */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Cursor Style
                </label>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {['line', 'block', 'underline'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdatePreferences({ cursorStyle: c as any })}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                        preferences.cursorStyle === c
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Error Highlight
                </label>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {['classic', 'subtle', 'outline'].map((er) => (
                    <button
                      key={er}
                      type="button"
                      onClick={() => onUpdatePreferences({ errorStyle: er as any })}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                        preferences.errorStyle === er
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {er}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Default Test Duration */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                Default Test Duration
              </label>
              <div className="flex gap-2">
                {[15, 30, 60, 120].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onUpdatePreferences({ defaultDuration: d })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      preferences.defaultDuration === d
                        ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Reduced Motion Accessibility */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-sm font-bold block">Reduced Motion</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Minimize animations and smooth scrolling</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdatePreferences({ reducedMotion: !preferences.reducedMotion })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.reducedMotion ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              Done & Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
