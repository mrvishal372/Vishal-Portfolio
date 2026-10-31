import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  LayoutGrid, 
  Wrench, 
  Wallet, 
  FileText, 
  Pill, 
  Utensils, 
  BookOpen, 
  Landmark, 
  ShieldAlert, 
  Youtube, 
  Gamepad2, 
  Code2, 
  User, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ModuleId } from '../../types';

interface VyronHubDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: ModuleId) => void;
  onOpenExploreCategory: (category: string) => void;
  onOpenProfile: () => void;
}

export const VyronHubDrawer: React.FC<VyronHubDrawerProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onOpenExploreCategory,
  onOpenProfile,
}) => {
  if (!isOpen) return null;

  const aiModules: { id: ModuleId; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'cimage-logo',
      title: 'CIMAGE BCA Logo Maker',
      desc: '3D Gold batch logo creator with CIMAGE crest & code window',
      icon: ShieldAlert,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      id: 'money',
      title: 'Money Manager',
      desc: 'Daily expense logging, budget tracker & income calculator',
      icon: Wallet,
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      id: 'jugaad',
      title: 'Jugaad Fix',
      desc: 'Household DIY life hacks, repair tricks & instant fixes',
      icon: Wrench,
      color: 'text-sky-500 bg-sky-500/10'
    },
    {
      id: 'form',
      title: 'Form Alert',
      desc: 'Govt exam deadlines, vacancy notices & admit card alerts',
      icon: FileText,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'medicine',
      title: 'Sasti Dawai',
      desc: 'Generic medicine price comparison & chemical salt finder',
      icon: Pill,
      color: 'text-teal-500 bg-teal-500/10'
    },
    {
      id: 'recipe',
      title: 'Aaj Kya Banaoo',
      desc: 'Ingredient-based Indian kitchen recipe builder & chef tips',
      icon: Utensils,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      id: 'study',
      title: 'Last Night Padhai',
      desc: '2-minute high-yield revision notes & computer science quizzes',
      icon: BookOpen,
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      id: 'yojna',
      title: 'Meri Yojna',
      desc: 'Central & State Government welfare scheme eligibility finder',
      icon: Landmark,
      color: 'text-purple-500 bg-purple-500/10'
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end backdrop-blur-md bg-slate-950/70 overflow-hidden">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 text-left"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-xs">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Vyron Super Hub</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                    All Tools
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch to your other utilities, channels & labs anytime.
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

          {/* Hub Scroll Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Quick Links Section */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Explore Channels & Labs
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenExploreCategory('YouTube');
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-red-500/10 hover:border-red-500/40 transition-all cursor-pointer flex items-center gap-2.5 text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Youtube className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-500">
                      YouTube Videos
                    </div>
                    <div className="text-[10px] text-slate-500">
                      @mr_vishal372
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenExploreCategory('Coding Lab');
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-sky-500/10 hover:border-sky-500/40 transition-all cursor-pointer flex items-center gap-2.5 text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500">
                      Coding Lab
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Multi-compiler
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenExploreCategory('Games');
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-2.5 text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-500">
                      Games Hub
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Arcade & Brain
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenProfile();
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center gap-2.5 text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-500">
                      Profile / Portfolio
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Vishal Yadav
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* AI Utilities Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                AI Utilities & Modules
              </div>
              <div className="space-y-2">
                {aiModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        onSelectModule(mod.id);
                        onClose();
                      }}
                      className="w-full p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 bg-white dark:bg-slate-800/40 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                            {mod.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {mod.desc}
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
