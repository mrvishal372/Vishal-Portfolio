import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Eye, EyeOff, Play, Pause, Compass, Zap } from 'lucide-react';
import { PandaPetSettings } from '../../types/typing';

interface PandaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PandaPetSettings;
  onUpdateSettings: (updated: Partial<PandaPetSettings>) => void;
}

export const PandaSettingsModal: React.FC<PandaSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Panda Pet Preferences</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure your companion pet behavior</p>
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
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                {settings.visible ? (
                  <Eye className="w-4 h-4 text-emerald-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <span className="text-sm font-bold block">Panda Pet Visibility</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Show or hide the companion in background</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ visible: !settings.visible })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.visible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.visible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Animation Pause / Resume */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                {settings.isPaused ? (
                  <Pause className="w-4 h-4 text-amber-500" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-500" />
                )}
                <div>
                  <span className="text-sm font-bold block">Animation State</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Pause or resume wandering movements</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ isPaused: !settings.isPaused })}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                {settings.isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>

            {/* Movement Area / Placement */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> Movement Area
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'roaming', label: 'Wander Screen (Roaming)' },
                  { id: 'bottom-right', label: 'Bottom Right Corner' },
                  { id: 'bottom-left', label: 'Bottom Left Corner' },
                  { id: 'top-right', label: 'Top Right Corner' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateSettings({ location: opt.id as any })}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                      settings.location === opt.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Movement Speed */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  Panda Size
                </label>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {['small', 'medium', 'large'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onUpdateSettings({ size: s as any })}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                        settings.size === s
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Walk Pace
                </label>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {['slow', 'normal', 'playful'].map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => onUpdateSettings({ speed: sp as any })}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                        settings.speed === sp
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
            >
              Done & Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
