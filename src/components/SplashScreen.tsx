import React, { useEffect, useState, useRef } from 'react';

interface SplashScreenProps {
  theme?: 'light' | 'dark';
  reducedMotion?: boolean;
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  theme = 'light', 
  reducedMotion = false, 
  onFinish 
}) => {
  const [isSettled, setIsSettled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    // If reduced motion is preferred, finish quickly and smoothly
    const duration = reducedMotion ? 400 : 820;
    const settleDelay = reducedMotion ? 450 : 880;
    const finishDelay = reducedMotion ? 700 : 1150;

    // Settle / begin dissolve transition after progress finishes
    const tSettle = setTimeout(() => {
      setIsSettled(true);
    }, settleDelay);

    // Progress animation (0 to 100%)
    const startTime = performance.now();
    let animationFrameId: number;

    const animateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const linearRatio = Math.min(1, Math.max(0, elapsed / duration));
      // Smooth Apple/YouTube cubic ease-out
      const easedProgress = 1 - Math.pow(1 - linearRatio, 2.5);
      const p = Math.floor(easedProgress * 100);
      if (progressRef.current) progressRef.current.style.width = `${p}%`;
      if (progressTextRef.current) progressTextRef.current.innerText = `${p}%`;

      if (linearRatio < 1) {
        animationFrameId = requestAnimationFrame(animateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    // Complete dismiss callback after smooth cross-dissolve
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, finishDelay);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(tSettle);
      clearTimeout(finishTimer);
    };
  }, [onFinish, reducedMotion]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-300 ease-out ${
        isSettled ? 'opacity-0 pointer-events-none scale-[1.01]' : 'opacity-100 scale-100'
      } ${isDark ? 'bg-[#020617]' : 'bg-white'}`}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        willChange: 'opacity, transform',
      }}
      aria-hidden="true"
    >
      {/* Ambient Radial Prismatic Refraction */}
      <div 
        className={`absolute inset-0 pointer-events-none splash-glow ${
          isDark 
            ? 'opacity-70 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.22)_0%,rgba(245,158,11,0.14)_35%,transparent_70%)]' 
            : 'opacity-50 bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.08)_0%,rgba(245,158,11,0.09)_35%,transparent_70%)]'
        }`} 
      />

      {/* Centered YouTube-Style Brand Experience */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        
        {/* YouTube-Style Bouncing Spring Shield Emblem */}
        <div className={`relative mb-5 flex items-center justify-center ${reducedMotion ? '' : 'splash-logo-anim'}`}>
          <div 
            className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center relative overflow-hidden transition-colors ${
              isDark 
                ? 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-white/20 p-0.5 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.4)]' 
                : 'bg-white border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,1)] p-0.5'
            }`}
          >
            {/* Subtle internal specular sheen */}
            <div className={`absolute inset-0 pointer-events-none ${
              isDark 
                ? 'bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent' 
                : 'bg-gradient-to-tr from-transparent via-white/80 to-transparent'
            }`} />
            
            {/* Rotating subtle energy ring */}
            <div className="absolute inset-1 rounded-2xl border border-amber-400/30 animate-pulse pointer-events-none" />

            {/* Inner Brand Monogram / Shield */}
            <svg 
              className={`w-9 h-9 sm:w-10 sm:h-10 transition-transform ${
                isDark 
                  ? 'text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]' 
                  : 'text-[#FF9933] drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]'
              }`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.8"
            >
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8v8M8 12h8" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
            </svg>
          </div>

          {/* Ambient golden corona */}
          <div className={`absolute -inset-2 rounded-full pointer-events-none blur-xl ${
            isDark ? 'bg-amber-400/25' : 'bg-amber-400/20'
          }`} />
        </div>

        {/* Minimal High-Contrast Brand Typography */}
        <div className={`flex flex-col items-center justify-center space-y-1 ${reducedMotion ? '' : 'splash-text-anim'}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-1.5 font-['Poppins',sans-serif]">
            <span className={
              isDark
                ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-slate-950 via-slate-800 to-slate-900 bg-clip-text text-transparent'
            }>
              Vishal
            </span>
            <span className="text-[#FF9933]">
              Portfolio
            </span>
          </h1>

          <p className={`text-xs sm:text-sm tracking-widest uppercase font-mono pt-0.5 ${
            isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold'
          }`}>
            BharatJugaad • Powered by Vyron AI
          </p>
        </div>

        {/* Fluid Glass Progress Capsule */}
        <div className={`flex flex-col items-center gap-2.5 mt-6 ${reducedMotion ? '' : 'splash-text-anim'}`}>
          <div className={`w-56 sm:w-64 h-2 rounded-full overflow-hidden relative p-[1.5px] ${
            isDark 
              ? 'bg-slate-900/90 border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]' 
              : 'bg-slate-100 border border-slate-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]'
          }`}>
            {/* Ambient track glow */}
            <div className={`absolute inset-0 pointer-events-none ${
              isDark 
                ? 'bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-transparent' 
                : 'bg-gradient-to-r from-blue-500/5 via-amber-500/5 to-transparent'
            }`} />
            
            {/* Progress Fill */}
            <div 
              className={`h-full rounded-full relative transition-all duration-75 ease-out ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.6)]' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
              }`}
              ref={progressRef}
              style={{ width: '0%', willChange: 'width' }}
            >
              {/* Glowing leading tip */}
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full ${
                isDark 
                  ? 'shadow-[0_0_6px_#ffffff,0_0_10px_#f59e0b]' 
                  : 'shadow-[0_0_6px_#ffffff,0_0_8px_#f59e0b]'
              }`} />
            </div>
          </div>

          {/* Precision percentage label */}
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-wider">
            <span className={`uppercase text-[10px] font-bold ${
              isDark ? 'text-amber-400' : 'text-amber-600'
            }`}>
              CALIBRATING
            </span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>•</span>
            <span ref={progressTextRef} className={`tabular-nums font-semibold ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              0%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
