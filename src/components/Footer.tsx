import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { getEffectiveAvatarUrl } from '../lib/defaultAvatar';

interface FooterProps {
  language?: string;
  avatarUrl?: string;
}

export const Footer: React.FC<FooterProps> = ({ avatarUrl }) => {
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

  const effectiveAvatar = getEffectiveAvatarUrl(currentAvatar);
  const username = 'mr_vishal372';

  const socialLinks = [
    {
      name: 'Instagram',
      tileClass: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-xs',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      url: `https://instagram.com/${username}`,
      appUrl: `instagram://user?username=${username}`
    },
    {
      name: 'WhatsApp',
      tileClass: 'bg-[#25D366] text-white shadow-xs',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 0C5.396 0 .015 5.381.015 12.016c0 2.12.553 4.188 1.603 6.01L0 24l6.169-1.619a11.97 11.97 0 0 0 5.862 1.523h.005c6.633 0 12.016-5.383 12.016-12.018A11.94 11.94 0 0 0 20.528 3.51 11.93 11.93 0 0 0 12.031 0zm.005 21.988a9.98 9.98 0 0 1-5.09-1.396l-.365-.216-3.782.992 1.009-3.687-.238-.378a9.97 9.97 0 0 1-1.536-5.287C2.034 6.495 6.516 2.013 12.036 2.013a9.94 9.94 0 0 1 7.072 2.936 9.94 9.94 0 0 1 2.93 7.072c-.002 5.522-4.485 10.004-10.002 10.004zm5.485-7.487c-.301-.151-1.78-.878-2.056-.979-.276-.1-.476-.151-.677.151-.2.301-.778.979-.954 1.18-.175.201-.351.226-.652.075-.301-.151-1.272-.469-2.423-1.496-.895-.798-1.5-1.785-1.676-2.086-.176-.301-.019-.464.132-.614.135-.136.301-.351.452-.527.151-.176.201-.301.301-.502.1-.201.05-.377-.025-.527-.075-.151-.677-1.632-.928-2.235-.245-.588-.494-.508-.677-.518-.176-.009-.377-.01-.578-.01-.201 0-.527.075-.803.376s-1.054 1.029-1.054 2.51 1.079 2.912 1.23 3.113c.151.201 2.123 3.243 5.144 4.549.719.311 1.28.497 1.718.636.722.23 1.378.197 1.897.12.579-.086 1.78-.728 2.031-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.352z"/>
        </svg>
      ),
      url: `https://wa.me/917320913451?text=Hello%20Vishal`,
      appUrl: `whatsapp://send?phone=917320913451&text=Hello%20Vishal`
    },
    {
      name: 'YouTube',
      tileClass: 'bg-[#FF0000] text-white shadow-xs',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 0 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      url: `https://youtube.com/@${username}`,
      appUrl: `vnd.youtube://user/${username}`
    },
    {
      name: 'Facebook',
      tileClass: 'bg-[#1877F2] text-white shadow-xs',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://facebook.com/${username}`,
      appUrl: `fb://profile/${username}`
    },
    {
      name: 'X (Twitter)',
      tileClass: 'bg-black text-white border border-slate-700/80 shadow-xs',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://x.com/${username}`,
      appUrl: `twitter://user?screen_name=${username}`
    },
    {
      name: 'LinkedIn',
      tileClass: 'bg-[#0A66C2] text-white shadow-xs',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      url: `https://linkedin.com/in/${username}`,
      appUrl: `linkedin://in/${username}`
    },
    {
      name: 'GitHub',
      tileClass: 'bg-[#24292e] text-white border border-slate-700/80 shadow-xs',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      ),
      url: `https://github.com/${username}`,
      appUrl: `https://github.com/${username}`
    },
    {
      name: 'Snapchat',
      tileClass: 'bg-[#FFFC00] text-black shadow-xs',
      icon: (
        <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.001 1.5c-4.455 0-7.233 3.32-7.233 6.84 0 1.545.54 2.925 1.485 3.93.18.195.27.42.195.69-.135.48-.6 1.815-1.245 2.13-.42.21-.915.135-1.125-.015-.225-.165-.48-.255-.75-.255-.66 0-1.275.525-1.275 1.215 0 .615.42 1.08 1.035 1.155 1.2.15 2.19.855 2.76 1.845.285.495.735.84 1.29.975 1.05.255 2.145.39 3.87.39 1.725 0 2.82-.135 3.87-.39.555-.135 1.005-.48 1.29-.975.57-.99 1.56-1.695 2.76-1.845.615-.075 1.035-.54 1.035-1.155 0-.69-.615-1.215-1.275-1.215-.27 0-.525.09-.75.255-.21.15-.705.225-1.125.015-.645-.315-1.11-1.65-1.245-2.13-.075-.27.015-.495.195-.69.945-1.005 1.485-2.385 1.485-3.93 0-3.52-2.778-6.84-7.233-6.84z"/>
        </svg>
      ),
      url: `https://snapchat.com/add/${username}`,
      appUrl: `snapchat://add/${username}`
    },
    {
      name: 'Threads',
      tileClass: 'bg-black text-white border border-slate-700/80 shadow-xs',
      icon: (
        <svg className="w-4 h-4 text-white" viewBox="0 0 192 192" fill="currentColor">
          <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4101 44.745 97.2584 44.745 97.1066 44.745C75.4218 44.745 59.9538 58.745 59.9538 80.8931C59.9538 103.041 75.4218 117.041 97.1066 117.041C109.914 117.041 120.443 111.458 126.85 101.442C130.643 107.039 136.216 111.391 142.793 113.882C150.119 116.657 158.077 116.611 165.253 113.751C172.932 110.69 178.681 104.912 181.447 97.4764C184.444 89.4178 184.148 79.9972 180.615 70.923C174.524 55.2759 161.854 43.149 145.417 37.2472C128.718 31.2509 109.773 31.9547 93.6309 39.1691C74.6534 47.6496 59.8837 63.8569 53.4862 83.2103C47.0886 102.564 49.7997 122.846 60.8528 138.384C71.3995 153.211 87.8924 162.245 106.84 163.606C121.758 164.677 136.284 160.82 147.625 152.784L143.085 140.063C133.729 146.685 121.758 149.851 109.431 148.966C93.4474 147.818 79.4975 140.187 70.6035 127.683C61.2721 114.566 58.9866 97.4334 64.3905 81.0886C69.7944 64.7437 82.2618 51.0538 98.2817 43.8931C111.91 37.8009 127.914 37.2065 142.022 42.2713C155.918 47.2614 166.621 57.5028 171.766 70.7226C174.698 78.2562 174.945 86.0759 172.457 92.7663C170.197 98.8427 165.503 103.559 159.231 106.059C153.376 108.393 146.883 108.43 140.85 106.142C133.567 103.379 128.083 97.4877 125.795 89.9238C132.868 86.8776 137.917 80.2033 138.835 71.979C139.753 63.7547 136.425 55.4338 130.016 49.8553C122.569 43.3732 112.519 39.8138 102.138 39.8138H97.1066C82.1648 39.8138 69.4674 47.9628 64.1205 60.9169C58.7736 73.8711 61.5904 89.7099 71.3995 101.954C81.2087 114.198 96.6575 121.286 112.449 121.286C123.633 121.286 134.423 117.755 143.435 111.139L147.975 123.86C136.634 132.148 123.003 136.631 109.049 136.631C89.3499 136.631 70.0825 127.781 57.8385 112.502C45.5944 97.2239 42.0601 77.4475 48.7351 61.2721C55.4101 45.0968 71.2618 34.8138 89.9678 34.8138H97.1066C109.914 34.8138 122.33 39.206 131.543 47.214C140.231 54.7738 144.757 65.9928 143.513 77.1066C142.378 87.2625 136.195 95.5398 127.279 99.4182C122.181 83.2103 109.914 71.5919 94.6644 71.5919C84.3411 71.5919 74.8967 77.4891 70.3667 86.745C65.8367 95.9972 66.8653 107.039 73.0112 115.174C79.1572 123.309 89.5085 127.845 99.6469 127.845C112.923 127.845 124.636 120.73 129.743 109.845C133.729 111.536 137.917 112.433 142.146 112.433C142.441 112.433 142.736 112.433 143.031 112.433C136.216 110.15 130.643 105.798 126.85 100.201C120.443 110.217 109.914 115.8 97.1066 115.8C76.4716 115.8 61.6429 102.396 61.6429 80.8931C61.6429 59.3902 76.4716 45.9863 97.1066 45.9863C97.2584 45.9863 97.4101 45.9863 97.5619 45.9863C121.282 46.1463 135.848 60.7786 137.33 86.8451C138.181 87.2104 139.021 87.5919 139.848 87.9883H141.537Z" />
        </svg>
      ),
      url: `https://threads.net/@${username}`,
      appUrl: `threads://user?username=${username}`
    }
  ];

  const handleSocialClick = (item: typeof socialLinks[0], e: React.MouseEvent) => {
    e.preventDefault();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && item.appUrl) {
      window.location.href = item.appUrl;
      setTimeout(() => {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      }, 500);
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="mt-12 w-full backdrop-blur-xl bg-slate-50/95 text-slate-700 border-t border-slate-200 dark:bg-slate-900/95 dark:text-slate-300 dark:border-slate-800 pt-8 pb-32 sm:pb-36 px-4 sm:px-6 lg:px-10 relative z-20">
      <div className="w-full space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <Logo size="md" showTagline={true} className="text-slate-900 dark:text-white" lightText={false} avatarUrl={effectiveAvatar} />
            <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-md">
              Vishal Portfolio is your leading AI Super App, empowering households, students, and professionals with practical tools, smart budgeting, generic medicine savings, BCA notes & logo design, and government scheme guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-orange-600 dark:text-amber-400">
                Creator & Founder
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Vishal Kumar Yadav
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300">
                Made with ❤️ for Bharat • BCA Student & Innovator
              </span>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-xs sm:text-sm">
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-amber-300 mb-2.5">
              About
            </h4>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li><a href="#about" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Our Mission</a></li>
              <li><a href="#features" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Vyron AI Engine</a></li>
              <li><a href="#impact" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Bharat Impact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-amber-300 mb-2.5">
              Legal
            </h4>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li><a href="#privacy" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Terms of Service</a></li>
              <li><a href="#disclaimer" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Medical & Financial Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-amber-300 mb-2.5">
              Modules
            </h4>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
              <li><a href="#money" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Money Manager</a></li>
              <li><a href="#jugaad" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Jugaad Fix</a></li>
              <li><a href="#medicine" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Sasti Dawai</a></li>
              <li><a href="#yojna" className="hover:text-orange-600 dark:hover:text-amber-300 transition-colors">Meri Yojna</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-amber-300 mb-2.5">
              Contact
            </h4>
            <ul className="space-y-1.5">
              <li className="text-slate-700 dark:text-slate-300">Email: bk372.in@gmail.com</li>
              <li className="text-slate-700 dark:text-slate-300">Support: 24/7 AI Chat</li>
              <li className="text-slate-700 dark:text-slate-300">Handle: @mr_vishal372</li>
            </ul>
          </div>
        </div>

        {/* Social Icons Bar: Left-Aligned Header + Compact Row of Real Brand Logo Buttons */}
        <div className="pt-2 flex flex-col items-start gap-2.5 w-full">
          <div className="text-xs font-semibold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
            <span>Connect with Creator</span>
            <span className="font-mono text-orange-600 dark:text-amber-400 font-bold">@mr_vishal372</span>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 sm:gap-2.5 w-full">
            {socialLinks.map((item) => (
              <button
                key={item.name}
                onClick={(e) => handleSocialClick(item, e)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shrink-0 ${item.tileClass}`}
                title={`Open ${item.name} (@mr_vishal372)`}
                aria-label={`Open ${item.name} app`}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-left sm:text-center text-[11px] text-slate-700 dark:text-slate-300 pt-1">
          © {new Date().getFullYear()} Vishal Portfolio by Vyron AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
