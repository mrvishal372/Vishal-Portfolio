import React, { useState, useCallback } from 'react';
import { 
  Delete, 
  CornerDownLeft, 
  Space, 
  ArrowBigUp, 
  Sparkles, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff,
  Trash2,
  Zap
} from 'lucide-react';

interface AnimatedAppKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter: () => void;
  onVoiceToggle?: () => void;
  isListening?: boolean;
  inputLength: number;
}

// Global AudioContext singleton
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      sharedAudioCtx = new AudioCtxClass();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export const AnimatedAppKeyboard: React.FC<AnimatedAppKeyboardProps> = React.memo(({
  isOpen,
  onClose,
  onKeyPress,
  onBackspace,
  onClear,
  onEnter,
  onVoiceToggle,
  isListening = false,
  inputLength,
}) => {
  const [layoutMode, setLayoutMode] = useState<'alpha' | 'numeric' | 'bca'>('alpha');
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Trigger Hardware Haptic Vibration on mobile devices
  const triggerHaptic = useCallback((pattern: number | number[] = 14) => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignored if vibration is restricted
    }
  }, []);

  // Play snappy, low-latency key sound
  const playKeySound = useCallback((type: 'key' | 'action' | 'special' | 'space' = 'key') => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'action') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'special') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'space') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.035);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750 + Math.random() * 80, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch {
      // Audio context restricted
    }
  }, [soundEnabled]);

  const handleKeyClick = (char: string) => {
    setActiveKey(char);
    setTimeout(() => setActiveKey(null), 100);
    triggerHaptic(12);
    playKeySound(char === ' ' ? 'space' : 'key');
    
    let toInsert = char;
    if (layoutMode === 'alpha') {
      toInsert = (isShift || isCaps) ? char.toUpperCase() : char.toLowerCase();
      if (isShift && !isCaps) {
        setIsShift(false);
      }
    }
    onKeyPress(toInsert);
  };

  const handleSnippetInsert = (snippet: string) => {
    triggerHaptic([15, 30, 15]);
    playKeySound('special');
    onKeyPress(snippet);
  };

  const handleBackspaceClick = () => {
    setActiveKey('backspace');
    setTimeout(() => setActiveKey(null), 100);
    triggerHaptic(18);
    playKeySound('action');
    onBackspace();
  };

  const handleClearClick = () => {
    triggerHaptic([20, 40, 20]);
    playKeySound('action');
    onClear();
  };

  const handleEnterClick = () => {
    setActiveKey('enter');
    setTimeout(() => setActiveKey(null), 120);
    triggerHaptic([25, 50, 30]);
    playKeySound('special');
    onEnter();
  };

  const handleShiftClick = () => {
    triggerHaptic(15);
    playKeySound('action');
    if (isShift) {
      if (isCaps) {
        setIsCaps(false);
        setIsShift(false);
      } else {
        setIsCaps(true);
      }
    } else {
      setIsShift(true);
    }
  };

  // Standard QWERTY Layout rows
  const alphaRow1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const alphaRow2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const alphaRow3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const numRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const numRow2 = ['@', '#', '₹', '$', '%', '&', '*', '(', ')', '_'];
  const numRow3 = ['+', '-', '=', '/', ':', ';', '"', "'", '?', '!'];

  const quickAnswers = [
    { label: 'Option A', val: 'A' },
    { label: 'Option B', val: 'B' },
    { label: 'Option C', val: 'C' },
    { label: 'Option D', val: 'D' },
    { label: 'Yes / Haan', val: 'Haan, bilkul!' },
    { label: 'No / Nahi', val: 'Nahi' },
  ];

  const bcaSnippets = [
    { label: 'Factorial C++', val: 'C++ me Factorial ka program aur logic samjhao' },
    { label: 'Inheritance OOP', val: 'Java me Inheritance kya hai with example?' },
    { label: 'DBMS Normalization', val: 'DBMS 1NF, 2NF, 3NF Normalization samjhao' },
    { label: 'Excel VLOOKUP', val: 'Excel me VLOOKUP aur XLOOKUP kaise use kare?' },
    { label: 'Stack vs Queue', val: 'Data Structure me Stack aur Queue me kya difference hai?' },
    { label: 'SQL SELECT Query', val: 'SQL SELECT query with WHERE and GROUP BY example' },
    { label: 'SDLC Phases', val: 'SDLC ke sabhi stages aur Waterfall Model samjhao' },
    { label: 'Binary Search', val: 'Binary Search Algorithm ka code aur time complexity' },
    { label: 'Logo Generator', val: 'CIMAGE BCA 3rd Sem ka modern luxury logo banao' },
    { label: 'Nearby Mechanic', val: 'Patna me mere paas bike mechanic dhundo' },
  ];

  if (!isOpen) return null;

  return (
    <div
      style={{ touchAction: 'manipulation' }}
      className="w-full bg-[#12131c] border-t border-slate-700/80 shadow-[0_-16px_50px_rgba(0,0,0,0.9)] select-none z-50 flex flex-col p-1.5 sm:p-2.5 pt-1.5 pb-5 sm:pb-6 shrink-0 transition-all duration-200"
    >
      {/* Active Voice Listening Live Banner */}
      {isListening && (
        <div className="mb-2 px-3 py-2 rounded-xl bg-gradient-to-r from-red-600/30 via-red-500/20 to-red-600/30 border border-red-500/50 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="text-xs font-bold text-red-200">
              🎙️ Listening... Bolye / Speak now
            </span>
          </div>
          <button
            type="button"
            onClick={() => onVoiceToggle && onVoiceToggle()}
            className="px-2.5 py-0.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* Top Quick Suggestions & Ribbon */}
      <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-800/80 mb-1.5 px-0.5 min-w-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-[75%] sm:max-w-[80%]">
          {/* Layout Mode Selector (ABC / 123 / BCA) */}
          <div className="flex items-center bg-[#1c1e2b] rounded-xl p-0.5 border border-slate-700/70 shrink-0 shadow-inner">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setLayoutMode('alpha');
                triggerHaptic(10);
                playKeySound('action');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'alpha'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ABC
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setLayoutMode('numeric');
                triggerHaptic(10);
                playKeySound('action');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === 'numeric'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              123
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setLayoutMode('bca');
                triggerHaptic(12);
                playKeySound('special');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                layoutMode === 'bca'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>BCA</span>
            </button>
          </div>

          {/* Quick Option Pills */}
          {quickAnswers.map((opt, i) => (
            <button
              key={i}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleSnippetInsert(opt.val);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#1c1e2b] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-[11px] font-bold whitespace-nowrap transition-all shrink-0 active:scale-95 shadow-xs cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-1 shrink-0">
          {inputLength > 0 && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleClearClick();
              }}
              title="Clear text"
              className="p-1.5 rounded-lg bg-[#1c1e2b] hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-800 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setSoundEnabled(!soundEnabled);
              triggerHaptic(10);
            }}
            title={soundEnabled ? "Sound on" : "Sound off"}
            className={`p-1.5 rounded-lg border transition-all text-xs cursor-pointer active:scale-95 ${
              soundEnabled 
                ? 'bg-purple-950/80 text-purple-300 border-purple-800/80 shadow-xs' 
                : 'bg-[#1c1e2b] text-slate-700 dark:text-slate-300 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              triggerHaptic(10);
              onClose();
            }}
            title="Minimize Keyboard"
            className="p-1.5 rounded-lg bg-[#1c1e2b] hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer active:scale-95"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BCA Snippets View */}
      {layoutMode === 'bca' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 max-h-[240px] overflow-y-auto scrollbar-none">
          {bcaSnippets.map((snip, i) => (
            <button
              key={i}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleSnippetInsert(snip.val);
              }}
              className="p-2.5 rounded-xl bg-[#1c1e2b] hover:bg-purple-950/60 border border-purple-500/30 hover:border-cyan-400 text-left transition-all group active:scale-[0.98] cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300">{snip.label}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{snip.val}</p>
            </button>
          ))}
        </div>
      )}

      {/* QWERTY Standard Phone Layout */}
      {layoutMode !== 'bca' && (
        <div className="flex flex-col gap-1.5 w-full max-w-xl mx-auto px-0.5">
          {/* ROW 1: Q W E R T Y U I O P (Standard 10 Keys) */}
          <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {(layoutMode === 'alpha' ? alphaRow1 : numRow1).map((k) => {
              const char = (isShift || isCaps) ? k.toUpperCase() : k;
              const isPressed = activeKey === k;
              return (
                <button
                  key={k}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleKeyClick(k);
                  }}
                  className={`flex-1 h-11 sm:h-12 rounded-lg font-semibold text-[17px] sm:text-[19px] flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none touch-manipulation border border-slate-700/60 shadow-[0_2px_0_rgba(0,0,0,0.45)] ${
                    isPressed
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,191,255,0.8)]'
                      : 'bg-[#222433] hover:bg-[#2b2d40] text-slate-100 active:bg-cyan-400 active:text-slate-950'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* ROW 2: A S D F G H J K L (Standard 9 Keys Staggered) */}
          <div className="flex justify-center gap-1 sm:gap-1.5 w-full px-3 sm:px-4">
            {(layoutMode === 'alpha' ? alphaRow2 : numRow2).map((k) => {
              const char = (isShift || isCaps) ? k.toUpperCase() : k;
              const isPressed = activeKey === k;
              return (
                <button
                  key={k}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleKeyClick(k);
                  }}
                  className={`flex-1 h-11 sm:h-12 rounded-lg font-semibold text-[17px] sm:text-[19px] flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none touch-manipulation border border-slate-700/60 shadow-[0_2px_0_rgba(0,0,0,0.45)] ${
                    isPressed
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,191,255,0.8)]'
                      : 'bg-[#222433] hover:bg-[#2b2d40] text-slate-100 active:bg-cyan-400 active:text-slate-950'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* ROW 3: Shift / Z X C V B N M / Backspace */}
          <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {layoutMode === 'alpha' ? (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleShiftClick();
                }}
                className={`w-11 sm:w-14 h-11 sm:h-12 rounded-lg flex items-center justify-center transition-all shadow-[0_2px_0_rgba(0,0,0,0.45)] cursor-pointer select-none touch-manipulation shrink-0 border ${
                  isCaps
                    ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-extrabold shadow-[0_0_12px_rgba(0,191,255,0.75)]'
                    : isShift
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-[#181926] text-slate-300 border-slate-700/70 hover:bg-[#222433]'
                }`}
              >
                <ArrowBigUp className={`w-5 h-5 sm:w-6 sm:h-6 ${isCaps || isShift ? 'fill-current' : ''}`} />
              </button>
            ) : (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleKeyClick('+');
                }}
                className="w-11 sm:w-14 h-11 sm:h-12 rounded-lg bg-[#181926] text-white border border-slate-700/70 font-semibold text-[17px] sm:text-[19px] flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.45)] active:bg-cyan-400 active:text-black cursor-pointer select-none touch-manipulation shrink-0"
              >
                +
              </button>
            )}

            {(layoutMode === 'alpha' ? alphaRow3 : numRow3).map((k) => {
              const char = (isShift || isCaps) ? k.toUpperCase() : k;
              const isPressed = activeKey === k;
              return (
                <button
                  key={k}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleKeyClick(k);
                  }}
                  className={`flex-1 h-11 sm:h-12 rounded-lg font-semibold text-[17px] sm:text-[19px] flex items-center justify-center transition-transform active:scale-90 cursor-pointer select-none touch-manipulation border border-slate-700/60 shadow-[0_2px_0_rgba(0,0,0,0.45)] ${
                    isPressed
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,191,255,0.8)]'
                      : 'bg-[#222433] hover:bg-[#2b2d40] text-slate-100 active:bg-cyan-400 active:text-slate-950'
                  }`}
                >
                  {char}
                </button>
              );
            })}

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleBackspaceClick();
              }}
              className="w-11 sm:w-14 h-11 sm:h-12 rounded-lg bg-[#181926] hover:bg-red-950 text-slate-200 hover:text-red-300 border border-slate-700/70 flex items-center justify-center transition-all shadow-[0_2px_0_rgba(0,0,0,0.45)] active:bg-red-600 active:text-white cursor-pointer select-none touch-manipulation shrink-0"
            >
              <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* ROW 4 (BOTTOM ROW): 123 | Comma | MIC (Dedicated) | SPACEBAR | Period | Enter/Send */}
          <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
            {/* Mode Switcher (?123 / ABC) */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                triggerHaptic(10);
                playKeySound('action');
                setLayoutMode(layoutMode === 'alpha' ? 'numeric' : 'alpha');
              }}
              className="w-12 sm:w-15 h-11 sm:h-12 rounded-lg bg-[#181926] hover:bg-[#222433] text-slate-300 border border-slate-700/70 font-bold text-xs sm:text-sm flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.45)] active:bg-indigo-600 active:text-white cursor-pointer select-none touch-manipulation shrink-0"
            >
              {layoutMode === 'alpha' ? '?123' : 'ABC'}
            </button>

            {/* Comma Key */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleKeyClick(',');
              }}
              className="w-9 sm:w-11 h-11 sm:h-12 rounded-lg bg-[#222433] hover:bg-[#2b2d40] text-slate-200 border border-slate-700/60 font-semibold text-[17px] sm:text-[19px] flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.45)] active:bg-cyan-400 active:text-black cursor-pointer select-none touch-manipulation shrink-0"
            >
              ,
            </button>

            {/* Dedicated Bottom Microphone Voice Key */}
            {onVoiceToggle && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  triggerHaptic([20, 30, 20]);
                  onVoiceToggle();
                }}
                title={isListening ? "Listening... Tap to stop" : "Tap for Voice typing"}
                className={`w-11 sm:w-13 h-11 sm:h-12 rounded-lg flex items-center justify-center transition-all shadow-[0_2px_0_rgba(0,0,0,0.45)] cursor-pointer select-none touch-manipulation shrink-0 border ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.9)]'
                    : 'bg-[#181926] hover:bg-cyan-950 text-cyan-400 hover:text-cyan-200 border-cyan-500/40 active:bg-red-500 active:text-white'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                ) : (
                  <Mic className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                )}
              </button>
            )}

            {/* Centered Space Bar */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleKeyClick(' ');
              }}
              className="flex-1 h-11 sm:h-12 rounded-lg bg-[#222433] hover:bg-[#2b2d40] text-slate-400 hover:text-white border border-slate-700/60 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_2px_0_rgba(0,0,0,0.45)] active:bg-indigo-900 active:text-white cursor-pointer select-none touch-manipulation"
            >
              <Space className="w-4 h-4 opacity-50" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider">SPACE</span>
            </button>

            {/* Period Key */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleKeyClick('.');
              }}
              className="w-9 sm:w-11 h-11 sm:h-12 rounded-lg bg-[#222433] hover:bg-[#2b2d40] text-slate-200 border border-slate-700/60 font-semibold text-[17px] sm:text-[19px] flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.45)] active:bg-cyan-400 active:text-black cursor-pointer select-none touch-manipulation shrink-0"
            >
              .
            </button>

            {/* Send / Enter Action Key */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleEnterClick();
              }}
              className="w-12 sm:w-15 h-11 sm:h-12 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white font-bold flex items-center justify-center shadow-[0_2px_0_rgba(0,0,0,0.45),0_0_15px_rgba(99,102,241,0.4)] active:scale-95 cursor-pointer select-none touch-manipulation shrink-0 border border-indigo-400/40"
            >
              <CornerDownLeft className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
