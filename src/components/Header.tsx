import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';
import { NavTab, UserProfile } from '../types';
import { Mic, Globe, Bell, User, Moon, Sun, Search, SlidersHorizontal, X, ChevronRight, Check, Shield, Settings, LogOut, Key, Lock, ArrowLeft, Eye, EyeOff, AlertTriangle, Loader2, Terminal, Keyboard } from 'lucide-react';
import { getEffectiveAvatarUrl } from '../lib/defaultAvatar';
import { AiRainbowButton } from './AiRainbowButton';
import { adminLogin } from '../lib/adminAuth';

interface HeaderProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenVoice: () => void;
  onOpenSearch: () => void;
  onNavigateTab: (tab: any, subTab?: string) => void;
  unreadCount: number;
  activeTab?: NavTab;
  isAdmin?: boolean;
  onAdminLogout?: () => void;
  onOpenAdmin?: () => void;
  onAdminLoginSuccess?: (identifier: string) => void;
  isBarsHidden?: boolean;
  onBarsVisibilityChange?: (hidden: boolean) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  profile,
  onUpdateProfile,
  onOpenVoice,
  onOpenSearch,
  onNavigateTab,
  unreadCount,
  activeTab,
  isAdmin = false,
  onAdminLogout,
  onOpenAdmin,
  onAdminLoginSuccess,
  isBarsHidden,
  onBarsVisibilityChange
}) => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const lastScrollYRef = React.useRef(0);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = React.useState(false);
  const [isQuickLoginOpen, setIsQuickLoginOpen] = React.useState(false);
  const [quickUsername, setQuickUsername] = React.useState('');
  const [quickPassword, setQuickPassword] = React.useState('');
  const [showQuickPassword, setShowQuickPassword] = React.useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = React.useState(false);
  const [quickLoginError, setQuickLoginError] = React.useState<string | null>(null);

  const quickMenuRef = React.useRef<HTMLDivElement>(null);
  const quickMenuBtnRef = React.useRef<HTMLButtonElement>(null);

  // Global Outside Click / Tap Dismissal (Works anywhere on screen without needing to click the cross button)
  React.useEffect(() => {
    if (!isQuickMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        quickMenuRef.current?.contains(target) ||
        quickMenuBtnRef.current?.contains(target)
      ) {
        return;
      }
      setIsQuickMenuOpen(false);
      setIsQuickLoginOpen(false);
      setQuickLoginError(null);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isQuickMenuOpen]);

  // Track scroll position for backdrop blur and subtle border sheen (never hides header on any device)
  React.useEffect(() => {
    let ticking = false;

    const getScrollTop = () => {
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        (document.querySelector('main')?.scrollTop || 0)
      );
    };

    lastScrollYRef.current = getScrollTop();

    const handleScroll = () => {
      const currentScrollY = getScrollTop();

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Scrolled state with hysteresis to prevent jitter/flicker at top
          if (currentScrollY > 20) {
            setIsScrolled(true);
          } else if (currentScrollY <= 6) {
            setIsScrolled(false);
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }

      if (isQuickMenuOpen && Math.abs(currentScrollY - lastScrollYRef.current) > 25) {
        setIsQuickMenuOpen(false);
        setIsQuickLoginOpen(false);
        setQuickLoginError(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isQuickMenuOpen]);

  // Track if on laptop screen (>= 1024px)
  const [isLaptop, setIsLaptop] = React.useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  React.useEffect(() => {
    let timer: any = null;
    const handleResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsLaptop(window.innerWidth >= 1024);
      }, 120);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isHi = profile.language === 'hi';

  // Header is permanently visible across all devices during normal scroll
  const isHidden = false;

  // Track if fullscreen modal (e.g. Profile Edit) is active on mobile
  const [isModalOpen, setIsModalOpen] = useState(() => 
    typeof document !== 'undefined' && document.body.classList.contains('modal-fullscreen-open')
  );

  useEffect(() => {
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    window.addEventListener('vyron_modal_opened', handleModalOpen);
    window.addEventListener('vyron_modal_closed', handleModalClose);

    return () => {
      window.removeEventListener('vyron_modal_opened', handleModalOpen);
      window.removeEventListener('vyron_modal_closed', handleModalClose);
    };
  }, []);

  const handleQuickLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickLoginError(null);
    const trimmedUser = quickUsername.trim();
    const trimmedPass = quickPassword.trim();
    if (!trimmedUser || !trimmedPass) {
      setQuickLoginError(isHi ? 'यूज़रनेम और पासवर्ड दोनों दर्ज करें' : 'Please enter both username and password');
      return;
    }
    setQuickLoginLoading(true);
    try {
      const result = await adminLogin(trimmedUser, trimmedPass);
      if (result.success) {
        setIsQuickLoginOpen(false);
        setIsQuickMenuOpen(false);
        setQuickPassword('');
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(result.username || result.phone || trimmedUser);
        }
      } else {
        setQuickLoginError(result.error || (isHi ? 'अमान्य क्रेडेंशियल्स' : 'Invalid credentials'));
      }
    } catch {
      setQuickLoginError(isHi ? 'प्रमाणीकरण विफल रहा' : 'Authentication failed');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = profile.language === 'en' ? 'hi' : 'en';
    onUpdateProfile({ language: nextLang });
  };

  const toggleTheme = () => {
    const nextTheme = profile.theme === 'dark' ? 'light' : 'dark';
    onUpdateProfile({ theme: nextTheme });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full pt-[env(safe-area-inset-top,0px)] lg:pt-0 pointer-events-auto translate-y-0 opacity-100 transition-colors duration-300 ${
          isModalOpen ? 'max-lg:hidden max-lg:opacity-0 max-lg:pointer-events-none' : ''
        }`}
        style={{ transform: 'translate3d(0,0,0)', contain: 'layout style' }}
      >
        {/* Tier 1: Single high-performance optical frosted glass blur layer */}
        <div 
          className="absolute inset-0 pointer-events-none backdrop-blur-xl sm:backdrop-blur-2xl transition-opacity duration-300"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Tier 3: Soft progressive color gradient (upar dense, niche transparent) */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
            isScrolled
              ? 'bg-gradient-to-b from-white/95 via-white/80 to-transparent dark:from-slate-950/95 dark:via-slate-950/80 dark:to-transparent border-b border-slate-200/40 dark:border-white/5'
              : 'bg-gradient-to-b from-white/90 via-white/70 to-transparent dark:from-slate-950/90 dark:via-slate-950/70 dark:to-transparent'
          }`}
        />

        {/* Mobile Safe Area Status Bar Solid Color Underlay (White in light mode, Dark in dark mode) */}
        <div className="sm:hidden absolute top-0 left-0 right-0 h-[env(safe-area-inset-top,0px)] bg-white/95 dark:bg-slate-950/95 pointer-events-none transition-colors duration-300" />

        {/* Ultra Glass Specular Reflection Highlight & Gloss Sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/50 dark:via-white/20 to-transparent pointer-events-none z-10" />
        <div className="w-full px-3 sm:px-6 lg:px-10 h-13 sm:h-16 flex items-center justify-between gap-1 sm:gap-3 min-w-0 relative z-20">
        {/* Left: Brand Logo & Title */}
        <div 
          onClick={() => {
            setIsQuickMenuOpen(false);
            onNavigateTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer flex items-center gap-1 sm:gap-2 group hover:opacity-90 transition-opacity flex-shrink-0 min-w-max"
        >
          <Logo size="sm" showTagline={true} className="sm:hidden" avatarUrl={profile.avatarUrl} />
          <Logo size="md" showTagline={true} className="hidden sm:flex" avatarUrl={profile.avatarUrl} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 relative">
          {/* 🌟 1. CHROMATIC RAINBOW AI BUTTON (Blue, Pink, Yellow, Green, Orange with Bubbles & Glow) */}
          <AiRainbowButton
            id="header-voice-btn"
            variant="header"
            isHindi={isHi}
            onClick={() => {
              setIsQuickMenuOpen(false);
              onOpenVoice();
            }}
          />

          {/* 🔍 2. Global Search Button */}
          <motion.button
            type="button"
            id="header-search-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickMenuOpen(false);
              onOpenSearch();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors border border-slate-200/80 dark:border-white/10 relative flex items-center justify-center flex-shrink-0 shadow-2xs touch-manipulation cursor-pointer"
            title={isHi ? 'खोजें (Search)' : 'Global Search'}
            aria-label={isHi ? 'सर्च' : 'Search'}
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </motion.button>

          {/* 🌐 3. Language Switcher (Integrated into Quick Settings Menu like mobile) */}
          <motion.button
            type="button"
            id="header-lang-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLanguage();
            }}
            className="hidden"
            title={isHi ? 'Click to switch to English' : 'हिंदी में बदलने के लिए क्लिक करें'}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="whitespace-nowrap font-bold">
              {isHi ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </span>
          </motion.button>

          {/* 🌗 4. Dark / Light Mode Toggle (Integrated into Quick Settings Menu like mobile) */}
          <motion.button
            type="button"
            id="header-theme-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
            className="hidden"
            title={profile.theme === 'light' ? (isHi ? 'डार्क मोड ऑन करें' : 'Switch to Dark Mode') : (isHi ? 'लाइट मोड ऑन करें' : 'Switch to Light Mode')}
            aria-label="Toggle theme mode"
          >
            {profile.theme === 'light' ? (
              <Moon className="w-4 h-4 text-indigo-900" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </motion.button>

          {/* 🔔 5. Notification Badge (Integrated into Quick Settings Menu like mobile) */}
          <motion.button
            type="button"
            id="header-notif-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickMenuOpen(false);
              onNavigateTab('notifications');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden"
            title={isHi ? 'सूचनाएं' : 'Notifications'}
            aria-label={isHi ? 'सूचनाएं' : 'Notifications'}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#FF9933] text-slate-900 font-black text-[10px] rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-xs">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* 👤 6. Profile Navigation Button (Integrated into Quick Settings Menu like mobile) */}
          <motion.button
            type="button"
            id="header-profile-nav-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickMenuOpen(false);
              onNavigateTab('profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden"
            title={isHi ? '👤 प्रोफ़ाइल व पोर्टफोलियो' : '👤 Profile & Portfolio'}
            aria-label={isHi ? 'प्रोफ़ाइल' : 'Profile'}
          >
            <User className="w-3.5 h-3.5 text-amber-500" />
            <span className="whitespace-nowrap">{isHi ? 'प्रोफ़ाइल' : 'Profile'}</span>
          </motion.button>

          {/* ⚙️ 7. Quick Settings Control Button (Clean, compact icon on mobile, labeled on laptop/desktop) */}
          <motion.button
            ref={quickMenuBtnRef}
            type="button"
            id="header-quick-menu-btn"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsQuickMenuOpen((prev) => !prev);
            }}
            className={`w-8 h-8 sm:w-auto sm:h-9 px-0 sm:px-3 rounded-full transition-all border flex items-center justify-center gap-1.5 relative shadow-2xs touch-manipulation cursor-pointer flex-shrink-0 ${
              isQuickMenuOpen
                ? 'bg-[#000080] text-white dark:bg-amber-400 dark:text-slate-950 border-[#000080] dark:border-amber-400 ring-2 ring-[#000080]/30 dark:ring-amber-400/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isHi ? 'त्वरित सेटिंग्स (प्रोफ़ाइल, एडमिन, थीम, भाषा)' : 'Quick Settings (Profile, Admin, Theme, Language)'}
            aria-label={isHi ? 'त्वरित विकल्प' : 'Quick options menu'}
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isQuickMenuOpen ? 'text-white dark:text-slate-950' : 'text-[#000080] dark:text-amber-400'}`} />
            <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">{isHi ? 'सेटिंग्स' : 'Settings'}</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF9933] rounded-full border border-white dark:border-slate-900 shadow-xs" />
            )}
          </motion.button>
        </div>
      </div>

      {/* 📱 Quick Settings Floating Action Tab (Unified for Laptop & Mobile) */}
      <AnimatePresence>
        {isQuickMenuOpen && (
          <>
            {/* Backdrop click dismisser */}
            <div 
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer"
              onClick={() => {
                setIsQuickMenuOpen(false);
                setIsQuickLoginOpen(false);
                setQuickLoginError(null);
              }}
              aria-hidden="true"
            />

            {/* Popup tab */}
            <motion.div
              ref={quickMenuRef}
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="absolute top-13 sm:top-15 right-2 sm:right-6 lg:right-10 w-[315px] sm:w-[350px] max-w-[calc(100vw-1rem)] z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-[0_16px_45px_rgba(0,0,0,0.25)] p-3 sm:p-3.5 space-y-2 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {isQuickLoginOpen ? (
                /* 🔐 INLINE CORNER GLASSY ADMIN LOGIN */
                <div className="space-y-3.5 p-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickLoginOpen(false);
                        setQuickLoginError(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isHi ? 'सेटिंग्स' : 'Settings'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {isHi ? 'एडमिन लॉगिन' : 'Admin Login'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickLoginOpen(false);
                        setIsQuickMenuOpen(false);
                        setQuickLoginError(null);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label={isHi ? 'बंद करें' : 'Close'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {quickLoginError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-medium text-[11px]">{quickLoginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleQuickLoginSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        {isHi ? 'यूज़रनेम (Username)' : 'Username'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={quickUsername}
                          onChange={(e) => setQuickUsername(e.target.value)}
                          placeholder={isHi ? 'यूज़रनेम दर्ज करें' : 'Enter username'}
                          autoComplete="username"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-slate-100/90 dark:bg-slate-950/70 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        {isHi ? 'पासवर्ड (Password)' : 'Password'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type={showQuickPassword ? 'text' : 'password'}
                          value={quickPassword}
                          onChange={(e) => setQuickPassword(e.target.value)}
                          placeholder={isHi ? 'पासवर्ड दर्ज करें' : 'Enter password'}
                          autoComplete="current-password"
                          required
                          className="w-full pl-9 pr-9 py-2 bg-slate-100/90 dark:bg-slate-950/70 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowQuickPassword(!showQuickPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {showQuickPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={quickLoginLoading}
                      className="w-full mt-2 py-2.5 px-3 bg-gradient-to-r from-amber-500 hover:from-amber-400 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      {quickLoginLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                          <span>{isHi ? 'सत्यापित हो रहा है...' : 'Authenticating...'}</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          <span>{isHi ? 'साइन इन करें' : 'Sign In'}</span>
                        </>
                      )}
                    </button>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{isHi ? 'सुरक्षित मालिक सत्यापन' : 'Secured owner login'}</span>
                      {onOpenAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsQuickLoginOpen(false);
                            setIsQuickMenuOpen(false);
                            onOpenAdmin();
                          }}
                          className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          {isHi ? 'फुल स्क्रीन' : 'Full page'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  {/* Header of the popup tab */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <div>
                        <span id="header-quick-title" className="block text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                          {isHi ? 'त्वरित सेटिंग्स' : 'Quick Settings'}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                          {isHi ? 'प्रोफ़ाइल, एडमिन व कंट्रोल्स' : 'Profile, Admin & Controls'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="header-quick-close-btn"
                      onClick={() => setIsQuickMenuOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      aria-label={isHi ? 'बंद करें' : 'Close menu'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. Profile & Portfolio Direct Card */}
                  <div
                    id="profile-tab-portfolio"
                    data-secondary-id="header-quick-profile-btn"
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all min-h-[54px] ${
                      activeTab === 'profile'
                        ? 'bg-[#000080]/10 border-[#000080]/60 text-[#000080] dark:bg-amber-400/10 dark:border-amber-400/60 dark:text-amber-300 shadow-xs ring-1 ring-[#000080]/30 dark:ring-amber-400/40'
                        : 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-200 dark:bg-slate-800">
                        <img
                          src={getEffectiveAvatarUrl(profile.avatarUrl)}
                          alt={profile.name || 'Vishal Yadav'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold truncate">
                            {profile.name || 'Vishal Yadav'}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold rounded">
                            ✓
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {isHi ? 'पोर्टफोलियो व रिज़्यूमे' : 'Portfolio & Resume'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onNavigateTab('profile', 'portfolio');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-[96px] h-[34px] rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 shadow-xs"
                    >
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{isHi ? 'पोर्टफोलियो' : 'Portfolio'}</span>
                    </button>
                  </div>

                  {/* 3. Theme Toggle (Equal size card & button) */}
                  <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2.5 min-h-[54px]" id="header-quick-theme-section">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        profile.theme === 'dark' 
                          ? 'bg-indigo-500/20 text-indigo-400' 
                          : 'bg-amber-500/20 text-amber-600'
                      }`}>
                        {profile.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {isHi ? 'थीम मोड' : 'Theme Mode'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {profile.theme === 'dark' 
                            ? (isHi ? 'डार्क मोड सक्रिय' : 'Dark theme active') 
                            : (isHi ? 'लाइट मोड सक्रिय' : 'Light theme active')}
                        </span>
                      </div>
                    </div>

                    {/* Semantic hidden buttons for selector compatibility */}
                    <button
                      type="button"
                      id="header-quick-theme-light"
                      onClick={() => onUpdateProfile({ theme: 'light' })}
                      className="sr-only"
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      id="header-quick-theme-dark"
                      onClick={() => onUpdateProfile({ theme: 'dark' })}
                      className="sr-only"
                    >
                      Dark
                    </button>

                    {/* Uniform Theme Action Button */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={profile.theme === 'dark'}
                      onClick={toggleTheme}
                      className={`w-[96px] h-[34px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-95 shadow-xs ${
                        profile.theme === 'dark'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                          : 'bg-indigo-600/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/25'
                      }`}
                      title={profile.theme === 'dark' ? (isHi ? 'लाइट मोड करें' : 'Switch to light mode') : (isHi ? 'डार्क मोड चालू करें' : 'Switch to dark mode')}
                    >
                      {profile.theme === 'dark' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{isHi ? 'लाइट' : 'Light'}</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span>{isHi ? 'डार्क' : 'Dark'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 4. Language Switch (Equal size card & button) */}
                  <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2.5 min-h-[54px]" id="header-quick-lang-section">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {isHi ? 'भाषा (Language)' : 'Language'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {isHi ? 'हिंदी सक्रिय है' : 'English active'}
                        </span>
                      </div>
                    </div>

                    <div className="w-[96px] h-[34px] p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-700/60 flex items-center shrink-0">
                      <button
                        type="button"
                        id="header-quick-lang-hi"
                        onClick={() => onUpdateProfile({ language: 'hi' })}
                        className={`flex-1 h-full rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isHi
                            ? 'bg-[#000080] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        HI
                      </button>
                      <button
                        type="button"
                        id="header-quick-lang-en"
                        onClick={() => onUpdateProfile({ language: 'en' })}
                        className={`flex-1 h-full rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          !isHi
                            ? 'bg-[#000080] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        EN
                      </button>
                    </div>
                  </div>

                  {/* 5. Voice Assistant (AiRainbowButton with big bubbling animation restored) */}
                  <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2.5 min-h-[54px]" id="header-quick-voice-section">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center relative shrink-0">
                        <Mic className="w-4 h-4 text-[#FF9933]" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {isHi ? 'वॉइस असिस्टेंट' : 'Voice Assistant'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {isHi ? 'बोलकर सवाल व सर्च करें' : 'Voice commands & AI'}
                        </span>
                      </div>
                    </div>
                    <AiRainbowButton
                      id="header-quick-voice-btn"
                      variant="header"
                      label={isHi ? 'बोलें AI' : 'Speak AI'}
                      isHindi={isHi}
                      className="!w-[96px] !h-[34px] !px-1.5 shrink-0 text-xs font-black shadow-sm"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onOpenVoice();
                      }}
                    />
                  </div>

                  {/* Vyron Typing Speed Lab Card */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/5 border border-sky-400/30 dark:border-sky-800/60 flex items-center justify-between gap-2.5 min-h-[54px]">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Keyboard className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          VYRON TYPING
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          Speed & Accuracy Laboratory
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onNavigateTab('explore', 'Typing');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-[96px] h-[34px] rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Keyboard className="w-3.5 h-3.5 shrink-0" />
                      <span>Launch</span>
                    </button>
                  </div>

                  {/* 6. Alerts & Notifications (Equal size card & button) */}
                  <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2.5 min-h-[54px]" id="header-quick-alerts-section">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center relative shrink-0">
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-[#FF9933] text-slate-950 font-bold text-[8px] rounded-full flex items-center justify-center animate-pulse border border-white dark:border-slate-900">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {isHi ? 'अलर्ट्स व सूचनाएं' : 'Alerts & Updates'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {unreadCount > 0 
                            ? (isHi ? `${unreadCount} नई सूचनाएं मौजूद हैं` : `${unreadCount} new notifications`) 
                            : (isHi ? 'सब अप-टू-डेट है' : 'All caught up')}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="header-quick-alerts-btn"
                      onClick={() => {
                        setIsQuickMenuOpen(false);
                        onNavigateTab('notifications');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-[96px] h-[34px] rounded-xl bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      title={isHi ? 'सूचनाएं देखें' : 'View Alerts'}
                    >
                      <Bell className="w-3.5 h-3.5 shrink-0" />
                      <span>{isHi ? 'देखें' : 'View'}</span>
                      {unreadCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-slate-950 animate-ping shrink-0" />
                      )}
                    </button>
                  </div>

                  {/* 7. 🔐 Admin Portal & Login Card (REARRANGED TO THE BOTTOM) */}
                  <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2.5 min-h-[54px]">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isAdmin ? 'bg-amber-400/20 text-amber-400' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left truncate flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {isHi ? 'एडमिन पोर्टल (?admin)' : 'Admin Portal (?admin)'}
                          </span>
                          {isAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                          {isAdmin 
                            ? (isHi ? 'एडमिन सत्र चालू है' : 'Logged in as Admin') 
                            : (isHi ? 'मालिक लॉगिन पैनल' : 'Owner access panel')}
                        </span>
                      </div>
                    </div>

                    {isAdmin ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          id="header-quick-admin-appcode-btn"
                          onClick={() => {
                            setIsQuickMenuOpen(false);
                            onNavigateTab('explore', 'App Code');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="h-[34px] px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1 active:scale-95"
                          title="Open App Code Studio"
                        >
                          <Terminal className="w-3.5 h-3.5 shrink-0" />
                          <span>App Code</span>
                        </button>
                        <button
                          type="button"
                          id="header-quick-admin-logout-btn"
                          onClick={() => {
                            setIsQuickMenuOpen(false);
                            onAdminLogout?.();
                          }}
                          className="h-[34px] px-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-1 active:scale-95"
                          title={isHi ? 'एडमिन लॉग आउट' : 'Logout Admin'}
                        >
                          <LogOut className="w-3.5 h-3.5 shrink-0" />
                          <span>{isHi ? 'लॉग आउट' : 'Logout'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id="header-quick-admin-btn"
                        onClick={() => {
                          setIsQuickLoginOpen(true);
                        }}
                        className="w-[96px] h-[34px] rounded-xl bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 text-xs font-extrabold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 flex items-center justify-center gap-1.5 hover:opacity-90"
                        title={isHi ? 'एडमिन लॉगिन' : 'Admin Login'}
                      >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>{isHi ? 'लॉगिन' : 'Login'}</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </header>
    </>
  );
});
