import React from 'react';
import { motion } from 'motion/react';

interface VirtualKeyboardProps {
  activeChar: string;
  lastPressedKey?: string;
  isError?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  activeChar,
  lastPressedKey,
  isError,
}) => {
  const rows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Space'],
  ];

  const normalizedActive = activeChar === ' ' ? 'Space' : activeChar.toUpperCase();
  const normalizedLast = lastPressedKey === ' ' ? 'Space' : (lastPressedKey || '').toUpperCase();

  const isHomeRow = (key: string) => ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'].includes(key);

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-3 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between px-2 pb-2 text-[10px] sm:text-xs font-bold text-slate-400 border-b border-slate-800">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          Interactive Keyboard & Finger Placement Guide
        </span>
        <span className="hidden sm:inline text-slate-400">
          Home Row Position: <strong className="text-emerald-300">ASDF JKL;</strong>
        </span>
      </div>

      <div className="mt-2 space-y-1 sm:space-y-1.5 select-none font-mono overflow-x-auto scrollbar-none pb-1">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center items-center gap-0.5 sm:gap-1 min-w-fit px-0.5">
            {row.map((key, kIdx) => {
              const isTarget = key === normalizedActive || (key.length === 1 && key === normalizedActive);
              const isPressed = key === normalizedLast || (key.length === 1 && key === normalizedLast);
              const isHome = isHomeRow(key);

              let widthClass = 'w-5 sm:w-8 md:w-9 h-7 sm:h-8 md:h-9 text-[9px] sm:text-xs shrink-0';
              if (key === 'Space') widthClass = 'w-36 sm:w-56 md:w-64 h-7 sm:h-8 md:h-9 text-[9px] sm:text-xs shrink-0';
              else if (key === 'Backspace' || key === 'Enter') widthClass = 'w-10 sm:w-14 md:w-16 h-7 sm:h-8 md:h-9 text-[8px] sm:text-[10px] shrink-0';
              else if (key === 'Shift') widthClass = 'w-9 sm:w-12 md:w-14 h-7 sm:h-8 md:h-9 text-[8px] sm:text-[10px] shrink-0';
              else if (key === 'Tab' || key === 'Caps') widthClass = 'w-8 sm:w-11 md:w-12 h-7 sm:h-8 md:h-9 text-[8px] sm:text-[10px] shrink-0';

              return (
                <motion.div
                  key={key + kIdx}
                  animate={
                    isPressed
                      ? { scale: [1, 0.88, 1], y: [0, 2, 0] }
                      : isTarget
                      ? { y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.8 } }
                      : {}
                  }
                  className={`relative rounded-md flex items-center justify-center font-bold transition-colors shadow-xs ${widthClass} ${
                    isTarget
                      ? isError
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 ring-2 ring-red-400 font-black'
                        : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-300 font-black'
                      : isPressed
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : isHome
                      ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <span>{key === 'Space' ? 'SPACE BAR' : key}</span>
                  {/* Home row tactile bump indicator for F and J */}
                  {(key === 'F' || key === 'J') && (
                    <div className="absolute bottom-1 w-2.5 h-0.5 bg-emerald-400/80 rounded-full" />
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
