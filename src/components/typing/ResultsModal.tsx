import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Share2, 
  Check, 
  Award, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  Clock, 
  Target, 
  Activity,
  X
} from 'lucide-react';
import { ConfettiEffect } from '../modules/typing/ConfettiEffect';

export interface TestResultData {
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timeSeconds: number;
  correctChars: number;
  errorChars: number;
  extraChars: number;
  missedChars: number;
  wpmHistory: number[];
  errorKeyMap: Record<string, number>;
  testMode: string;
  isExam?: boolean;
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onNextTest: () => void;
  onPracticeWeakKeys?: (keys: string[]) => void;
  onOpenCertificate?: () => void;
  data: TestResultData;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  onNextTest,
  onPracticeWeakKeys,
  onOpenCertificate,
  data,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Rank determination
  const getRank = (wpm: number) => {
    if (wpm >= 105) return { title: 'Grandmaster Typer', color: 'text-amber-400', tier: 'Top 0.5% Global' };
    if (wpm >= 85) return { title: 'Master Typist', color: 'text-purple-400', tier: 'Top 3% Speed' };
    if (wpm >= 65) return { title: 'Speed Demon', color: 'text-sky-400', tier: 'Top 10% Fast' };
    if (wpm >= 45) return { title: 'Proficient Typer', color: 'text-emerald-400', tier: 'Above Average' };
    if (wpm >= 25) return { title: 'Rising Typist', color: 'text-blue-400', tier: 'Developing Steady Rhythm' };
    return { title: 'Novice Learner', color: 'text-slate-400', tier: 'Keep Practicing Daily' };
  };

  const rank = getRank(data.netWpm);

  // Top weak keys sorted by error frequency
  const weakKeys = Object.entries(data.errorKeyMap || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Share text
  const handleCopyResult = () => {
    const text = `⌨️ VYRON TYPING SPEED TEST\n🚀 Net Speed: ${data.netWpm} WPM (Raw: ${data.rawWpm} WPM)\n🎯 Accuracy: ${data.accuracy}%\n📈 Consistency: ${data.consistency}%\n⏱️ Duration: ${data.timeSeconds}s\n🏆 Rank: ${rank.title}\nTested on VYRON TYPING Lab`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // SVG Chart Calculation for WPM timeline
  const points = data.wpmHistory && data.wpmHistory.length > 1 ? data.wpmHistory : [data.netWpm, data.netWpm];
  const maxWpm = Math.max(...points, 60);
  const minWpm = Math.min(...points, 0);
  const chartWidth = 520;
  const chartHeight = 110;

  const getSvgPath = () => {
    if (points.length < 2) return '';
    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * (chartWidth - 20) + 10;
        const normalized = (val - minWpm) / (maxWpm - minWpm || 1);
        const y = chartHeight - normalized * (chartHeight - 24) - 12;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const svgPath = getSvgPath();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-md bg-slate-950/70">
        <ConfettiEffect active={data.netWpm >= 35 && data.accuracy >= 92} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Test Completed</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {data.testMode}
                  </span>
                </h2>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className={rank.color}>{rank.title}</span>
                  <span>·</span>
                  <span>{rank.tier}</span>
                </div>
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

          <div className="p-6 space-y-6">
            
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-left">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Net WPM</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400 tracking-tight tabular-nums mt-1">
                  {data.netWpm}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Raw: {data.rawWpm} WPM
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-left">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Accuracy</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums mt-1">
                  {data.accuracy}%
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {data.errorChars} typos recorded
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-left">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Consistency</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums mt-1">
                  {data.consistency}%
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Rhythm stability
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-left">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Time Taken</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-200 tracking-tight tabular-nums mt-1">
                  {data.timeSeconds}s
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {data.correctChars} chars typed
                </div>
              </div>
            </div>

            {/* Live Speed Trajectory Graph */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                  <span>Speed Progression Curve (Second by Second)</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Peak: {maxWpm} WPM
                </div>
              </div>

              <div className="w-full h-28 relative flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-full overflow-visible"
                >
                  {/* Grid lines */}
                  <line x1="10" y1="20" x2={chartWidth - 10} y2="20" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                  <line x1="10" y1="55" x2={chartWidth - 10} y2="55" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />
                  <line x1="10" y1="90" x2={chartWidth - 10} y2="90" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" />

                  {/* Gradient Area Fill under Curve */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {svgPath && (
                    <>
                      <path
                        d={`${svgPath} L ${chartWidth - 10} ${chartHeight - 6} L 10 ${chartHeight - 6} Z`}
                        fill="url(#chartGradient)"
                      />
                      <path
                        d={svgPath}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Character & Key Error Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Keystroke Breakdown</div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Correct Keystrokes:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{data.correctChars}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Incorrect Keystrokes:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{data.errorChars}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Extra Characters:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{data.extraChars}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Weakest Keys (Typos)</span>
                  {weakKeys.length > 0 && onPracticeWeakKeys && (
                    <button
                      type="button"
                      onClick={() => onPracticeWeakKeys(weakKeys.map(k => k[0]))}
                      className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Drill These
                    </button>
                  )}
                </div>
                {weakKeys.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {weakKeys.map(([key, count]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold"
                      >
                        '{key === ' ' ? 'Space' : key}': {count}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 italic pt-1">
                    Zero mistakes! Flawless precision.
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRestart}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart (Tab)</span>
                </button>

                <button
                  type="button"
                  onClick={onNextTest}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Text</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onOpenCertificate && (
                  <button
                    type="button"
                    onClick={onOpenCertificate}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>View Certificate</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Share Score'}</span>
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
