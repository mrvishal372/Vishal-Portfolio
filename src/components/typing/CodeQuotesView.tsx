import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Quote, 
  FileText, 
  Play, 
  Terminal, 
  Sparkles, 
  Copy, 
  Check, 
  Layers,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { 
  TYPING_CODE_SNIPPETS, 
  TYPING_QUOTES, 
  TYPING_TEXTS 
} from '../modules/typing/typingData';

interface CodeQuotesViewProps {
  onSelectText: (text: string, title: string, mode: 'code' | 'quote' | 'bca' | 'custom') => void;
}

export const CodeQuotesView: React.FC<CodeQuotesViewProps> = ({ onSelectText }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'quotes' | 'bca' | 'custom'>('code');
  const [customInput, setCustomInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleStartCustom = () => {
    if (!customInput.trim()) return;
    onSelectText(customInput.trim(), 'Custom Practice Text', 'custom');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer Syntax & Literature Laboratory</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Code Snippets, Classic Quotes & Custom Texts
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Condition your fingers for authentic syntax: curly braces, arrow functions, SQL queries, Python generators, and timeless philosophical quotes.
          </p>
        </div>
      </div>

      {/* Sub Mode Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-full overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('code')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === 'code'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 shrink-0" />
          <span>Programming Snippets</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotes')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === 'quotes'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Quote className="w-3.5 h-3.5 shrink-0" />
          <span>Famous Quotes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bca')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === 'bca'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 shrink-0" />
          <span>BCA & CS Definitions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            activeTab === 'custom'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>Custom Text</span>
        </button>
      </div>

      {/* Tab 1: Code Snippets */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TYPING_CODE_SNIPPETS.map((snippet, idx) => (
            <div
              key={snippet.name}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-mono">
                    {snippet.language}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {snippet.name}
                  </span>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-relaxed overflow-x-auto max-h-40 border border-slate-800">
                  <code>{snippet.code}</code>
                </pre>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectText(snippet.code, snippet.name, 'code')}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Practice Snippet</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Quotes */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TYPING_QUOTES.map((q, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sky-500">
                  <Quote className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {q.length} Quote
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic leading-relaxed">
                  "{q.text}"
                </p>

                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  — {q.author}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectText(q.text, `${q.author} Quote`, 'quote')}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Practice Quote</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: BCA & Computer Science Definitions */}
      {activeTab === 'bca' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TYPING_TEXTS.bca.map((def, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                    BCA Syllabus #{idx + 1}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  {def}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onSelectText(def, `BCA Concept #${idx + 1}`, 'bca')}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Type Concept</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Custom Text Input */}
      {activeTab === 'custom' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Type Your Own Custom Passage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Paste homework passages, articles, interview answers, or legal drafts to test your typing speed on your own material.
            </p>
          </div>

          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Paste or type any paragraph here (minimum 10 words recommended)..."
            rows={6}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 resize-y"
          />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{customInput.trim().split(/\s+/).filter(Boolean).length} words · {customInput.length} characters</span>
            
            <button
              type="button"
              disabled={!customInput.trim()}
              onClick={handleStartCustom}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Custom Typing Test</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
