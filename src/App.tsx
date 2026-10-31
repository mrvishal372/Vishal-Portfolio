/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, NavTab, ModuleId, NotificationItem } from './types';
import { loadProfile, saveProfile, loadNotifications, saveNotifications } from './lib/storage';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, saveProfileToFirestore, subscribeToCloudProfile, logoutUser } from './lib/firebaseSync';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { VyronAssistantModal } from './components/VyronAssistantModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';


// Views
import { HomeView } from './components/views/HomeView';
import { ExploreView } from './components/views/ExploreView';
import { NotificationsView } from './components/views/NotificationsView';
import { ProfileView, ProfileSubTab } from './components/views/ProfileView';
import { AIToolsHeaderAnimation } from './components/TabHeroAnimations';

// Modules
import { MoneyManager } from './components/modules/MoneyManager';
import { JugaadFix } from './components/modules/JugaadFix';
import { FormAlert } from './components/modules/FormAlert';
import { SastiDawai } from './components/modules/SastiDawai';
import { AajKyaBanaoo } from './components/modules/AajKyaBanaoo';
import { LastNightPadhai } from './components/modules/LastNightPadhai';
import { MeriYojna } from './components/modules/MeriYojna';
import { CimageBcaLogoMaker } from './components/modules/CimageBcaLogoMaker';

import { ArrowLeft, Sparkles, Wrench, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { appleTabVariants, appleReducedTabVariants, appleCardHover, appleCardTap } from './lib/motionTokens';
import { ScrollReveal } from './components/common/ScrollReveal';

import { AmbientGlowBackground } from './components/AmbientGlowBackground';
import { AdminLogin } from './components/admin/AdminLogin';
import { hasAdminSession, verifyAdminSession, adminLogout, getAdminPhone } from './lib/adminAuth';
import { isCustomAvatarUrl } from './lib/defaultAvatar';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';
import { syncOfflineDataWithServer } from './lib/offlineStorage';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadNotifications());

  // Routing state for /admin and public website
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => hasAdminSession());
  const [adminPhone, setAdminPhone] = useState<string>(() => getAdminPhone());

  // Default active tab: Home
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [exploreCategory, setExploreCategory] = useState<string>('All');
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('portfolio');
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const [moduleQuery, setModuleQuery] = useState('');
  
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isWelcomeAuthOpen, setIsWelcomeAuthOpen] = useState(false);

  const isBarsHidden = false;

  // Permanent Header & Bottom Navigation: bars never hide on scroll up or down across any device
  const setIsBarsHidden = (_val?: boolean) => {};

  // Check whether to show Welcome Auth Modal after splash screen
  const handleSplashFinish = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('splashShown', 'true');
    } catch {}
  };

  // Listen to browser URL navigation and verify admin session
  useEffect(() => {
    const checkRoute = async () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (hasAdminSession()) {
        const valid = await verifyAdminSession();
        setIsAdminLoggedIn(valid);
        if (valid) {
          // Admin opens app -> Preserve user's explicitly selected theme if chosen
          const savedVisitorTheme = localStorage.getItem('vyron_visitor_theme') as 'light' | 'dark' | null;
          setProfile(prev => {
            const currentTheme = prev.theme || savedVisitorTheme || 'dark';
            const next = { ...prev, theme: currentTheme };
            saveProfile(next);
            return next;
          });
          if (path === '/admin' || window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
            setActiveTab('explore');
            setExploreCategory('App Code');
            setActiveModule(null);
            window.history.replaceState({}, '', '/');
            setCurrentPath('/');
          } else {
            setActiveTab('home');
            setActiveModule(null);
          }
        } else {
          // Admin session invalid/expired -> return to public white mode
          setIsAdminLoggedIn(false);
          setProfile(prev => {
            const next = { ...prev, theme: 'light' as const };
            saveProfile(next);
            return next;
          });
          setActiveTab('home');
          setActiveModule(null);
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      } else {
        setIsAdminLoggedIn(false);
        const hasVisited = localStorage.getItem('bharatjugaad_has_visited_v1');
        const savedVisitorTheme = localStorage.getItem('vyron_visitor_theme');
        const themeToUse = savedVisitorTheme === 'dark' ? 'dark' : 'light';

        if (!hasVisited) {
          try {
            localStorage.setItem('bharatjugaad_has_visited_v1', 'true');
          } catch {}
          setProfile(prev => {
            const next = { ...prev, theme: 'dark' as const };
            saveProfile(next);
            return next;
          });
          setActiveTab('home');
          setActiveModule(null);
        } else {
          // Returning visitor: ensure home page on initial load
          setProfile(prev => {
            if (prev.theme === themeToUse) return prev;
            return { ...prev, theme: themeToUse };
          });
        }
      }
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const handleAdminLogout = async () => {
    await adminLogout();
    setIsAdminLoggedIn(false);
    setProfile(prev => {
      const next = { ...prev, theme: 'dark' as const };
      saveProfile(next);
      return next;
    });
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
    setActiveTab('home');
    setActiveModule(null);
  };

  // Listen to Firebase Auth state, real-time Cloud Profile changes & live sync events
  useEffect(() => {
    // Initial fetch of fresh profile / portfolio data from server
    fetch(`/api/portfolio?_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data?.portfolio) {
          setProfile(prev => {
            let changed = false;
            const next = { ...prev };
            if (data.portfolio.fullName && (!prev.name || prev.name !== data.portfolio.fullName)) {
              next.name = data.portfolio.fullName;
              changed = true;
            }
            // Protect custom avatar: never overwrite an admin-uploaded photo with default placeholder
            if (data.portfolio.avatarUrl) {
              const incomingIsCustom = isCustomAvatarUrl(data.portfolio.avatarUrl);
              const prevIsCustom = isCustomAvatarUrl(prev.avatarUrl);
              if (incomingIsCustom || !prevIsCustom) {
                if (next.avatarUrl !== data.portfolio.avatarUrl) {
                  next.avatarUrl = data.portfolio.avatarUrl;
                  changed = true;
                }
              }
            }
            if (changed) {
              saveProfile(next);
              return next;
            }
            return prev;
          });
        }
      })
      .catch(() => {});

    // Subscribe to cloud profile for everyone (visitors and owner) via Firestore onSnapshot
    const unsubscribeCloud = subscribeToCloudProfile((cloudProfile) => {
      if (cloudProfile) {
        setProfile((prev) => {
          let changed = false;
          const next = { ...prev };
          if (cloudProfile.name && cloudProfile.name !== prev.name) {
            next.name = cloudProfile.name;
            changed = true;
          }
          // Protect custom avatar from being overwritten by default
          if (cloudProfile.avatarUrl) {
            const incomingIsCustom = isCustomAvatarUrl(cloudProfile.avatarUrl);
            const prevIsCustom = isCustomAvatarUrl(prev.avatarUrl);
            if (incomingIsCustom || !prevIsCustom) {
              if (next.avatarUrl !== cloudProfile.avatarUrl) {
                next.avatarUrl = cloudProfile.avatarUrl;
                changed = true;
              }
            }
          }
          if (cloudProfile.aboutMe && cloudProfile.aboutMe !== prev.aboutMe) {
            next.aboutMe = cloudProfile.aboutMe;
            changed = true;
          }
          if (changed) {
            saveProfile(next);
            return next;
          }
          return prev;
        });
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoggedIn(!!user);
    });

    // Sub-second custom event listeners for instant photo and name updates across tabs and views
    const handlePhotoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl?: string }>;
      if (customEvent.detail?.avatarUrl) {
        setProfile(prev => {
          if (prev.avatarUrl === customEvent.detail.avatarUrl) return prev;
          const updated = { ...prev, avatarUrl: customEvent.detail.avatarUrl! };
          saveProfile(updated);
          return updated;
        });
      }
    };

    const handleInfoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ name?: string; avatarUrl?: string }>;
      if (customEvent.detail) {
        setProfile(prev => {
          let changed = false;
          const next = { ...prev };
          if (customEvent.detail.name && next.name !== customEvent.detail.name) {
            next.name = customEvent.detail.name;
            changed = true;
          }
          if (customEvent.detail.avatarUrl && next.avatarUrl !== customEvent.detail.avatarUrl) {
            next.avatarUrl = customEvent.detail.avatarUrl;
            changed = true;
          }
          if (changed) {
            saveProfile(next);
            return next;
          }
          return prev;
        });
      }
    };

    const handlePortfolioSynced = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        setProfile(prev => {
          let changed = false;
          const next = { ...prev };
          if (customEvent.detail.fullName && next.name !== customEvent.detail.fullName) {
            next.name = customEvent.detail.fullName;
            changed = true;
          }
          if (customEvent.detail.avatarUrl && next.avatarUrl !== customEvent.detail.avatarUrl) {
            next.avatarUrl = customEvent.detail.avatarUrl;
            changed = true;
          }
          if (customEvent.detail.shortBio && next.aboutMe !== customEvent.detail.shortBio) {
            next.aboutMe = customEvent.detail.shortBio;
            changed = true;
          }
          if (changed) {
            saveProfile(next);
            return next;
          }
          return prev;
        });
      }
    };

    window.addEventListener('portfolio_photo_updated', handlePhotoUpdate);
    window.addEventListener('profile_info_updated', handleInfoUpdate);
    window.addEventListener('portfolio_synced_from_cloud', handlePortfolioSynced);

    return () => {
      unsubscribeAuth();
      unsubscribeCloud();
      window.removeEventListener('portfolio_photo_updated', handlePhotoUpdate);
      window.removeEventListener('profile_info_updated', handleInfoUpdate);
      window.removeEventListener('portfolio_synced_from_cloud', handlePortfolioSynced);
    };
  }, []);

  // Sync profile changes to localStorage & Cloud Firestore if logged in
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (updated.theme) {
      try {
        localStorage.setItem('vyron_visitor_theme', updated.theme);
      } catch {}
    }
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      saveProfile(next);
      if (currentUser) {
        saveProfileToFirestore(currentUser.uid, next);
      }
      if (updated.avatarUrl) {
        window.dispatchEvent(new CustomEvent('portfolio_photo_updated', { detail: { avatarUrl: updated.avatarUrl } }));
      }
      if (updated.name) {
        window.dispatchEvent(new CustomEvent('profile_info_updated', { detail: { name: updated.name, avatarUrl: updated.avatarUrl || next.avatarUrl } }));
      }
      return next;
    });
  };

  // Logout handler
  const handleLogout = () => {
    logoutUser();
    setIsWelcomeAuthOpen(true);
  };


  // Sync notification changes
  const handleUpdateNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    saveNotifications(newNotifs);
  };

  // Sync dark theme class, root/body backgroundColor, and dynamic meta theme tags for iOS/Android status bar
  useEffect(() => {
    const isDark = profile.theme === 'dark';
    const color = isDark ? '#020617' : '#ffffff';
    const barStyle = isDark ? 'black-translucent' : 'default';

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    root.style.backgroundColor = color;
    document.body.style.backgroundColor = color;

    // WebKit / iOS Safari & Chrome Dynamic Status Bar Repaint:
    // Replacing the meta elements forces mobile browsers (Safari & Chrome) to repaint the status bar and toolbar immediately
    try {
      document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove());
      const themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      themeMeta.content = color;
      themeMeta.id = 'theme-color-meta';
      document.head.appendChild(themeMeta);

      document.querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]').forEach(el => el.remove());
      const appleMeta = document.createElement('meta');
      appleMeta.name = 'apple-mobile-web-app-status-bar-style';
      appleMeta.content = barStyle;
      appleMeta.id = 'apple-status-bar-meta';
      document.head.appendChild(appleMeta);
    } catch {}
  }, [profile.theme]);

  // Register PWA Service Worker & sync essential module data (medicines, recipes)
  useEffect(() => {
    // Initial background sync of essential module data into local storage & caches
    syncOfflineDataWithServer();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('BharatJugaad SW registered:', reg.scope);
          // If a new service worker is waiting, activate immediately
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        })
        .catch((err) => console.warn('SW registration failed:', err));
    }

    const handleBackOnline = () => {
      syncOfflineDataWithServer();
    };
    window.addEventListener('online', handleBackOnline);
    return () => window.removeEventListener('online', handleBackOnline);
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const isHi = profile.language === 'hi';

  const handleSelectModule = (modId: ModuleId, query?: string) => {
    setActiveModule(modId);
    setModuleQuery(query || '');
    setActiveTab('tools');
  };

  const handleBackToHome = () => {
    setActiveModule(null);
    setModuleQuery('');
    setActiveTab('home');
  };

  // Scroll to top on startup and navigation change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, [activeTab, activeModule]);

  // Private Admin Route Gate: If visiting /admin without active authenticated session, show AdminLogin
  if (currentPath === '/admin' && !isAdminLoggedIn) {
    return (
      <AdminLogin
        onLoginSuccess={(phone) => {
          setIsAdminLoggedIn(true);
          setAdminPhone(phone);
          setActiveTab('explore');
          setExploreCategory('App Code');
          setActiveModule(null);
          handleUpdateProfile({ theme: 'dark' });
          window.history.replaceState({}, '', '/');
          setCurrentPath('/');
        }}
        onBackToPublic={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
          setActiveTab('home');
          setActiveModule(null);
        }}
      />
    );
  }

  const isCurrentAdmin = isAdminLoggedIn || (typeof window !== 'undefined' && hasAdminSession());

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Poppins',sans-serif] selection:bg-[#FF9933]/30 selection:text-[#000080] relative overflow-x-hidden">
      {/* Premium Ambient Glow Background for Dark Mode on Mobile and Desktop */}
      {profile.theme === 'dark' && (
        <AmbientGlowBackground isDark={true} />
      )}

      {/* Clean Pure White Canvas for Light Mode */}
      {profile.theme !== 'dark' && (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none bg-white select-none" />
      )}
      {/* Luxury Brand Opening Splash Screen */}
      {showSplash && (
        <SplashScreen 
          theme={profile.theme} 
          reducedMotion={profile.reducedMotion} 
          onFinish={handleSplashFinish} 
        />
      )}

      {/* Fixed Glassy Header */}
      <Header
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenVoice={() => {
          setIsBarsHidden(false);
          setIsVoiceOpen(true);
        }}
        onOpenSearch={() => {
          setIsBarsHidden(false);
          setIsSearchOpen(true);
        }}
        onNavigateTab={(tab, subTab) => {
          setIsBarsHidden(false);
          if (tab === 'typing') {
            setActiveTab('explore');
            setExploreCategory('Typing');
          } else {
            setActiveTab(tab);
          }
          if (tab === 'profile' && subTab) {
            setProfileSubTab(subTab as any);
          }
          if (tab === 'explore' && subTab) {
            setExploreCategory(subTab);
          }
          if (tab !== 'tools') setActiveModule(null);
        }}
        unreadCount={unreadNotifCount}
        activeTab={activeTab}
        isAdmin={isCurrentAdmin}
        onAdminLogout={handleAdminLogout}
        onOpenAdmin={() => {
          setIsBarsHidden(false);
          window.history.pushState({}, '', '/admin');
          setCurrentPath('/admin');
        }}
        onAdminLoginSuccess={(identifier) => {
          setIsBarsHidden(false);
          setIsAdminLoggedIn(true);
          setAdminPhone(identifier);
          setActiveTab('profile');
          setProfileSubTab('portfolio');
          setActiveModule(null);
          handleUpdateProfile({ theme: 'dark' });
        }}
        isBarsHidden={isBarsHidden}
        onBarsVisibilityChange={setIsBarsHidden}
      />

      <div className="flex-1 w-full flex flex-col relative">
        {/* Floating Glass Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setIsBarsHidden(false);
            if (tab === 'typing') {
              setActiveTab('explore');
              setExploreCategory('Typing');
            } else {
              setActiveTab(tab);
            }
            if (tab !== 'tools') setActiveModule(null);
          }}
          unreadCount={unreadNotifCount}
          language={profile.language}
          profile={profile}
          onOpenSearch={() => {
            setIsBarsHidden(false);
            setIsSearchOpen(true);
          }}
          isBarsHidden={isBarsHidden}
          onBarsVisibilityChange={setIsBarsHidden}
          onInteractionStart={() => {}}
          onInteractionEnd={() => {}}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth w-full px-3.5 sm:px-6 lg:px-10 pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:pt-20 pb-24 sm:pb-28">

        {/* Module View Header Breadcrumb if active module */}
        {activeModule && (
          <div className="mb-4 flex items-center justify-between bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md px-4 py-2.5 rounded-2xl">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1.5 text-xs font-bold text-[#000080] dark:text-amber-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHi ? 'होम पर वापस जाएं' : 'Back to Home'}</span>
            </button>
            <div className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span>{isHi ? 'AI टूल्स' : 'AI Tools'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-slate-900 dark:text-white capitalize">{activeModule}</span>
            </div>
          </div>
        )}

        {/* Tab / Module Router with Apple Motion Language */}
        <AnimatePresence mode="wait">
          {activeModule ? (
            <motion.div
              key={`module-${activeModule}`}
              variants={profile.reducedMotion ? appleReducedTabVariants : appleTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {activeModule === 'money' && <MoneyManager profile={profile} onUpdateProfile={handleUpdateProfile} />}
              {activeModule === 'jugaad' && <JugaadFix profile={profile} onUpdateProfile={handleUpdateProfile} initialQuery={moduleQuery} />}
              {activeModule === 'form' && <FormAlert profile={profile} onUpdateProfile={handleUpdateProfile} />}
              {activeModule === 'medicine' && <SastiDawai profile={profile} onUpdateProfile={handleUpdateProfile} initialQuery={moduleQuery} />}
              {activeModule === 'recipe' && (
                <AajKyaBanaoo 
                  profile={profile} 
                  onUpdateProfile={handleUpdateProfile} 
                  initialQuery={moduleQuery}
                  onOpenAssistant={(prompt) => {
                    setAssistantInitialPrompt(prompt);
                    setIsVoiceOpen(true);
                  }}
                />
              )}
              {activeModule === 'study' && <LastNightPadhai profile={profile} onUpdateProfile={handleUpdateProfile} initialQuery={moduleQuery} />}
              {activeModule === 'yojna' && <MeriYojna profile={profile} onUpdateProfile={handleUpdateProfile} initialQuery={moduleQuery} />}
              {activeModule === 'cimage-logo' && <CimageBcaLogoMaker profile={profile} onUpdateProfile={handleUpdateProfile} />}
            </motion.div>
          ) : (
            <motion.div
              key={`tab-${activeTab}`}
              variants={profile.reducedMotion ? appleReducedTabVariants : appleTabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {activeTab === 'typing' && (
                <ExploreView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onSelectModule={handleSelectModule}
                  isAdmin={isCurrentAdmin}
                  isAuthenticated={Boolean(isCurrentAdmin || isLoggedIn || currentUser)}
                  initialCategory="Typing"
                  onCategoryChange={setExploreCategory}
                />
              )}

              {activeTab === 'home' && (
                <HomeView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onSelectModule={handleSelectModule}
                  onOpenVoice={() => setIsVoiceOpen(true)}
                  onOpenSearch={() => setIsSearchOpen(true)}
                />
              )}

              {activeTab === 'tools' && (
                <div className="space-y-6">
                  {/* Apple Keynote Style Hub Banner */}
                  <ScrollReveal cascadeIndex={0} reducedMotion={profile.reducedMotion}>
                    <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md text-slate-900 dark:text-white overflow-hidden">
                      <AIToolsHeaderAnimation />
                      <div className="relative z-10 space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-sky-400/20 text-blue-700 dark:text-sky-200 text-[11px] font-bold border border-blue-200 dark:border-sky-400/30">
                          <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-sky-300" />
                          <span>{isHi ? 'AI स्टूडियो हब' : 'AI Studio Hub'}</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{isHi ? 'सभी 8 AI मॉड्यूल और क्रिएटिव स्टूडियो' : 'All Eight AI Modules & Creative Studios'}</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200/90 max-w-2xl">
                          {isHi ? 'किसी भी मॉड्यूल पर टैप करके उसका AI वर्कस्पेस खोलें' : 'Select any module to open its dedicated AI workspace'}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Refined Apple App Grid with Staggered Scroll Reveal */}
                  <ScrollReveal cascadeIndex={1} reducedMotion={profile.reducedMotion}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[
                        {
                          id: 'cimage-logo' as ModuleId,
                          title: isHi ? 'CIMAGE BCA लोगो मेकर AI' : 'CIMAGE BCA Logo Maker AI',
                          desc: isHi ? 'CIMAGE शील्ड, कोड स्क्रीन और 3D गोल्ड डिज़ाइनर' : 'Circular batch emblem designer with CIMAGE shield, code screen & 3D gold',
                          highlight: true
                        },
                        {
                          id: 'money' as ModuleId,
                          title: isHi ? 'मनी मैनेजर' : 'Money Manager',
                          desc: isHi ? 'दैनिक खर्च और बजट योजना' : 'Expense logger & budget planner'
                        },
                        {
                          id: 'jugaad' as ModuleId,
                          title: isHi ? 'जुगाड़ फिक्स' : 'Jugaad Fix',
                          desc: isHi ? 'घरेलू DIY लाइफ हैक्स और टिप्स' : 'Household DIY life hacks'
                        },
                        {
                          id: 'form' as ModuleId,
                          title: isHi ? 'फॉर्म अलर्ट' : 'Form Alert',
                          desc: isHi ? 'सरकारी परीक्षा व नौकरी अंतिम तिथि ट्रैकर' : 'Govt exam & job deadline tracker'
                        },
                        {
                          id: 'medicine' as ModuleId,
                          title: isHi ? 'सस्ती दवाई' : 'Sasti Dawai',
                          desc: isHi ? 'जेनेरिक दवा मूल्य बचत कैलकुलेटर' : 'Generic medicine price comparison'
                        },
                        {
                          id: 'recipe' as ModuleId,
                          title: isHi ? 'आज क्या बनाऊं' : 'Aaj Kya Banaoo',
                          desc: isHi ? 'सामग्री आधारित भारतीय व्यंजन रेसिपी' : 'Ingredient-based Indian recipes'
                        },
                        {
                          id: 'study' as ModuleId,
                          title: isHi ? 'लास्ट नाइट पढ़ाई' : 'Last Night Padhai',
                          desc: isHi ? '2 मिनट क्विक रिविजन नोट्स व क्विज' : '2-min revision notes & practice quiz'
                        },
                        {
                          id: 'yojna' as ModuleId,
                          title: isHi ? 'मेरी योजना' : 'Meri Yojna',
                          desc: isHi ? 'केंद्र व राज्य सरकारी योजना खोजक' : 'Central & State Govt scheme finder'
                        }
                      ].map((m) => (
                        <motion.button
                          key={m.id}
                          whileHover={profile.reducedMotion ? undefined : appleCardHover}
                          whileTap={profile.reducedMotion ? undefined : appleCardTap}
                          onClick={() => handleSelectModule(m.id)}
                          className={`p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-slate-50/80 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 text-left transition-colors space-y-2.5 shadow-md relative overflow-hidden cursor-pointer group hover:shadow-lg`}
                        >
                          {(m as any).highlight && (
                            <span className="absolute top-3.5 right-3.5 text-[10px] font-black uppercase tracking-wider bg-sky-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                              NEW
                            </span>
                          )}
                          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#000080] dark:group-hover:text-sky-400 transition-colors">
                            {m.title}
                          </h3>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {m.desc}
                          </p>
                          <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#000080] dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                            <span>{isHi ? 'वर्कस्पेस खोलें' : 'Open Workspace'}</span>
                            <span className="text-sm">→</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {activeTab === 'explore' && (
                <ExploreView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  onSelectModule={handleSelectModule}
                  isAdmin={isCurrentAdmin}
                  isAuthenticated={Boolean(isCurrentAdmin || isLoggedIn || currentUser)}
                  initialCategory={exploreCategory}
                  onCategoryChange={setExploreCategory}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onUpdateNotifications={handleUpdateNotifications}
                  language={profile.language}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                  initialSubTab={profileSubTab}
                  currentUser={currentUser}
                  isLoggedIn={isLoggedIn}
                  isAdmin={isCurrentAdmin}
                  onLogout={isCurrentAdmin ? handleAdminLogout : handleLogout}
                  onOpenLogin={() => {}}
                  onProfileSynced={(synced) => {
                    handleUpdateProfile(synced);
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </div>

      {/* Vyron AI Voice & Text Modal */}
      <VyronAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => {
          setIsVoiceOpen(false);
          setAssistantInitialPrompt(undefined);
        }}
        language={profile.language}
        profile={profile}
        notifications={notifications}
        initialPrompt={assistantInitialPrompt}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        profile={profile}
        onSelectModule={handleSelectModule}
      />

      {/* Main Authentication Modal */}
      <AuthModal
        isOpen={isWelcomeAuthOpen && !isLoggedIn}
        onClose={() => setIsWelcomeAuthOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setIsWelcomeAuthOpen(false);
        }}
      />

      {/* Persistent Offline Connectivity & Data Cache Banner */}
      <OfflineStatusBanner language={profile.language} />

      {/* Glass Footer */}
      <Footer language={profile.language} avatarUrl={profile.avatarUrl} />
    </div>
  );
}
