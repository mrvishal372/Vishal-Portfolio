import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Tab', desc: 'Restart test instantly', context: 'During test' },
    { key: 'Esc', desc: 'Exit active test or close modals', context: 'Global' },
    { key: 'Ctrl + Enter', desc: 'Start test or practice immediately', context: 'Dashboard' },
    { key: 'Ctrl + K', desc: 'Open quick navigation search', context: 'Global' },
    { key: 'Space', desc: 'Advance to next word in test', context: 'Typing' },
    { key: 'F', desc: 'Toggle immersive Fullscreen mode', context: 'During test' },
    { key: 'M', desc: 'Toggle mechanical audio clicks', context: 'Global' },
    { key: '?', desc: 'Show keyboard shortcuts guide', context: 'Global' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Keyboard Shortcuts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Streamline your typing workflow</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-4 max-h-[60vh] overflow-y-auto">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200 block">{sc.desc}</span>
                  <span className="text-[10px] text-slate-400">{sc.context}</span>
                </div>
                <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-emerald-400 shadow-2xs whitespace-nowrap">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
