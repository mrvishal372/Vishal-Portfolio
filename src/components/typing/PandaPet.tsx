import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PandaPetSettings } from '../../types/typing';

interface PandaPetProps {
  settings: PandaPetSettings;
  onOpenSettings?: () => void;
  typingActive?: boolean;
  wpm?: number;
}

type PandaState = 'walking' | 'sitting' | 'eating' | 'looking' | 'sleeping';

export const PandaPet: React.FC<PandaPetProps> = ({
  settings,
  onOpenSettings,
  typingActive = false,
  wpm = 0,
}) => {
  const [currentState, setCurrentState] = useState<PandaState>('walking');
  const [posX, setPosX] = useState<number>(18); // percentage of container width
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [chewPhase, setChewPhase] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [reactionEmote, setReactionEmote] = useState<string | null>(null);

  // If user hid the panda, don't render
  if (!settings.visible) {
    return null;
  }

  // Animation speed multipliers based on settings
  const speedMult = settings.speed === 'slow' ? 0.5 : settings.speed === 'playful' ? 1.4 : 1.0;
  const isRoaming = settings.location === 'roaming';

  // State machine loop: periodically switch between walking, sitting, eating bamboo, looking around
  useEffect(() => {
    if (settings.isPaused) return;

    const stateTimer = setInterval(() => {
      // If user is actively typing fast, panda enjoys eating bamboo and watching
      if (typingActive && wpm > 40) {
        setCurrentState('eating');
        return;
      }

      const randomChoice = Math.random();
      if (isRoaming) {
        if (randomChoice < 0.45) setCurrentState('walking');
        else if (randomChoice < 0.7) setCurrentState('eating');
        else if (randomChoice < 0.9) setCurrentState('sitting');
        else setCurrentState('looking');
      } else {
        // In pinned corner: mostly sit, eat bamboo, look around
        if (randomChoice < 0.5) setCurrentState('eating');
        else if (randomChoice < 0.8) setCurrentState('sitting');
        else setCurrentState('looking');
      }
    }, 8000 / speedMult);

    return () => clearInterval(stateTimer);
  }, [settings.isPaused, isRoaming, typingActive, wpm, speedMult]);

  // Movement position loop when walking
  useEffect(() => {
    if (settings.isPaused || currentState !== 'walking' || !isRoaming) return;

    const moveTimer = setInterval(() => {
      setPosX((prev) => {
        const step = 0.5 * speedMult;
        if (direction === 'right') {
          if (prev >= 82) {
            setDirection('left');
            return 81;
          }
          return prev + step;
        } else {
          if (prev <= 12) {
            setDirection('right');
            return 13;
          }
          return prev - step;
        }
      });
    }, 60);

    return () => clearInterval(moveTimer);
  }, [currentState, direction, settings.isPaused, isRoaming, speedMult]);

  // Eye blinking cycle
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 4200);
    return () => clearInterval(blinkTimer);
  }, []);

  // Bamboo chew cycle
  useEffect(() => {
    if (currentState !== 'eating') return;
    const chewTimer = setInterval(() => {
      setChewPhase((p) => (p + 1) % 4);
    }, 280 / speedMult);
    return () => clearInterval(chewTimer);
  }, [currentState, speedMult]);

  // Interactive tap / click reaction
  const handlePandaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reactions = ['👋 Hello!', '🎋 Crunch!', '❤️ Love it!', '✨ Fast fingers!', '🐼 Roar!'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setReactionEmote(randomReaction);
    setCurrentState('looking');
    setTimeout(() => setReactionEmote(null), 1800);
  };

  // Size styling
  const sizeMap = {
    small: 'w-20 h-28 sm:w-24 sm:h-32',
    medium: 'w-28 h-36 sm:w-32 sm:h-44',
    large: 'w-36 h-48 sm:w-44 sm:h-56',
  };

  // Fixed position styling if not roaming
  let positionStyles: React.CSSProperties = {
    left: `${posX}%`,
    bottom: '8px',
    transform: `translateX(-50%) scaleX(${direction === 'right' ? 1 : -1})`,
  };

  if (!isRoaming) {
    if (settings.location === 'bottom-right') {
      positionStyles = { right: '24px', bottom: '16px' };
    } else if (settings.location === 'bottom-left') {
      positionStyles = { left: '24px', bottom: '16px' };
    } else if (settings.location === 'top-right') {
      positionStyles = { right: '24px', top: '96px' };
    }
  }

  return (
    <div
      style={positionStyles}
      className={`fixed z-30 transition-all duration-300 pointer-events-auto select-none ${
        settings.location !== 'roaming' ? 'static-corner' : ''
      }`}
    >
      {/* Speech reaction emote bubble */}
      <AnimatePresence>
        {reactionEmote && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -28, scale: 1 }}
            exit={{ opacity: 0, y: -36, scale: 0.8 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900/95 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold shadow-lg flex items-center gap-1 z-40 pointer-events-none"
          >
            <span>{reactionEmote}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Panda Character */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePandaClick}
        className="cursor-pointer relative flex flex-col items-center group"
        title="VYRON TYPING Panda Pet (Click for reaction)"
      >
        {/* Soft ground contact shadow */}
        <div className="absolute -bottom-1 w-20 h-4 bg-black/25 dark:bg-black/40 rounded-full blur-xs" />

        {/* Detailed Animated Panda SVG */}
        <svg
          className={`${sizeMap[settings.size]} drop-shadow-xl transition-all duration-300`}
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="pandaFur" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
            <radialGradient id="pandaBlack" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <linearGradient id="bambooStalk" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>

          {/* Stepping Hind Legs */}
          <g>
            <motion.ellipse
              cx="44"
              cy="126"
              rx="11"
              ry="18"
              fill="url(#pandaBlack)"
              animate={
                currentState === 'walking'
                  ? { cy: [126, 122, 126], rotate: [-8, 8, -8] }
                  : { cy: 126 }
              }
              transition={{ repeat: Infinity, duration: 0.45 }}
            />
            <motion.ellipse
              cx="76"
              cy="126"
              rx="11"
              ry="18"
              fill="url(#pandaBlack)"
              animate={
                currentState === 'walking'
                  ? { cy: [122, 126, 122], rotate: [8, -8, 8] }
                  : { cy: 126 }
              }
              transition={{ repeat: Infinity, duration: 0.45 }}
            />
          </g>

          {/* Panda Torso / Fluffy Belly */}
          <motion.g
            animate={{
              y: currentState === 'walking' ? [0, -2, 0] : [0, -1, 0],
            }}
            transition={{ repeat: Infinity, duration: currentState === 'walking' ? 0.35 : 1.8 }}
          >
            {/* White Body */}
            <ellipse cx="60" cy="94" rx="30" ry="36" fill="url(#pandaFur)" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* Black Chest Band / Vest */}
            <path
              d="M32 68 Q60 62 88 68 L89 82 Q60 92 31 82 Z"
              fill="url(#pandaBlack)"
            />

            {/* Left Arm */}
            <motion.ellipse
              cx="28"
              cy="84"
              rx="9"
              ry="20"
              transform="rotate(18 28 84)"
              fill="url(#pandaBlack)"
              animate={
                currentState === 'eating'
                  ? { rotate: [12, 22, 12] }
                  : currentState === 'walking'
                  ? { rotate: [-10, 18, -10] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 0.8 }}
            />

            {/* Right Arm: Holds Bamboo or Waves */}
            <motion.g
              animate={
                currentState === 'eating'
                  ? { rotate: [-14, -6, -14], y: [0, -2, 0] }
                  : currentState === 'looking'
                  ? { rotate: [-24, 0, -24] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.1 }}
              style={{ transformOrigin: '88px 74px' }}
            >
              <ellipse cx="90" cy="80" rx="9" ry="20" transform="rotate(-20 90 80)" fill="url(#pandaBlack)" />
              {/* Right Paw */}
              <circle cx="94" cy="94" r="8" fill="url(#pandaBlack)" />
            </motion.g>

            {/* Bamboo Stalk when Eating */}
            {currentState === 'eating' && (
              <motion.g
                animate={{ rotate: [14, 20, 14] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                style={{ transformOrigin: '76px 70px' }}
              >
                <rect x="74" y="44" width="5" height="42" rx="1.5" fill="url(#bambooStalk)" stroke="#166534" strokeWidth="0.8" />
                <line x1="74" y1="52" x2="79" y2="52" stroke="#14532d" strokeWidth="1.2" />
                <line x1="74" y1="62" x2="79" y2="62" stroke="#14532d" strokeWidth="1.2" />
                <line x1="74" y1="72" x2="79" y2="72" stroke="#14532d" strokeWidth="1.2" />
                {/* Leaves */}
                <path d="M78 44 Q86 38 90 42 Q84 46 78 46 Z" fill="#4ade80" />
                <path d="M74 48 Q66 42 64 46 Q70 49 74 49 Z" fill="#22c55e" />
              </motion.g>
            )}

            {/* Head */}
            <ellipse cx="60" cy="44" rx="28" ry="26" fill="url(#pandaFur)" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* Ears */}
            <motion.circle
              cx="36"
              cy="20"
              r="12"
              fill="url(#pandaBlack)"
              stroke="#0f172a"
              strokeWidth="1"
              animate={currentState === 'looking' ? { rotate: [-4, 4, -4] } : {}}
            />
            <circle cx="36" cy="20" r="5" fill="#475569" opacity="0.35" />

            <motion.circle
              cx="84"
              cy="20"
              r="12"
              fill="url(#pandaBlack)"
              stroke="#0f172a"
              strokeWidth="1"
              animate={currentState === 'looking' ? { rotate: [4, -4, 4] } : {}}
            />
            <circle cx="84" cy="20" r="5" fill="#475569" opacity="0.35" />

            {/* Black Eye Patches */}
            <ellipse cx="48" cy="42" rx="8" ry="10" transform="rotate(-15 48 42)" fill="url(#pandaBlack)" />
            <ellipse cx="72" cy="42" rx="8" ry="10" transform="rotate(15 72 42)" fill="url(#pandaBlack)" />

            {/* Eyes with Blinking */}
            <ellipse cx="49" cy="41" rx="3.5" ry={isBlinking ? 0.6 : 3.5} fill="#ffffff" />
            <circle cx="49.8" cy="41" r="2.2" fill="#0f172a" />
            <circle cx="50.5" cy="40.3" r="0.8" fill="#ffffff" />

            <ellipse cx="71" cy="41" rx="3.5" ry={isBlinking ? 0.6 : 3.5} fill="#ffffff" />
            <circle cx="70.2" cy="41" r="2.2" fill="#0f172a" />
            <circle cx="69.5" cy="40.3" r="0.8" fill="#ffffff" />

            {/* Nose */}
            <ellipse cx="60" cy="50" rx="4" ry="2.6" fill="#0f172a" />

            {/* Cheerful Mouth / Chewing */}
            {currentState === 'eating' ? (
              <motion.path
                d={chewPhase % 2 === 0 ? "M56 53 Q60 55 64 53" : "M55 53 Q60 58 65 53"}
                stroke="#0f172a"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill={chewPhase % 2 === 1 ? "#f87171" : "none"}
              />
            ) : (
              <path
                d="M56 53 Q60 56 64 53"
                stroke="#0f172a"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* Cheeks Blush */}
            <ellipse cx="42" cy="50" rx="4" ry="2" fill="#fca5a5" opacity="0.55" />
            <ellipse cx="78" cy="50" rx="4" ry="2" fill="#fca5a5" opacity="0.55" />
          </motion.g>
        </svg>

        {/* Action badge indicator */}
        <div className="mt-0.5 px-2 py-0.5 rounded-full bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-slate-300 shadow-sm flex items-center gap-1 group-hover:border-emerald-500 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="capitalize">{currentState}</span>
        </div>
      </motion.div>
    </div>
  );
};
