import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Zap, Camera } from 'lucide-react';

interface RealPandaCompanionProps {
  wpm: number;
  accuracy: number;
  isTyping: boolean;
  streak: number;
  hasError: boolean;
  isCompleted?: boolean;
  compact?: boolean;
  onOpenGallery?: () => void;
}

export const TypingMascot: React.FC<RealPandaCompanionProps> = ({
  wpm,
  accuracy,
  isTyping,
  streak,
  hasError,
  isCompleted = false,
  compact = false,
  onOpenGallery,
}) => {
  const [speech, setSpeech] = useState<string>("Munching sweet sugarcane while you type! 🎋");
  const [walkX, setWalkX] = useState<number>(15); // percentage across track
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isChewing, setIsChewing] = useState<boolean>(true);
  const [chewPhase, setChewPhase] = useState<number>(0);
  const [fedCount, setFedCount] = useState<number>(0);
  const [showHeart, setShowHeart] = useState<boolean>(false);

  // Autonomous walking loop: Panda walks left & right across the arena!
  useEffect(() => {
    const walkTimer = setInterval(() => {
      setWalkX((prev) => {
        if (direction === 'right') {
          if (prev >= 78) {
            setDirection('left');
            return 77;
          }
          return prev + (isTyping ? 3.5 : 2);
        } else {
          if (prev <= 8) {
            setDirection('right');
            return 9;
          }
          return prev - (isTyping ? 3.5 : 2);
        }
      });
    }, 180);

    return () => clearInterval(walkTimer);
  }, [direction, isTyping]);

  // Chew cycle animation for sugarcane / bamboo
  useEffect(() => {
    const chewSpeed = isTyping ? Math.max(90, 220 - Math.min(wpm * 2, 130)) : 280;
    const chewTimer = setInterval(() => {
      setChewPhase((prev) => (prev + 1) % 4);
    }, chewSpeed);
    return () => clearInterval(chewTimer);
  }, [isTyping, wpm]);

  // Dynamic English reactions based on typing speed & state
  useEffect(() => {
    if (isCompleted) {
      if (wpm >= 65) {
        setSpeech("Incredible supersonic speed! True typing master! 🏆🎉");
      } else if (wpm >= 40) {
        setSpeech("Great performance! Clean speed and accuracy! 🌟👏");
      } else {
        setSpeech("Good job! Consistent daily practice builds mastery! 💪🐼");
      }
      return;
    }

    if (hasError) {
      const errorPhrases = [
        "Oops, mistyped! Keep calm and focus on the keys! 🎯",
        "Don't rush, watch each letter carefully! 👀",
        "Panda says: Take a breath, you got this! 🎋",
        "Mistakes happen! Smooth rhythm is key! 💪",
      ];
      setSpeech(errorPhrases[Math.floor(Math.random() * errorPhrases.length)]);
      return;
    }

    if (streak >= 35) {
      setSpeech("🔥 35+ Combo Streak! Your fingers are on fire!");
    } else if (wpm >= 70) {
      setSpeech("🚀 70+ WPM! Blazing rocket speed! Unstoppable!");
    } else if (wpm >= 45) {
      setSpeech("⚡ Smooth flow! Chewing sugarcane in high gear!");
    } else if (isTyping) {
      const activePhrases = [
        "Crunch, crunch, nom... keep typing! ⌨️🎋",
        "Tap-tap-tap... nice keystroke rhythm! 👍",
        "Looking sharp! High accuracy flow! ✨",
        "Tasty sugarcane, lightning fast fingers! 🐼",
      ];
      setSpeech(activePhrases[Math.floor(Math.random() * activePhrases.length)]);
    } else {
      setSpeech("Start typing to begin! Watching your speed... 🎋🐼");
    }
  }, [hasError, streak, wpm, isTyping, isCompleted]);

  // Interactive feed / poke
  const handleFeed = () => {
    setFedCount((c) => c + 1);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1200);
    const feedPhrases = [
      "Yum! Juicy fresh sugarcane! Crunch crunch! 🎋😋",
      "Delicious treat! Extra typing energy boosted! ⚡",
      "Panda loves this! Now let's hit 70 WPM! 🚀",
      "Nom nom nom! Best bamboo ever! 🐼💚",
    ];
    setSpeech(feedPhrases[Math.floor(Math.random() * feedPhrases.length)]);
  };

  return (
    <div className={`relative w-full overflow-hidden select-none py-1.5 ${compact ? 'scale-95' : ''}`}>
      {/* Walking Track & Habitat Bar */}
      <div className="relative w-full rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-emerald-950/40 border border-emerald-500/25 p-2 sm:p-2.5 backdrop-blur-md shadow-inner flex flex-col justify-between min-h-[110px] sm:min-h-[125px]">
        {/* Track Grass & Bamboo Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        {/* Top Header Row of Habitat: Speech & Feed button */}
        <div className="relative z-10 flex items-center justify-between gap-2 px-1">
          {/* Speech Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={speech}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="px-3 py-1 rounded-xl bg-white/95 dark:bg-slate-800/95 border border-emerald-400/40 text-slate-900 dark:text-emerald-200 text-xs font-bold shadow-md flex items-center gap-1.5 max-w-[320px] sm:max-w-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-spin" style={{ animationDuration: '5s' }} />
              <span className="truncate">{speech}</span>
            </motion.div>
          </AnimatePresence>

          {/* Action buttons: Feed & Photo Gallery */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleFeed}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              title="Feed panda more sugarcane!"
            >
              <span>🎋 Feed Cane</span>
              {fedCount > 0 && <span className="text-[10px] bg-emerald-500 text-slate-950 px-1 rounded-full font-black">{fedCount}</span>}
            </button>

            {onOpenGallery && (
              <button
                type="button"
                onClick={onOpenGallery}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                title="View real HD photo of panda eating bamboo"
              >
                <Camera className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Real Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Walking Arena: Panda walking left & right while eating sugarcane */}
        <div className="relative w-full h-16 sm:h-20 mt-1 flex items-end">
          {/* Walking Bamboo Ground Line */}
          <div className="absolute bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600/30 via-emerald-400/60 to-emerald-600/30 rounded-full" />

          {/* Moving Panda Entity */}
          <motion.div
            style={{ left: `${walkX}%` }}
            animate={{
              scaleX: direction === 'right' ? 1 : -1,
            }}
            transition={{ duration: 0.25 }}
            onClick={handleFeed}
            className="absolute bottom-1 -translate-x-1/2 cursor-pointer flex flex-col items-center group"
            title="Click to interact & feed sweet sugarcane!"
          >
            {/* Pop-up floating heart when fed */}
            {showHeart && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -24, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="absolute -top-6 text-emerald-400 font-black text-xs z-30 drop-shadow-md"
              >
                💚 Yum!
              </motion.div>
            )}

            {/* Speed Flame Hat if fast */}
            {wpm >= 50 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-4 z-20 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-black border border-white flex items-center gap-0.5 shadow-md"
              >
                <Flame className="w-2.5 h-2.5 fill-current text-yellow-200" />
                <span>FAST</span>
              </motion.div>
            )}

            {/* Real Panda Character with Sugarcane/Bamboo Munching Action */}
            <div className="relative flex items-center justify-center">
              <svg
                className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="pandaRealFur" cx="50%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="75%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </radialGradient>
                  <radialGradient id="pandaRealDark" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="60%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                  <linearGradient id="sugarcaneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="40%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>
                </defs>

                {/* Alternating walking legs */}
                <g>
                  {/* Back Left Leg */}
                  <motion.ellipse
                    cx="36"
                    cy="85"
                    rx="8"
                    ry="6"
                    fill="url(#pandaRealDark)"
                    animate={{
                      cy: chewPhase % 2 === 0 ? 84 : 86,
                      cx: chewPhase % 2 === 0 ? 34 : 38,
                    }}
                    transition={{ duration: 0.18 }}
                  />
                  {/* Back Right Leg */}
                  <motion.ellipse
                    cx="64"
                    cy="85"
                    rx="8"
                    ry="6"
                    fill="url(#pandaRealDark)"
                    animate={{
                      cy: chewPhase % 2 === 0 ? 86 : 84,
                      cx: chewPhase % 2 === 0 ? 66 : 62,
                    }}
                    transition={{ duration: 0.18 }}
                  />
                </g>

                {/* Round Fluffy Ears with twitch */}
                <motion.circle
                  cx="28"
                  cy="26"
                  r="13"
                  fill="url(#pandaRealDark)"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  animate={{ rotate: [-3, 3, -3] }}
                  style={{ transformOrigin: '28px 26px' }}
                />
                <circle cx="28" cy="26" r="6" fill="#475569" opacity="0.35" />

                <motion.circle
                  cx="72"
                  cy="26"
                  r="13"
                  fill="url(#pandaRealDark)"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  animate={{ rotate: [3, -3, 3] }}
                  style={{ transformOrigin: '72px 26px' }}
                />
                <circle cx="72" cy="26" r="6" fill="#475569" opacity="0.35" />

                {/* Chubby Round Head */}
                <ellipse cx="50" cy="46" rx="28" ry="26" fill="url(#pandaRealFur)" stroke="#94a3b8" strokeWidth="1.5" />

                {/* Black Eye Patches */}
                <ellipse cx="38" cy="44" rx="8" ry="10" transform="rotate(-15 38 44)" fill="url(#pandaRealDark)" />
                <ellipse cx="62" cy="44" rx="8" ry="10" transform="rotate(15 62 44)" fill="url(#pandaRealDark)" />

                {/* Expressive Cheerful Eyes with Blinking */}
                <motion.ellipse
                  cx="39"
                  cy="43"
                  rx="3.5"
                  ry={chewPhase === 2 ? 0.8 : 3.5}
                  fill="#ffffff"
                />
                <circle cx="39.8" cy="43" r="2.2" fill="#0f172a" />
                <circle cx="40.5" cy="42.2" r="0.9" fill="#ffffff" />

                <motion.ellipse
                  cx="61"
                  cy="43"
                  rx="3.5"
                  ry={chewPhase === 2 ? 0.8 : 3.5}
                  fill="#ffffff"
                />
                <circle cx="60.2" cy="43" r="2.2" fill="#0f172a" />
                <circle cx="59.5" cy="42.2" r="0.9" fill="#ffffff" />

                {/* Soft Cheeks Blush */}
                <ellipse cx="32" cy="51" rx="4" ry="2" fill="#fca5a5" opacity="0.55" />
                <ellipse cx="68" cy="51" rx="4" ry="2" fill="#fca5a5" opacity="0.55" />

                {/* Chubby Body */}
                <ellipse cx="50" cy="74" rx="23" ry="16" fill="url(#pandaRealFur)" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Black Fur Vest */}
                <path d="M30 65 Q50 61 70 65 L71 73 Q50 78 29 73 Z" fill="url(#pandaRealDark)" />

                {/* 🎋 TASTY SUGARCANE / BAMBOO STICK ("गन्ना") held in front */}
                <motion.g
                  animate={{
                    rotate: [22, 28, 22],
                    y: [0, -1.5, 0],
                  }}
                  style={{ transformOrigin: '55px 56px' }}
                >
                  {/* Sugarcane stalk */}
                  <rect x="52" y="32" width="6.5" height="42" rx="2" fill="url(#sugarcaneGrad)" stroke="#166534" strokeWidth="1" />
                  {/* Sugarcane nodes/rings */}
                  <line x1="52" y1="40" x2="58.5" y2="40" stroke="#14532d" strokeWidth="1.5" />
                  <line x1="52" y1="49" x2="58.5" y2="49" stroke="#14532d" strokeWidth="1.5" />
                  <line x1="52" y1="58" x2="58.5" y2="58" stroke="#14532d" strokeWidth="1.5" />
                  <line x1="52" y1="67" x2="58.5" y2="67" stroke="#14532d" strokeWidth="1.5" />
                  {/* Top leafy shoots */}
                  <path d="M55 32 Q62 25 68 28 Q63 32 55 33 Z" fill="#4ade80" />
                  <path d="M53 34 Q45 27 42 32 Q48 35 53 35 Z" fill="#22c55e" />
                </motion.g>

                {/* Cute Panda Snout with ACTIVE CHEWING MOUTH */}
                <ellipse cx="50" cy="52" rx="6" ry="4" fill="#ffffff" />
                {/* Black Nose */}
                <ellipse cx="50" cy="51" rx="3.5" ry="2.2" fill="#0f172a" />

                {/* Chewing Animated Mouth */}
                <motion.path
                  d={
                    chewPhase === 0
                      ? "M47 54 Q50 56 53 54"
                      : chewPhase === 1
                      ? "M46 54 Q50 58 54 54"
                      : chewPhase === 2
                      ? "M47 54 Q50 55 53 54"
                      : "M46 54 Q50 57 54 54"
                  }
                  stroke="#0f172a"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill={chewPhase === 1 || chewPhase === 3 ? "#ef4444" : "none"}
                />

                {/* Flying crunch crumbs when chewing */}
                {(chewPhase === 1 || chewPhase === 3) && (
                  <g>
                    <circle cx="59" cy="46" r="1" fill="#4ade80" />
                    <circle cx="62" cy="50" r="0.8" fill="#22c55e" />
                    <circle cx="45" cy="56" r="0.9" fill="#86efac" />
                  </g>
                )}

                {/* Both Paws holding the sugarcane */}
                <motion.circle
                  cx="45"
                  cy="62"
                  r="6"
                  fill="url(#pandaRealDark)"
                  stroke="#1e293b"
                  strokeWidth="1"
                  animate={{ y: [0, -1, 0] }}
                />
                <motion.circle
                  cx="59"
                  cy="60"
                  r="6"
                  fill="url(#pandaRealDark)"
                  stroke="#1e293b"
                  strokeWidth="1"
                  animate={{ y: [-1, 0, -1] }}
                />
              </svg>

              {/* Status Pill beneath panda */}
              <div className="absolute -bottom-1 whitespace-nowrap px-2 py-0.2 rounded-full bg-slate-900/90 border border-emerald-400/50 text-[9px] font-black text-emerald-300 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Munching Cane 🎋</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
