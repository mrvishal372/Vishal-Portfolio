import React from 'react';
import { motion } from 'motion/react';

interface VyronTypingLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const VyronTypingLogo: React.FC<VyronTypingLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSize = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const titleSize = {
    sm: 'text-sm font-black',
    md: 'text-lg font-black',
    lg: 'text-2xl font-black',
  }[size];

  const subSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Mechanical Key / Cursor Emblem */}
      <div className={`relative ${iconSize} rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 p-1 border border-sky-400/30 shadow-md shadow-indigo-950/40 flex items-center justify-center overflow-hidden shrink-0 group`}>
        {/* Ambient grid glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-indigo-500/20 opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Stylized Keycap with live blinking prompt */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-sky-400"
        >
          {/* Key outline */}
          <rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-sky-400/80"
          />
          {/* Top keycap bevel */}
          <path
            d="M5 8H19"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          {/* V letterform & typing cursor */}
          <path
            d="M7 10L10.5 16L14 10"
            stroke="url(#vGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Blinking caret */}
          <line
            x1="16.5"
            y1="10"
            x2="16.5"
            y2="16"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="vGradient" x1="7" y1="10" x2="14" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className={`tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap ${titleSize}`}>
          <span className="tracking-wider bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-500 dark:from-sky-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
            VYRON
          </span>
          <span className="text-slate-800 dark:text-slate-100">
            TYPING
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 uppercase">
            PRO
          </span>
        </div>

        {showSubtitle && (
          <div className={`mt-0.5 font-medium tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap ${subSize}`}>
            <span>Speed & Accuracy Lab</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Zero Latency</span>
          </div>
        )}
      </div>
    </div>
  );
};
