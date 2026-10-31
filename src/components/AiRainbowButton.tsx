import React from 'react';
import { Mic, Sparkles } from 'lucide-react';

interface AiRainbowButtonProps {
  onClick: () => void;
  variant?: 'hero' | 'header' | 'floating' | 'compact';
  label?: string;
  isHindi?: boolean;
  className?: string;
  id?: string;
}

/**
 * 🌈 Lightweight Premium AiRainbowButton
 * - Instant touch/click response with zero lag
 * - Identical stunning chromatic gradient & luxury Apple-style specular sheen
 * - 0% continuous animation overhead (no infinite keyframe loops or RAF)
 * - Optimized for low-RAM mobile devices and thermal efficiency
 */
export const AiRainbowButton: React.FC<AiRainbowButtonProps> = React.memo(({
  onClick,
  variant = 'hero',
  label,
  isHindi = false,
  className = '',
  id,
}) => {
  // Determine size classes & label based on variant
  const isHeader = variant === 'header';
  const isFloating = variant === 'floating';

  const defaultLabel = isHindi
    ? isHeader ? 'बोलें AI' : 'Vyron AI'
    : isHeader ? 'Ask AI' : 'Vyron AI';

  const displayLabel = label || defaultLabel;

  return (
    <button
      type="button"
      id={id || (isHeader ? 'header-voice-btn' : 'hero-vyron-ai-btn')}
      onClick={onClick}
      aria-label={displayLabel}
      title={isHindi ? 'व्यारोन AI असिस्टेंट — बोलकर या लिखकर पूछें' : 'Vyron AI Assistant — Ask with Voice or Text'}
      className={`group relative overflow-hidden rounded-full font-black select-none touch-manipulation cursor-pointer flex items-center justify-center transition-transform duration-150 active:scale-95 hover:scale-[1.02] ${
        isHeader
          ? 'h-8 sm:h-9 px-3 sm:px-4 text-xs'
          : isFloating
          ? 'h-12 sm:h-14 px-5 sm:px-6 text-sm shadow-lg'
          : 'min-h-[48px] sm:min-h-[50px] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm shadow-md'
      } ${className}`}
      style={{
        // 🌈 Chromatic AI Gradient (blue, pink, yellow, emerald, orange)
        background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 26%, #facc15 52%, #10b981 76%, #f97316 100%)',
        contain: 'layout style',
      }}
    >
      {/* 🌟 1. Outer Chromatic Aura Glow (Static soft shadow, 0 animation) */}
      <span
        className="absolute -inset-0.5 rounded-full opacity-60 group-hover:opacity-90 transition-opacity pointer-events-none -z-10"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #ec4899, #facc15, #10b981, #f97316)',
          filter: 'blur(5px)',
        }}
        aria-hidden="true"
      />

      {/* 💎 2. Glossy Specular Top Sheen (Apple-style 3D Glass) */}
      <span 
        className="absolute inset-x-1 top-0.5 h-[42%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none z-10" 
        aria-hidden="true"
      />

      {/* 🔘 3. Border Ring for Depth */}
      <span 
        className="absolute inset-0 rounded-full border border-white/50 dark:border-white/35 pointer-events-none z-10 shadow-inner" 
        aria-hidden="true"
      />

      {/* 🚀 4. Foreground Content (Icons & Text) */}
      <div className="relative z-20 flex items-center justify-center gap-1.5 sm:gap-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        {/* AI Mic / Sparkle Icon container */}
        <div className="relative flex items-center justify-center">
          <div className="flex items-center justify-center transition-transform group-hover:rotate-12 duration-200">
            {isHeader ? (
              <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
            ) : (
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-200 group-hover:text-white shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-colors" />
            )}
          </div>

          {/* Crisp Living AI Status Dot (Static, no CPU drain) */}
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-300 border border-white/80" />
        </div>

        {/* Text Label */}
        <span className="font-extrabold tracking-wide text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
          {displayLabel}
        </span>

        {/* Extra Mini AI Badge for Hero */}
        {!isHeader && (
          <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-full bg-white/25 border border-white/40 text-white shrink-0 hidden xs:inline-flex">
            AI
          </span>
        )}
      </div>
    </button>
  );
});

AiRainbowButton.displayName = 'AiRainbowButton';
