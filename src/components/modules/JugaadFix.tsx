import React, { useState } from 'react';
import { UserProfile, JugaadItem } from '../../types';
import { Lightbulb, Search, Sparkles, Bookmark, Volume2, VolumeX, ShieldAlert, CheckCircle2, Loader2, ThumbsUp, Copy } from 'lucide-react';
import { speakText, stopSpeech } from '../../lib/voice';
import { AISolutionSkeleton } from '../skeletons/ModuleSkeleton';

interface JugaadFixProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  initialQuery?: string;
}

const popularHacksList: JugaadItem[] = [
  {
    id: 'j1',
    title: 'Fix Leaky Plastic Bucket with Hot Spoon & Bottle Cap',
    category: 'Household Repair',
    summary: 'Melt a scrap piece of HDPE plastic bottle cap over the pinhole leak using a warm metal spoon for an airtight seal.',
    materials: ['Scrap bottle cap', 'Old metal spoon', 'Candle/Lighter'],
    steps: [
      'Dry the plastic surface completely.',
      'Warm the back of an old spoon gently over a flame.',
      'Press melted bottle cap plastic firmly over the leak.',
      'Smooth out edges with warm spoon and let harden for 60 seconds.'
    ],
    safetyNote: 'Do in a well-ventilated area away from cloth or curtains.',
    proTip: 'Dab cold water right after smoothing for instant curing!',
    likes: 542
  },
  {
    id: 'j2',
    title: 'Remove Dust from Ceiling Fan using Pillowcase (Zero Mess)',
    category: 'Cleaning Hack',
    summary: 'Slide a pillowcase over each fan blade and wipe inward so all accumulated dust drops inside the pillowcase instead of on your bed!',
    materials: ['Old pillowcase', 'Mild soapy spray'],
    steps: [
      'Turn off fan main switch.',
      'Slide pillowcase entirely over one blade.',
      'Press fabric against top and bottom of blade and pull back.',
      'Shake dust out of pillowcase into trash bag.'
    ],
    proTip: 'Spray mild softener inside pillowcase so dust repels in future!',
    likes: 890
  },
  {
    id: 'j3',
    title: 'Keep Green Chilies & Coriander Fresh for 3 Weeks',
    category: 'Kitchen Jugaad',
    summary: 'Remove stems from green chilies and store them inside a airtight box lined with dry kitchen paper towel.',
    materials: ['Airtight Tupperware', 'Kitchen towel paper'],
    steps: [
      'Pluck stems off all green chilies.',
      'Dry thoroughly if wet.',
      'Line container bottom with paper towel, add chilies, cover top with another paper layer.',
      'Refrigerate.'
    ],
    proTip: 'Stems absorb moisture and cause rot; plucking doubles shelf life!',
    likes: 1240
  }
];

export const JugaadFix: React.FC<JugaadFixProps> = React.memo(({ profile, onUpdateProfile, initialQuery = '' }) => {
  const isHi = profile.language === 'hi';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [aiSolution, setAiSolution] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const popularHacks = popularHacksList;

  const handleSolveJugaad = async (searchQuery?: string) => {
    const textToSubmit = searchQuery || query;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setAiSolution('');
    stopSpeech();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/ai/jugaad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSubmit,
          language: profile.language
        })
      });
      const data = await res.json();
      if (data.result) {
        setAiSolution(data.result);
      } else {
        setAiSolution('Unable to generate Jugaad Fix right now. Please try again.');
      }
    } catch (err: any) {
      setAiSolution(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (item: JugaadItem) => {
    const exists = profile.bookmarks.some((b) => b.id === item.id);
    if (exists) {
      onUpdateProfile({ bookmarks: profile.bookmarks.filter((b) => b.id !== item.id) });
    } else {
      onUpdateProfile({ bookmarks: [item, ...profile.bookmarks] });
    }
  };

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakText(text, profile.language).then(() => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FF9933] via-[#e68a00] to-[#000080] text-white shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 backdrop-blur-md">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{isHi ? 'घरेलू DIY रिपेयर और लाइफ हैक्स' : 'DIY Repair & Life Hacks Engine'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{isHi ? 'जुगाड़ फिक्स' : 'Jugaad Fix'}</h2>
        <p className="text-sm text-slate-100 mt-1">
          {isHi ? 'भारतीय घरों के लिए आसान, किफायती और तुरंत कारगर DIY समाधान।' : 'Instant, frugal, step-by-step DIY solutions for Indian households.'}
        </p>

        {/* Input Solver Box */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSolveJugaad()}
              placeholder={isHi ? 'समस्या लिखें (उदा. नल टपकना, कपड़े का जिद्दी दाग, पंखे की आवाज)...' : 'Describe what\'s broken (e.g. leaking tap, stained shirt, loose fan)...'}
              className="w-full px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/40 dark:backdrop-blur-xl/95 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md"
            />
          </div>
          <button
            onClick={() => handleSolveJugaad()}
            disabled={!query.trim() || loading}
            className="px-6 py-3 rounded-2xl bg-[#000080] hover:bg-blue-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all hover:scale-105 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
            <span>{isHi ? 'समाधान खोजें' : 'Solve'}</span>
          </button>
        </div>
      </div>

      {/* AI Solution Result Container */}
      {loading ? (
        <AISolutionSkeleton />
      ) : aiSolution ? (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF9933]" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isHi ? 'जुगाड़ समाधान' : 'Jugaad Solution'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSpeech(aiSolution)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#000080] dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer active:scale-95"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-[#138808]" />}
                <span>{isSpeaking ? (isHi ? 'रोकें' : 'Stop') : (isHi ? 'सुनें' : 'Listen')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(aiSolution)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                  isCopied
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                {isCopied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                <span>{isCopied ? (isHi ? 'कॉपी हुआ ✓' : 'Copied ✓') : (isHi ? 'कॉपी' : 'Copy')}</span>
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere] min-w-0 w-full overflow-hidden">
            {aiSolution}
          </div>
        </div>
      ) : null}

      {/* Pre-built Popular Hacks Feed */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
          <span>{isHi ? '🔥 लोकप्रिय घरेलू जुगाड़ हैक्स' : '🔥 Trending Household Jugaad Hacks'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularHacks.map((item) => {
            const isBookmarked = profile.bookmarks.some((b) => b.id === item.id);
            return (
              <div key={item.id} className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold">
                      {item.category}
                    </span>
                    <button
                      onClick={() => toggleBookmark(item)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isBookmarked ? 'text-[#FF9933] bg-amber-50 dark:bg-amber-950' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{item.summary}</p>

                  <div className="pt-2 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{isHi ? 'चरण:' : 'STEPS:'}</p>
                    <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      {item.steps.slice(0, 3).map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#138808] flex-shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.safetyNote && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-[11px] flex items-center gap-1.5 border border-rose-200/50">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>{item.safetyNote}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-[#138808]">
                    <ThumbsUp className="w-3.5 h-3.5" /> {item.likes} {isHi ? 'सत्यापित' : 'Verified'}
                  </span>
                  <button
                    onClick={() => {
                      setQuery(item.title);
                      handleSolveJugaad(item.title);
                    }}
                    className="font-bold text-[#000080] dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {isHi ? 'विवरण देखें →' : 'View →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
