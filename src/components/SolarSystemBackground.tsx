import React from 'react';
import { AmbientGlowBackground } from './AmbientGlowBackground';

interface SolarSystemBackgroundProps {
  activeTab?: string;
  isDark: boolean;
  isPaused?: boolean;
  reducedMotion?: boolean;
}

/**
 * 🌌 Lightweight Ambient Glow Background
 * Provides consistent, ultra-low-power dark ambient glow without continuous canvas loops.
 */
export const SolarSystemBackground: React.FC<SolarSystemBackgroundProps> = React.memo(function SolarSystemBackground({
  isDark,
}) {
  return <AmbientGlowBackground isDark={isDark} />;
});

SolarSystemBackground.displayName = 'SolarSystemBackground';
