import React, { useState, useEffect } from 'react';
import { PRESET_AVATARS, DEFAULT_AVATAR_DATA_URI, PresetAvatar } from '../lib/defaultAvatar';
import { X, Upload, Sparkles, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AvatarPickerModalProps {
  currentAvatarUrl?: string;
  onSelectAvatar: (dataUri: string) => void;
  onOpenUpload: () => void;
  onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  currentAvatarUrl,
  onSelectAvatar,
  onOpenUpload,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Tech' | 'Emoji' | 'Indian'>('All');

  useEffect(() => {
    if (document.body) {
      if (document.body) document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      if (document.body) {
        if (document.body) document.body.style.overflow = 'unset';
        document.documentElement.style.overflow = 'unset';
      }
    };
  }, []);

  const filtered = activeCategory === 'All'
    ? PRESET_AVATARS
    : PRESET_AVATARS.filter((a) => a.category === activeCategory);

  return (
    <AnimatePresence>
      <motion.div 
        key="avatar-picker-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="w-full max-w-lg bg-slate-900 border-0 sm:border border-slate-700/80 rounded-none sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col h-[100dvh] sm:h-auto sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">Choose Avatar & Emoji</h3>
                <p className="text-xs text-slate-400">Select an awesome 3D avatar, emoji, or upload photo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar">
            {(['All', 'Tech', 'Emoji', 'Indian'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat === 'All' ? '🌟 All Avatars' : cat === 'Tech' ? '👨‍💻 Tech & AI' : cat === 'Emoji' ? '😎 Emojis' : '🇮🇳 Bharat'}
              </button>
            ))}
          </div>

          {/* Grid of Avatars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 overflow-y-auto pr-1">
            {filtered.map((item: PresetAvatar) => {
              const isSelected = currentAvatarUrl === item.dataUri || (!currentAvatarUrl && item.dataUri === DEFAULT_AVATAR_DATA_URI);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectAvatar(item.dataUri);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-2xl flex flex-col items-center gap-2 border transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 hover:scale-[1.03]'
                  }`}
                >
                  {/* Avatar Preview */}
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-700 shadow-inner bg-slate-950 relative flex items-center justify-center">
                    <img
                      src={item.dataUri}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Name & Emoji */}
                  <div className="w-full">
                    <p className="text-xs font-semibold text-white truncate flex items-center justify-center gap-1">
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
            <button
              onClick={() => {
                onSelectAvatar(DEFAULT_AVATAR_DATA_URI);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Default 3D</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Custom Photo</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
