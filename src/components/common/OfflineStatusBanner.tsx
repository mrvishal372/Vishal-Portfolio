import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff, Wifi, Database, CheckCircle2, X } from 'lucide-react';
import { getOfflineStorageStats } from '../../lib/offlineStorage';

export const OfflineStatusBanner: React.FC<{ language?: 'en' | 'hi' }> = ({ language = 'en' }) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [prevStatus, setPrevStatus] = useState<boolean>(true);
  const isHi = language === 'hi';

  const stats = getOfflineStorageStats();

  useEffect(() => {
    if (prevStatus === false && isOnline === true) {
      setShowReconnected(true);
      setDismissed(false);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    setPrevStatus(isOnline);
  }, [isOnline, prevStatus]);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (dismissed && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="fixed top-18 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-950/20 text-xs font-semibold backdrop-blur-lg border border-emerald-400/40 animate-fade-in">
        <Wifi className="w-4 h-4 text-emerald-200 animate-pulse" />
        <span>{isHi ? 'इंटरनेट वापस जुड़ गया! डेटा सिंक हो गया है।' : 'Back Online — Cloud sync resumed.'}</span>
        <CheckCircle2 className="w-4 h-4 text-emerald-200 ml-1" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white shadow-2xl text-xs font-medium backdrop-blur-xl border border-amber-400/40 flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-xl bg-amber-500/30 flex items-center justify-center shrink-0">
          <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-amber-100 flex items-center gap-1.5">
            <span>{isHi ? 'ऑफ़लाइन मोड सक्रिय' : 'Offline Mode Active'}</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono">
              <Database className="w-2.5 h-2.5" />
              {stats.medicinesCount} meds • {stats.recipesCount} recipes
            </span>
          </p>
          <p className="text-[11px] text-amber-200/90 truncate">
            {isHi 
              ? 'दवाइयों की कीमतें और किचन रेसिपी ऑफलाइन उपलब्ध हैं।' 
              : 'Generic medicine prices & recipe templates remain fully accessible.'}
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0 ml-1"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
