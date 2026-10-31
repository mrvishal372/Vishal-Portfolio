import React from 'react';

/**
 * 🌌 Premium Ambient Glow Header Banners
 * High-performance static visual styling:
 * - 0% CPU & 0% GPU idle overhead (zero continuous spin, pulse, ping, or RAF loops)
 * - Beautiful static celestial tech chakras, radar motifs, and ambient glows
 * - Crisp borders and subtle shadows replacing heavy stacked blurs
 * - Preserves complete visual aesthetic and luxury feel across all tabs
 */

// ==========================================
// 1. HOME TAB HERO AMBIENT GLOW
// Saffron & Navy Royal Cosmic Chakra + Celestial Core
// ==========================================
export const HomeHeaderAnimation: React.FC = React.memo(() => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl select-none"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Static Ambient Glow Backdrops */}
      <div 
        className="absolute -top-14 -right-14 w-72 h-72 rounded-full pointer-events-none opacity-30" 
        style={{
          background: 'radial-gradient(circle, rgba(255, 153, 51, 0.35) 0%, rgba(245, 158, 11, 0.1) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-14 -left-14 w-64 h-64 rounded-full pointer-events-none opacity-25" 
        style={{
          background: 'radial-gradient(circle, rgba(19, 136, 8, 0.3) 0%, rgba(5, 150, 105, 0.08) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none opacity-20" 
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 65%)',
        }}
      />

      {/* Right Side Cosmic Tech Chakra Motif (Crisp, Static, 0 CPU/GPU Load) */}
      <div className="absolute right-3 sm:right-7 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-56 opacity-80 sm:opacity-90">
        {/* Outer Static Dashed Chakra Orbit */}
        <div className="absolute inset-0 border border-dashed border-amber-400/35 rounded-full" />
        
        {/* Middle Celestial Ring */}
        <div className="absolute inset-4 sm:inset-6 border border-cyan-400/35 rounded-full border-t-transparent border-b-transparent" />

        {/* Inner Ring */}
        <div className="absolute inset-9 sm:inset-12 border border-indigo-400/40 rounded-full" />

        {/* Central Radiant AI Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#FF9933] via-amber-400 to-[#000080] shadow-[0_0_20px_rgba(245,158,11,0.45)] flex items-center justify-center p-0.5">
          <div className="w-full h-full rounded-full bg-slate-950/85 flex items-center justify-center relative overflow-hidden">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" opacity="0.6" />
              <circle cx="12" cy="12" r="3" fill="#FF9933" />
            </svg>
          </div>
        </div>

        {/* Static Celestial Beacon Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] border border-white" />
        <div className="absolute bottom-4 left-1/4 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] border border-white" />
        <div className="absolute right-1 top-1/3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
      </div>

      {/* Soft Ambient Starlight Accents */}
      <div className="absolute top-4 left-1/4 w-1.5 h-1.5 rounded-full bg-amber-300/80 shadow-[0_0_4px_#fde047]" />
      <div className="absolute bottom-6 right-1/3 w-2 h-2 rounded-full bg-cyan-300/70 shadow-[0_0_4px_#67e8f9]" />
    </div>
  );
});

HomeHeaderAnimation.displayName = 'HomeHeaderAnimation';

// ==========================================
// 2. AI TOOLS TAB HERO AMBIENT GLOW
// Neural Matrix Grid + AI Hexagon Engine
// ==========================================
export const AIToolsHeaderAnimation: React.FC = React.memo(() => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl select-none"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Static Nebular Glow */}
      <div 
        className="absolute -top-12 -right-10 w-64 h-64 rounded-full pointer-events-none opacity-30" 
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, rgba(249, 115, 22, 0.08) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-12 -left-10 w-60 h-60 rounded-full pointer-events-none opacity-25" 
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)',
        }}
      />

      {/* Futuristic Right Side Gear & AI Hexagon Engine (Static, crisp) */}
      <div className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-56 opacity-80 sm:opacity-95">
        {/* Hexagonal Outer Grid Ring */}
        <svg 
          className="absolute inset-0 w-full h-full text-amber-400/35" 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1"
        >
          <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" strokeDasharray="4 3" />
          <polygon points="50,15 80,30 80,70 50,85 20,70 20,30" strokeOpacity="0.45" />
        </svg>

        {/* Tech Circuit Gear */}
        <div className="absolute inset-6 sm:inset-8 border border-cyan-400/40 rounded-full border-dashed" />

        {/* Neural Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-950 via-blue-900 to-amber-500/80 p-0.5 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
          <div className="w-full h-full rounded-2xl bg-slate-950/90 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="3" fill="#38bdf8" />
            </svg>
          </div>
        </div>

        {/* Static Spark Nodes */}
        <div className="absolute top-2 right-4 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        <div className="absolute bottom-4 left-6 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
      </div>

      {/* Circuit lines */}
      <div className="absolute bottom-2 left-1/4 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="absolute top-4 left-1/3 w-40 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
    </div>
  );
});

AIToolsHeaderAnimation.displayName = 'AIToolsHeaderAnimation';

// ==========================================
// 3. EXPLORE TAB HERO AMBIENT GLOW
// Cosmic Radar / Telescope Constellation
// ==========================================
export const ExploreHeaderAnimation: React.FC = React.memo(() => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl select-none"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Warm Sunset & Galactic Ambient Glow */}
      <div 
        className="absolute -top-14 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-30" 
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, rgba(245, 158, 11, 0.08) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-14 -left-12 w-60 h-60 rounded-full pointer-events-none opacity-25" 
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)',
        }}
      />

      {/* Radar Scanner Motif on the right (Static, clean geometry) */}
      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-56 opacity-80 sm:opacity-90">
        {/* Concentric Radar Rings */}
        <div className="absolute inset-0 border border-amber-400/30 rounded-full" />
        <div className="absolute inset-5 border border-amber-400/20 rounded-full" />
        <div className="absolute inset-10 border border-cyan-400/25 rounded-full" />
        <div className="absolute inset-15 border border-purple-400/30 rounded-full" />

        {/* Sector Sweep Highlight */}
        <div className="absolute inset-0 rounded-full opacity-60">
          <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-400/25 via-amber-400/5 to-transparent origin-bottom-right rounded-tl-full" />
        </div>

        {/* Center Scanner Star */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-[0_0_16px_#f97316]">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
          </svg>
        </div>

        {/* Radar Blips */}
        <div className="absolute top-6 right-10 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        <div className="absolute bottom-10 left-8 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047]" />
        <div className="absolute top-16 left-12 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
      </div>
    </div>
  );
});

ExploreHeaderAnimation.displayName = 'ExploreHeaderAnimation';

// ==========================================
// 4. ALERTS & NOTIFICATIONS TAB HERO AMBIENT GLOW
// Signal Beacon & Broadcast Core
// ==========================================
export const AlertsHeaderAnimation: React.FC = React.memo(() => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl select-none"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Ambient Gradient Glow */}
      <div 
        className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-30" 
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(20, 184, 166, 0.08) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full pointer-events-none opacity-25" 
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(249, 115, 22, 0.06) 50%, transparent 70%)',
        }}
      />

      {/* Signal Beacon Towers on the right */}
      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-56 opacity-80 sm:opacity-90 flex items-center justify-center">
        {/* Ripple Wave Rings (Crisp static borders) */}
        <div className="absolute w-44 sm:w-52 h-44 sm:h-52 rounded-full border border-emerald-400/25" />
        <div className="absolute w-32 sm:w-38 h-32 sm:h-38 rounded-full border border-teal-400/35" />
        <div className="absolute w-24 h-24 rounded-full border border-dashed border-amber-400/50" />

        {/* Central Bell / Broadcast Beacon Core */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-amber-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.55)]">
          <div className="w-full h-full rounded-2xl bg-slate-950/85 flex items-center justify-center">
            <svg className="w-7 h-7 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>

        {/* Small Signal Dots */}
        <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
        <div className="absolute bottom-3 right-8 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
      </div>
    </div>
  );
});

AlertsHeaderAnimation.displayName = 'AlertsHeaderAnimation';

// ==========================================
// 5. PROFILE TAB HERO AMBIENT GLOW
// Royal Saffron-Gold Emblem & Star Halo
// ==========================================
export const ProfileHeaderAnimation: React.FC = React.memo(() => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl select-none"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Rich Saffron-Navy Luxury Glow */}
      <div 
        className="absolute -top-14 -right-12 w-64 h-64 rounded-full pointer-events-none opacity-30" 
        style={{
          background: 'radial-gradient(circle, rgba(255, 153, 51, 0.35) 0%, rgba(245, 158, 11, 0.1) 50%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-14 -left-12 w-60 h-60 rounded-full pointer-events-none opacity-25" 
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)',
        }}
      />

      {/* Right Side Golden Star Crown Orbit (Static, crisp) */}
      <div className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-44 sm:w-56 h-44 sm:h-56 opacity-80 sm:opacity-90">
        {/* Star Polygon Ring */}
        <svg 
          className="absolute inset-0 w-full h-full text-amber-400/40" 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.2"
        >
          <circle cx="50" cy="50" r="42" strokeDasharray="3 4" />
          <polygon points="50,10 62,35 90,38 70,58 75,86 50,73 25,86 30,58 10,38 38,35" strokeOpacity="0.35" />
        </svg>

        {/* Halo Ring */}
        <div className="absolute inset-6 border border-cyan-400/35 rounded-full border-dashed" />

        {/* Center Shield Avatar Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-tr from-[#FF9933] via-amber-400 to-[#000080] p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
          <div className="w-full h-full rounded-full bg-slate-950/85 flex items-center justify-center">
            <svg className="w-7 h-7 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
              <path d="M12 8v8M8 12h8" strokeWidth="1.5" strokeOpacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Static Golden Gem Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] border border-white" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
      </div>
    </div>
  );
});

ProfileHeaderAnimation.displayName = 'ProfileHeaderAnimation';
