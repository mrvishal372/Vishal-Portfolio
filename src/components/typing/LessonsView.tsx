import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  Keyboard, 
  Target, 
  Sparkles,
  Trophy,
  Zap
} from 'lucide-react';
import { TOUCH_TYPING_LESSONS, TouchTypingLesson } from '../modules/typing/typingData';

interface LessonsViewProps {
  onStartLesson: (lesson: TouchTypingLesson) => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onStartLesson }) => {
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('vyron_typing_completed_lessons');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  const categories = ['All', 'Home Row', 'Top Row', 'Bottom Row', 'Numbers & Symbols', 'Advanced Flow'];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredLessons = TOUCH_TYPING_LESSONS.filter(
    (l) => selectedCategory === 'All' || l.category === selectedCategory
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-bold border border-sky-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Structured Touch Typing Curriculum</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            12 Progressive Keyboard Mastery Lessons
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Condition your muscle memory to type without looking at your fingers. Master home row discipline, finger reach coordinates, capitalization, and programming symbols.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{completedLessonIds.length} of {TOUCH_TYPING_LESSONS.length} Completed</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Target: 40+ WPM with 95% Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => {
          const isCompleted = completedLessonIds.includes(lesson.id);

          return (
            <motion.div
              key={lesson.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300 font-black text-xs flex items-center justify-center font-mono">
                      {lesson.id}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {lesson.category}
                    </span>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>

                {/* Target Keys Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lesson.keys.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold border border-slate-200/80 dark:border-slate-700"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: <strong className="text-sky-600 dark:text-sky-400">{lesson.targetWpm} WPM</strong> · {lesson.targetAccuracy}% Acc
                </div>

                <button
                  type="button"
                  onClick={() => onStartLesson(lesson)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Drill</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
