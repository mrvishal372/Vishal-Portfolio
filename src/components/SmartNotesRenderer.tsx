import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles, Copy, Check, ChevronRight, BarChart2,
  GitCommit, ArrowRight, Layers, FileCode, ZoomIn, ZoomOut,
  HelpCircle, AlertTriangle, Lightbulb, Bookmark, CheckCircle2,
  Terminal, Maximize2, Minimize2
} from 'lucide-react';

interface SmartNotesRendererProps {
  content: string;
  isUser?: boolean;
  fontSize?: 'normal' | 'large' | 'xl';
}

interface DiagramStep {
  label: string;
  sub?: string;
  badge?: string;
}

export const SmartNotesRenderer: React.FC<SmartNotesRendererProps> = React.memo(({
  content,
  isUser = false,
  fontSize = 'large',
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, idx: number) => {
    try {
      navigator.clipboard.writeText(codeText);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    } catch {}
  };

  // Typography size styles based on fontSize mode ('normal' | 'large' | 'xl')
  // Default 'large' ensures mobile visibility from a distance (mobile me dur se padha sake)
  const sz = useMemo(() => {
    if (fontSize === 'xl') {
      return {
        userBubble: 'text-lg sm:text-xl leading-[1.85]',
        h1: 'text-2xl sm:text-3xl md:text-4xl font-black',
        h2: 'text-xl sm:text-2xl md:text-3xl font-black',
        h3: 'text-lg sm:text-xl md:text-2xl font-extrabold',
        callout: 'text-base sm:text-lg leading-[1.8] p-4 sm:p-5',
        paragraph: 'text-base sm:text-lg md:text-xl leading-[1.85]',
        bullet: 'text-base sm:text-lg md:text-xl leading-[1.85]',
        number: 'text-base sm:text-lg md:text-xl leading-[1.85]',
        badge: 'w-8 h-8 sm:w-9 sm:h-9 text-sm sm:text-base font-black',
        code: 'text-sm sm:text-base leading-relaxed',
        flowLabel: 'text-base sm:text-lg font-bold',
        flowSub: 'text-sm sm:text-base',
        chartLabel: 'text-base sm:text-lg font-bold',
        chartVal: 'text-base sm:text-lg font-bold',
        tableHeader: 'text-base sm:text-lg p-3.5',
        tableCell: 'text-base sm:text-lg p-3.5',
        inlineCode: 'text-sm sm:text-base',
      };
    }
    if (fontSize === 'normal') {
      return {
        userBubble: 'text-sm sm:text-base leading-relaxed',
        h1: 'text-base sm:text-lg md:text-xl font-black',
        h2: 'text-sm sm:text-base md:text-lg font-black',
        h3: 'text-xs sm:text-sm md:text-base font-extrabold',
        callout: 'text-xs sm:text-sm leading-relaxed p-3 sm:p-3.5',
        paragraph: 'text-xs sm:text-sm leading-relaxed',
        bullet: 'text-xs sm:text-sm leading-relaxed',
        number: 'text-xs sm:text-sm leading-relaxed',
        badge: 'w-6 h-6 text-xs font-bold',
        code: 'text-xs sm:text-sm leading-relaxed',
        flowLabel: 'text-xs sm:text-sm font-bold',
        flowSub: 'text-[11px] sm:text-xs',
        chartLabel: 'text-xs sm:text-sm font-bold',
        chartVal: 'text-xs sm:text-sm font-bold',
        tableHeader: 'text-xs sm:text-sm p-2.5',
        tableCell: 'text-xs sm:text-sm p-2.5',
        inlineCode: 'text-xs sm:text-sm',
      };
    }
    // Default 'large' — specifically tuned for mobile distance reading
    return {
      userBubble: 'text-base sm:text-[17px] md:text-lg leading-[1.75]',
      h1: 'text-xl sm:text-2xl md:text-3xl font-black',
      h2: 'text-lg sm:text-xl md:text-2xl font-black',
      h3: 'text-base sm:text-lg md:text-xl font-extrabold',
      callout: 'text-[15.5px] sm:text-base md:text-[17px] leading-[1.75] p-3.5 sm:p-4',
      paragraph: 'text-base sm:text-[17px] md:text-lg leading-[1.8]',
      bullet: 'text-base sm:text-[17px] md:text-lg leading-[1.8]',
      number: 'text-base sm:text-[17px] md:text-lg leading-[1.8]',
      badge: 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm font-black',
      code: 'text-xs sm:text-sm leading-relaxed',
      flowLabel: 'text-sm sm:text-base font-bold',
      flowSub: 'text-xs sm:text-sm',
      chartLabel: 'text-base font-bold',
      chartVal: 'text-sm sm:text-base font-bold',
      tableHeader: 'text-sm sm:text-base p-3',
      tableCell: 'text-sm sm:text-base p-3',
      inlineCode: 'text-xs sm:text-sm',
    };
  }, [fontSize]);

  // Helper to render inline text with rich bold colors, underlines, and emojis
  const renderRichInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Pattern matches:
    // 1. `code`
    // 2. <u>underline</u> or <ins>underline</ins>
    // 3. ==highlight==
    // 4. **bold**
    // 5. *italic*
    const tokenRegex = /(`[^`]+`|<u>[^<]+<\/u>|<ins>[^<]+<\/ins>|==[^=]+==|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Inline code `...`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={i}
            className={`px-2 py-0.5 mx-0.5 rounded-md font-mono ${sz.inlineCode} font-bold bg-purple-100/90 dark:bg-purple-950/70 text-purple-900 dark:text-cyan-300 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs select-text`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Underline <u>...</u> or <ins>...</ins>
      if ((part.startsWith('<u>') && part.endsWith('</u>')) || (part.startsWith('<ins>') && part.endsWith('</ins>'))) {
        const inner = part.replace(/^<u?>|<ins>/, '').replace(/<\/u?>|<\/ins>$/, '');
        return (
          <span
            key={i}
            className="font-bold underline decoration-amber-500 dark:decoration-amber-400 decoration-2 underline-offset-3 text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-500/10 px-1 py-0.5 rounded-sm"
          >
            {inner}
          </span>
        );
      }

      // Highlight ==...==
      if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
        const inner = part.slice(2, -2);
        return (
          <span
            key={i}
            className="font-extrabold text-emerald-950 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-300/80 dark:border-emerald-500/30 underline decoration-emerald-500 decoration-2 underline-offset-2"
          >
            {inner}
          </span>
        );
      }

      // Bold **...** -> Colored Note Styling
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const boldText = part.slice(2, -2);
        return (
          <strong
            key={i}
            className={
              isUser
                ? 'font-bold text-white underline decoration-white/50'
                : 'font-bold text-indigo-700 dark:text-cyan-300 bg-indigo-50/80 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-cyan-800/40'
            }
          >
            {boldText}
          </strong>
        );
      }

      // Italic *...*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={i} className="italic text-slate-700 dark:text-slate-300 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }

      return <span key={i}>{part}</span>;
    });
  };

  // If user bubble, keep it simple, clean, and scaled
  if (isUser) {
    return (
      <div className={`whitespace-pre-wrap font-medium ${sz.userBubble} break-words select-text`}>
        {renderRichInline(content)}
      </div>
    );
  }

  // Parse markdown into blocks
  const blocks = useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const result: Array<{
      type: 'h1' | 'h2' | 'h3' | 'callout' | 'flowchart' | 'chart' | 'code' | 'table' | 'bullet' | 'number' | 'paragraph';
      content: string;
      meta?: any;
    }> = [];

    let inCodeBlock = false;
    let codeLang = '';
    let codeBuffer: string[] = [];

    let inTable = false;
    let tableBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle Code Block start / end
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          const codeText = codeBuffer.join('\n');
          const lang = codeLang.toLowerCase();

          if (lang === 'flowchart' || lang === 'diagram' || lang === 'process') {
            result.push({ type: 'flowchart', content: codeText, meta: { lang } });
          } else if (lang === 'chart' || lang === 'graph' || lang === 'barchart') {
            result.push({ type: 'chart', content: codeText, meta: { lang } });
          } else {
            result.push({ type: 'code', content: codeText, meta: { lang: codeLang || 'text' } });
          }

          inCodeBlock = false;
          codeLang = '';
          codeBuffer = [];
          continue;
        } else {
          // Opening code block
          inCodeBlock = true;
          codeLang = trimmed.replace(/^```/, '').trim();
          codeBuffer = [];
          continue;
        }
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      // Handle Markdown Table
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        tableBuffer.push(trimmed);
        continue;
      } else if (inTable) {
        // Table ended
        if (tableBuffer.length > 0) {
          result.push({ type: 'table', content: tableBuffer.join('\n') });
          tableBuffer = [];
        }
        inTable = false;
      }

      if (!trimmed) {
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        result.push({ type: 'h1', content: line.replace(/^#\s+/, '') });
        continue;
      }
      if (line.startsWith('## ')) {
        result.push({ type: 'h2', content: line.replace(/^##\s+/, '') });
        continue;
      }
      if (line.startsWith('### ') || line.startsWith('#### ')) {
        result.push({ type: 'h3', content: line.replace(/^#{3,4}\s+/, '') });
        continue;
      }

      // Flowchart arrow inline detection (e.g. A ➔ B ➔ C or A -> B -> C)
      if (
        (trimmed.includes(' ➔ ') || trimmed.includes(' -> ') || trimmed.includes(' --> ')) &&
        (trimmed.startsWith('[') || trimmed.includes('➔') || trimmed.split(/(?:➔|->|-->)/).length >= 3)
      ) {
        result.push({ type: 'flowchart', content: trimmed, meta: { inline: true } });
        continue;
      }

      // Callout notes (e.g. > Note:, > 💡, 📌 Definition:, 💡 Note:, ⚠️ Warning:)
      if (
        trimmed.startsWith('>') ||
        /^(\*|\-|\•)?\s*(📌|💡|⚠️|📝|🎯|🌟|🔔|ℹ️)\s*\*\*?(Note|Definition|Important|Syntax|Tip|Rule|Summary|याद रखें|महत्वपूर्ण|परिभाषा)/i.test(trimmed)
      ) {
        result.push({ type: 'callout', content: trimmed.replace(/^>\s*/, '') });
        continue;
      }

      // Numbered items (1. 2. 3. or 1️⃣ 2️⃣)
      const numMatch = trimmed.match(/^(\d+[\.\)]|[1-9]️⃣)\s+(.+)/);
      if (numMatch) {
        result.push({ type: 'number', content: numMatch[2], meta: { index: numMatch[1] } });
        continue;
      }

      // Bullet items (•, *, -)
      if (/^[\*\-\•]\s+/.test(trimmed)) {
        result.push({ type: 'bullet', content: trimmed.replace(/^[\*\-\•]\s+/, '') });
        continue;
      }

      // Regular paragraph
      result.push({ type: 'paragraph', content: line });
    }

    // Flush any pending table
    if (tableBuffer.length > 0) {
      result.push({ type: 'table', content: tableBuffer.join('\n') });
    }

    // Flush any unclosed code
    if (inCodeBlock && codeBuffer.length > 0) {
      result.push({ type: 'code', content: codeBuffer.join('\n'), meta: { lang: codeLang || 'text' } });
    }

    return result;
  }, [content]);

  // Helper to parse flowchart steps
  const parseFlowSteps = (raw: string): DiagramStep[] => {
    // Split by arrows
    const segments = raw.split(/(?:➔|->|-->|=>|⟶)/).map(s => s.trim()).filter(Boolean);
    return segments.map((seg, idx) => {
      // Clean up brackets [Step] or (Step)
      const cleaned = seg.replace(/^[\[\(]/, '').replace(/[\]\)]$/, '').trim();
      const parts = cleaned.split(/[:\-]/);
      if (parts.length > 1) {
        return {
          label: parts[0].trim(),
          sub: parts.slice(1).join('-').trim(),
          badge: `Step ${idx + 1}`
        };
      }
      return {
        label: cleaned,
        badge: `Step ${idx + 1}`
      };
    });
  };

  // Helper to parse Bar Chart data
  const parseChartItems = (raw: string) => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const items: Array<{ label: string; value: number; unit?: string; rawVal?: string }> = [];

    for (const l of lines) {
      const match = l.match(/^([^:\-]+)[:\-]\s*(\d+(?:\.\d+)?)\s*(%|[a-zA-Z]*)/);
      if (match) {
        const val = parseFloat(match[2]);
        items.push({
          label: match[1].trim(),
          value: isNaN(val) ? 50 : val,
          unit: match[3] || '',
          rawVal: match[2] + (match[3] || '')
        });
      }
    }
    return items;
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 font-sans leading-relaxed select-text w-full">
      {blocks.map((block, idx) => {
        // H1 Heading
        if (block.type === 'h1') {
          return (
            <div
              key={idx}
              className="mt-4 mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-pink-950/30 border-l-4 border-indigo-600 dark:border-cyan-400 shadow-sm"
            >
              <h2 className={`${sz.h1} text-indigo-950 dark:text-cyan-200 tracking-tight flex items-center gap-2`}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0 animate-pulse" />
                <span>{renderRichInline(block.content)}</span>
              </h2>
            </div>
          );
        }

        // H2 Heading
        if (block.type === 'h2') {
          return (
            <div
              key={idx}
              className="mt-4 mb-2 pb-2 border-b-2 border-purple-200/80 dark:border-purple-800/60 flex items-center gap-2.5"
            >
              <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-indigo-600 shrink-0" />
              <h3 className={`${sz.h2} text-purple-950 dark:text-purple-200 tracking-tight`}>
                {renderRichInline(block.content)}
              </h3>
            </div>
          );
        }

        // H3 Heading (Notes Section Title)
        if (block.type === 'h3') {
          return (
            <div key={idx} className="mt-3.5 mb-2 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-cyan-400 shrink-0" />
              <h4 className={`${sz.h3} text-slate-900 dark:text-cyan-300 underline decoration-indigo-300/80 dark:decoration-cyan-500/50 decoration-2 underline-offset-4`}>
                {renderRichInline(block.content)}
              </h4>
            </div>
          );
        }

        // Callout Box (Important Notes, Definitions, Rules, Warnings)
        if (block.type === 'callout') {
          const isWarn = /⚠️|Warning|Alert|खतरा|सावधानी/i.test(block.content);
          const isDef = /📌|Definition|परिभाषा|अर्थ/i.test(block.content);
          const isTip = /💡|🌟|Tip|Jugaad|टिप|सुझाव/i.test(block.content);

          const borderColor = isWarn
            ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100'
            : isDef
            ? 'border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-950 dark:text-cyan-100'
            : isTip
            ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
            : 'border-purple-500 bg-purple-50/90 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100';

          return (
            <div
              key={idx}
              className={`my-3.5 rounded-2xl border-l-4 shadow-xs ${sz.callout} ${borderColor}`}
            >
              <div className="flex items-start gap-3">
                {isWarn ? (
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : isDef ? (
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                ) : isTip ? (
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  {renderRichInline(block.content)}
                </div>
              </div>
            </div>
          );
        }

        // Responsive Flowchart / Process Diagram (Mobile, Tablet, Laptop optimized)
        if (block.type === 'flowchart') {
          const steps = parseFlowSteps(block.content);
          if (steps.length >= 2) {
            return (
              <div
                key={idx}
                className="my-4 p-3.5 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700/90 overflow-hidden"
              >
                {/* Diagram Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800 text-sm sm:text-base font-bold text-cyan-300">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 animate-pulse" />
                    <span>📊 Visual Flowchart / Process Diagram</span>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-300 font-mono bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                    {steps.length} Steps
                  </span>
                </div>

                {/* Steps Layout (Responsive Flex on Laptop/Tablet, Wrap & Scroll-safe on Mobile) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
                  {steps.map((st, sIdx) => {
                    const isLast = sIdx === steps.length - 1;
                    return (
                      <React.Fragment key={sIdx}>
                        {/* Step Card */}
                        <div className="flex-1 min-w-[150px] sm:min-w-[140px] p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700 hover:border-cyan-400/80 transition-all shadow-md group">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-900/80 text-indigo-300 border border-indigo-700/60">
                              {st.badge || `Step ${sIdx + 1}`}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                          </div>
                          <div className={`${sz.flowLabel} text-white leading-snug`}>
                            {st.label}
                          </div>
                          {st.sub && (
                            <div className={`${sz.flowSub} text-slate-300 mt-1 leading-snug`}>
                              {st.sub}
                            </div>
                          )}
                        </div>

                        {/* Arrow Connector */}
                        {!isLast && (
                          <div className="flex items-center justify-center py-1 sm:py-0 shrink-0 text-amber-400">
                            <div className="sm:hidden flex items-center justify-center">
                              <span className="text-base">⬇️</span>
                            </div>
                            <div className="hidden sm:flex items-center justify-center">
                              <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Fallback if not splittable into steps
          return (
            <div
              key={idx}
              className="my-2.5 p-3 rounded-xl bg-slate-900 text-cyan-300 font-mono text-xs sm:text-sm overflow-x-auto border border-slate-700"
            >
              {block.content}
            </div>
          );
        }

        // Responsive Data Bar Chart (Mobile, Tablet, Laptop)
        if (block.type === 'chart') {
          const chartItems = parseChartItems(block.content);
          if (chartItems.length > 0) {
            const maxVal = Math.max(...chartItems.map(i => i.value), 100);
            return (
              <div
                key={idx}
                className="my-4 p-3.5 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700/90"
              >
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800 text-sm sm:text-base font-bold text-emerald-400">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <span>📈 Comparison Chart & Metrics</span>
                  </div>
                  <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">Visualized</span>
                </div>

                <div className="space-y-3.5">
                  {chartItems.map((item, cIdx) => {
                    const pct = Math.min(100, Math.round((item.value / maxVal) * 100));
                    return (
                      <div key={cIdx} className="space-y-1.5">
                        <div className="flex items-center justify-between font-bold">
                          <span className={`${sz.chartLabel} text-slate-100`}>{item.label}</span>
                          <span className={`${sz.chartVal} text-cyan-300 font-mono`}>
                            {item.rawVal || `${item.value}${item.unit}`}
                          </span>
                        </div>
                        {/* Progress Bar Container */}
                        <div className="w-full h-3 sm:h-3.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: cIdx * 0.1 }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Fallback for non-parsed chart
          return (
            <div key={idx} className="my-2.5 p-3 rounded-xl bg-slate-900 text-cyan-300 font-mono text-xs sm:text-sm overflow-x-auto">
              <pre>{block.content}</pre>
            </div>
          );
        }

        // Code Block
        if (block.type === 'code') {
          return (
            <div
              key={idx}
              className="my-3.5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 shadow-lg font-mono"
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200 uppercase">{block.meta?.lang || 'Code'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(block.content, idx)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className={`p-4 overflow-x-auto scrollbar-thin ${sz.code} text-cyan-200`}>
                <pre>{block.content}</pre>
              </div>
            </div>
          );
        }

        // Markdown Table (Responsive for Mobile, Tablet, Laptop)
        if (block.type === 'table') {
          const rows = block.content
            .split('\n')
            .map(r => r.split('|').map(c => c.trim()).filter((_, i, arr) => i !== 0 && i !== arr.length - 1))
            .filter(r => r.length > 0 && !r.every(c => /^:?-+:?$/.test(c)));

          if (rows.length > 0) {
            const header = rows[0];
            const dataRows = rows.slice(1);

            return (
              <div
                key={idx}
                className="my-4 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="overflow-x-auto scrollbar-thin max-w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-indigo-50 dark:bg-slate-900 border-b border-indigo-200 dark:border-slate-700 text-indigo-950 dark:text-cyan-300 font-extrabold">
                        {header.map((col, cIdx) => (
                          <th key={cIdx} className={`${sz.tableHeader} whitespace-nowrap`}>
                            {renderRichInline(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataRows.map((r, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-slate-200/60 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          {r.map((cell, cIdx) => (
                            <td key={cIdx} className={`${sz.tableCell} text-slate-800 dark:text-slate-200`}>
                              {renderRichInline(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }
        }

        // Numbered Item
        if (block.type === 'number') {
          return (
            <div key={idx} className={`flex items-start gap-3 my-2 ${sz.number}`}>
              <span className={`inline-flex items-center justify-center shrink-0 ${sz.badge} rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs mt-0.5`}>
                {block.meta?.index?.replace(/[\.\)]/, '') || '•'}
              </span>
              <div className="flex-1 min-w-0 text-slate-900 dark:text-slate-100">
                {renderRichInline(block.content)}
              </div>
            </div>
          );
        }

        // Bullet Point
        if (block.type === 'bullet') {
          return (
            <div key={idx} className={`flex items-start gap-3 my-2 ${sz.bullet}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shrink-0 mt-2.5" />
              <div className="flex-1 min-w-0 text-slate-900 dark:text-slate-100">
                {renderRichInline(block.content)}
              </div>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className={`my-2.5 ${sz.paragraph} text-slate-900 dark:text-slate-100`}>
            {renderRichInline(block.content)}
          </p>
        );
      })}
    </div>
  );
});
SmartNotesRenderer.displayName = 'SmartNotesRenderer';
