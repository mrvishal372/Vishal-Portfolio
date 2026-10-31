import React, { useState, useMemo, memo } from 'react';
import { UserProfile, ModuleId } from '../types';
import { Search, X, Mic, ArrowRight, Utensils, Pill, GraduationCap, Building2, Wallet, Lightbulb, Sparkles } from 'lucide-react';
import { VoiceListener } from '../lib/voice';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSelectModule: (module: ModuleId, initialQuery?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = memo(({
  isOpen,
  onClose,
  profile,
  onSelectModule
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listener] = useState(() => new VoiceListener());

  const trimmedTerm = searchTerm.trim().toLowerCase();

  // Search results filtered across stored user data memoized
  const filteredRecipes = useMemo(() => {
    if (!trimmedTerm) return [];
    return profile.savedRecipes.filter(
      (r) => r.title.toLowerCase().includes(trimmedTerm) || r.ingredients.some(i => i.toLowerCase().includes(trimmedTerm))
    );
  }, [profile.savedRecipes, trimmedTerm]);

  const filteredMedicines = useMemo(() => {
    if (!trimmedTerm) return [];
    return profile.savedMedicines.filter(
      (m) => m.brandName.toLowerCase().includes(trimmedTerm) || m.saltName.toLowerCase().includes(trimmedTerm)
    );
  }, [profile.savedMedicines, trimmedTerm]);

  const filteredSchemes = useMemo(() => {
    if (!trimmedTerm) return [];
    return profile.savedSchemes.filter(
      (s) => s.title.toLowerCase().includes(trimmedTerm) || s.benefits.toLowerCase().includes(trimmedTerm)
    );
  }, [profile.savedSchemes, trimmedTerm]);

  const filteredBookmarks = useMemo(() => {
    if (!trimmedTerm) return [];
    return profile.bookmarks.filter(
      (b) => b.title.toLowerCase().includes(trimmedTerm) || b.summary.toLowerCase().includes(trimmedTerm)
    );
  }, [profile.bookmarks, trimmedTerm]);

  if (!isOpen) return null;

  const handleStartVoice = () => {
    if (isListening) {
      listener.stop();
      setIsListening(false);
      return;
    }
    listener.start(
      (text) => {
        setIsListening(false);
        setSearchTerm(text);
      },
      (err) => {
        setIsListening(false);
        alert(`Voice search error: ${err}`);
      },
      profile.language
    );
    setIsListening(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 backdrop-blur-md bg-slate-950/60 animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-2xl rounded-3xl p-6 relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Bar Input */}
        <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipes, medicines, schemes, study notes, or jugaads..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleStartVoice}
            className={`p-2 rounded-full mr-2 transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50'
            }`}
            title="Voice Search"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Direct Module Action Shortcuts */}
          {searchTerm && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search in AI Modules</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => { onSelectModule('cimage-logo', searchTerm); onClose(); }}
                  className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between text-left hover:scale-[1.02] transition-transform col-span-2 sm:col-span-3 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>CIMAGE BCA Logo Maker AI Studio</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  onClick={() => { onSelectModule('jugaad', searchTerm); onClose(); }}
                  className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                    <Lightbulb className="w-4 h-4 text-[#FF9933]" />
                    <span>Jugaad Fix</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  onClick={() => { onSelectModule('recipe', searchTerm); onClose(); }}
                  className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 flex items-center justify-between text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-900 dark:text-orange-300">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <span>Aaj Kya Banaoo</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-500" />
                </button>

                <button
                  onClick={() => { onSelectModule('medicine', searchTerm); onClose(); }}
                  className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    <Pill className="w-4 h-4 text-[#138808]" />
                    <span>Sasti Dawai</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </button>

                <button
                  onClick={() => { onSelectModule('study', searchTerm); onClose(); }}
                  className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-300">
                    <GraduationCap className="w-4 h-4 text-[#000080] dark:text-sky-400" />
                    <span>Last Night Padhai</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </button>

                <button
                  onClick={() => { onSelectModule('yojna', searchTerm); onClose(); }}
                  className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 dark:text-purple-300">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Meri Yojna</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-500" />
                </button>

                <button
                  onClick={() => { onSelectModule('money', searchTerm); onClose(); }}
                  className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    <Wallet className="w-4 h-4 text-[#138808]" />
                    <span>Money Manager</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </button>
              </div>
            </div>
          )}

          {/* Matches in Saved / Local Records */}
          {searchTerm && (
            <div className="space-y-4">
              {filteredRecipes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-orange-600 uppercase mb-2">Saved Recipes ({filteredRecipes.length})</h4>
                  <div className="space-y-2">
                    {filteredRecipes.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-white">{r.title}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300">Time: {r.prepTime} • {r.diet}</p>
                        </div>
                        <button onClick={() => { onSelectModule('recipe'); onClose(); }} className="text-xs text-[#000080] dark:text-amber-400 font-semibold">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredMedicines.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-emerald-600 uppercase mb-2">Saved Medicines ({filteredMedicines.length})</h4>
                  <div className="space-y-2">
                    {filteredMedicines.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-white">{m.brandName}</p>
                          <p className="text-xs text-emerald-600">Generic: {m.genericAlternative} (Save {m.savingsPercentage}%)</p>
                        </div>
                        <button onClick={() => { onSelectModule('medicine'); onClose(); }} className="text-xs text-[#000080] dark:text-amber-400 font-semibold">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredSchemes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-purple-600 uppercase mb-2">Govt Schemes ({filteredSchemes.length})</h4>
                  <div className="space-y-2">
                    {filteredSchemes.map((s) => (
                      <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-white">{s.title}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{s.benefits}</p>
                        </div>
                        <button onClick={() => { onSelectModule('yojna'); onClose(); }} className="text-xs text-[#000080] dark:text-amber-400 font-semibold">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredBookmarks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-600 uppercase mb-2">Saved Jugaad Hacks ({filteredBookmarks.length})</h4>
                  <div className="space-y-2">
                    {filteredBookmarks.map((b) => (
                      <div key={b.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-sm text-slate-800 dark:text-white">{b.title}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{b.summary}</p>
                        </div>
                        <button onClick={() => { onSelectModule('jugaad'); onClose(); }} className="text-xs text-[#000080] dark:text-amber-400 font-semibold">View</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">Type keywords or use voice search to query all modules simultaneously.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['CIMAGE BCA Logo', 'BCA Batch 1', 'BCA 3rd Sem', 'Dolo 650', 'PM Kisan', 'SSC CGL 2026', 'Leftover Roti', 'Monthly Budget'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-[#000080] dark:hover:text-amber-300"
                  >
                    🔍 {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
