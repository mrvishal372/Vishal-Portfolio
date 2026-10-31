import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Trophy, 
  Target, 
  Clock, 
  Flame, 
  Download, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  Activity,
  Layers
} from 'lucide-react';

export interface SavedTypingRecord {
  id: string;
  date: string;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  timeSeconds: number;
  testMode: string;
}

export const AnalyticsView: React.FC = () => {
  const [records, setRecords] = useState<SavedTypingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vyron_typing_history_v2');
      if (saved) return JSON.parse(saved);
      // Sample starter records if empty
      return [
        {
          id: 'rec_1',
          date: 'Today, 10:15 AM',
          netWpm: 46,
          rawWpm: 49,
          accuracy: 96,
          consistency: 84,
          timeSeconds: 60,
          testMode: 'Time 60s'
        },
        {
          id: 'rec_2',
          date: 'Yesterday, 4:20 PM',
          netWpm: 42,
          rawWpm: 45,
          accuracy: 94,
          consistency: 80,
          timeSeconds: 30,
          testMode: 'Time 30s'
        }
      ];
    } catch {
      return [];
    }
  });

  // Calculate aggregates
  const totalTests = records.length;
  const bestWpm = records.length ? Math.max(...records.map((r) => r.netWpm)) : 0;
  const avgWpm = records.length ? Math.round(records.reduce((acc, r) => acc + r.netWpm, 0) / records.length) : 0;
  const avgAccuracy = records.length ? Math.round(records.reduce((acc, r) => acc + r.accuracy, 0) / records.length) : 0;
  const totalMinutes = Math.round(records.reduce((acc, r) => acc + (r.timeSeconds || 30), 0) / 60);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vyron_typing_stats_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your typing test history?")) {
      setRecords([]);
      localStorage.removeItem('vyron_typing_history_v2');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 text-sky-300 text-xs font-bold border border-sky-400/30">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Personal Performance Analytics</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Typing Velocity & Accuracy Telemetry
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Monitor your personal progression across sessions. Measure rhythm stability, identify persistent weak keys, and export test benchmarks.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Highest Speed</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400 tracking-tight tabular-nums mt-1">
            {bestWpm} <span className="text-xs font-bold text-slate-400">WPM</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Personal all-time record
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Average Speed</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums mt-1">
            {avgWpm} <span className="text-xs font-bold text-slate-400">WPM</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Across {totalTests} sessions
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>Average Accuracy</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums mt-1">
            {avgAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Precision benchmark
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>Practice Time</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-200 tracking-tight tabular-nums mt-1">
            {totalMinutes} <span className="text-xs font-bold text-slate-400">mins</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Active keyboarding
          </div>
        </div>
      </div>

      {/* Historical Test Sessions Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent Typing Test Sessions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified local test logs stored securely on your browser.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            {records.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Net WPM</th>
                  <th className="py-2.5 px-3">Raw WPM</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Consistency</th>
                  <th className="py-2.5 px-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-sans">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-sans font-bold">
                        {r.testMode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">
                      {r.netWpm}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.rawWpm}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {r.accuracy}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.consistency}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {r.timeSeconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            No test records saved yet. Complete a test in the Test tab to log your first benchmark!
          </div>
        )}
      </div>
    </div>
  );
};
