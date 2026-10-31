import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface WalkingPandaBackgroundProps {
  wpm: number;
  isTyping: boolean;
}

export const WalkingPandaBackground: React.FC<WalkingPandaBackgroundProps> = ({
  wpm,
  isTyping,
}) => {
  const [posX, setPosX] = useState<number>(10); // percentage across screen
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [stepPhase, setStepPhase] = useState<number>(0);

  // Speed of walking increases smoothly when typing fast
  const walkSpeed = isTyping ? Math.min(2.2, 0.9 + (wpm / 60) * 1.3) : 0.6;
  const stepIntervalMs = isTyping ? Math.max(90, 200 - Math.min(wpm * 2, 110)) : 220;

  // Position loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPosX((prev) => {
        if (direction === 'right') {
          if (prev >= 86) {
            setDirection('left');
            return 85;
          }
          return prev + walkSpeed;
        } else {
          if (prev <= 6) {
            setDirection('right');
            return 7;
          }
          return prev - walkSpeed;
        }
      });
    }, 60);

    return () => clearInterval(timer);
  }, [direction, walkSpeed]);

  // Stepping leg animation loop
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepPhase((prev) => (prev + 1) % 4);
    }, stepIntervalMs);

    return () => clearInterval(stepTimer);
  }, [stepIntervalMs]);

  const getSpeechBubble = () => {
    if (!isTyping) return "Hi! Let's type 🐼👋";
    if (wpm >= 80) return `Lightning! ${wpm} WPM 🔥⚡`;
    if (wpm >= 60) return `Super fast! ${wpm} WPM 🚀`;
    if (wpm >= 40) return `Great pace! ${wpm} WPM ✨`;
    if (wpm > 0) return `Keep going! ${wpm} WPM 🐾`;
    return "Start typing! ⌨️";
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      {/* Subtle ambient lighting */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 dark:bg-teal-400/10 rounded-full blur-3xl" />

      {/* Decorative gentle bamboo silhouette accents on sides */}
      <div className="absolute bottom-0 left-4 w-6 h-28 bg-emerald-600/10 dark:bg-emerald-400/10 rounded-t-full hidden sm:block" />
      <div className="absolute bottom-0 left-8 w-4 h-20 bg-emerald-600/10 dark:bg-emerald-400/10 rounded-t-full hidden sm:block" />
      <div className="absolute bottom-0 right-6 w-5 h-24 bg-emerald-600/10 dark:bg-emerald-400/10 rounded-t-full hidden sm:block" />

      {/* Ground stroll path indicator */}
      <div className="absolute bottom-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 dark:via-emerald-400/15 to-transparent" />

      {/* Walking Giant Panda (Upright 2-legged walking & waving with full headroom) */}
      <div
        style={{
          left: `${posX}%`,
          bottom: '8px',
          transform: `translateX(-50%)`,
        }}
        className="absolute flex flex-col items-center opacity-95 drop-shadow-xl"
      >
        {/* Cute Speech Bubble floating ABOVE Panda */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-1 px-3 py-0.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-[11px] font-black text-slate-800 dark:text-slate-100 shadow-md border border-emerald-400/40 dark:border-emerald-500/30 flex items-center gap-1.5 whitespace-nowrap z-20"
        >
          <span>{getSpeechBubble()}</span>
        </motion.div>

        {/* Panda Character Container (flips with direction) */}
        <div
          style={{
            transform: `scaleX(${direction === 'right' ? 1 : -1})`,
            transition: 'transform 0.3s ease-out',
          }}
          className="relative flex flex-col items-center"
        >
          {/* Soft ground shadow that follows panda */}
          <motion.div
            animate={{
              scaleX: stepPhase % 2 === 0 ? 1.05 : 0.92,
              opacity: [0.35, 0.45, 0.35],
            }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-1 w-24 h-4 bg-black/35 rounded-full blur-xs"
          />

          {/* Upright Walking & Waving Panda SVG (Height scaled so ears & waving hand never cut off) */}
          <svg
            className="w-24 h-32 sm:w-28 sm:h-36 drop-shadow-lg"
            viewBox="0 0 140 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
          <defs>
            <radialGradient id="bodyFurWhite" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </radialGradient>
            <radialGradient id="pandaFurBlack" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#2d3748" />
              <stop offset="70%" stopColor="#1a202c" />
              <stop offset="100%" stopColor="#0b0f19" />
            </radialGradient>
            <radialGradient id="furHighlight" cx="30%" cy="30%" r="50%">
              <stop offset="0%" stopColor="#4a5568" />
              <stop offset="100%" stopColor="#1a202c" />
            </radialGradient>
          </defs>

          {/* Stepping Leg Animation (Upright walking on two legs) */}
          <g>
            {/* Left Leg */}
            <motion.g
              animate={{
                rotate:
                  stepPhase === 0
                    ? 18
                    : stepPhase === 1
                    ? 0
                    : stepPhase === 2
                    ? -18
                    : 0,
                y: stepPhase === 0 ? -3 : 0,
              }}
              style={{ transformOrigin: '52px 140px' }}
            >
              <ellipse cx="50" cy="155" rx="14" ry="24" fill="url(#pandaFurBlack)" />
              {/* Foot/Paw */}
              <ellipse cx="48" cy="178" rx="15" ry="10" fill="url(#pandaFurBlack)" stroke="#0b0f19" strokeWidth="1.5" />
              {/* Claws */}
              <circle cx="39" cy="184" r="1.8" fill="#cbd5e1" />
              <circle cx="45" cy="186" r="1.8" fill="#cbd5e1" />
              <circle cx="51" cy="186" r="1.8" fill="#cbd5e1" />
              <circle cx="57" cy="184" r="1.8" fill="#cbd5e1" />
            </motion.g>

            {/* Right Leg */}
            <motion.g
              animate={{
                rotate:
                  stepPhase === 0
                    ? -18
                    : stepPhase === 1
                    ? 0
                    : stepPhase === 2
                    ? 18
                    : 0,
                y: stepPhase === 2 ? -3 : 0,
              }}
              style={{ transformOrigin: '88px 140px' }}
            >
              <ellipse cx="90" cy="155" rx="14" ry="24" fill="url(#pandaFurBlack)" />
              {/* Foot/Paw */}
              <ellipse cx="92" cy="178" rx="15" ry="10" fill="url(#pandaFurBlack)" stroke="#0b0f19" strokeWidth="1.5" />
              {/* Claws */}
              <circle cx="83" cy="184" r="1.8" fill="#cbd5e1" />
              <circle cx="89" cy="186" r="1.8" fill="#cbd5e1" />
              <circle cx="95" cy="186" r="1.8" fill="#cbd5e1" />
              <circle cx="101" cy="184" r="1.8" fill="#cbd5e1" />
            </motion.g>
          </g>

          {/* Torso & Fluffy Belly (Upright body posture, gentle bounce) */}
          <motion.g
            animate={{
              y: stepPhase % 2 === 0 ? 0 : -3,
              rotate: stepPhase % 2 === 0 ? -1 : 1,
            }}
            transition={{ duration: 0.15 }}
            style={{ transformOrigin: '70px 110px' }}
          >
            {/* Body */}
            <ellipse cx="70" cy="115" rx="36" ry="46" fill="url(#bodyFurWhite)" stroke="#d1d5db" strokeWidth="1.5" />

            {/* Fluffy Chest Black Fur Vest */}
            <path
              d="M36 82 Q70 74 104 82 L106 100 Q70 114 34 100 Z"
              fill="url(#pandaFurBlack)"
            />

            {/* Left Arm (Relaxed swing while walking) */}
            <motion.g
              animate={{
                rotate: stepPhase % 2 === 0 ? -12 : 12,
              }}
              style={{ transformOrigin: '38px 84px' }}
            >
              <ellipse cx="32" cy="106" rx="11" ry="26" transform="rotate(15 32 106)" fill="url(#pandaFurBlack)" />
              {/* Left Paw */}
              <circle cx="28" cy="128" r="11" fill="url(#furHighlight)" stroke="#0b0f19" strokeWidth="1" />
              <circle cx="24" cy="132" r="1.8" fill="#cbd5e1" />
              <circle cx="28" cy="134" r="1.8" fill="#cbd5e1" />
              <circle cx="33" cy="133" r="1.8" fill="#cbd5e1" />
            </motion.g>

            {/* RIGHT ARM: RAISED WAVING TO YOU! (Exactly matching user's photo) */}
            <motion.g
              animate={{
                rotate: isTyping ? [-6, 14, -6] : [-2, 8, -2],
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              style={{ transformOrigin: '102px 84px' }}
            >
              {/* Arm reaching up high */}
              <ellipse cx="112" cy="62" rx="12" ry="28" transform="rotate(-30 112 62)" fill="url(#pandaFurBlack)" />
              {/* Raised Waving Paw */}
              <circle cx="124" cy="40" r="13" fill="url(#furHighlight)" stroke="#0b0f19" strokeWidth="1.5" />
              {/* Paw pads (soft pinkish-black) */}
              <ellipse cx="124" cy="41" rx="6" ry="5" fill="#111827" />
              <circle cx="117" cy="32" r="2.2" fill="#111827" />
              <circle cx="122" cy="30" r="2.2" fill="#111827" />
              <circle cx="127" cy="30" r="2.2" fill="#111827" />
              <circle cx="132" cy="32" r="2.2" fill="#111827" />
            </motion.g>

            {/* Head (Fluffy, round, cheerful smile) */}
            <ellipse cx="70" cy="52" rx="34" ry="32" fill="url(#bodyFurWhite)" stroke="#d1d5db" strokeWidth="1.5" />

            {/* Black Ears with slight twitch */}
            <circle cx="42" cy="24" r="14" fill="url(#pandaFurBlack)" stroke="#0b0f19" strokeWidth="1.5" />
            <circle cx="98" cy="24" r="14" fill="url(#pandaFurBlack)" stroke="#0b0f19" strokeWidth="1.5" />
            <circle cx="42" cy="24" r="6" fill="#374151" opacity="0.4" />
            <circle cx="98" cy="24" r="6" fill="#374151" opacity="0.4" />

            {/* Black Eye Patches */}
            <ellipse cx="56" cy="48" rx="9" ry="12" transform="rotate(-15 56 48)" fill="url(#pandaFurBlack)" />
            <ellipse cx="84" cy="48" rx="9" ry="12" transform="rotate(15 84 48)" fill="url(#pandaFurBlack)" />

            {/* Expressive Eyes */}
            <circle cx="57" cy="47" r="4" fill="#ffffff" />
            <circle cx="58" cy="47" r="2.6" fill="#0f172a" />
            <circle cx="59" cy="46" r="1.2" fill="#ffffff" />

            <circle cx="83" cy="47" r="4" fill="#ffffff" />
            <circle cx="82" cy="47" r="2.6" fill="#0f172a" />
            <circle cx="83" cy="46" r="1.2" fill="#ffffff" />

            {/* Nose */}
            <ellipse cx="70" cy="58" rx="5" ry="3.2" fill="#0b0f19" />

            {/* Happy Open Smiling Mouth (like the photo!) */}
            <path
              d="M62 64 Q70 74 78 64 Z"
              fill="#ef4444"
              stroke="#0b0f19"
              strokeWidth="1.5"
            />
            {/* Cute tongue */}
            <path d="M66 69 Q70 74 74 69 Z" fill="#f87171" />
            {/* Smile line */}
            <path
              d="M60 62 Q70 65 80 62"
              stroke="#0b0f19"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cheerful Blush */}
            <ellipse cx="48" cy="58" rx="4.5" ry="2.5" fill="#fca5a5" opacity="0.6" />
            <ellipse cx="92" cy="58" rx="4.5" ry="2.5" fill="#fca5a5" opacity="0.6" />
          </motion.g>
        </svg>

        </div>
      </div>
    </div>
  );
};
