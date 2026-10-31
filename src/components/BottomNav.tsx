import React, { useState, useRef, useEffect } from 'react';
import { NavTab, UserProfile } from '../types';
import { Home, Sparkles, Compass, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getEffectiveAvatarUrl } from '../lib/defaultAvatar';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount: number;
  language?: 'en' | 'hi';
  profile?: UserProfile;
  onOpenSearch?: () => void;
  isBarsHidden?: boolean;
  onBarsVisibilityChange?: (hidden: boolean) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = React.memo(({
  activeTab,
  onSelectTab,
  unreadCount,
  profile,
  isBarsHidden,
  onBarsVisibilityChange,
  onInteractionStart,
  onInteractionEnd,
}) => {
  const isHi = profile?.language === 'hi';
  const avatarUrl = getEffectiveAvatarUrl(profile?.avatarUrl);

  const [isWobble, setIsWobble] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'none'>('none');
  const wobbleTimerRef = useRef<any>(null);

  // Track if on laptop screen (>= 1024px)
  const [isLaptop, setIsLaptop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLaptop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Bottom Nav is permanently visible across all devices (never hides on scroll up or down)
  const effectivelyHidden = false;

  // Pointer drag tracking for swipe gesture (works for mouse and touch)
  const pointerStartPos = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingGesture = useRef(false);

  const tabs = [
    {
      id: 'home' as NavTab,
      label: isHi ? 'होम' : 'Home',
      icon: (isActive: boolean) => (
        <Home
          className="w-5 h-5 sm:w-[22px] sm:h-[22px] shrink-0 pointer-events-none"
          strokeWidth={isActive ? 2.5 : 2.2}
        />
      ),
      badge: 0,
    },
    {
      id: 'tools' as NavTab,
      label: isHi ? 'AI टूल्स' : 'AI Tools',
      icon: (isActive: boolean) => (
        <Sparkles
          className="w-5 h-5 sm:w-[22px] sm:h-[22px] shrink-0 pointer-events-none"
          strokeWidth={isActive ? 2.5 : 2.2}
        />
      ),
      badge: 0,
    },
    {
      id: 'explore' as NavTab,
      label: isHi ? 'खोजें' : 'Explore',
      icon: (isActive: boolean) => (
        <Compass
          className="w-5 h-5 sm:w-[22px] sm:h-[22px] shrink-0 pointer-events-none"
          strokeWidth={isActive ? 2.5 : 2.2}
        />
      ),
      badge: 0,
    },
    {
      id: 'notifications' as NavTab,
      label: isHi ? 'अलर्ट' : 'Alerts',
      icon: (isActive: boolean) => (
        <Bell
          className="w-5 h-5 sm:w-[22px] sm:h-[22px] shrink-0 pointer-events-none"
          strokeWidth={isActive ? 2.5 : 2.2}
        />
      ),
      badge: unreadCount,
    },
    {
      id: 'profile' as NavTab,
      label: isHi ? 'प्रोफ़ाइल' : 'Profile',
      icon: (isActive: boolean) => (
        <div
          className={`w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full overflow-hidden shrink-0 border pointer-events-none transition-all ${
            isActive
              ? 'border-slate-900 dark:border-white ring-2 ring-slate-900/30 dark:ring-white/40 scale-105 shadow-xs'
              : 'border-slate-300/80 dark:border-white/25'
          }`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                if (e.target) (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <User className="w-full h-full p-0.5 text-current pointer-events-none" strokeWidth={isActive ? 2.5 : 2.2} />
          )}
        </div>
      ),
      badge: 0,
    },
  ];

  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeTab));

  const triggerSelect = (targetIndex: number, withWobble = true) => {
    if (targetIndex < 0 || targetIndex >= tabs.length) return;
    const targetTab = tabs[targetIndex];

    onBarsVisibilityChange?.(false);

    if (withWobble) {
      setIsWobble(true);
      if (wobbleTimerRef.current) clearTimeout(wobbleTimerRef.current);
      wobbleTimerRef.current = setTimeout(() => {
        setIsWobble(false);
        setDragDirection('none');
      }, 600);
    }

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(8); } catch {}
    }

    onSelectTab(targetTab.id);
  };

  // Pointer drag gestures for laptop & mobile swipe
  const handlePointerDown = (e: React.PointerEvent) => {
    onBarsVisibilityChange?.(false);
    onInteractionStart?.();
    pointerStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    isDraggingGesture.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartPos.current) return;
    const dx = e.clientX - pointerStartPos.current.x;
    const dy = e.clientY - pointerStartPos.current.y;

    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
      isDraggingGesture.current = true;
      setDragDirection(dx > 0 ? 'right' : 'left');
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setTimeout(() => {
      onInteractionEnd?.();
    }, 400);

    if (!pointerStartPos.current) return;
    const dx = e.clientX - pointerStartPos.current.x;
    const dy = Math.abs(e.clientY - pointerStartPos.current.y);
    const wasDragging = isDraggingGesture.current;

    pointerStartPos.current = null;
    isDraggingGesture.current = false;

    if (wasDragging && Math.abs(dx) > 35 && Math.abs(dx) > dy) {
      if (dx < 0 && activeIndex < tabs.length - 1) {
        triggerSelect(activeIndex + 1, true);
      } else if (dx > 0 && activeIndex > 0) {
        triggerSelect(activeIndex - 1, true);
      } else {
        setDragDirection('none');
      }
    } else {
      setDragDirection('none');
    }
  };

  const handlePointerCancel = () => {
    onInteractionEnd?.();
    pointerStartPos.current = null;
    isDraggingGesture.current = false;
    setDragDirection('none');
  };

  return (
    <>
      {/* 🌊 Liquid Glass SVG Filter - Smooth water distortion */}
      <svg id="liquid-distort-svg" aria-hidden="true">
        <defs>
          <filter id="liquid-distort" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.012"
              numOctaves="2"
              seed="92"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="0.8" result="blurred" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurred"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div
        className={`bottom-nav-wrapper fixed inset-x-0 bottom-3 sm:bottom-4 z-40 flex justify-center items-center pointer-events-none pb-[env(safe-area-inset-bottom)] px-3 select-none transition-all duration-200 ${
          isModalOpen ? 'max-lg:hidden max-lg:opacity-0 max-lg:pointer-events-none' : ''
        }`}
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        {/* 💧 Transparent Liquid Nav Bar with Pointer Swipe & Direct Tab Clicks */}
        <nav
          id="nav"
          className="liquid-nav pointer-events-auto w-[94%] sm:w-full max-w-md sm:max-w-lg mx-auto"
          style={{ transform: 'translate3d(0,0,0)', contain: 'layout style' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                data-i={idx}
                id={`tab-btn-${tab.id}`}
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 350, damping: 24, mass: 0.5 }}
                onContextMenu={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSelect(idx, true);
                }}
                className={`tab relative z-10 flex flex-col items-center justify-center py-1.5 px-1 sm:px-2 rounded-full cursor-pointer touch-manipulation select-none min-h-[48px] sm:min-h-[52px] w-full group focus:outline-none ${
                  isActive ? 'active' : ''
                }`}
              >
                {/* 💧 Pani ki bund - Cylindrical Liquid Glass Pill (Cylinder with Curved Sides) */}
                {isActive && (
                  <motion.div
                    layoutId="liquidDropCylinder"
                    id="drop"
                    className="absolute inset-y-1 inset-x-0.5 sm:inset-x-1 rounded-full z-0 pointer-events-none shadow-md"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #ec4899 35%, #facc15 65%, #f97316 100%)',
                    }}
                    animate={{
                      scaleX: isWobble ? 1.06 : 1,
                      scaleY: isWobble ? 0.96 : 1,
                      borderRadius: isWobble
                        ? dragDirection === 'right'
                          ? '22px 30px 30px 22px'
                          : dragDirection === 'left'
                          ? '30px 22px 22px 30px'
                          : '9999px'
                        : '9999px',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 175,
                      damping: 23,
                      mass: 0.75,
                    }}
                  />
                )}

                {/* ✨ Hover Glow for Inactive Tabs */}
                {!isActive && (
                  <div 
                    className="absolute inset-y-1 inset-x-1 rounded-full z-0 opacity-0 group-hover:opacity-[0.15] dark:group-hover:opacity-[0.25] transition-opacity duration-200 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #ec4899, #facc15, #10b981, #f97316)',
                    }}
                  />
                )}

                <div
                  className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-200 ${
                    isActive
                      ? 'text-white font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]'
                      : 'text-slate-900 dark:text-white font-extrabold group-hover:text-[#ec4899] dark:group-hover:text-[#facc15] drop-shadow-sm dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                  }`}
                >
                  <motion.div
                    className="relative flex-shrink-0 flex items-center justify-center pointer-events-none"
                    animate={{
                      scale: isActive ? 1.12 : 1,
                      y: isActive ? -1 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24, mass: 0.4 }}
                  >
                    {tab.icon(isActive)}
                    {tab.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                        className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] px-1 bg-red-600 text-[9px] font-black text-white rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs flex items-center justify-center"
                      >
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </motion.span>
                    )}
                  </motion.div>

                  <span
                    className={`text-[10px] sm:text-[11.5px] mt-0.5 tracking-tight transition-all duration-200 whitespace-nowrap pointer-events-none ${
                      isActive
                        ? 'font-black text-white scale-[1.04]'
                        : 'font-extrabold'
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </>
  );
});
