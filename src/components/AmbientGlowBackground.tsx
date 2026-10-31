import React from 'react';

interface AmbientGlowBackgroundProps {
  isDark: boolean;
}

/**
 * 🌌 Premium Ambient Glow Design
 * High-performance, lightweight static background:
 * - 0% CPU & 0% GPU idle consumption
 * - No canvas particle loops, no requestAnimationFrame, no infinite CSS keyframes
 * - Deep dark slate gradient with subtle blue and purple ambient glow
 * - Tailored for iPhone 12 Mini and low-RAM mobile devices
 */
export const AmbientGlowBackground: React.FC<AmbientGlowBackgroundProps> = React.memo(({ isDark }) => {
  if (!isDark) {
    return (
      <div 
        className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none bg-white"
        aria-hidden="true"
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden bg-[#020617]"
      aria-hidden="true"
      style={{
        contain: 'strict',
      }}
    >
      {/* 1. Base Deep Obsidian Gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(180deg, #020617 0%, #030712 50%, #02040a 100%)',
        }}
      />

      {/* 2. Top-Right Ambient Electric Blue Glow */}
      <div 
        className="absolute -top-24 -right-24 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full pointer-events-none opacity-40 sm:opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, rgba(59, 130, 246, 0.12) 40%, transparent 70%)',
        }}
      />

      {/* 3. Top-Left Subtle Cosmic Violet Glow */}
      <div 
        className="absolute top-1/4 -left-28 w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full pointer-events-none opacity-30 sm:opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.22) 0%, rgba(126, 34, 206, 0.08) 45%, transparent 70%)',
        }}
      />

      {/* 4. Bottom-Center Deep Indigo / Cyan Ambient Light */}
      <div 
        className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-[450px] sm:w-[650px] h-[320px] sm:h-[420px] rounded-full pointer-events-none opacity-35 sm:opacity-45"
        style={{
          background: 'radial-gradient(ellipse, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 75%)',
        }}
      />

      {/* 5. Delicate Micro Starlight Accents (Crisp static CSS points, 0 animations, 0 canvas) */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 15% 18%, rgba(255, 255, 255, 0.8) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 38% 12%, rgba(186, 230, 253, 0.85) 50%, transparent 100%),
            radial-gradient(1px 1px at 72% 22%, rgba(255, 255, 255, 0.75) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 15%, rgba(216, 180, 254, 0.85) 50%, transparent 100%),
            radial-gradient(1px 1px at 24% 45%, rgba(255, 255, 255, 0.65) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 68% 52%, rgba(186, 230, 253, 0.7) 50%, transparent 100%),
            radial-gradient(1px 1px at 82% 65%, rgba(255, 255, 255, 0.65) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 18% 78%, rgba(216, 180, 254, 0.7) 50%, transparent 100%),
            radial-gradient(1px 1px at 52% 84%, rgba(255, 255, 255, 0.6) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 88% 90%, rgba(186, 230, 253, 0.7) 50%, transparent 100%)
          `,
        }}
      />
    </div>
  );
});

AmbientGlowBackground.displayName = 'AmbientGlowBackground';
