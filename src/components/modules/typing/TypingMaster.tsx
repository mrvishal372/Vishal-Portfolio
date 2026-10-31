import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  RotateCcw,
  Clock,
  Trophy,
  Target,
  History,
  BookOpen,
  Code,
  Type,
  Infinity as InfinityIcon,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Keyboard,
  Flame,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { TYPING_TEXTS, TYPING_WORDS, TYPING_CODE } from './typingData';
import { WalkingPandaBackground } from './WalkingPandaBackground';
import { VirtualKeyboard } from './VirtualKeyboard';
import { ConfettiEffect } from './ConfettiEffect';
import { soundEngine } from './soundEffects';

type Mode = 'timed' | 'practice_word' | 'practice_sentence' | 'practice_code';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'bca';
type Duration = number; // 0 represents infinite/free mode

interface TestHistory {
  date: string;
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  difficulty: string;
}

export const TypingMaster: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'test' | 'result' | 'history'>('dashboard');

  // Settings
  const [mode, setMode] = useState<Mode>('timed');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [duration, setDuration] = useState<Duration>(60);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundEngine.getMuted());
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // State
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [bestWpm, setBestWpm] = useState(0);
  const [bestAcc, setBestAcc] = useState(0);

  // Stats & live feedback
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hasErrorRecently, setHasErrorRecently] = useState(false);
  const [lastChar, setLastChar] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('vishal_typing_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        setBestWpm(Math.max(0, ...parsed.map((h: any) => h.wpm)));
        setBestAcc(Math.max(0, ...parsed.map((h: any) => h.accuracy)));
      } catch (e) {}
    }
  }, []);

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFullscreen = Boolean(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isDocFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle true fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (containerRef.current && containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } else {
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  };

  // Keyboard shortcut listener for Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleSound = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    soundEngine.setMuted(next);
    if (!next) {
      soundEngine.playKeyClick(' ');
    }
  };

  const generateText = useCallback(() => {
    let source: string[] = [];
    if (mode === 'timed' || mode === 'practice_sentence') {
      source = TYPING_TEXTS[difficulty] || TYPING_TEXTS.intermediate;
    } else if (mode === 'practice_word') {
      source = TYPING_WORDS;
    } else if (mode === 'practice_code') {
      source = TYPING_CODE;
    }

    let generated = '';
    const iterations = mode === 'timed' ? (duration === 0 ? 30 : 15) : 3;
    for (let i = 0; i < iterations; i++) {
      generated += source[Math.floor(Math.random() * source.length)] + ' ';
    }
    setText(generated.trim());
  }, [difficulty, mode, duration]);

  const startTest = () => {
    generateText();
    setInput('');
    setErrors(0);
    setTotalTyped(0);
    setStreak(0);
    setTimeLeft(duration);
    setTimeElapsed(0);
    setIsActive(false);
    setShowConfetti(false);
    setView('test');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 120);
  };

  const endTest = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const correctChars = Math.max(0, totalTyped - errors);
    const timeInMinutes = timeElapsed / 60 || 0.1;
    const finalWpm = Math.max(0, Math.round(correctChars / 5 / timeInMinutes));
    const finalAcc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

    const newRecord: TestHistory = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      wpm: finalWpm,
      accuracy: finalAcc,
      errors,
      duration: timeElapsed,
      difficulty: mode === 'timed' ? difficulty : mode,
    };

    const newHistory = [newRecord, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('vishal_typing_history', JSON.stringify(newHistory));

    if (finalWpm > bestWpm) setBestWpm(finalWpm);
    if (finalAcc > bestAcc) setBestAcc(finalAcc);

    soundEngine.playVictory();
    setShowConfetti(true);

    setView('result');
  }, [duration, timeElapsed, totalTyped, errors, history, bestWpm, bestAcc, difficulty, mode]);

  // Timer loop
  useEffect(() => {
    if (isActive) {
      if (duration > 0 && timeLeft <= 0) {
        endTest();
      } else {
        timerRef.current = setInterval(() => {
          if (duration > 0) setTimeLeft((prev) => prev - 1);
          setTimeElapsed((prev) => prev + 1);
        }, 1000);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, duration, endTest]);

  // Keystroke input handling
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const lastCharTyped = val.slice(-1);
    setLastChar(lastCharTyped);

    if (!isActive && val.length > 0) {
      setIsActive(true);
    }

    const currentIdx = val.length - 1;
    const isCharCorrect = currentIdx >= 0 && currentIdx < text.length && val[currentIdx] === text[currentIdx];

    if (isCharCorrect) {
      soundEngine.playKeyClick(lastCharTyped);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > 0 && next % 20 === 0) {
          soundEngine.playStreakChime(next);
        }
        return next;
      });
      setHasErrorRecently(false);
    } else if (val.length > input.length) {
      soundEngine.playError();
      setStreak(0);
      setHasErrorRecently(true);
      setTimeout(() => setHasErrorRecently(false), 300);
    }

    let currentErrors = 0;
    const maxLen = Math.min(val.length, text.length);
    for (let i = 0; i < maxLen; i++) {
      if (val[i] !== text[i]) currentErrors++;
    }

    setInput(val.substring(0, text.length));
    setTotalTyped(Math.min(val.length, text.length));
    setErrors(currentErrors);

    if (val.length >= text.length) {
      endTest();
    }
  };

  const correctChars = Math.max(0, totalTyped - errors);
  const timeElapsedMins = timeElapsed / 60 || 0.01;
  const currentWpm = Math.max(0, Math.round(correctChars / 5 / timeElapsedMins));
  const currentAcc = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  const currentCpm = Math.max(0, Math.round(correctChars / timeElapsedMins));
  const progressPercent = text.length > 0 ? Math.min(100, Math.round((input.length / text.length) * 100)) : 0;
  const nextTargetChar = text[input.length] || ' ';

  const getCharClass = (idx: number) => {
    if (idx < input.length) {
      return input[idx] === text[idx]
        ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
        : 'text-red-500 bg-red-100 dark:bg-red-900/40 rounded px-0.5 font-bold animate-pulse';
    }
    if (idx === input.length && isActive) {
      return 'bg-emerald-300 dark:bg-emerald-400 text-slate-950 font-bold border-b-2 border-emerald-600 dark:border-emerald-300 animate-pulse px-0.5 rounded-xs';
    }
    return 'text-slate-400 dark:text-slate-500';
  };

  const getSpeedRating = (wpmVal: number) => {
    if (wpmVal >= 70) return { label: 'Rocket 🚀', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (wpmVal >= 45) return { label: 'Cheetah 🐆', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (wpmVal >= 25) return { label: 'Rabbit 🐇', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { label: 'Turtle 🐢', color: 'text-slate-400', bg: 'bg-slate-500/20' };
  };

  const speedRating = getSpeedRating(currentWpm);

  /* ========================================================================= */
  /* 1. DASHBOARD VIEW (Clean, English, Background Walking Panda)              */
  /* ========================================================================= */
  if (view === 'dashboard') {
    return (
      <div
        ref={containerRef}
        className={`w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-12 transition-all relative ${
          isFullscreen
            ? 'fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-4 sm:p-8 overflow-y-auto w-screen h-screen max-w-none text-white'
            : ''
        }`}
      >
        <ConfettiEffect active={showConfetti} />

        {/* Ambient Walking Panda in Background */}
        <WalkingPandaBackground wpm={bestWpm} isTyping={false} />

        {/* Detailed High-End Header */}
        <div className="relative z-10 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl overflow-hidden border-2 border-emerald-500/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30 shrink-0">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Typing Master Pro</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      Walking Panda
                    </span>
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 dark:text-slate-300 font-medium mt-0.5">
                  Real-time typing speed and accuracy trainer with smooth background walking panda
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSoundMuted
                    ? 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
                    : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-sm'
                }`}
                title={isSoundMuted ? 'Unmute Mechanical Sound' : 'Mute Click Sound'}
              >
                {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enable Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
              </button>

              {/* History Button */}
              <button
                type="button"
                onClick={() => setView('history')}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({history.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider mb-0.5">Best Speed</p>
              <p className="text-2xl font-black text-emerald-300">{bestWpm} <span className="text-xs text-white/70">WPM</span></p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider mb-0.5">Best Accuracy</p>
              <p className="text-2xl font-black text-teal-300">{bestAcc}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider mb-0.5">Total Tests</p>
              <p className="text-2xl font-black text-white">{history.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
              <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider mb-0.5">Current Tier</p>
              <p className="text-base font-black text-emerald-200">{getSpeedRating(bestWpm).label}</p>
            </div>
          </div>
        </div>

        {/* Test Settings Configuration Card */}
        <div className="relative z-10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <span>Test Settings & Modes</span>
            </h3>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Active: <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{mode.replace('_', ' ')}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mode selection */}
            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 block">
                1. Mode Selection
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'timed', label: 'Timed Test', icon: <Clock className="w-4 h-4 text-emerald-500" />, desc: 'Countdown speed run' },
                  { id: 'practice_word', label: 'Words Practice', icon: <Type className="w-4 h-4 text-blue-500" />, desc: 'Vocabulary drills' },
                  { id: 'practice_sentence', label: 'Sentences', icon: <BookOpen className="w-4 h-4 text-purple-500" />, desc: 'Real-world paragraphs' },
                  { id: 'practice_code', label: 'BCA Code Mode', icon: <Code className="w-4 h-4 text-amber-500" />, desc: 'C, Java, Python & SQL' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as Mode)}
                    className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                      mode === m.id
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-slate-800 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                      {m.icon}
                      <span>{m.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Difficulty */}
            <div className="space-y-4">
              {mode === 'timed' && (
                <div>
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                    2. Duration
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[15, 30, 60, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDuration(sec)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          duration === sec
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDuration(duration === 0 ? 60 : 0)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        duration === 0
                          ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <InfinityIcon className="w-3.5 h-3.5" /> Infinite Mode
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                  3. Difficulty Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'beginner', label: 'Beginner' },
                    { id: 'intermediate', label: 'Intermediate' },
                    { id: 'advanced', label: 'Advanced' },
                    { id: 'expert', label: 'Expert' },
                    { id: 'bca', label: 'BCA Master' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id as Difficulty)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        difficulty === d.id
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Virtual Keyboard Option */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showVirtualKeyboard}
                    onChange={(e) => setShowVirtualKeyboard(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Show Interactive Virtual Keyboard Guide</span>
                </label>
              </div>
            </div>
          </div>

          {/* Start Test Button */}
          <button
            type="button"
            onClick={startTest}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base sm:text-lg shadow-lg shadow-emerald-500/25 transition-all active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START TYPING TEST NOW 🚀</span>
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 2. HISTORY VIEW                                                           */
  /* ========================================================================= */
  if (view === 'history') {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in space-y-6 relative">
        <WalkingPandaBackground wpm={bestWpm} isTyping={false} />

        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition-colors cursor-pointer text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Total Records: <strong className="text-slate-900 dark:text-white">{history.length}</strong></span>
          </div>
        </div>

        <div className="relative z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-md">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-emerald-500" />
            <span>Typing Performance History</span>
          </h2>

          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-bold text-sm">No test sessions recorded yet.</p>
              <button
                type="button"
                onClick={startTest}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Start First Test →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Speed (WPM)</th>
                    <th className="px-5 py-3.5">Accuracy</th>
                    <th className="px-5 py-3.5">Errors</th>
                    <th className="px-5 py-3.5">Mode / Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{h.date}</td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">{h.wpm} WPM</td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">{h.accuracy}%</td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-bold text-red-500">{h.errors}</td>
                      <td className="px-5 py-3 text-xs sm:text-sm font-medium text-slate-500 capitalize">
                        {h.difficulty} ({h.duration}s)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 3. RESULT VIEW                                                            */
  /* ========================================================================= */
  if (view === 'result') {
    const isNewBest = history.length > 0 && currentWpm >= bestWpm && currentWpm > 0;

    return (
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 animate-fade-in flex flex-col items-center relative">
        <ConfettiEffect active={showConfetti} />
        <WalkingPandaBackground wpm={currentWpm} isTyping={false} />

        <h2 className="relative z-10 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 text-center">
          🎉 TEST COMPLETE 🎉
        </h2>
        <p className="relative z-10 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium text-center">
          Here is your comprehensive typing test performance report:
        </p>

        {isNewBest && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 mb-6 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-full font-black text-sm flex items-center gap-2 shadow-lg animate-bounce"
          >
            <Trophy className="w-5 h-5 fill-current" /> New Personal Best Record!
          </motion.div>
        )}

        {/* 4 Core Stat Cards */}
        <div className="relative z-10 w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 border-emerald-500/30 rounded-2xl p-4 text-center shadow-md">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Speed</p>
            <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">{currentWpm}</p>
            <span className="text-[10px] font-bold text-slate-500">{speedRating.label}</span>
          </div>
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 border-teal-500/30 rounded-2xl p-4 text-center shadow-md">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Accuracy</p>
            <p className="text-3xl sm:text-4xl font-black text-teal-500">{currentAcc}%</p>
            <span className="text-[10px] font-bold text-slate-500">Clean Keystrokes</span>
          </div>
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 border-blue-500/30 rounded-2xl p-4 text-center shadow-md">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">CPM</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{currentCpm}</p>
            <span className="text-[10px] font-bold text-slate-500">Chars / Min</span>
          </div>
          <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 border-red-500/30 rounded-2xl p-4 text-center shadow-md">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Errors</p>
            <p className="text-2xl sm:text-3xl font-black text-red-500 mt-1">{errors}</p>
            <span className="text-[10px] font-bold text-slate-500">Mistakes</span>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="relative z-10 w-full bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-800 flex justify-around text-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 mb-0.5">Correct Chars</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{correctChars}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 mb-0.5">Incorrect Chars</p>
            <p className="text-base font-black text-red-500">{errors}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 mb-0.5">Time Elapsed</p>
            <p className="text-base font-black text-slate-700 dark:text-slate-300">{timeElapsed}s</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 mb-0.5">Max Streak</p>
            <p className="text-base font-black text-amber-500">🔥 {streak}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-2xl transition-all cursor-pointer text-center text-sm"
          >
            ← Back to Dashboard
          </button>
          <button
            type="button"
            onClick={startTest}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* 4. ACTIVE TEST VIEW (Clean, English, Background Walking Panda)            */
  /* ========================================================================= */
  return (
    <div
      ref={containerRef}
      className={`w-full max-w-5xl mx-auto flex flex-col justify-between transition-all relative ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl p-3 sm:p-6 w-screen h-screen max-w-none text-white overflow-y-auto'
          : 'p-2 sm:p-4 min-h-[580px]'
      }`}
    >
      <ConfettiEffect active={showConfetti} />

      {/* 🐼 SMOOTH WALKING PANDA IN BACKGROUND (Upright, waving, pacing with your typing) */}
      <WalkingPandaBackground wpm={currentWpm} isTyping={isActive} />

      {/* =================================================================== */}
      {/* 🌟 DETAILED CLEAN TEST HEADER                                       */}
      {/* =================================================================== */}
      <div className="relative z-10 w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-md mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Exit/Cancel & Mode badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setView('dashboard');
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          {/* Mode Pill */}
          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
            {mode.replace('_', ' ')} • {difficulty}
          </span>

          {duration === 0 && isActive && (
            <button
              type="button"
              onClick={endTest}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-xs"
            >
              Finish
            </button>
          )}
        </div>

        {/* Center: Live Speed & Timer */}
        <div className="flex items-center gap-2.5 self-center sm:self-auto">
          <div className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs font-black ${speedRating.bg} ${speedRating.color}`}>
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{currentWpm} WPM ({speedRating.label})</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-xl font-mono font-black text-sm border border-emerald-200 dark:border-emerald-800">
            <Clock className="w-4 h-4 text-emerald-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{duration === 0 ? `${timeElapsed}s` : `${timeLeft}s`}</span>
          </div>
        </div>

        {/* Right: Controls (Sound, Keyboard, Fullscreen, Restart) */}
        <div className="flex items-center gap-2 justify-end">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isSoundMuted
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                : 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400/50 text-emerald-600 dark:text-emerald-400'
            }`}
            title={isSoundMuted ? 'Turn Sound On' : 'Mute Sound'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Virtual Keyboard Toggle */}
          <button
            type="button"
            onClick={() => setShowVirtualKeyboard((prev) => !prev)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showVirtualKeyboard
                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400/50 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
            }`}
            title="Toggle Keyboard Guide"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>

          {/* Restart Button */}
          <button
            type="button"
            onClick={startTest}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Restart Test"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ⌨️ TYPING ARENA (Spacious, prominent, with clean background depth)   */}
      {/* =================================================================== */}
      <div
        className={`relative z-10 w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border-2 rounded-3xl p-6 sm:p-8 shadow-xl cursor-text overflow-y-auto transition-all ${
          hasErrorRecently
            ? 'border-red-400 ring-2 ring-red-400/30'
            : 'border-slate-300 dark:border-slate-700/80 focus-within:border-emerald-500 dark:focus-within:border-emerald-400'
        } ${isFullscreen ? 'flex-1 max-h-[52vh]' : 'h-[340px] max-h-[400px]'}`}
        onClick={() => inputRef.current?.focus()}
      >
        {!isActive && input.length === 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-center w-full pointer-events-none z-20 flex flex-col items-center gap-1.5">
            <span className="text-base sm:text-lg animate-pulse text-slate-700 dark:text-slate-200">
              ⌨️ Start typing to begin test...
            </span>
            <span className="text-xs text-slate-400">
              Panda is walking and cheering for you in the background! 🐼
            </span>
          </div>
        )}

        {/* Hidden Input for capture */}
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none z-10"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* Text with Character Highlights */}
        <div className="text-xl sm:text-3xl font-medium leading-relaxed font-mono select-none break-words relative z-20 transition-all">
          {text.split('').map((char, i) => (
            <span key={i} className={`transition-all duration-75 ${getCharClass(i)}`}>
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🌟 DETAILED TEST FOOTER                                             */}
      {/* =================================================================== */}
      <div className="relative z-10 w-full mt-4 space-y-3">
        {/* Progress Bar */}
        <div className="relative w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stats Row & Keyboard Guide */}
        <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-2 gap-2">
          <div className="flex items-center gap-4">
            <span>
              Progress: <strong className="text-slate-900 dark:text-white">{progressPercent}%</strong>
            </span>
            <span>
              Errors: <strong className="text-red-500">{errors}</strong>
            </span>
            <span>
              Chars: <strong className="text-slate-900 dark:text-white">{input.length} / {text.length}</strong>
            </span>
            {streak > 5 && (
              <span className="text-amber-500 flex items-center gap-1 font-black">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streak}x Streak</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-slate-400">
              Next Key:{' '}
              <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-emerald-400 font-mono font-black border border-slate-300 dark:border-slate-700">
                {nextTargetChar === ' ' ? 'SPACE' : nextTargetChar}
              </kbd>
            </span>
            <span className="text-[10px] text-slate-400">
              Esc: Exit Fullscreen | Space: Next Word
            </span>
          </div>
        </div>

        {/* Virtual Keyboard */}
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
    </div>
  );
};
