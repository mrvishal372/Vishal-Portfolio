import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Clock, 
  Type, 
  Code2, 
  Quote, 
  Flame, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Keyboard as KeyboardIcon,
  Eye, 
  EyeOff,
  ChevronDown,
  Layers,
  Award
} from 'lucide-react';
import { 
  TYPING_WORDS, 
  TYPING_QUOTES, 
  TYPING_CODE_SNIPPETS, 
  WORD_COLLECTIONS 
} from '../modules/typing/typingData';
import { soundEngine, SoundProfile } from '../modules/typing/soundEffects';
import { VirtualKeyboard } from '../modules/typing/VirtualKeyboard';
import { WalkingPandaBackground } from '../modules/typing/WalkingPandaBackground';
import { ResultsModal, TestResultData } from './ResultsModal';
import { TypingSettings } from './SettingsModal';

export type TestModeType = 'time' | 'words' | 'quote' | 'code' | 'custom' | 'exam';

interface TypingTestEngineProps {
  settings: TypingSettings;
  onUpdateSettings: (newSettings: Partial<TypingSettings>) => void;
  externalText?: { text: string; title: string; mode: string } | null;
  onClearExternalText?: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const TypingTestEngine: React.FC<TypingTestEngineProps> = ({
  settings,
  onUpdateSettings,
  externalText,
  onClearExternalText,
  isFullscreen,
  onToggleFullscreen,
}) => {
  // Test Mode Config
  const [testMode, setTestMode] = useState<TestModeType>('time');
  const [timeLimit, setTimeLimit] = useState<number>(30); // 15, 30, 60, 120
  const [wordCountLimit, setWordCountLimit] = useState<number>(25); // 10, 25, 50, 100
  const [quoteLength, setQuoteLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [includePunctuation, setIncludePunctuation] = useState<boolean>(false);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(false);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(true);

  // Core Typing State
  const [targetText, setTargetText] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  // Telemetry & Metrics
  const [wpm, setWpm] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [consistency, setConsistency] = useState<number>(100);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [highestStreak, setHighestStreak] = useState<number>(0);
  const [errorCharMap, setErrorCharMap] = useState<Record<string, number>>({});
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(0);
  const [keystrokeDelays, setKeystrokeDelays] = useState<number[]>([]);

  // Results Modal State
  const [resultData, setResultData] = useState<TestResultData | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // DOM Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<any>(null);

  // Generate target passage based on mode
  const generatePassage = useCallback(() => {
    if (externalText) {
      setTargetText(externalText.text);
      if (externalText.mode === 'exam') {
        setTestMode('exam');
      } else if (externalText.mode === 'code') {
        setTestMode('code');
      } else {
        setTestMode('custom');
      }
      return;
    }

    if (testMode === 'quote') {
      const filtered = TYPING_QUOTES.filter((q) => q.length === quoteLength);
      const chosen = filtered[Math.floor(Math.random() * filtered.length)] || TYPING_QUOTES[0];
      setTargetText(chosen.text);
    } else if (testMode === 'code') {
      const chosen = TYPING_CODE_SNIPPETS[Math.floor(Math.random() * TYPING_CODE_SNIPPETS.length)];
      setTargetText(chosen.code);
    } else {
      // Time or Words mode: assemble from word collections
      const pool = WORD_COLLECTIONS.common200.concat(WORD_COLLECTIONS.techTerms);
      const count = testMode === 'words' ? wordCountLimit : Math.max(50, timeLimit * 2.5);
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        let w = pool[Math.floor(Math.random() * pool.length)];
        if (includePunctuation && Math.random() < 0.2) {
          const puncts = [',', '.', '!', '?', ';', ':'];
          w += puncts[Math.floor(Math.random() * puncts.length)];
        }
        if (includeNumbers && Math.random() < 0.15) {
          w = String(Math.floor(Math.random() * 900 + 10));
        }
        words.push(w);
      }
      setTargetText(words.join(' '));
    }
  }, [testMode, timeLimit, wordCountLimit, quoteLength, includePunctuation, includeNumbers, externalText]);

  // Reset test cleanly
  const resetTest = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setInputText('');
    setTestState('idle');
    setTimeLeft(testMode === 'time' ? timeLimit : 0);
    setElapsedSeconds(0);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setConsistency(100);
    setComboStreak(0);
    setErrorCharMap({});
    setWpmHistory([]);
    setKeystrokeDelays([]);
    setShowResults(false);
    generatePassage();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [generatePassage, testMode, timeLimit]);

  // Initial and reactive generation
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Focus input automatically
  const focusInput = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  // Timer Tick Handling
  useEffect(() => {
    if (testState !== 'running') return;

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSec = prev + 1;

        // Calculate live WPM & Raw WPM
        const currentTyped = inputText.length;
        const wordsTyped = currentTyped / 5;
        const minutes = nextSec / 60;
        const liveRawWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
        setRawWpm(liveRawWpm);

        // Net WPM (correct chars only)
        let correct = 0;
        for (let i = 0; i < currentTyped; i++) {
          if (inputText[i] === targetText[i]) correct++;
        }
        const liveNetWpm = minutes > 0 ? Math.round((correct / 5) / minutes) : 0;
        setWpm(liveNetWpm);

        // Record history snapshot for SVG chart
        setWpmHistory((hist) => [...hist, liveNetWpm]);

        return nextSec;
      });

      if (testMode === 'time') {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [testState, inputText, targetText, testMode]);

  // Finish test and calculate official metrics
  const finishTest = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTestState('completed');
    soundEngine.playVictory();

    const duration = testMode === 'time' ? timeLimit - timeLeft : elapsedSeconds || 1;
    const minutes = Math.max(0.1, duration / 60);

    let correct = 0;
    let errors = 0;
    const errorMap: Record<string, number> = {};

    for (let i = 0; i < inputText.length; i++) {
      if (inputText[i] === targetText[i]) {
        correct++;
      } else {
        errors++;
        const targetChar = targetText[i] || 'extra';
        errorMap[targetChar] = (errorMap[targetChar] || 0) + 1;
      }
    }

    const calculatedRawWpm = Math.round((inputText.length / 5) / minutes);
    const calculatedNetWpm = Math.max(0, Math.round((correct / 5) / minutes));
    const calculatedAccuracy = inputText.length > 0 ? Math.round((correct / inputText.length) * 1000) / 10 : 100;

    // Consistency formula based on standard deviation of keystroke delays
    let consistencyVal = 88;
    if (keystrokeDelays.length > 10) {
      const mean = keystrokeDelays.reduce((a, b) => a + b, 0) / keystrokeDelays.length;
      const variance = keystrokeDelays.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / keystrokeDelays.length;
      const stdDev = Math.sqrt(variance);
      consistencyVal = Math.max(40, Math.min(99, Math.round(100 - (stdDev / (mean || 1)) * 40)));
    }

    const result: TestResultData = {
      netWpm: calculatedNetWpm,
      rawWpm: calculatedRawWpm,
      accuracy: calculatedAccuracy,
      consistency: consistencyVal,
      timeSeconds: duration,
      correctChars: correct,
      errorChars: errors,
      extraChars: Math.max(0, inputText.length - targetText.length),
      missedChars: Math.max(0, targetText.length - inputText.length),
      wpmHistory: wpmHistory.length > 0 ? wpmHistory : [calculatedNetWpm],
      errorKeyMap: errorMap,
      testMode: `${testMode.toUpperCase()} (${duration}s)`,
      isExam: testMode === 'exam'
    };

    setResultData(result);
    setShowResults(true);

    // Persist to localStorage
    try {
      const saved = localStorage.getItem('vyron_typing_history_v2');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift({
        id: `rec_${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        netWpm: calculatedNetWpm,
        rawWpm: calculatedRawWpm,
        accuracy: calculatedAccuracy,
        consistency: consistencyVal,
        timeSeconds: duration,
        testMode: `${testMode} ${duration}s`,
      });
      localStorage.setItem('vyron_typing_history_v2', JSON.stringify(list.slice(0, 50)));
    } catch {}
  }, [elapsedSeconds, inputText, keystrokeDelays, targetText, testMode, timeLeft, timeLimit, wpmHistory]);

  // Handle Keystroke Input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (testState === 'completed') return;

    const val = e.target.value;

    // Start timer on very first keystroke
    if (testState === 'idle' && val.length > 0) {
      setTestState('running');
      setLastKeystrokeTime(Date.now());
    }

    // Keystroke latency recording for consistency
    const now = Date.now();
    if (lastKeystrokeTime > 0) {
      const delay = now - lastKeystrokeTime;
      if (delay < 2500) {
        setKeystrokeDelays((delays) => [...delays, delay]);
      }
    }
    setLastKeystrokeTime(now);

    const prevLen = inputText.length;
    const newLen = val.length;

    // Check if character was added or removed
    if (newLen > prevLen) {
      const typedChar = val[newLen - 1];
      const targetChar = targetText[newLen - 1];

      if (typedChar === targetChar) {
        soundEngine.playKeyClick(typedChar);
        setComboStreak((s) => {
          const nextStreak = s + 1;
          if (nextStreak > highestStreak) setHighestStreak(nextStreak);
          if (nextStreak % 20 === 0) soundEngine.playStreakChime(nextStreak);
          return nextStreak;
        });
      } else {
        soundEngine.playError();
        setComboStreak(0);
        setErrorCharMap((m) => ({
          ...m,
          [targetChar || 'extra']: (m[targetChar || 'extra'] || 0) + 1,
        }));
      }
    }

    setInputText(val);

    // Live Accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correct++;
    }
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);

    // Check completion condition
    if (val.length >= targetText.length && targetText.length > 0) {
      finishTest();
    }
  };

  // Keyboard shortcut listener (Tab for restart, Esc for fullscreen exit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      resetTest();
    }
    // Strict Backspace Handling
    if (settings.strictBackspace && e.key === 'Backspace') {
      e.preventDefault();
      soundEngine.playError();
    }
  };

  // Auto-scroll target text container as user types
  useEffect(() => {
    if (!textContainerRef.current) return;
    const activeCharEl = textContainerRef.current.querySelector('.active-char');
    if (activeCharEl) {
      activeCharEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [inputText.length]);

  // Caret next character
  const currentExpectedChar = targetText[inputText.length] || '';

  return (
    <div className="max-w-5xl mx-auto space-y-5 select-none relative">
      
      {/* Panda Companion Layer (when active - spacious height so ears and head never cut off) */}
      {settings.pandaMode === 'active' && (
        <div className="relative w-full h-44 sm:h-48 overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-500/10 via-sky-500/5 to-transparent border border-emerald-400/25 dark:border-emerald-500/20 shadow-xs mb-2">
          <WalkingPandaBackground wpm={wpm} isTyping={testState === 'running'} />
        </div>
      )}

      {/* Mode & Parameter Selector Bar (Fully responsive toolbar) */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 text-xs max-w-full overflow-x-auto scrollbar-none">
        
        {/* Left: Mode Picker */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => {
              setTestMode('time');
              if (onClearExternalText) onClearExternalText();
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              testMode === 'time'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTestMode('words');
              if (onClearExternalText) onClearExternalText();
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              testMode === 'words'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Words</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTestMode('quote');
              if (onClearExternalText) onClearExternalText();
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              testMode === 'quote'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTestMode('code');
              if (onClearExternalText) onClearExternalText();
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              testMode === 'code'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Center: Mode Durations & Counts */}
        <div className="flex items-center gap-1 text-slate-500 font-mono font-bold shrink-0">
          {testMode === 'time' && (
            [15, 30, 60, 120].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeLimit(t)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                  timeLimit === t
                    ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-black'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}s
              </button>
            ))
          )}

          {testMode === 'words' && (
            [10, 25, 50, 100].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWordCountLimit(w)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                  wordCountLimit === w
                    ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-black'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {w}
              </button>
            ))
          )}

          {testMode === 'quote' && (
            (['short', 'medium', 'long'] as const).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuoteLength(q)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer shrink-0 ${
                  quoteLength === q
                    ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-black'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {q}
              </button>
            ))
          )}
        </div>

        {/* Right: Modifiers & Keyboard Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {testMode !== 'code' && (
            <>
              <button
                type="button"
                onClick={() => setIncludePunctuation(!includePunctuation)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  includePunctuation
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-600 dark:text-sky-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <span className="hidden sm:inline">@ punctuation</span>
                <span className="sm:hidden">@ punct</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeNumbers(!includeNumbers)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                  includeNumbers
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-600 dark:text-sky-400 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <span className="hidden sm:inline"># numbers</span>
                <span className="sm:hidden"># num</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
              showVirtualKeyboard
                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 text-sky-600 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title="Toggle Virtual Keyboard Guide"
          >
            <KeyboardIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Telemetry KPI Bar (Hidden if blindMode is on) */}
      {!settings.blindMode && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Live Speedometer */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Speed (WPM)
            </div>
            <div className="text-3xl font-black text-sky-600 dark:text-sky-400 tracking-tight font-mono tabular-nums mt-0.5">
              {wpm}
            </div>
          </div>

          {/* Live Accuracy */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Accuracy
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono tabular-nums mt-0.5">
              {accuracy}%
            </div>
          </div>

          {/* Time Remaining / Words */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {testMode === 'time' ? 'Time Left' : 'Elapsed'}
            </div>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono tabular-nums mt-0.5">
              {testMode === 'time' ? `${timeLeft}s` : `${elapsedSeconds}s`}
            </div>
          </div>

          {/* Combo Streak */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Flame className={`w-3.5 h-3.5 ${comboStreak > 15 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
              <span>Streak</span>
            </div>
            <div className="text-3xl font-black text-amber-500 tracking-tight font-mono tabular-nums mt-0.5">
              {comboStreak}x
            </div>
          </div>

          {/* Raw Speed */}
          <div className="hidden sm:block p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Raw WPM
            </div>
            <div className="text-3xl font-black text-slate-500 tracking-tight font-mono tabular-nums mt-0.5">
              {rawWpm}
            </div>
          </div>
        </div>
      )}

      {/* The Central Typing Stage Canvas */}
      <div
        onClick={focusInput}
        className={`relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all cursor-text min-h-[180px] max-h-[320px] overflow-hidden flex flex-col justify-between ${
          isFocused 
            ? 'border-sky-500/80 shadow-lg shadow-sky-500/5' 
            : 'border-slate-200 dark:border-slate-800 opacity-90'
        }`}
      >
        {/* Hidden Physical Input Sink */}
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 opacity-0 pointer-events-auto cursor-text w-full h-full z-10"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Unfocused Blur Reminder Overlay */}
        {!isFocused && (
          <div className="absolute inset-0 backdrop-blur-xs bg-slate-950/30 flex items-center justify-center z-20 pointer-events-none rounded-3xl">
            <div className="px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg border border-slate-700 animate-pulse flex items-center gap-2">
              <KeyboardIcon className="w-4 h-4 text-sky-400" />
              <span>Click or tap anywhere here to focus & type</span>
            </div>
          </div>
        )}

        {/* Text Display Canvas with Caret & Character Highlights */}
        <div
          ref={textContainerRef}
          className={`leading-relaxed text-left transition-all ${
            settings.fontSize === 'compact'
              ? 'text-lg sm:text-xl'
              : settings.fontSize === 'large'
              ? 'text-2xl sm:text-3xl'
              : 'text-xl sm:text-2xl'
          } ${
            settings.fontFamily === 'mono' ? 'font-mono' : 'font-sans'
          }`}
        >
          {targetText.split('').map((char, index) => {
            const isTyped = index < inputText.length;
            const isCurrent = index === inputText.length;
            const isCorrect = isTyped && inputText[index] === char;
            const isError = isTyped && inputText[index] !== char;

            let charColor = 'text-slate-400 dark:text-slate-600'; // Untyped
            if (isCorrect) {
              charColor = 'text-slate-900 dark:text-slate-100 font-semibold';
            } else if (isError) {
              charColor = 'text-rose-600 dark:text-rose-400 bg-rose-500/15 rounded-xs underline decoration-rose-500';
            }

            return (
              <span
                key={index}
                className={`relative inline-block ${charColor} ${isCurrent ? 'active-char' : ''}`}
              >
                {/* Animated Caret on Active Character */}
                {isCurrent && isFocused && (
                  <span
                    className={`absolute ${
                      settings.caretStyle === 'block'
                        ? 'inset-0 bg-sky-500/30 border border-sky-400 animate-pulse'
                        : settings.caretStyle === 'underline'
                        ? '-bottom-0.5 left-0 right-0 h-1 bg-sky-500 animate-pulse'
                        : '-left-0.5 top-0 bottom-0 w-0.5 bg-sky-500 animate-pulse'
                    }`}
                  />
                )}
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>

        {/* Quick Restart Hint in Footer (Elevated z-index so clicks reach the button) */}
        <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 mt-4 relative z-20 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
              Tab
            </span>
            <span className="hidden sm:inline">to restart test</span>
            <span className="sm:hidden">restart</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetTest();
            }}
            className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Interactive Virtual Mechanical Keyboard */}
      {showVirtualKeyboard && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <VirtualKeyboard
            activeChar={currentExpectedChar}
            lastPressedKey={inputText[inputText.length - 1]}
            isError={inputText.length > 0 && inputText[inputText.length - 1] !== targetText[inputText.length - 1]}
          />
        </div>
      )}

      {/* Results Telemetry Modal */}
      {resultData && (
        <ResultsModal
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          onRestart={resetTest}
          onNextTest={() => {
            generatePassage();
            resetTest();
          }}
          onPracticeWeakKeys={(keys) => {
            // Build custom drill with weak keys
            const drillWords = keys.map((k) => `${k}${k} ${k}a ${k}e ${k}i ${k}o ${k}u`).join(' ');
            setTargetText(drillWords);
            resetTest();
          }}
          data={resultData}
        />
      )}

    </div>
  );
};
