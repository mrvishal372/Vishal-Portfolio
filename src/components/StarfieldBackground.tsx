import React from 'react';
import { AmbientGlowBackground } from './AmbientGlowBackground';

interface StarfieldBackgroundProps {
  isDark: boolean;
  isPaused?: boolean;
  reducedMotion?: boolean;
}

/**
 * 🌌 Lightweight Ambient Glow Replacement for StarfieldBackground
 * Replaces heavy canvas 60fps loops with pure static CSS Ambient Glow Design.
 * Eliminates mobile GPU & CPU heating on iPhone 12 Mini and low-RAM devices.
 */
export const StarfieldBackground: React.FC<StarfieldBackgroundProps> = React.memo(({ isDark }) => {
  return <AmbientGlowBackground isDark={isDark} />;
});

StarfieldBackground.displayName = 'StarfieldBackground';
