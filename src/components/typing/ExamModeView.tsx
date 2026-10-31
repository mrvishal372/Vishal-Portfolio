import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  ShieldCheck, 
  Clock, 
  Target, 
  Play, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Lock,
  ChevronRight,
  FileCheck,
  X
} from 'lucide-react';
import { EXAM_PASSAGES } from '../modules/typing/typingData';

interface ExamModeViewProps {
  onStartExam: (passage: typeof EXAM_PASSAGES[0], durationSeconds: number, strictBackspace: boolean) => void;
  candidateName: string;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({ onStartExam, candidateName }) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(EXAM_PASSAGES[0].id);
  const [useSprintDuration, setUseSprintDuration] = useState<boolean>(true);
  const [strictBackspace, setStrictBackspace] = useState<boolean>(false);
  
  // Certificate Preview State
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certData, setCertData] = useState({
    name: candidateName || 'Vishal Kumar Yadav',
    examTitle: 'SSC CGL / CHSL Standard Typing Passage',
    netWpm: 48,
    rawWpm: 51,
    accuracy: 97.4,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    certId: `VYRON-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    status: 'QUALIFIED'
  });

  const selectedExam = EXAM_PASSAGES.find((e) => e.id === selectedExamId) || EXAM_PASSAGES[0];
  const activeDuration = useSprintDuration ? selectedExam.shortDurationSeconds : selectedExam.durationSeconds;

  const handleLaunch = () => {
    onStartExam(selectedExam, activeDuration, strictBackspace);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Government & University Exam Simulator</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Competitive Typing Speed & Accuracy Assessment
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Simulate authentic SSC CGL, CHSL, Banking Clerk, and BCA university typing examinations. Strict timing, penalty scoring, Net WPM deduction, and downloadable verified certificates.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Net WPM Formula: Gross WPM - (Mistakes / Time)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-400" />
              Verified Certificate of Competence
            </span>
          </div>
        </div>
      </div>

      {/* Exam Selection & Terminal Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Exam Modules List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-left">
            Select Examination Standard
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXAM_PASSAGES.map((exam) => {
              const isSelected = selectedExamId === exam.id;
              return (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {exam.examType}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      )}
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {exam.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {exam.passage}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Target: <strong className="text-sky-600 dark:text-sky-400 font-bold">{exam.targetWpm} WPM</strong></span>
                    <span>Min Acc: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{exam.minAccuracy}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Passage Preview Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Official Passage Transcript ({selectedExam.title})
              </span>
              <span className="text-slate-400 font-mono">
                {selectedExam.passage.split(/\s+/).length} words
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-serif italic leading-relaxed p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              "{selectedExam.passage}"
            </p>
          </div>
        </div>

        {/* Right: Exam Configuration & Launch Deck */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-left">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-500" />
              <span>Assessment Rules & Timing</span>
            </h2>

            {/* Duration Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Test Duration Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUseSprintDuration(true)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    useSprintDuration
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-base font-black tabular-nums">
                    {Math.floor(selectedExam.shortDurationSeconds / 60)} min
                  </div>
                  <div className="text-[10px] font-normal text-slate-400">Sprint Mode</div>
                </button>

                <button
                  type="button"
                  onClick={() => setUseSprintDuration(false)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                    !useSprintDuration
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-600 dark:text-sky-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-base font-black tabular-nums">
                    {Math.floor(selectedExam.durationSeconds / 60)} min
                  </div>
                  <div className="text-[10px] font-normal text-slate-400">Full Standard</div>
                </button>
              </div>
            </div>

            {/* Strict Backspace Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Strict Backspace Lock
                </span>
                <input
                  type="checkbox"
                  checked={strictBackspace}
                  onChange={(e) => setStrictBackspace(e.target.checked)}
                  className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                When enabled, backspace is disabled during the test to simulate real government examination terminals.
              </p>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={handleLaunch}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Official Exam Test</span>
            </button>

            {/* Certificate Sample Trigger */}
            <button
              type="button"
              onClick={() => setShowCertificateModal(true)}
              className="w-full py-2.5 rounded-xl border border-amber-400/40 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 hover:bg-amber-100/60 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Preview Sample Certificate</span>
            </button>
          </div>
        </div>

      </div>

      {/* Official Certificate Modal */}
      <AnimatePresence>
        {showCertificateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/80 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-10 border-4 border-amber-400/60 relative space-y-6"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowCertificateModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 transition-colors cursor-pointer print:hidden"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Inner Frame */}
              <div className="border-2 border-dashed border-amber-500/50 p-6 sm:p-8 rounded-2xl text-center space-y-5 bg-gradient-to-b from-amber-50/30 via-white to-amber-50/20 relative">
                
                {/* Certificate Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-amber-600 font-extrabold text-xs uppercase tracking-widest">
                    <Award className="w-4 h-4" />
                    <span>VYRON TYPING SPEED LABORATORY</span>
                    <Award className="w-4 h-4" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 uppercase">
                    Certificate of Competence
                  </h2>
                  <p className="text-xs text-slate-500 italic">
                    Official Verification ID: {certData.certId}
                  </p>
                </div>

                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />

                {/* Candidate Name */}
                <div className="space-y-1 py-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">This is proudly awarded to</p>
                  <div className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-wide font-serif underline decoration-amber-400/80 decoration-2 underline-offset-4">
                    {certData.name}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
                  for successfully completing the <strong>{certData.examTitle}</strong> and achieving qualifying typing speed and accuracy under standardized examination parameters.
                </p>

                {/* Performance Metrics Badges */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Net Speed</div>
                    <div className="text-2xl font-black text-sky-600">{certData.netWpm} WPM</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</div>
                    <div className="text-2xl font-black text-emerald-600">{certData.accuracy}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Result</div>
                    <div className="text-xl font-black text-amber-600">{certData.status}</div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="pt-6 border-t border-slate-200 flex items-end justify-between px-4 sm:px-10 text-xs">
                  <div className="text-left space-y-1">
                    <div className="font-serif italic font-bold text-indigo-900 text-sm">Vishal Kumar Yadav</div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-300 pt-1">Founder, Vyron AI</div>
                  </div>

                  {/* Gold Seal Graphic */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md flex items-center justify-center text-white">
                    <div className="w-full h-full rounded-full border border-amber-600 flex flex-col items-center justify-center text-[9px] font-black uppercase leading-none">
                      <Sparkles className="w-3.5 h-3.5 mb-0.5" />
                      <span>OFFICIAL</span>
                      <span>SEAL</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-mono text-slate-700 text-xs">{certData.date}</div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-300 pt-1">Assessment Date</div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
