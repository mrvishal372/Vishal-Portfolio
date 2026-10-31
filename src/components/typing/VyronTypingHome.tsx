import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  ArrowRight,
  BookOpen,
  Keyboard,
  Trophy,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Clock,
  Layers,
  GraduationCap,
  RotateCcw
} from 'lucide-react';
import { TypingTab } from './VyronTypingHeader';
import { PRACTICE_MODULES } from './typingData';

interface VyronTypingHomeProps {
  onSelectTab: (tab: TypingTab) => void;
  onStartTest: (category?: string) => void;
  bestWpm?: number;
  totalTests?: number;
}

export const VyronTypingHome: React.FC<VyronTypingHomeProps> = ({
  onSelectTab,
  onStartTest,
  bestWpm = 0,
  totalTests = 0,
}) => {
  // Interactive Hero Typing Preview Widget State
  const previewSampleText = "Focus on clean rhythm and accuracy; speed will naturally follow.";
  const [previewInput, setPreviewInput] = useState("");
  const previewInputRef = useRef<HTMLInputElement>(null);
  const [previewStartTime, setPreviewStartTime] = useState<number | null>(null);

  const handlePreviewInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!previewStartTime && val.length > 0) {
      setPreviewStartTime(Date.now());
    }
    setPreviewInput(val.substring(0, previewSampleText.length));
  };

  const handlePreviewReset = () => {
    setPreviewInput("");
    setPreviewStartTime(null);
    previewInputRef.current?.focus();
  };

  // Preview calculations
  const previewElapsedMin = previewStartTime ? Math.max(0.02, (Date.now() - previewStartTime) / 60000) : 0.02;
  let previewErrors = 0;
  for (let i = 0; i < previewInput.length; i++) {
    if (previewInput[i] !== previewSampleText[i]) previewErrors++;
  }
  const previewCorrect = Math.max(0, previewInput.length - previewErrors);
  const previewWpm = previewStartTime && previewInput.length > 0 ? Math.round((previewCorrect / 5) / previewElapsedMin) : 0;
  const previewAcc = previewInput.length > 0 ? Math.round((previewCorrect / previewInput.length) * 100) : 100;

  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-fade-in pb-16">
      {/* =================================================================== */}
      {/* 🌟 HERO SECTION                                                     */}
      {/* =================================================================== */}
      <section className="relative pt-6 sm:pt-12 px-2">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
          {/* Subtle Technology Kicker (Zero-pill discipline: unboxed clean text) */}
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping inline-block" />
            <span>Next-Generation Typing Laboratory</span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">Precision Touch Typing</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white max-w-3xl leading-[1.12]">
            Master Your Typing. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
              Unlock Your Speed.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
            Improve your typing speed, accuracy, and confidence with smart practice, real-time feedback, and personalized progress tracking.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSelectTab('test')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Typing Test</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('practice')}
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm sm:text-base border border-slate-200 dark:border-slate-700/80 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-500" />
              <span>Explore Practice</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ⌨️ INTERACTIVE LIVE TYPING PREVIEW WIDGET                          */}
        {/* ================================================================= */}
        <div className="max-w-3xl mx-auto mt-10">
          <div className="relative rounded-3xl bg-slate-900 text-slate-100 p-6 sm:p-8 shadow-2xl border border-slate-800 backdrop-blur-xl">
            {/* Top Bar with Live Indicator */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-300">Live Interactive Typing Sandbox</span>
                <span className="hidden sm:inline text-slate-500">(Type directly below to try)</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-slate-400 font-semibold">Speed:</span>
                  <span className="text-cyan-400 font-black">{previewWpm} WPM</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-slate-400 font-semibold">Accuracy:</span>
                  <span className="text-emerald-400 font-black">{previewAcc}%</span>
                </div>
                <button
                  type="button"
                  onClick={handlePreviewReset}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Reset Sandbox"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Typing Sentence Display */}
            <div
              onClick={() => previewInputRef.current?.focus()}
              className="relative text-lg sm:text-xl font-mono leading-relaxed cursor-text min-h-[72px]"
            >
              {/* Hidden real input */}
              <input
                ref={previewInputRef}
                type="text"
                value={previewInput}
                onChange={handlePreviewInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                autoComplete="off"
                spellCheck="false"
              />

              {/* Rendered Colored Characters */}
              <div className="select-none break-words relative z-0">
                {previewSampleText.split('').map((char, idx) => {
                  let charClass = "text-slate-500";
                  let isCurrent = idx === previewInput.length;
                  if (idx < previewInput.length) {
                    charClass = previewInput[idx] === char ? "text-emerald-400" : "text-rose-400 bg-rose-950/60 rounded px-0.5";
                  }

                  return (
                    <span key={idx} className={`transition-colors duration-75 relative ${charClass}`}>
                      {isCurrent && (
                        <span className="inline-block w-0.5 h-5 bg-cyan-400 animate-pulse align-middle -mb-1 mr-0.5" />
                      )}
                      {char}
                    </span>
                  );
                })}
              </div>

              {previewInput.length === 0 && (
                <div className="mt-3 text-xs text-slate-500 italic">
                  Tip: Click here and press any key to test the interactive engine...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 📊 HONEST FEATURE STATS STRIP                                     */}
        {/* ================================================================= */}
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-2">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-center shadow-xs">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Typing Practice</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">15 Modules</p>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-0.5">Rows & Vocabulary</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Speed Tracking</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">Gross &amp; Net</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Precision CPM &amp; WPM</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accuracy Analysis</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">Error Heatmap</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Mistake Review</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Progress History</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalTests > 0 ? `${totalTests} Tests` : 'Saved Local'}</p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">{bestWpm > 0 ? `Best: ${bestWpm} WPM` : 'Trend Analytics'}</p>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 🚀 QUICK TEST CATEGORIES                                            */}
      {/* =================================================================== */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              Curated Practice Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select any domain to launch an instant 60-second typing test
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('practice')}
            className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All 15 Modules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            {
              id: 'common',
              title: 'Common English Words',
              desc: 'High-frequency vocabulary essential for baseline touch-typing velocity.',
              tag: 'Core Speed',
              icon: <BookOpen className="w-5 h-5 text-blue-500" />
            },
            {
              id: 'computer_it',
              title: 'Computer & IT Systems',
              desc: 'Operating systems, network protocols, databases, and architecture terms.',
              tag: 'Technical',
              icon: <Layers className="w-5 h-5 text-cyan-500" />
            },
            {
              id: 'programming',
              title: 'Programming Code & Syntax',
              desc: 'JavaScript, TypeScript, Python, and SQL keywords, brackets, and syntax.',
              tag: 'Code Lab',
              icon: <Zap className="w-5 h-5 text-emerald-500" />
            },
            {
              id: 'college',
              title: 'Collegiate & Academic',
              desc: 'Advanced academic discourse, research methodology, and exam vocabulary.',
              tag: 'Higher Ed',
              icon: <GraduationCap className="w-5 h-5 text-purple-500" />
            },
            {
              id: 'business',
              title: 'Business & Office Writing',
              desc: 'Professional communication, client deliverables, and corporate emails.',
              tag: 'Corporate',
              icon: <Target className="w-5 h-5 text-amber-500" />
            },
            {
              id: 'knowledge',
              title: 'General Knowledge & Science',
              desc: 'Astronomy, biology, geology, and fascinating historical discoveries.',
              tag: 'Knowledge',
              icon: <Sparkles className="w-5 h-5 text-teal-500" />
            },
          ].map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectTab('test');
                onStartTest(cat.id);
              }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
                <span>Start Test →</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 📚 STRUCTURED CURRICULUM BANNER                                     */}
      {/* =================================================================== */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Step-by-Step Learning Path
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              5 Structured Typing Levels
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              From absolute beginner posture and Home Row (ASDF JKL;) keys to high-speed collegiate endurance drills. Track your lesson progress step by step.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('lessons')}
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            Open Structured Lessons →
          </button>
        </div>
      </section>
    </div>
  );
};
