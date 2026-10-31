import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Play,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Trophy,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { TypingSession } from '../../types/typing';

interface TypingResultsProps {
  session: TypingSession;
  onRetake: () => void;
  onTryAnother: () => void;
  onViewDashboard: () => void;
}

export const TypingResults: React.FC<TypingResultsProps> = ({
  session,
  onRetake,
  onTryAnother,
  onViewDashboard,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMistakesReview, setShowMistakesReview] = useState(false);

  // Speed rating
  const getRating = (wpm: number) => {
    if (wpm >= 85) return { tier: 'Grandmaster 🏆', color: 'text-amber-400' };
    if (wpm >= 65) return { tier: 'Master ⚡', color: 'text-cyan-400' };
    if (wpm >= 45) return { tier: 'Touch Typist 🚀', color: 'text-emerald-400' };
    if (wpm >= 30) return { tier: 'Intermediate 📈', color: 'text-blue-400' };
    return { tier: 'Beginner 🐢', color: 'text-slate-400' };
  };

  const rating = getRating(session.netWpm);

  // Copy Results to Clipboard
  const handleCopyResults = () => {
    const textToCopy = `⌨️ VYRON TYPING Result\n⚡ Speed: ${session.netWpm} Net WPM (${session.grossWpm} Gross WPM)\n🎯 Accuracy: ${session.accuracy}%\n❌ Errors: ${session.errors}\n⏱️ Duration: ${session.duration}s\nTier: ${rating.tier}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share Results via native Web Share API
  const handleShareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VYRON TYPING Test Results',
          text: `I just achieved ${session.netWpm} Net WPM with ${session.accuracy}% accuracy on VYRON TYPING!`,
          url: window.location.href,
        });
      } catch {
        handleCopyResults();
      }
    } else {
      handleCopyResults();
    }
  };

  // SVG Speed Curve calculation
  const historyData = session.speedHistory || [];
  const maxWpm = Math.max(60, ...historyData.map((d) => d.wpm));
  const svgWidth = 400;
  const svgHeight = 120;

  const points = historyData.length > 1
    ? historyData.map((pt, i) => {
        const x = (i / (historyData.length - 1)) * svgWidth;
        const y = svgHeight - (pt.wpm / maxWpm) * (svgHeight - 20) - 10;
        return `${x},${y}`;
      }).join(' ')
    : '';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/20">
          <Trophy className="w-3.5 h-3.5" />
          <span>Test Session Completed</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
          Performance Breakdown
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Here is your comprehensive typing speed and precision analysis
        </p>
      </div>

      {/* Primary Result Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Net WPM */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-cyan-500/40 shadow-md text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Net WPM</span>
          <span className="text-4xl sm:text-5xl font-black text-cyan-600 dark:text-cyan-400 block leading-none">
            {session.netWpm}
          </span>
          <span className={`text-xs font-bold mt-2 inline-block ${rating.color}`}>
            {rating.tier}
          </span>
        </div>

        {/* Accuracy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-md text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Accuracy</span>
          <span className="text-4xl sm:text-5xl font-black text-emerald-500 block leading-none">
            {session.accuracy}%
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-2 inline-block">
            {session.accuracy >= 98 ? 'Flawless Rhythm' : 'Good Precision'}
          </span>
        </div>

        {/* Gross WPM */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gross WPM</span>
          <span className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-200 block leading-none mt-1">
            {session.grossWpm}
          </span>
          <span className="text-[11px] text-slate-400 mt-2 inline-block">
            CPM: {session.cpm}
          </span>
        </div>

        {/* Errors & Chars */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mistakes</span>
          <span className="text-3xl sm:text-4xl font-black text-rose-500 block leading-none mt-1">
            {session.errors}
          </span>
          <span className="text-[11px] text-slate-400 mt-2 inline-block">
            {session.correctChars} / {session.totalChars} Chars
          </span>
        </div>
      </div>

      {/* Speed Time-Series Chart (if data points exist) */}
      {historyData.length > 2 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span>Speed Consistency Curve (WPM over seconds)</span>
            </span>
            <span className="text-slate-400">Peak: {maxWpm} WPM</span>
          </div>

          <div className="w-full h-32 relative flex items-center justify-center">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area under curve */}
              <polygon
                points={`0,${svgHeight} ${points} ${svgWidth},${svgHeight}`}
                fill="url(#chartGradient)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>
        </div>
      )}

      {/* Mistake Review Toggle */}
      {session.mistakes && session.mistakes.length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Review Mistyped Keystrokes ({session.mistakes.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowMistakesReview(!showMistakesReview)}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              {showMistakesReview ? 'Hide Review' : 'Show Details'}
            </button>
          </div>

          <AnimatePresence>
            {showMistakesReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto text-xs"
              >
                {session.mistakes.slice(0, 15).map((m, i) => (
                  <div key={i} className="py-2 flex items-center justify-between font-mono">
                    <span className="text-slate-500">Char #{m.index} in Word #{m.wordIndex + 1}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Expected: <strong className="text-emerald-500">{m.expected === ' ' ? 'SPACE' : m.expected}</strong></span>
                      <span className="text-slate-400">Typed: <strong className="text-rose-500">{m.typed === ' ' ? 'SPACE' : m.typed}</strong></span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          type="button"
          onClick={onRetake}
          className="p-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Test</span>
        </button>

        <button
          type="button"
          onClick={onTryAnother}
          className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4" />
          <span>New Text</span>
        </button>

        <button
          type="button"
          onClick={handleCopyResults}
          className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
        </button>

        <button
          type="button"
          onClick={onViewDashboard}
          className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 text-blue-500" />
          <span>View Progress</span>
        </button>
      </div>
    </div>
  );
};
