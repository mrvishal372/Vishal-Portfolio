import React, { useState, useMemo, memo } from 'react';
import { UserProfile, MedicineItem, MedicineReminder } from '../../types';
import { 
  Pill, 
  Search, 
  Sparkles, 
  Bell, 
  Plus, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  WifiOff, 
  Database,
  Filter,
  Check
} from 'lucide-react';
import { AISolutionSkeleton } from '../skeletons/ModuleSkeleton';
import { SwipeToDeleteItem } from '../common/SwipeToDeleteItem';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { 
  getOfflineMedicines, 
  searchOfflineMedicines, 
  generateOfflineMedicineResponse, 
  cacheAiQuery, 
  getCachedAiQuery 
} from '../../lib/offlineStorage';
import { CachedMedicineItem } from '../../lib/offlineModuleData';

interface SastiDawaiProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  initialQuery?: string;
}

export const SastiDawai: React.FC<SastiDawaiProps> = memo(({ profile, onUpdateProfile, initialQuery = '' }) => {
  const isHi = profile.language === 'hi';
  const isOnline = useOnlineStatus();
  
  const [medicineSearch, setMedicineSearch] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [isResultFromCache, setIsResultFromCache] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // New Medicine Alarm state
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('1 Tablet');
  const [time, setTime] = useState('09:00');

  // Load 18+ offline medicines from local storage / catalog
  const offlineMedicines = useMemo(() => getOfflineMedicines(), []);

  // Filtered medicines by search input and category
  const filteredMedicines = useMemo(() => {
    let list = offlineMedicines;
    if (medicineSearch.trim()) {
      list = searchOfflineMedicines(medicineSearch);
    }
    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    return list;
  }, [offlineMedicines, medicineSearch, selectedCategory]);

  const categories = useMemo(() => [
    { id: 'all', label: isHi ? 'सभी दवाएं' : 'All Medicines' },
    { id: 'Fever', label: isHi ? 'बुखार व दर्द' : 'Fever & Pain' },
    { id: 'Acidity', label: isHi ? 'गैस व एसिडिटी' : 'Acidity & Gas' },
    { id: 'Allergy', label: isHi ? 'एलर्जी व जुकाम' : 'Allergy & Cold' },
    { id: 'Antibiotic', label: isHi ? 'एंटीबायोटिक' : 'Antibiotics' },
    { id: 'Diabetes', label: isHi ? 'शुगर / डायबिटीज' : 'Diabetes' },
    { id: 'Cardiac', label: isHi ? 'बीपी व हृदय' : 'BP & Heart' },
    { id: 'Vitamin', label: isHi ? 'विटामिन्स' : 'Vitamins' },
    { id: 'Pain Relief', label: isHi ? 'दर्द स्प्रे व जेल' : 'Pain Relief' },
  ], [isHi]);

  const handleSearchMedicine = async (queryText?: string) => {
    const textToSubmit = (queryText || medicineSearch).trim();
    if (!textToSubmit) return;

    setLoading(true);
    setAiResult('');
    setIsResultFromCache(false);

    // 1. If offline, immediately use offline storage logic
    if (!navigator.onLine) {
      setTimeout(() => {
        const cachedResponse = generateOfflineMedicineResponse(textToSubmit, profile.language);
        setAiResult(cachedResponse);
        setIsResultFromCache(true);
        setLoading(false);
      }, 250);
      return;
    }

    // 2. Check client-side cached AI query
    const cachedPrevious = getCachedAiQuery('medicine', textToSubmit);
    if (cachedPrevious) {
      setAiResult(cachedPrevious);
      setIsResultFromCache(true);
      setLoading(false);
      return;
    }

    // 3. Online fetch with resilient fallback
    try {
      const res = await fetch('/api/ai/medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineName: textToSubmit,
          language: profile.language
        })
      });
      const data = await res.json();
      if (data.result) {
        setAiResult(data.result);
        setIsResultFromCache(Boolean(data.isOffline));
        cacheAiQuery('medicine', textToSubmit, data.result);
      } else {
        throw new Error('Could not fetch substitute details.');
      }
    } catch (err: any) {
      // Graceful offline fallback
      const offlineFallback = generateOfflineMedicineResponse(textToSubmit, profile.language);
      setAiResult(offlineFallback);
      setIsResultFromCache(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPredefinedMedicine = (med: CachedMedicineItem) => {
    setMedicineSearch(med.brandName);
    handleSearchMedicine(med.brandName);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !time) return;

    const newReminder: MedicineReminder = {
      id: 'rem_' + Date.now(),
      medicineName: medName,
      dosage,
      time,
      days: ['Daily'],
      active: true
    };

    onUpdateProfile({
      savedReminders: [newReminder, ...profile.savedReminders]
    });

    setMedName('');
    setShowReminderModal(false);
  };

  const handleDeleteReminder = (id: string) => {
    onUpdateProfile({
      savedReminders: profile.savedReminders.filter((r) => r.id !== id)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner with Offline Resilience Indicator */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#138808] via-[#0f766e] to-[#000080] text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
            <Pill className="w-3.5 h-3.5" />
            <span>{isHi ? 'जेनेरिक दवा व मूल्य बचत कैलकुलेटर' : 'Generic Substitute & Price Savings Calculator'}</span>
          </div>

          {/* Storage & Connectivity Badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md ${
            isOnline 
              ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-300/30' 
              : 'bg-amber-500/40 text-amber-100 border border-amber-300/40'
          }`}>
            {isOnline ? (
              <>
                <Database className="w-3 h-3 text-emerald-200" />
                <span>{isHi ? '18+ दवाइयां ऑफलाइन कैश्ड' : '18+ Medicines Cached Offline'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-200" />
                <span>{isHi ? 'ऑफ़लाइन मोड (कैश सक्रिय)' : 'Offline Mode (Device Storage)'}</span>
              </>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{isHi ? 'सस्ती दवाई' : 'Sasti Dawai'}</h2>
        <p className="text-sm text-slate-100 mt-1">
          {isHi 
            ? 'प्रधानमंत्री जन औषधि जेनेरिक दवाओं की खोज करें और 80-90% तक की बचत करें। इंटरनेट न होने पर भी पूरी तरह चालू!' 
            : 'Discover Jan Aushadhi generic alternatives & save up to 80-90% on medical expenses. Fully functional offline!'}
        </p>

        {/* Medicine Search Bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={medicineSearch}
              onChange={(e) => setMedicineSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchMedicine()}
              placeholder={isHi ? 'ब्रांडेड दवा या बीमारी खोजें (उदा. Dolo 650, Pan 40, Allegra, बुखार, एसिडिटी)...' : 'Enter brand name or condition (e.g., Dolo 650, Pan 40, Allegra, Fever, BP)...'}
              className="w-full px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/40 dark:backdrop-blur-xl/95 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md"
            />
            {medicineSearch && (
              <button
                onClick={() => setMedicineSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearchMedicine()}
            disabled={!medicineSearch.trim() || loading}
            className="px-6 py-3 rounded-2xl bg-[#FF9933] hover:bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all hover:scale-105 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isHi ? 'खोजें' : 'Search'}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white/90'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Medicine Breakdown Result */}
      {loading ? (
        <AISolutionSkeleton />
      ) : aiResult ? (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
              <Sparkles className="w-5 h-5 text-[#FF9933]" />
              <span>Vyron AI Generic Medicine Analysis</span>
            </div>
            {isResultFromCache && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#138808] dark:text-emerald-400 text-[11px] font-bold">
                <Database className="w-3 h-3" />
                {isHi ? 'डिवाइस कैश से लोड' : 'Loaded from Device Cache'}
              </span>
            )}
          </div>
          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere] min-w-0 w-full overflow-hidden">
            {aiResult}
          </div>
        </div>
      ) : null}

      {/* Generic Price Savings Comparisons (Loaded from Offline Storage) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <span>💰 {isHi ? 'ब्रांडेड बनाम जन औषधि मूल्य तुलना' : 'Popular Brand vs Jan Aushadhi Savings'}</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredMedicines.length} {isHi ? 'दवाइयां उपलब्ध' : 'medicines'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMedicines.map((med) => (
            <div 
              key={med.id} 
              onClick={() => handleSelectPredefinedMedicine(med)}
              className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-3 hover:border-[#138808] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isHi && med.categoryHi ? med.categoryHi : med.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#138808] dark:text-emerald-400 font-bold text-xs">
                  Save {med.savingsPercentage}%
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#138808] transition-colors">
                  {med.brandName}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">Salt: {med.saltName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {isHi && med.useCaseHi ? med.useCaseHi : med.useCase}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">BRAND PRICE:</span>
                  <strong className="text-rose-600 dark:text-rose-400 text-sm">₹{med.priceBrand}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">JAN AUSHADHI GENERIC:</span>
                  <strong className="text-[#138808] dark:text-emerald-400 text-sm">₹{med.priceGeneric}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-medium truncate">
                  <CheckCircle2 className="w-4 h-4 text-[#138808] shrink-0" />
                  <span className="truncate">{med.genericAlternative}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMedName(med.brandName);
                    setShowReminderModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-[#000080] dark:text-blue-300 text-[10px] font-bold hover:bg-blue-100 transition-colors shrink-0 flex items-center gap-1"
                >
                  <Bell className="w-3 h-3" />
                  <span>{isHi ? 'अलार्म' : 'Alarm'}</span>
                </button>
              </div>
            </div>
          ))}

          {filteredMedicines.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>{isHi ? 'इस नाम से कोई कैश्ड दवाई नहीं मिली।' : 'No matching cached medicine found.'}</p>
              <button
                onClick={() => { setMedicineSearch(''); setSelectedCategory('all'); }}
                className="mt-2 text-xs text-[#138808] font-bold underline"
              >
                {isHi ? 'सभी दवाएं देखें' : 'View all cached medicines'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Medicine Reminder Scheduler (Persisted Offline in LocalStorage) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Bell className="w-5 h-5 text-[#FF9933]" />
            <span>{isHi ? 'दवा खुराक अलार्म (ऑफलाइन सुरक्षित)' : 'Daily Dosage Medicine Alarm (Offline Safe)'}</span>
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#000080] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-900 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isHi ? 'अलार्म जोड़ें' : 'Add Alarm'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {profile.savedReminders.map((rem) => (
            <SwipeToDeleteItem
              key={rem.id}
              id={rem.id}
              onDelete={handleDeleteReminder}
              language={profile.language}
              confirmTitle={isHi ? 'अलार्म हटाएं?' : 'Delete Alarm?'}
              confirmMessage={isHi ? `क्या आप "${rem.medicineName}" का अलार्म हटाना चाहते हैं?` : `Are you sure you want to delete the alarm for "${rem.medicineName}"?`}
            >
              <div className="py-3 px-3 sm:px-4 flex items-center justify-between border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/90">
                <div className="flex items-center gap-3 pr-6 sm:pr-8">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-[#FF9933] flex items-center justify-center font-bold shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{rem.medicineName}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{rem.dosage} • {isHi ? 'समय:' : 'Time:'} {rem.time}</p>
                  </div>
                </div>
              </div>
            </SwipeToDeleteItem>
          ))}

          {profile.savedReminders.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-700 dark:text-slate-300">
              {isHi ? 'कोई सक्रिय दवाई अलार्म नहीं है।' : 'No active medicine alarms set.'}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>{isHi ? 'चिकित्सा अस्वीकरण:' : 'Medical Disclaimer:'}</strong> {isHi ? 'सस्ती दवाई केवल सूचना और मूल्य शिक्षा उपकरण है। किसी भी दवा को बदलने से पहले हमेशा योग्य डॉक्टर या फार्मासिस्ट से परामर्श लें।' : 'Sasti Dawai is an information & price educational tool. Always consult a certified MBBS doctor or registered pharmacist before switching or altering prescribed dosages.'}
        </p>
      </div>

      {/* Add Dose Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/60">
          <div className="w-full max-w-md bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              {isHi ? 'दवा अलार्म जोड़ें' : 'Add Medicine Alarm'}
            </h3>
            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isHi ? 'दवाई का नाम' : 'Medicine Name'}
                </label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder={isHi ? 'उदा. मल्टीविटामिन, बीपी टैबलेट' : 'e.g. Multivitamin, BP tablet, Crocin'}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#138808]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isHi ? 'खुराक' : 'Dosage'}
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder={isHi ? '1 गोली भोजन के बाद' : '1 Tablet after meal'}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#138808]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isHi ? 'समय' : 'Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#138808]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#138808] hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  {isHi ? 'सहेजें' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});
