import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ModuleId } from '../../types';
import { 
  Wallet, 
  Lightbulb, 
  Bell, 
  Pill, 
  Utensils, 
  GraduationCap, 
  Building2, 
  Sparkles, 
  Mic, 
  Search, 
  ArrowRight, 
  Zap, 
  LayoutGrid,
  ShieldCheck,
  BookOpen,
  IndianRupee,
  Flame,
  BadgePercent,
  Clapperboard,
  Film,
  Video,
  Code2,
  Laptop,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import { HomeHeaderAnimation } from '../TabHeroAnimations';
import { appleCardHover, appleCardTap } from '../../lib/motionTokens';
import { AiRainbowButton } from '../AiRainbowButton';
import { ScrollReveal } from '../common/ScrollReveal';

interface HomeViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSelectModule: (module: ModuleId, query?: string) => void;
  onOpenVoice: () => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = memo(({
  profile,
  onUpdateProfile,
  onSelectModule,
  onOpenVoice,
  onOpenSearch
}) => {
  const isHindi = profile.language === 'hi';

  // Track module usage to dynamically prioritize top 4 most used modules
  const [usageStats, setUsageStats] = useState<Record<string, { count: number; lastUsed: number }>>(() => {
    try {
      const saved = localStorage.getItem('bharat_module_usage_stats');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Super Modules & Quick Actions view mode: 'cards' | 'quick'
  

  const handleModuleClick = (id: ModuleId) => {
    try {
      const prev = JSON.parse(localStorage.getItem('bharat_module_usage_stats') || '{}');
      const updated = {
        ...prev,
        [id]: {
          count: (prev[id]?.count || 0) + 1,
          lastUsed: Date.now()
        }
      };
      localStorage.setItem('bharat_module_usage_stats', JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save module usage:", e);
    }
    onSelectModule(id);
  };

  const fullHeroText = useMemo(() => {
    const creatorName = profile.name || "Vishal Yadav";
    return isHindi
      ? `Welcome to My Portfolio 👋\n\nI’m ${creatorName}, a BCA student at CIMAGE Professional College. I’m currently learning programming, web development, and AI technologies, while building my skills through practical projects and creative ideas.`
      : `Welcome to My Portfolio 👋\n\nI’m ${creatorName}, a BCA student at CIMAGE Professional College. I’m currently learning programming, web development, and AI technologies, while building my skills through practical projects and creative ideas.`;
  }, [isHindi, profile.name]);
  const [typedHeroText, setTypedHeroText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isSkillsExpandedMobile, setIsSkillsExpandedMobile] = useState(false);

  // Typewriter effect for Roles in the hero section (concise 1-2 word roles, thin typography)
  const portfolioRoles = useMemo(() => [
    "Video Editor",
    "Web Developer",
    "System Analyst",
    "Robotics",
    "BCA Student",
    "Vyron AI Founder"
  ], []);
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [typedRoleText, setTypedRoleText] = useState("Video Editor");
  const [isRoleDeleting, setIsRoleDeleting] = useState(false);

  useEffect(() => {
    if (profile.reducedMotion) {
      setTypedRoleText(portfolioRoles[currentRoleIndex % portfolioRoles.length]);
      return;
    }

    const currentTarget = portfolioRoles[currentRoleIndex % portfolioRoles.length];
    let roleTimer: NodeJS.Timeout;

    const tick = () => {
      if (document.hidden) return;

      if (!isRoleDeleting) {
        if (typedRoleText.length < currentTarget.length) {
          roleTimer = setTimeout(() => {
            setTypedRoleText(currentTarget.slice(0, typedRoleText.length + 1));
          }, 55);
        } else {
          // Pause at full text
          roleTimer = setTimeout(() => {
            setIsRoleDeleting(true);
          }, 1800);
        }
      } else {
        if (typedRoleText.length > 0) {
          roleTimer = setTimeout(() => {
            setTypedRoleText(typedRoleText.slice(0, -1));
          }, 30);
        } else {
          setIsRoleDeleting(false);
          setCurrentRoleIndex((prev) => prev + 1);
        }
      }
    };

    tick();

    const handleVisibility = () => {
      if (!document.hidden) {
        tick();
      } else {
        clearTimeout(roleTimer);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(roleTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [typedRoleText, isRoleDeleting, currentRoleIndex, portfolioRoles, profile.reducedMotion]);

  useEffect(() => {
    if (profile.reducedMotion) {
      setTypedHeroText(fullHeroText);
      setIsTypingComplete(true);
      return;
    }

    setTypedHeroText("");
    setIsTypingComplete(false);
    let index = 0;
    const totalDurationMs = 3500;
    const speedMs = Math.max(16, Math.floor(totalDurationMs / fullHeroText.length));

    let interval: any = null;

    const startTyping = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (document.hidden) return;
        index++;
        if (index <= fullHeroText.length) {
          setTypedHeroText(fullHeroText.slice(0, index));
        } else {
          setIsTypingComplete(true);
          clearInterval(interval);
        }
      }, speedMs);
    };

    startTyping();

    const handleVisibility = () => {
      if (!document.hidden && index <= fullHeroText.length) {
        startTyping();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fullHeroText, profile.reducedMotion]);

  const modules = useMemo(() => [
    {
      id: 'cimage-logo' as ModuleId,
      title: 'CIMAGE BCA Logo Maker AI',
      tagline: 'Circular Batch Emblem Designer',
      description: 'Diamond Festival & Clean batch logos with CIMAGE shield, code screen, campus facade & 3D gold.',
      icon: <Sparkles className="w-6 h-6 text-amber-300" />,
      color: 'from-[#000080] via-[#1e1b4b] to-amber-600',
      badge: '👑 BCA Studio'
    },
    {
      id: 'money' as ModuleId,
      title: 'Money Manager',
      tagline: 'Track Income, Kirana & Savings',
      description: 'Rupee income/expense logger, budget analysis & AI cost-cutting tips.',
      icon: <Wallet className="w-6 h-6 text-white" />,
      color: 'from-[#000080] to-blue-900',
      badge: '₹ Rupee Engine'
    },
    {
      id: 'jugaad' as ModuleId,
      title: 'Jugaad Fix',
      tagline: 'DIY Household Repairs',
      description: 'AI fixes for leaky buckets, fans, stains, appliances & kitchen hacks.',
      icon: <Lightbulb className="w-6 h-6 text-slate-950" />,
      color: 'from-[#FF9933] to-amber-500',
      badge: '💡 DIY Hacks'
    },
    {
      id: 'form' as ModuleId,
      title: 'Form Alert',
      tagline: 'Exams, Jobs & Scholarships',
      description: 'Live countdown deadlines for SSC, UPSC, NEET, JEE & Govt Jobs.',
      icon: <Bell className="w-6 h-6 text-white" />,
      color: 'from-purple-600 to-indigo-900',
      badge: '🚨 Deadlines'
    },
    {
      id: 'medicine' as ModuleId,
      title: 'Sasti Dawai',
      tagline: 'Generic Medicine Substitutes',
      description: 'Save 80% with Jan Aushadhi generic alternatives & dosage alarms.',
      icon: <Pill className="w-6 h-6 text-white" />,
      color: 'from-[#138808] to-emerald-700',
      badge: '💊 80% Savings'
    },
    {
      id: 'recipe' as ModuleId,
      title: 'Aaj Kya Banaoo',
      tagline: 'Ingredient Recipe Finder',
      description: 'Tell what is in your fridge & get instant Indian dish recipes.',
      icon: <Utensils className="w-6 h-6 text-white" />,
      color: 'from-orange-500 to-amber-600',
      badge: '🍳 Pantry Chef'
    },
    {
      id: 'study' as ModuleId,
      title: 'Last Night Padhai',
      tagline: '2-Min Exam Notes & Quiz',
      description: 'Instant bullet summaries, formulas, mnemonic tricks & practice MCQs.',
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      color: 'from-[#000080] to-indigo-900',
      badge: '🎓 2-Min Notes'
    },
    {
      id: 'yojna' as ModuleId,
      title: 'Meri Yojna',
      tagline: 'Govt Schemes Finder',
      description: 'Find 250+ Central & State subsidies, grants & PM Kisan benefits.',
      icon: <Building2 className="w-6 h-6 text-slate-950" />,
      color: 'from-amber-400 to-[#FF9933]',
      badge: '🏛️ Govt Schemes'
    }
  ], []);

  // Sort all 8 modules dynamically based on user interaction frequency & recency, prioritizing favorites
  const sortedModules = useMemo(() => {
    return [...modules].sort((a, b) => {
      const isAFav = profile.favoriteModules?.includes(a.id);
      const isBFav = profile.favoriteModules?.includes(b.id);
      
      if (isAFav && !isBFav) return -1;
      if (!isAFav && isBFav) return 1;

      const statA = usageStats[a.id] || { count: 0, lastUsed: 0 };
      const statB = usageStats[b.id] || { count: 0, lastUsed: 0 };
      if (statB.count !== statA.count) {
        return statB.count - statA.count;
      }
      return statB.lastUsed - statA.lastUsed;
    });
  }, [modules, usageStats, profile.favoriteModules]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Welcome Banner - Vishal Portfolio & Vyron AI (Immediate startup display with smooth seamless blur transition) */}
      <motion.div
        initial={profile.reducedMotion ? { opacity: 1 } : { opacity: 0.95, filter: 'blur(8px)', y: 0 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full min-w-0"
      >
        <div className="relative p-5 sm:p-8 lg:p-9 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md text-slate-900 dark:text-white overflow-hidden min-w-0">
          <HomeHeaderAnimation />
          {/* Glow Spheres matching app's saffron, sapphire, emerald & violet colors */}
          <div className="absolute top-0 right-0 w-80 h-80 hidden dark:block bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 hidden dark:block bg-[#FF9933]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 hidden dark:block bg-[#138808]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 min-w-0">
            {/* Top Status & Creator Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 backdrop-blur-md text-purple-700 dark:text-purple-300 text-[11px] sm:text-xs font-bold border border-purple-200 dark:border-purple-400/40 max-w-full">
                <Clapperboard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300 shrink-0" />
                <span className="truncate">Creator Portfolio • Video Editor & Tech</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-white/10 backdrop-blur-md text-blue-700 dark:text-sky-300 text-[11px] sm:text-xs font-bold border border-blue-200 dark:border-sky-400/30 shrink-0">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 dark:text-sky-400 animate-spin shrink-0" />
                <span>Vyron AI Active</span>
              </div>
            </div>

            {/* User's Exact Heading Text from Screenshot */}
            <div className="space-y-1.5 min-w-0">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight break-words text-slate-900 dark:text-white flex flex-wrap items-center gap-x-2.5 sm:gap-x-3.5 gap-y-1">
                <span>Hi, this is</span>
                <span className="text-[#c084fc] drop-shadow-[0_0_15px_rgba(192,132,252,0.3)] font-black dark:drop-shadow-[0_0_30px_rgba(192,132,252,0.45)]">
                  Vishal
                </span>
                <span className="inline-block animate-pulse text-2xl sm:text-4xl select-none">💞</span>
              </h1>

              <p className="text-base sm:text-2xl lg:text-3xl font-bold text-slate-700 sm:text-slate-600 dark:text-slate-100 dark:sm:text-slate-200 tracking-tight leading-snug break-words">
                Student of Cimage Professional College, Patna
              </p>

              {/* Typing line: Video Editor| with authentic thick, smoothly blinking cursor pipe */}
              <div className="flex items-center text-2xl sm:text-4xl lg:text-5xl font-light tracking-wide text-purple-600 dark:text-[#c084fc] min-h-[40px] sm:min-h-[52px]">
                <span className="font-light tracking-normal dark:drop-shadow-[0_0_16px_rgba(192,132,252,0.3)]">{typedRoleText}</span>
                <span
                  className="inline-block w-1 sm:w-1.5 h-6 sm:h-8 lg:h-9 bg-purple-500 dark:bg-purple-300 rounded-full ml-2 dark:shadow-[0_0_12px_rgba(216,180,254,0.7)] animate-cursor-blink"
                />
              </div>
            </div>

            {/* App description and context - Fixed height/space container to prevent jumping/layout shifts */}
            <div className="relative min-h-[4.5rem] sm:min-h-[4rem] max-w-2xl">
              {/* Invisible ghost full text to guarantee exact height and layout reservation in advance */}
              <p className="invisible text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-200/90 font-normal leading-relaxed break-words whitespace-pre-line select-none pointer-events-none" aria-hidden="true">
                {fullHeroText}
              </p>
              {/* Actual typed text rendered in absolute position over the reserved space */}
              <p className="absolute inset-0 text-[11px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-200/90 font-normal leading-relaxed break-words whitespace-pre-line">
                {typedHeroText}
                {!isTypingComplete && (
                  <span className="inline-block w-0.5 h-3.5 bg-blue-500 dark:bg-sky-400 ml-1 animate-pulse align-middle" />
                )}
              </p>
            </div>

            {/* Portfolio & Creator Skills Chips — Merged interactive button on mobile, all visible on laptop/desktop */}
            <div className="pt-1">
              {/* 💻 Desktop / Laptop View: All chips directly visible */}
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-sky-200 text-xs font-semibold border border-blue-200 dark:border-sky-400/30 backdrop-blur-md">
                  <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300" />
                  <span>Full-Stack & Web Dev</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 text-xs font-semibold border border-purple-200 dark:border-purple-400/30 backdrop-blur-md">
                  <Film className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
                  <span>Video Editing & Motion</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-[#FF9933]/20 text-orange-700 dark:text-amber-200 text-xs font-semibold border border-orange-200 dark:border-amber-400/30 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-amber-300" />
                  <span>Vyron AI Creator</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 text-xs font-semibold border border-indigo-200 dark:border-indigo-400/30 backdrop-blur-md">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
                  <span>BCA • CIMAGE Patna</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-[#138808]/20 text-emerald-700 dark:text-emerald-200 text-xs font-semibold border border-emerald-200 dark:border-emerald-400/30 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                  <span>@mr_vishal372</span>
                </span>
              </div>

              {/* 📱 Mobile View: @mr_vishal372 outside + Merged Skills & Highlights button */}
              <div className="sm:hidden flex flex-col items-start gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* 🌟 @mr_vishal372 ALWAYS VISIBLE OUTSIDE */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-[#138808]/20 text-emerald-700 dark:text-emerald-200 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-400/30 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                    <span>@mr_vishal372</span>
                  </span>

                  {/* Merged 4 skills button */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsSkillsExpandedMobile((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-500/25 dark:via-indigo-500/25 dark:to-purple-500/25 border border-blue-200 dark:border-sky-400/40 text-blue-800 dark:text-sky-100 text-[11px] font-bold shadow-xs backdrop-blur-md cursor-pointer touch-manipulation active:opacity-90"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 dark:text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Skills & Highlights</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-sky-400 animate-pulse" />
                    <motion.span
                      animate={{ rotate: isSkillsExpandedMobile ? 180 : 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-flex items-center justify-center"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300" />
                    </motion.span>
                  </motion.button>
                </div>

                {/* Animated reveal of the 4 skill chips on mobile - Slow, buttery smooth open/close */}
                <AnimatePresence>
                  {isSkillsExpandedMobile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.96, y: -4 }}
                      animate={{ 
                        opacity: 1, 
                        height: 'auto', 
                        scale: 1, 
                        y: 0,
                        transition: {
                          height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.4, ease: 'easeOut' },
                          scale: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                          y: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0, 
                        scale: 0.95, 
                        y: -6,
                        transition: {
                          height: { duration: 0.42, ease: [0.32, 0, 0.67, 0] },
                          opacity: { duration: 0.28, ease: 'easeIn' },
                          scale: { duration: 0.35, ease: 'easeIn' },
                          y: { duration: 0.35, ease: 'easeIn' }
                        }
                      }}
                      className="overflow-hidden flex flex-wrap items-center gap-1.5 pt-1"
                    >
                      <motion.span
                        initial={{ opacity: 0, y: -8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.94 }}
                        transition={{ duration: 0.45, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/25 text-blue-700 dark:text-sky-200 text-[11px] font-semibold border border-blue-200 dark:border-sky-400/35 backdrop-blur-md shadow-2xs"
                      >
                        <Code2 className="w-3 h-3 text-blue-600 dark:text-sky-300" />
                        <span>Full-Stack & Web Dev</span>
                      </motion.span>

                      <motion.span
                        initial={{ opacity: 0, y: -8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.94 }}
                        transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-500/25 text-purple-700 dark:text-purple-200 text-[11px] font-semibold border border-purple-200 dark:border-purple-400/35 backdrop-blur-md shadow-2xs"
                      >
                        <Film className="w-3 h-3 text-purple-600 dark:text-purple-300" />
                        <span>Video Editing & Motion</span>
                      </motion.span>

                      <motion.span
                        initial={{ opacity: 0, y: -8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.94 }}
                        transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-[#FF9933]/25 text-orange-700 dark:text-amber-200 text-[11px] font-semibold border border-orange-200 dark:border-amber-400/35 backdrop-blur-md shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-orange-600 dark:text-amber-300" />
                        <span>Vyron AI Creator</span>
                      </motion.span>

                      <motion.span
                        initial={{ opacity: 0, y: -8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.94 }}
                        transition={{ duration: 0.45, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/25 text-indigo-700 dark:text-indigo-200 text-[11px] font-semibold border border-indigo-200 dark:border-indigo-400/35 backdrop-blur-md shadow-2xs"
                      >
                        <GraduationCap className="w-3 h-3 text-indigo-600 dark:text-indigo-300" />
                        <span>BCA • CIMAGE Patna</span>
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Search & Voice Bar */}
            <div className="pt-2 flex flex-row gap-2 sm:gap-2.5 max-w-xl w-full min-w-0">
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Open Global Search"
                className="flex-1 min-h-[48px] bg-white/90 dark:bg-slate-900/40 dark:backdrop-blur-xl/90 text-slate-800 dark:text-slate-100 px-4 py-3 sm:py-3.5 rounded-2xl flex items-center justify-between border border-slate-200 dark:border-slate-700/60 shadow-lg text-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group min-w-0 touch-manipulation cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors min-w-0 flex-1">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#000080] dark:text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {isHindi ? "रेसिपी, दवाई, योजनाएं, नोट्स या टूल्स खोजें..." : "Search recipes, medicines, schemes, study, tools..."}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-[#000080] dark:text-sky-300 bg-indigo-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-slate-700 shrink-0 ml-1">
                  Search
                </span>
              </button>

              <AiRainbowButton
                onClick={onOpenVoice}
                variant="hero"
                isHindi={isHindi}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Merged Super Modules & Quick Actions Section */}
      <ScrollReveal cascadeIndex={1} reducedMotion={profile.reducedMotion}>
        <div className="flex flex-col gap-3.5 sm:gap-4.5 min-w-0 w-full max-w-full">
          {/* Unified Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 w-full pb-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-[#FF9933] to-[#000080] flex items-center justify-center text-slate-950 shadow-sm shrink-0">
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {isHindi ? 'सुपर मॉड्यूल्स' : 'Super Modules'}
                  </h2>
                  <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                    {isHindi ? '8 टूल्स' : '8 Tools'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {isHindi
                    ? 'त्वरित 1-टैप टूल्स व AI समाधान'
                    : '1-Tap AI tools & quick solutions'}
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 min-w-0 w-full max-w-full pt-1">
              {sortedModules.map((mod, idx) => {
                const isFavorite = profile.favoriteModules?.includes(mod.id);
                return (
                <motion.div
                  key={mod.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${mod.title} module - ${mod.tagline}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleModuleClick(mod.id);
                    }
                  }}
                  whileHover={profile.reducedMotion ? undefined : { scale: 1.01 }}
                  whileTap={profile.reducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => handleModuleClick(mod.id)}
                  className="group cursor-pointer p-3 sm:p-4.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md hover:shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors duration-200 relative overflow-hidden flex flex-col justify-between space-y-2 min-w-0 w-full max-w-full min-h-[160px] sm:min-h-[210px] select-none"
                >
                  {/* Background gradient hint */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none rounded-full blur-xl" />

                  <div className="space-y-1.5 sm:space-y-2.5 relative z-10 min-w-0 w-full overflow-hidden">
                    <div className="flex items-start sm:items-center justify-between gap-1 sm:gap-2 min-w-0 w-full">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={`w-8 h-8 sm:w-10.5 sm:h-10.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-sm group-hover:-translate-y-0.5 transition-transform duration-200 shrink-0`}>
                          <div className="scale-75 sm:scale-90 flex items-center justify-center">
                            {mod.icon}
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentFavs = profile.favoriteModules || [];
                            if (isFavorite) {
                               onUpdateProfile({ favoriteModules: currentFavs.filter(id => id !== mod.id) });
                            } else {
                               onUpdateProfile({ favoriteModules: [...currentFavs, mod.id] });
                            }
                          }}
                          className={`p-1 sm:p-2 -ml-1 rounded-full transition-colors ${isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600 dark:hover:text-amber-400'}`}
                        >
                          <Star className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${isFavorite ? 'fill-current text-amber-400' : ''}`} />
                        </button>
                      </div>
                      <span className="hidden sm:inline-block text-[9.5px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 text-right max-w-[65%] truncate">
                        {mod.badge}
                      </span>
                    </div>

                    <div className="min-w-0 w-full space-y-0.5 pt-1 sm:pt-0">
                      <h3 className="text-[13px] sm:text-[15.5px] font-bold text-slate-900 dark:text-white group-hover:text-[#000080] dark:group-hover:text-sky-400 transition-colors break-words [overflow-wrap:anywhere] leading-tight sm:leading-snug">
                        {mod.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs font-semibold text-[#138808] dark:text-emerald-400 break-words [overflow-wrap:anywhere] leading-tight line-clamp-1 sm:line-clamp-none">
                        {mod.tagline}
                      </p>
                    </div>

                    <p className="hidden sm:block text-[11px] sm:text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-normal w-full max-w-full line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between min-h-[28px] sm:min-h-[36px] text-[10px] sm:text-xs font-bold text-[#000080] dark:text-sky-400 group-hover:text-[#000080] dark:group-hover:text-sky-300 relative z-10 min-w-0 w-full transition-colors">
                    <span>{isHindi ? 'खोलें' : 'Open'}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                </motion.div>
              );
            })}
            </div>
        </div>
      </ScrollReveal>
    </div>
  );
});
