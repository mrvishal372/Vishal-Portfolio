import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  RotateCcw,
  Clock,
  Target,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Keyboard,
  Info,
  Pause,
  ArrowLeft,
  Sliders,
  Flame,
  Zap,
  HelpCircle
} from 'lucide-react';
import {
  TestSettings,
  TypingSession,
  SpeedDataPoint,
  MistakeDetail,
  TextCategory,
  TypingDifficulty,
  UserPreferences
} from '../../types/typing';
import { CATEGORY_TEXTS } from './typingData';
import { soundEngine } from '../modules/typing/soundEffects';
import { VirtualKeyboard } from '../modules/typing/VirtualKeyboard';

interface TypingEngineProps {
  initialSettings?: Partial<TestSettings>;
  preferences: UserPreferences;
  onTestComplete: (session: TypingSession) => void;
  onExit: () => void;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  initialSettings,
  preferences,
  onTestComplete,
  onExit,
}) => {
  // Settings
  const [duration, setDuration] = useState<number>(initialSettings?.duration ?? preferences.defaultDuration ?? 60);
  const [difficulty, setDifficulty] = useState<TypingDifficulty>(initialSettings?.difficulty ?? preferences.defaultDifficulty ?? 'intermediate');
  const [category, setCategory] = useState<TextCategory>(initialSettings?.category ?? 'common');
  const [customText, setCustomText] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Test state
  const [text, setText] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [errors, setErrors] = useState<number>(0);
  const [totalTyped, setTotalTyped] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [hasErrorRecently, setHasErrorRecently] = useState<boolean>(false);
  const [lastChar, setLastChar] = useState<string>('');

  // Live Time-Series for Charting
  const speedHistoryRef = useRef<SpeedDataPoint[]>([]);
  const mistakesRef = useRef<MistakeDetail[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate target passage
  const generatePassage = useCallback(() => {
    if (category === 'custom' && customText.trim().length > 0) {
      setText(customText.trim());
      return;
    }

    const catPool = CATEGORY_TEXTS[category] || CATEGORY_TEXTS.common;
    const diffPool = catPool[difficulty] || catPool.intermediate;

    // Pick 2-4 sentences based on duration
    const count = duration === 15 ? 1 : duration === 30 ? 2 : duration === 60 ? 3 : 5;
    let combined = "";
    for (let i = 0; i < count; i++) {
      combined += diffPool[Math.floor(Math.random() * diffPool.length)] + " ";
    }
    setText(combined.trim());
  }, [category, difficulty, duration, customText]);

  // Reset & start
  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    generatePassage();
    setInput('');
    setTimeLeft(duration);
    setTimeElapsed(0);
    setIsActive(false);
    setIsPaused(false);
    setErrors(0);
    setTotalTyped(0);
    setStreak(0);
    setHasErrorRecently(false);
    speedHistoryRef.current = [];
    mistakesRef.current = [];
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [duration, generatePassage]);

  // Initial load
  useEffect(() => {
    handleReset();
  }, [duration, difficulty, category, handleReset]);

  // Handle Fullscreen events & Esc
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen && containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  // Keyboard shortcut listener for Tab (restart) & Esc (exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          if (document.exitFullscreen) document.exitFullscreen();
        } else {
          onExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReset, onExit, isFullscreen]);

  // Auto-scroll target text to keep active cursor visible
  useEffect(() => {
    if (activeCharRef.current && textContainerRef.current) {
      const charEl = activeCharRef.current;
      const container = textContainerRef.current;
      const charTop = charEl.offsetTop - container.offsetTop;
      if (charTop > container.scrollTop + container.clientHeight - 80) {
        container.scrollTo({ top: charTop - 40, behavior: 'smooth' });
      } else if (charTop < container.scrollTop) {
        container.scrollTo({ top: charTop - 40, behavior: 'smooth' });
      }
    }
  }, [input.length]);

  // Finish test
  const handleCompleteTest = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const actualTimeElapsed = Math.max(1, timeElapsed);
    const elapsedMinutes = actualTimeElapsed / 60;
    const correctChars = Math.max(0, totalTyped - errors);

    // Standard Gross & Net WPM formulas
    const grossWpm = Math.round((totalTyped / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(grossWpm - (errors / elapsedMinutes)));
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
    const cpm = Math.round(correctChars / elapsedMinutes);

    if (preferences.soundEnabled) {
      soundEngine.playVictory();
    }

    const session: TypingSession = {
      id: `session_${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      netWpm,
      grossWpm,
      accuracy,
      cpm,
      errors,
      totalChars: totalTyped,
      correctChars,
      incorrectChars: errors,
      duration: actualTimeElapsed,
      mode: 'timed',
      category,
      difficulty,
      speedHistory: speedHistoryRef.current,
      mistakes: mistakesRef.current,
    };

    onTestComplete(session);
  }, [errors, totalTyped, timeElapsed, category, difficulty, preferences.soundEnabled, onTestComplete]);

  // Timer loop & Speed Sampling (Every 1 second)
  useEffect(() => {
    if (isActive && !isPaused) {
      if (duration > 0 && timeLeft <= 0) {
        handleCompleteTest();
      } else {
        timerRef.current = setInterval(() => {
          if (duration > 0) {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                handleCompleteTest();
                return 0;
              }
              return prev - 1;
            });
          }
          setTimeElapsed((prev) => {
            const nextTime = prev + 1;
            // Record time-series speed data
            const mins = nextTime / 60 || 0.01;
            const currentCorrect = Math.max(0, totalTyped - errors);
            const liveWpm = Math.max(0, Math.round((currentCorrect / 5) / mins));
            const liveAcc = totalTyped > 0 ? Math.round((currentCorrect / totalTyped) * 100) : 100;
            speedHistoryRef.current.push({ time: nextTime, wpm: liveWpm, accuracy: liveAcc });
            return nextTime;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, duration, timeLeft, totalTyped, errors, handleCompleteTest]);

  // Keystroke input capture
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isPaused) return;

    const val = e.target.value;
    const lastTypedChar = val.slice(-1);
    setLastChar(lastTypedChar);

    // Start timer on first keystroke
    if (!isActive && val.length > 0) {
      setIsActive(true);
    }

    const currentIdx = val.length - 1;
    const isCharCorrect = currentIdx >= 0 && currentIdx < text.length && val[currentIdx] === text[currentIdx];

    if (isCharCorrect) {
      if (preferences.soundEnabled) soundEngine.playKeyClick(lastTypedChar);
      setStreak((s) => s + 1);
      setHasErrorRecently(false);
    } else if (val.length > input.length) {
      if (preferences.soundEnabled) soundEngine.playError();
      setStreak(0);
      setHasErrorRecently(true);
      setTimeout(() => setHasErrorRecently(false), 280);

      // Log mistake for mistake review
      if (currentIdx >= 0 && currentIdx < text.length) {
        mistakesRef.current.push({
          index: currentIdx,
          expected: text[currentIdx],
          typed: val[currentIdx],
          wordIndex: text.substring(0, currentIdx).split(' ').length - 1,
        });
      }
    }

    // Calculate errors
    let errorCount = 0;
    const maxLen = Math.min(val.length, text.length);
    for (let i = 0; i < maxLen; i++) {
      if (val[i] !== text[i]) errorCount++;
    }

    setInput(val.substring(0, text.length));
    setTotalTyped(Math.min(val.length, text.length));
    setErrors(errorCount);

    // End condition when full text is typed
    if (val.length >= text.length) {
      handleCompleteTest();
    }
  };

  // Live calculated metrics
  const elapsedMins = Math.max(0.01, timeElapsed / 60);
  const correctChars = Math.max(0, totalTyped - errors);
  const liveGrossWpm = Math.round((totalTyped / 5) / elapsedMins);
  const liveNetWpm = Math.max(0, Math.round(liveGrossWpm - (errors / elapsedMins)));
  const liveAccuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  const progressPercent = text.length > 0 ? Math.min(100, Math.round((input.length / text.length) * 100)) : 0;
  const nextTargetChar = text[input.length] || ' ';

  // Font styling based on preferences
  const fontClass =
    preferences.fontFamily === 'mono'
      ? 'font-mono'
      : preferences.fontFamily === 'code'
      ? 'font-["Fira_Code",monospace]'
      : 'font-sans';

  const sizeClass =
    preferences.fontSize === 'small'
      ? 'text-lg sm:text-xl'
      : preferences.fontSize === 'large'
      ? 'text-2xl sm:text-3xl'
      : preferences.fontSize === 'xlarge'
      ? 'text-3xl sm:text-4xl'
      : 'text-xl sm:text-2xl';

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-5xl mx-auto flex flex-col justify-between transition-all select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-4 sm:p-8 w-screen h-screen max-w-none text-white overflow-y-auto'
          : 'p-2 sm:p-4 min-h-[580px]'
      }`}
    >
      {/* =================================================================== */}
      {/* 🛠️ TEST CONFIGURATION BAR                                            */}
      {/* =================================================================== */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-sm mb-4 space-y-3">
        {/* Top Controls: Exit, Duration, Difficulty, Category */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onExit}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>

            {/* Duration Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              {[15, 30, 60, 120].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    duration === d
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              {(['beginner', 'intermediate', 'advanced'] as TypingDifficulty[]).map((dif) => (
                <button
                  key={dif}
                  type="button"
                  onClick={() => setDifficulty(dif)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                    difficulty === dif
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {dif}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value as TextCategory;
                if (val === 'custom') setShowCustomModal(true);
                else setCategory(val);
              }}
              className="p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="common">Common Words</option>
              <option value="sentences">Everyday Sentences</option>
              <option value="college">College & Academic</option>
              <option value="computer_it">Computer & IT</option>
              <option value="programming">Programming Code</option>
              <option value="business">Business & Office</option>
              <option value="knowledge">General Knowledge</option>
              <option value="custom">Paste Custom Text...</option>
            </select>
          </div>

          {/* Quick Actions (Sound, Keyboard guide, Fullscreen, Restart) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Restart Test (Tab)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowVirtualKeyboard((v) => !v)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showVirtualKeyboard
                  ? 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle Keyboard Guide"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Metrics Row (WPM, Accuracy, Timer, Errors) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-5 sm:gap-8">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net WPM</span>
              <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 leading-none">
                {liveNetWpm}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-500 leading-none">
                {liveAccuracy}%
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Errors</span>
              <span className="text-2xl sm:text-3xl font-black text-rose-500 leading-none">
                {errors}
              </span>
            </div>

            {streak >= 15 && (
              <div className="hidden sm:flex items-center gap-1 text-amber-500 font-bold text-xs pt-2">
                <Flame className="w-4 h-4 fill-current animate-bounce" />
                <span>{streak}x Streak!</span>
              </div>
            )}
          </div>

          {/* Time Remaining Pill */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl font-mono text-base font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{duration === 0 ? `${timeElapsed}s` : `${timeLeft}s`}</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ⌨️ TYPING TEXT ARENA                                                */}
      {/* =================================================================== */}
      <div
        className={`relative w-full rounded-3xl bg-white dark:bg-slate-900 border-2 p-6 sm:p-8 shadow-xl cursor-text transition-all ${
          hasErrorRecently
            ? 'border-rose-400 ring-2 ring-rose-400/20'
            : 'border-slate-200 dark:border-slate-800 focus-within:border-cyan-500 dark:focus-within:border-cyan-400'
        } ${isFullscreen ? 'flex-1 max-h-[50vh]' : 'h-[320px] max-h-[380px]'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Placeholder hint when test hasn't started */}
        {!isActive && input.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10 space-y-1">
            <p className="text-base sm:text-lg font-bold text-slate-400 dark:text-slate-500 animate-pulse">
              Start typing to begin test...
            </p>
            <p className="text-xs text-slate-400">
              Timer starts automatically on first keystroke
            </p>
          </div>
        )}

        {/* Hidden input capture */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none z-20"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Rendered Text with Precision Highlighting */}
        <div
          ref={textContainerRef}
          className={`h-full overflow-y-auto leading-relaxed select-none break-words relative z-0 ${fontClass} ${sizeClass}`}
        >
          {text.split('').map((char, idx) => {
            const isCompleted = idx < input.length;
            const isCurrent = idx === input.length;
            const isCorrect = isCompleted && input[idx] === char;

            let charClass = "text-slate-400 dark:text-slate-600";
            if (isCompleted) {
              charClass = isCorrect
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : preferences.errorStyle === 'outline'
                ? "text-rose-500 border-b-2 border-rose-500 font-bold"
                : preferences.errorStyle === 'subtle'
                ? "text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded px-0.5 font-bold"
                : "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40 rounded px-0.5 font-bold";
            }

            return (
              <span
                key={idx}
                ref={isCurrent ? activeCharRef : undefined}
                className={`relative transition-colors duration-75 ${charClass}`}
              >
                {isCurrent && (
                  <span
                    className={`inline-block w-0.5 h-6 bg-cyan-500 animate-pulse align-middle -mb-1 mr-0.5 rounded-full ${
                      preferences.cursorStyle === 'block'
                        ? 'w-2 bg-cyan-400/80'
                        : preferences.cursorStyle === 'underline'
                        ? 'h-1 w-3 bg-cyan-500 align-bottom'
                        : 'w-0.5'
                    }`}
                  />
                )}
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🌟 STATS FOOTER & SHORTCUT TIPS                                     */}
      {/* =================================================================== */}
      <div className="w-full mt-4 space-y-3">
        {/* Progress Bar */}
        <div className="relative w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 rounded-full transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Live Info Strip */}
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 gap-2">
          <div className="flex items-center gap-4">
            <span>Progress: <strong className="text-slate-900 dark:text-white">{progressPercent}%</strong></span>
            <span>Chars: <strong className="text-slate-900 dark:text-white">{input.length} / {text.length}</strong></span>
            <span>Gross WPM: <strong className="text-slate-900 dark:text-white">{liveGrossWpm}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
              className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How WPM is calculated</span>
            </button>

            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono border">Tab</kbd> to restart
            </span>
          </div>
        </div>

        {/* Calculation Formula Explainer Card (Toggleable) */}
        {showFormulaTooltip && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-cyan-50 dark:bg-slate-800/80 border border-cyan-200 dark:border-cyan-900 text-xs text-slate-700 dark:text-slate-300 space-y-1.5"
          >
            <p className="font-bold text-cyan-800 dark:text-cyan-300">Standard 5-Character WPM Formula:</p>
            <p><strong>Gross WPM</strong> = (Total Characters Typed ÷ 5) ÷ Elapsed Minutes</p>
            <p><strong>Net WPM</strong> = Gross WPM - (Errors ÷ Elapsed Minutes)</p>
            <p><strong>Accuracy</strong> = (Correct Characters ÷ Total Characters) × 100%</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculations reflect real active typing time.</p>
          </motion.div>
        )}

        {/* Interactive Virtual Keyboard Guide */}
        {showVirtualKeyboard && (
          <div className="pt-1">
            <VirtualKeyboard
              activeChar={nextTargetChar}
              lastPressedKey={lastChar}
              isError={hasErrorRecently}
            />
          </div>
        )}
      </div>

      {/* Custom User Text Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Custom Practice Text</h3>
            <p className="text-xs text-slate-500">Paste your own article, essay, or code snippet to practice:</p>
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste custom text here..."
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('common');
                  setShowCustomModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('custom');
                  setShowCustomModal(false);
                  handleReset();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 shadow-sm"
              >
                Apply Custom Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
