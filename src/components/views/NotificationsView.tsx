import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem, Language } from '../../types';
import { Bell, CheckCheck, Trash2, Clock, AlertTriangle, Pill, Lightbulb, Building2 } from 'lucide-react';
import { AlertsHeaderAnimation } from '../TabHeroAnimations';
import { SwipeToDeleteItem } from '../common/SwipeToDeleteItem';
import { ScrollReveal } from '../common/ScrollReveal';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onUpdateNotifications: (notifs: NotificationItem[]) => void;
  language?: Language;
}

export const NotificationsView: React.FC<NotificationsViewProps> = React.memo(({
  notifications,
  onUpdateNotifications,
  language = 'en'
}) => {
  const isHi = language === 'hi';

  const markAllRead = () => {
    onUpdateNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    onUpdateNotifications([]);
  };

  const deleteNotification = (id: string) => {
    onUpdateNotifications(notifications.filter((n) => n.id !== id));
  };

  const toggleRead = (id: string) => {
    onUpdateNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'reminder':
        return <Pill className="w-5 h-5 text-amber-500" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-[#FF9933]" />;
      case 'scheme':
        return <Building2 className="w-5 h-5 text-[#000080] dark:text-sky-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />;
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Header */}
      <ScrollReveal cascadeIndex={0}>
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
          <AlertsHeaderAnimation />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-600 dark:text-[#FF9933]" />
              <span>{isHi ? 'अलर्ट और सूचनाएं' : 'Alerts & Notifications'}</span>
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
              {isHi ? 'फॉर्म की अंतिम तिथि, दवा अलार्म और उपयोगी टिप्स' : 'Form deadline reminders, dosage alarms & daily Jugaad tips'}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <button 
              onClick={markAllRead}
              className="px-3 py-1.5 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-semibold text-slate-700 dark:text-white backdrop-blur-md border border-slate-900/10 dark:border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isHi ? 'पढ़ा हुआ' : 'Mark Read'}</span>
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/30 border border-rose-200 dark:border-rose-400/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isHi ? 'सभी हटाएं' : 'Clear All'}</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Notifications Feed */}
      <AnimatePresence>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {notifications.map((item, idx) => (
            <ScrollReveal key={item.id} cascadeIndex={1 + Math.min(idx, 8)}>
              <SwipeToDeleteItem
                id={item.id}
                onDelete={deleteNotification}
                language={language}
                confirmTitle={isHi ? 'अलर्ट हटाएं?' : 'Delete Alert?'}
                confirmMessage={isHi ? 'क्या आप इस सूचना को हटाना चाहते हैं?' : 'Are you sure you want to remove this notification?'}
              >
                <div
                  onClick={() => toggleRead(item.id)}
                  className={`relative cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3.5 overflow-hidden group ${
                    item.read
                      ? 'bg-gradient-to-br from-white/60 via-amber-50/20 to-blue-50/20 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-[#000080]/10 backdrop-blur-md border-2 border-slate-200 dark:border-slate-800 opacity-80'
                      : 'bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md'
                  }`}
                >
                  <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 relative z-10">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 relative z-10 pr-6 sm:pr-8">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-bold ${item.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" /> {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              </SwipeToDeleteItem>
            </ScrollReveal>
          ))}

          {notifications.length === 0 && (
            <ScrollReveal cascadeIndex={1} className="col-span-full">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center text-slate-700 dark:text-slate-300 text-sm bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-md"
              >
                {isHi ? 'अभी कोई नया अलर्ट नहीं है।' : 'No active notifications right now.'}
              </motion.div>
            </ScrollReveal>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
});
