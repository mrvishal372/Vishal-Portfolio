import React, { useState, useEffect } from 'react';
import { getEffectiveAvatarUrl } from '../lib/defaultAvatar';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  lightText?: boolean;
  avatarUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showTagline = true, 
  className = '', 
  lightText = false,
  avatarUrl 
}) => {
  const isWhiteText = lightText || className.split(' ').includes('text-white');
  const [currentAvatar, setCurrentAvatar] = useState<string>(() => avatarUrl || getEffectiveAvatarUrl());

  useEffect(() => {
    if (avatarUrl) {
      setCurrentAvatar(avatarUrl);
    }
  }, [avatarUrl]);

  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl?: string }>;
      if (customEvent.detail?.avatarUrl) {
        setCurrentAvatar(customEvent.detail.avatarUrl);
      }
    };
    window.addEventListener('portfolio_photo_updated', handleAvatarUpdate);
    return () => window.removeEventListener('portfolio_photo_updated', handleAvatarUpdate);
  }, []);

  const iconSizes = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-10 sm:h-10',
    lg: 'w-10 h-10 sm:w-14 sm:h-14'
  };

  const titleSizes = {
    sm: 'text-xs sm:text-base',
    md: 'text-xs min-[380px]:text-sm sm:text-xl',
    lg: 'text-lg sm:text-3xl'
  };

  const taglineSizes = {
    sm: 'text-[8px] sm:text-[9px]',
    md: 'text-[8px] min-[380px]:text-[9px] sm:text-[11px]',
    lg: 'text-[10px] sm:text-xs'
  };

  const effectivePhoto = getEffectiveAvatarUrl(currentAvatar);

  return (
    <div className={`flex items-center gap-1.5 min-[380px]:gap-2 sm:gap-2.5 select-none min-w-0 ${className}`}>
      {/* Brand Icon Badge - Featuring Vishal Yadav Profile Picture */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 rounded-full bg-gradient-to-br from-[#000080] via-[#000055] to-[#0f172a] p-0.5 shadow-md shadow-navy-900/30 border-2 border-amber-400/80 overflow-hidden group`}>
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF9933]/30 via-transparent to-[#138808]/30 opacity-90 group-hover:opacity-100 transition-opacity" />
        
        {/* Profile Picture Container */}
        <div className="w-full h-full rounded-full bg-[#000080] overflow-hidden flex items-center justify-center relative z-10">
          <img
            key={effectivePhoto}
            src={effectivePhoto}
            alt="Vishal Kumar Yadav"
            className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300 select-none"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== window.location.origin + '/profile.svg' && target.src !== '/profile.svg') {
                target.src = '/profile.svg';
              }
            }}
          />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-tight flex-shrink-0">
        <div className={`font-bold tracking-tight ${isWhiteText ? 'text-white' : 'text-slate-900 dark:text-white'} flex items-center gap-0.5 sm:gap-1 whitespace-nowrap ${titleSizes[size]}`}>
          <span className={isWhiteText ? 'text-white' : ''}>Vishal</span>
          <span className="text-[#FF9933]">Portfolio</span>
        </div>
        {showTagline && (
          <div className={`font-medium tracking-wide ${isWhiteText ? 'text-emerald-400' : 'text-[#138808] dark:text-emerald-400'} hidden min-[360px]:flex items-center gap-0.5 sm:gap-1 whitespace-nowrap ${taglineSizes[size]}`}>
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#FF9933] animate-pulse inline-block flex-shrink-0" />
            <span className={`whitespace-nowrap flex-shrink-0 ${isWhiteText ? 'text-emerald-400' : 'text-[#138808] dark:text-emerald-400'}`}>
              Powered by <strong className={`font-semibold ${isWhiteText ? 'text-sky-400 dark:text-sky-300 no-underline' : 'text-[#000080] dark:text-sky-300'}`}>Vyron AI</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
