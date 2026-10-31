import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, X, Camera, Award } from 'lucide-react';

interface PandaPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  wpm: number;
}

export const PandaPhotoModal: React.FC<PandaPhotoModalProps> = ({
  isOpen,
  onClose,
  wpm,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl text-white overflow-hidden"
        >
          {/* Ambient Lighting Rings */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/30 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer z-10"
            title="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Real Giant Panda Photo Gallery</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  HD Nature
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Observing the natural focus and appetite of giant pandas eating fresh bamboo & cane
              </p>
            </div>
          </div>

          {/* Real Panda Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {/* Card 1: Eating Bamboo / Sugarcane Close Up */}
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-800/80 shadow-lg flex flex-col"
            >
              <div className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=700&auto=format&fit=crop&q=80"
                  alt="Real Giant Panda eating fresh bamboo and cane"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> Daily Champion
                </span>
                <span className="absolute bottom-2.5 left-3 right-3 text-sm font-bold text-white drop-shadow-md">
                  🐼 Bamboo & Cane Muncher
                </span>
              </div>
              <div className="p-3 text-xs text-slate-300 space-y-1 bg-slate-900/90">
                <p className="font-semibold text-emerald-300">
                  "Pandas chew up to 40 times per minute! Can your fingers match their rhythm?"
                </p>
                <p className="text-[11px] text-slate-400">
                  Current Session Speed: <strong className="text-emerald-400">{wpm} WPM</strong>
                </p>
              </div>
            </motion.div>

            {/* Card 2: Relaxed Panda Sitting in Forest */}
            <motion.div
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl overflow-hidden border-2 border-teal-500/40 bg-slate-800/80 shadow-lg flex flex-col"
            >
              <div className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1527118732049-c88155f2107c?w=700&auto=format&fit=crop&q=80"
                  alt="Giant Panda enjoying sweet stalks in natural sanctuary"
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-current" /> Pure Focus
                </span>
                <span className="absolute bottom-2.5 left-3 right-3 text-sm font-bold text-white drop-shadow-md">
                  🐼 Forest Sanctuary Stroll
                </span>
              </div>
              <div className="p-3 text-xs text-slate-300 space-y-1 bg-slate-900/90">
                <p className="font-semibold text-teal-300">
                  "Consistency and calm posture lead to high accuracy and high speed."
                </p>
                <p className="text-[11px] text-slate-400">
                  Practice daily to surpass 60+ Words Per Minute!
                </p>
              </div>
            </motion.div>
          </div>

          {/* Modal Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sparkles className="w-4 h-4" /> Live Panda Companion Active
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition-colors cursor-pointer"
            >
              Back to Typing ⌨️
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
