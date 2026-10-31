/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Image as ImageIcon, 
  Upload, 
  Sliders, 
  BookOpen, 
  Code, 
  Layers, 
  Building2, 
  Award, 
  Share2, 
  CheckCircle2,
  Info,
  Wand2,
  Maximize2,
  Palette,
  Terminal,
  Coffee,
  HeartHandshake
} from 'lucide-react';
import { UserProfile } from '../../types';

interface CimageBcaLogoMakerProps {
  profile?: UserProfile;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

type LogoStyle = 'diamond' | 'simple';
type Semester = '2nd' | '3rd' | '1st' | '4th' | '5th' | '6th';

export const CimageBcaLogoMaker: React.FC<CimageBcaLogoMakerProps> = ({ profile }) => {
  const isHi = profile?.language === 'hi';
  const [style, setStyle] = useState<LogoStyle>('diamond');
  const [semester, setSemester] = useState<Semester>('3rd');
  const [batch, setBatch] = useState<string>('BATCH 1');
  const [customBuildingImg, setCustomBuildingImg] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [slogan, setSlogan] = useState<string>('TOGETHER WE LEARN TOGETHER WE GROW');
  const [activeTab, setActiveTab] = useState<'canvas' | 'ai-render' | 'prompt' | 'advice'>('canvas');
  
  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic syllabus books based on semester
  const books = semester === '2nd' ? [
    { title: 'DATA STRUCTURES', color: '#1e3a8a', spine: '#172554' },
    { title: 'C PROGRAMMING', color: '#047857', spine: '#064e3b' },
    { title: 'DATABASE SYSTEMS', color: '#b45309', spine: '#78350f' },
    { title: 'OPERATING SYSTEMS', color: '#6d28d9', spine: '#4c1d95' },
    { title: 'COMPUTER NETWORKS', color: '#be123c', spine: '#881337' },
    { title: 'DISCRETE MATH', color: '#0f766e', spine: '#134e4a' }
  ] : [
    { title: 'JAVA PROGRAMMING', color: '#b91c1c', spine: '#7f1d1d' },
    { title: 'C++ PROGRAMMING', color: '#1d4ed8', spine: '#1e3a8a' },
    { title: 'JAVASCRIPT', color: '#d97706', spine: '#92400e' },
    { title: 'SOFTWARE ENGINEERING', color: '#4338ca', spine: '#312e81' },
    { title: 'INTERNET & WEB DESIGN', color: '#059669', spine: '#065f46' },
    { title: 'ADVANCED EXCEL', color: '#047857', spine: '#064e3b' }
  ];

  // Dynamic code snippet
  const codeSnippet = semester === '2nd' ? [
    '#include <stdio.h>',
    'int main() {',
    '    printf("BCA BOYS\\n");',
    '    return 0;',
    '}'
  ] : [
    'public class SumExample {',
    '  public static void main(String[] a){',
    '    int a = 5, b = 10;',
    '    int sum = a + b;',
    '    System.out.println("Sum=" + sum);',
    '  }',
    '}'
  ];

  const fullPrompt = `Circular college batch logo emblem for CIMAGE College Patna BCA students.
STYLE: ${style === 'simple' ? 'SIMPLE CLEAN (Light cream background, clean vector flat badge, crisp dark blue and gold lines, thin ornate gold border, no heavy fireworks)' : 'DIAMOND FESTIVAL (Rich deep midnight black background, heavy golden 3D diamond glow, ornate gold mandala border, fireworks, diyas, marigold garlands, confetti, cinematic 8K photorealistic)'}.
SHAPE: Perfect circular badge with ornate golden border.
TOP CENTER: Royal blue shield with gold border, text 'CIMAGE' in 3D gold, surrounded by blue laurel wreath with diamond on top.
TOP LEFT: Text 'HAPPY Raksha Bandhan' with diamond rakhi, golden gift box, and marigold flowers.
TOP RIGHT: Text 'HAPPY Janmashtami' with cute Bal Krishna icon in yellow dhoti with peacock feather, breaking earthen matki with milk splash.
CENTER: Huge 3D text 'BCA' (${style === 'simple' ? 'solid dark blue with crisp gold edges' : 'diamond-cut golden glowing 3D with radiant light rays'}). Below it, royal blue and gold plaque with exact text 'INFORMAL ${semester.toUpperCase()} SEM ${batch.toUpperCase()}'.
LEFT SIDE: Stack of 6 vertical textbooks with clear titles on spines: ${books.map(b => b.title).join(', ')}.
BOTTOM LEFT: Open laptop showing screen with ${semester === '2nd' ? 'C code printf BCA BOYS' : 'Java sum code: public class SumExample { public static void main(String[] args) { int a = 5, b = 10; int sum = a + b; System.out.println("Sum = " + sum); } }'}.
RIGHT SIDE: ${customBuildingImg ? 'User provided CIMAGE modern building reference exactly with modern multi-story, green rooftop garden, brown/orange mesh facade, glass windows' : 'CIMAGE College Patna modern multi-story building with green rooftop garden, brown/orange mesh facade, CIMAGE signage on top and bottom, glass windows, brown fence, white cars'}.
BOTTOM: Royal blue and golden curved ribbon banner with text '${slogan}'.
BELOW BANNER: 4 distinct icons: LEARN (open book), CODE (</>), GROW (leaf plant), SUCCEED (trophy cup). Plus coffee mug with steam labeled 'FOCUS DISCIPLINE CONSISTENCY SUCCESS' and open notebook labeled 'Plan Prepare Practice Progress'.
${studentName ? `PERSONALIZATION: Student name '${studentName}' engraved on gold crest.` : ''}
OUTPUT SPECIFICATION: 1:1 Aspect ratio, ultra HD 8K, highly detailed, perfect English typography, zero spelling mistakes, perfectly centered circular composition.`;

  // Download high-resolution PNG from SVG Canvas
  const handleDownloadPng = (size: number = 2048) => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = style === 'diamond' ? '#070913' : '#FFFDF9';
          context.fillRect(0, 0, size, size);
          context.drawImage(image, 0, 0, size, size);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `CIMAGE_BCA_${semester.toUpperCase()}_SEM_${batch.replace(/\s+/g, '_')}_${style.toUpperCase()}_LOGO.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  };

  // Download SVG Vector File
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CIMAGE_BCA_${semester.toUpperCase()}_SEM_${batch.replace(/\s+/g, '_')}_LOGO.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Trigger AI Generation using server API
  const handleGenerateAiLogo = async () => {
    setIsAiGenerating(true);
    setAiError(null);
    try {
      // 1. Fetch AI Design Strategy & Advice
      const infoRes = await fetch('/api/ai/cimage-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: `${semester.toUpperCase()} SEM`,
          batch,
          style: style === 'diamond' ? 'DIAMOND FESTIVAL' : 'SIMPLE CLEAN',
          customSlogan: slogan,
          studentName,
          buildingDescription: customBuildingImg ? 'User uploaded custom CIMAGE campus architecture' : undefined
        })
      });
      const infoData = await infoRes.json();
      if (infoData.advice) setAiAdvice(infoData.advice);

      // 2. Request High Quality Image Generation
      const imgRes = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: '1:1',
          quality: 'pro',
          inputImageBase64: customBuildingImg || undefined
        })
      });

      const imgData = await imgRes.json();
      if (imgData.imageUrl) {
        setAiGeneratedImage(imgData.imageUrl);
        setActiveTab('ai-render');
      } else if (imgData.error) {
        setAiError(imgData.error);
        // Fallback to high-res vector canvas tab
        setActiveTab('canvas');
      }
    } catch (err: any) {
      console.warn('AI Image Generation notice:', err);
      setAiError('Direct GPU AI image render reached rate quota. Your high-resolution 4K Vector Canvas Logo is ready to download below!');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuildingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBuildingImg(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Color variables according to style
  const isDiamond = style === 'diamond';
  const bgColor = isDiamond ? '#060813' : '#FFFDF9';
  const goldPrimary = '#F59E0B';
  const goldLight = '#FDE68A';
  const goldDark = '#92400E';
  const royalBlue = '#0B1953';
  const accentBlue = '#1D4ED8';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1953] via-[#1E1B4B] to-[#B45309] text-white p-6 sm:p-8 shadow-2xl border border-amber-400/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>{isHi ? 'सिमेज कॉलेज पटना • बीसीए बैच लोगो मेकर' : 'CIMAGE College Patna • BCA Batch Logo Creator'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              CIMAGE BCA <span className="text-amber-400">{isHi ? 'लोगो मेकर' : 'Logo Maker AI'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {isHi
                ? 'बीसीए छात्रों के लिए आधिकारिक बैच प्रतीक जनरेटर। सिमेज शील्ड, रक्षाबंधन व जन्माष्टमी रूपांकन, सिलेबस पुस्तकें, कोड स्क्रीन और सिमेज पटना कैंपस के साथ।'
                : 'Official circular batch emblem generator for BCA students. Featuring CIMAGE shield, Raksha Bandhan & Janmashtami motifs, dynamic syllabus books, live code screen, CIMAGE Patna campus facade, and ornate golden plaques.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleDownloadPng(2048)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{isHi ? 'डाउनलोड PNG' : 'Download PNG'}</span>
            </button>
            <button
              onClick={handleGenerateAiLogo}
              disabled={isAiGenerating}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAiGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{isHi ? 'रेंडरिंग...' : 'Rendering...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-400" />
                  <span>{isHi ? 'AI रेंडर' : 'AI Render'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Controls & Customizer */}
        <div className="lg:col-span-5 space-y-5">
          {/* Style Mode Toggle */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-500" />
                <span>Logo Style Edition</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Select visual theme</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStyle('diamond')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  style === 'diamond'
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-md shadow-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {style === 'diamond' && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
                )}
                <div className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>DIAMOND FESTIVAL</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                  Black background, 3D golden diamond glow, fireworks, diyas & 8K cinematic vibes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStyle('simple')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  style === 'simple'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-md shadow-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {style === 'simple' && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600" />
                )}
                <div className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>SIMPLE CLEAN</span>
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                  Light cream background, vector flat badge, thin golden border, clear class group look.
                </p>
              </button>
            </div>
          </div>

          {/* Semester & Batch Configurator */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Semester & Batch Settings</span>
            </h3>

            {/* Semester Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Semester (Syllabus Books & Code)</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  {semester === '2nd' ? '2nd Sem: C Code & Data Structures' : '3rd Sem: Java Sum Code & Java/C++'}
                </span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['2nd', '3rd', '1st', '4th', '5th', '6th'] as Semester[]).map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSemester(sem)}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      semester === sem
                        ? 'bg-[#0B1953] text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sem.toUpperCase()} SEM
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Plaque Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Batch Tag Plaque
                </label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="e.g. BATCH 1 or SECTION A"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-bold uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Student Name (Optional)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aman Kumar"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Slogan Customizer */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Bottom Ribbon Motto Banner
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="TOGETHER WE LEARN TOGETHER WE GROW"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>
          </div>

          {/* CIMAGE Building Reference & Upload */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>CIMAGE Patna Campus Building</span>
              </h3>
              {customBuildingImg && (
                <button
                  type="button"
                  onClick={() => setCustomBuildingImg(null)}
                  className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              )}
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Default includes Patna modern campus with glass facade, rooftop garden, orange/brown mesh and signage. You can also upload a photo of your specific campus building.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>{customBuildingImg ? 'Change Campus Photo' : 'Upload Building Photo'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBuildingUpload}
                className="hidden"
              />
              {customBuildingImg && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Custom Building Loaded</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Syllabus Books & Code Preview Card */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Semester {semester.toUpperCase()} Content Checklist</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {books.map((b, idx) => (
                <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="truncate">{b.title}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-700">
              <div className="text-[10px] text-slate-400 mb-1">// Laptop Screen Code:</div>
              {codeSnippet.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Circular Emblem SVG Canvas & Preview Studio */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          {/* Tab Selector */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('canvas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'canvas'
                    ? 'bg-[#0B1953] text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isHi ? 'वेक्टर कैनवास' : 'Live Vector Canvas'}</span>
              </button>

              {aiGeneratedImage && (
                <button
                  type="button"
                  onClick={() => setActiveTab('ai-render')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ai-render'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isHi ? 'AI रेंडर' : 'AI 8K Render'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('prompt')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'prompt'
                    ? 'bg-[#0B1953] text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isHi ? 'प्रॉम्प्ट' : 'Prompt Studio'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDownloadPng(2048)}
                title={isHi ? '2048x2048 PNG डाउनलोड करें' : 'Download 2048x2048 PNG'}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                title={isHi ? 'वेक्टर SVG डाउनलोड करें' : 'Download Vector SVG'}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              >
                SVG
              </button>
            </div>
          </div>

          {/* Canvas Display Card */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-md overflow-hidden relative min-h-[520px]">
            
            {activeTab === 'canvas' && (
              <div className="w-full flex flex-col items-center justify-center">
                {/* Real-time SVG Canvas Renderer */}
                <div className="w-full max-w-[480px] aspect-square relative drop-shadow-2xl select-none">
                  <svg
                    ref={svgRef}
                    viewBox="0 0 1000 1000"
                    className="w-full h-full rounded-full overflow-hidden transition-all duration-300"
                    style={{
                      background: bgColor,
                    }}
                  >
                    <defs>
                      {/* Golden radial & linear gradients */}
                      <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FDE68A" stopOpacity={isDiamond ? "0.3" : "0.05"} />
                        <stop offset="60%" stopColor="#F59E0B" stopOpacity={isDiamond ? "0.15" : "0.02"} />
                        <stop offset="100%" stopColor="#92400E" stopOpacity="0" />
                      </radialGradient>

                      <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FEF3C7" />
                        <stop offset="25%" stopColor="#F59E0B" />
                        <stop offset="50%" stopColor="#D97706" />
                        <stop offset="75%" stopColor="#FCD34D" />
                        <stop offset="100%" stopColor="#78350F" />
                      </linearGradient>

                      <linearGradient id="shieldBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1E3A8A" />
                        <stop offset="50%" stopColor="#0B1953" />
                        <stop offset="100%" stopColor="#030712" />
                      </linearGradient>

                      <linearGradient id="bca3dGold" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFBEB" />
                        <stop offset="30%" stopColor="#FCD34D" />
                        <stop offset="65%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#B45309" />
                      </linearGradient>

                      <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0B1953" />
                        <stop offset="20%" stopColor="#1E3A8A" />
                        <stop offset="50%" stopColor="#2563EB" />
                        <stop offset="80%" stopColor="#1E3A8A" />
                        <stop offset="100%" stopColor="#0B1953" />
                      </linearGradient>

                      <filter id="goldShine" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.4" />
                      </filter>

                      <filter id="heavyGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Outer Glow in Diamond mode */}
                    {isDiamond && (
                      <circle cx="500" cy="500" r="490" fill="url(#goldGlow)" />
                    )}

                    {/* Ornate Mandala Radial Circles / Fireworks */}
                    {isDiamond && (
                      <g opacity="0.35">
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                          <line
                            key={i}
                            x1="500"
                            y1="500"
                            x2={500 + 460 * Math.cos((angle * Math.PI) / 180)}
                            y2={500 + 460 * Math.sin((angle * Math.PI) / 180)}
                            stroke="#F59E0B"
                            strokeWidth="1"
                            strokeDasharray="4 8"
                          />
                        ))}
                        {/* Festive Fireworks Sparkles */}
                        <circle cx="180" cy="180" r="3" fill="#FCD34D" filter="url(#heavyGlow)" />
                        <circle cx="820" cy="180" r="3" fill="#FCD34D" filter="url(#heavyGlow)" />
                        <circle cx="150" cy="450" r="2.5" fill="#F43F5E" />
                        <circle cx="850" cy="450" r="2.5" fill="#3B82F6" />
                        <circle cx="280" cy="120" r="2" fill="#10B981" />
                        <circle cx="720" cy="120" r="2" fill="#EC4899" />
                      </g>
                    )}

                    {/* Outer Circular Ornate Golden Border */}
                    <circle
                      cx="500"
                      cy="500"
                      r="485"
                      fill="none"
                      stroke="url(#goldBorderGrad)"
                      strokeWidth={isDiamond ? "14" : "8"}
                    />
                    <circle
                      cx="500"
                      cy="500"
                      r="472"
                      fill="none"
                      stroke={isDiamond ? "#FDE68A" : "#D97706"}
                      strokeWidth="2"
                      strokeDasharray="6 6"
                    />
                    <circle
                      cx="500"
                      cy="500"
                      r="464"
                      fill="none"
                      stroke="url(#goldBorderGrad)"
                      strokeWidth="3"
                    />

                    {/* TOP CENTER (2): Royal Blue Shield + Gold CIMAGE + Blue Laurel + Diamond */}
                    <g transform="translate(500, 110)">
                      {/* Laurel Wreath */}
                      <path
                        d="M -120,40 C -140,-10 -100,-70 0,-70 C 100,-70 140,-10 120,40"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      {/* Shield Body */}
                      <path
                        d="M -65,-30 L 65,-30 L 65,20 C 65,65 0,95 0,95 C 0,95 -65,65 -65,20 Z"
                        fill="url(#shieldBlueGrad)"
                        stroke="url(#goldBorderGrad)"
                        strokeWidth="4"
                        filter="url(#goldShine)"
                      />
                      {/* Sparkling Diamond on Top */}
                      <polygon
                        points="0,-45 14,-32 0,-20 -14,-32"
                        fill="#60A5FA"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      {/* 3D Gold CIMAGE Text */}
                      <text
                        x="0"
                        y="18"
                        textAnchor="middle"
                        fontSize="23"
                        fontFamily="Arial, sans-serif"
                        fontWeight="900"
                        fill="url(#bca3dGold)"
                        letterSpacing="3"
                      >
                        CIMAGE
                      </text>
                      <text
                        x="0"
                        y="42"
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="Arial, sans-serif"
                        fontWeight="800"
                        fill="#FDE68A"
                        letterSpacing="1.5"
                      >
                        PATNA • BIHAR
                      </text>
                    </g>

                    {/* TOP LEFT (3): HAPPY Raksha Bandhan + Diamond Rakhi + Gift Box + Marigolds */}
                    <g transform="translate(195, 175)">
                      <rect
                        x="-105"
                        y="-45"
                        width="210"
                        height="85"
                        rx="16"
                        fill={isDiamond ? "#1E1B4B" : "#FFF7ED"}
                        stroke="#F59E0B"
                        strokeWidth="2"
                      />
                      <text
                        x="0"
                        y="-22"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="900"
                        fill={isDiamond ? "#FDE68A" : "#B45309"}
                        letterSpacing="1"
                      >
                        HAPPY
                      </text>
                      <text
                        x="0"
                        y="-6"
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="900"
                        fill="#F59E0B"
                        letterSpacing="1"
                      >
                        Raksha Bandhan
                      </text>
                      
                      {/* Diamond Rakhi Motif */}
                      <circle cx="-50" cy="20" r="12" fill="#DC2626" stroke="#F59E0B" strokeWidth="2" />
                      <polygon points="-50,12 -42,20 -50,28 -58,20" fill="#60A5FA" />
                      {/* Golden Gift Box */}
                      <rect x="-10" y="8" width="20" height="20" rx="3" fill="#D97706" stroke="#FEF3C7" strokeWidth="1.5" />
                      <line x1="0" y1="8" x2="0" y2="28" stroke="#FEF3C7" strokeWidth="2" />
                      <line x1="-10" y1="18" x2="10" y2="18" stroke="#FEF3C7" strokeWidth="2" />
                      {/* Marigold Garland */}
                      <circle cx="45" cy="18" r="8" fill="#EA580C" />
                      <circle cx="45" cy="18" r="4" fill="#FCD34D" />
                      <circle cx="65" cy="18" r="7" fill="#F59E0B" />
                    </g>

                    {/* TOP RIGHT (4): HAPPY Janmashtami + Bal Krishna Icon + Matki Milk Splash + Peacock */}
                    <g transform="translate(805, 175)">
                      <rect
                        x="-105"
                        y="-45"
                        width="210"
                        height="85"
                        rx="16"
                        fill={isDiamond ? "#0F172A" : "#EFF6FF"}
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                      <text
                        x="0"
                        y="-22"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="900"
                        fill={isDiamond ? "#93C5FD" : "#1E40AF"}
                        letterSpacing="1"
                      >
                        HAPPY
                      </text>
                      <text
                        x="0"
                        y="-6"
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="900"
                        fill="#3B82F6"
                        letterSpacing="1"
                      >
                        Janmashtami
                      </text>

                      {/* Cute Bal Krishna Head & Crown */}
                      <circle cx="-50" cy="20" r="11" fill="#38BDF8" />
                      <path d="M -56,12 C -56,5 -44,5 -44,12 Z" fill="#F59E0B" />
                      <polygon points="-50,3 -45,9 -55,9" fill="#10B981" />
                      {/* Matki with Milk Splash */}
                      <ellipse cx="0" cy="22" rx="12" ry="9" fill="#92400E" stroke="#F59E0B" strokeWidth="1.5" />
                      <path d="M -5,13 Q 0,2 6,13 Q 12,5 5,16 Z" fill="#FFFFFF" />
                      {/* Peacock Feather */}
                      <path d="M 45,28 Q 55,8 65,15 Q 55,25 45,28 Z" fill="#047857" />
                      <circle cx="55" cy="17" r="4" fill="#1D4ED8" />
                      <circle cx="55" cy="17" r="2" fill="#F59E0B" />
                    </g>

                    {/* CENTER (5): Massive 3D BCA + Royal Blue Plaque "INFORMAL [SEM] BATCH [N]" */}
                    <g transform="translate(500, 395)">
                      {/* Light Rays Behind BCA in Diamond mode */}
                      {isDiamond && (
                        <g opacity="0.3">
                          <polygon points="0,0 -80,-120 80,-120" fill="url(#goldGlow)" />
                          <polygon points="0,0 -130,-50 -130,50" fill="url(#goldGlow)" />
                          <polygon points="0,0 130,-50 130,50" fill="url(#goldGlow)" />
                        </g>
                      )}

                      {/* 3D Shadows for BCA */}
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fontSize="110"
                        fontFamily="Impact, Arial Black, sans-serif"
                        fontWeight="900"
                        fill="#78350F"
                        letterSpacing="12"
                      >
                        BCA
                      </text>

                      {/* Main BCA 3D Text */}
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fontSize="110"
                        fontFamily="Impact, Arial Black, sans-serif"
                        fontWeight="900"
                        fill={isDiamond ? "url(#bca3dGold)" : "#0B1953"}
                        stroke={isDiamond ? "#FFFBEB" : "#F59E0B"}
                        strokeWidth="3"
                        letterSpacing="12"
                        filter="url(#goldShine)"
                      >
                        BCA
                      </text>

                      {/* Royal Blue Golden Plaque with INFORMAL SEM BATCH */}
                      <g transform="translate(0, 60)">
                        <rect
                          x="-195"
                          y="-24"
                          width="390"
                          height="48"
                          rx="24"
                          fill="url(#shieldBlueGrad)"
                          stroke="url(#goldBorderGrad)"
                          strokeWidth="3.5"
                          filter="url(#goldShine)"
                        />
                        <circle cx="-175" cy="0" r="4" fill="#F59E0B" />
                        <circle cx="175" cy="0" r="4" fill="#F59E0B" />
                        
                        <text
                          x="0"
                          y="7"
                          textAnchor="middle"
                          fontSize="18"
                          fontFamily="Arial, sans-serif"
                          fontWeight="900"
                          fill="#FDE68A"
                          letterSpacing="2.5"
                        >
                          INFORMAL {semester.toUpperCase()} SEM {batch.toUpperCase()}
                        </text>
                      </g>

                      {studentName && (
                        <text
                          x="0"
                          y="102"
                          textAnchor="middle"
                          fontSize="12"
                          fontFamily="Arial, sans-serif"
                          fontWeight="800"
                          fill={isDiamond ? "#CBD5E1" : "#475569"}
                          letterSpacing="1.5"
                        >
                          ✦ {studentName.toUpperCase()} ✦
                        </text>
                      )}
                    </g>

                    {/* LEFT SIDE (6): Stack of 6 Textbooks with Spines & Titles */}
                    <g transform="translate(185, 560)">
                      <rect
                        x="-85"
                        y="-105"
                        width="170"
                        height="200"
                        rx="14"
                        fill={isDiamond ? "#0F172A" : "#F8FAFC"}
                        stroke={isDiamond ? "#334155" : "#E2E8F0"}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="-85"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="900"
                        fill={isDiamond ? "#94A3B8" : "#475569"}
                        letterSpacing="1"
                      >
                        SYLLABUS BOOKS ({semester.toUpperCase()})
                      </text>

                      {books.map((book, idx) => (
                        <g key={idx} transform={`translate(-75, ${-68 + idx * 24})`}>
                          <rect
                            x="0"
                            y="0"
                            width="150"
                            height="20"
                            rx="4"
                            fill={book.color}
                            stroke={book.spine}
                            strokeWidth="1.5"
                          />
                          <rect x="0" y="0" width="8" height="20" rx="2" fill={book.spine} />
                          <text
                            x="15"
                            y="14"
                            fontSize="8.5"
                            fontFamily="Arial, sans-serif"
                            fontWeight="800"
                            fill="#FFFFFF"
                            letterSpacing="0.5"
                          >
                            {book.title}
                          </text>
                        </g>
                      ))}
                    </g>

                    {/* BOTTOM LEFT (7): Laptop Screen with Code */}
                    <g transform="translate(230, 755)">
                      {/* Laptop Screen Bezel */}
                      <rect
                        x="-100"
                        y="-65"
                        width="200"
                        height="100"
                        rx="8"
                        fill="#0F172A"
                        stroke="#94A3B8"
                        strokeWidth="3"
                      />
                      {/* Screen Content */}
                      <rect x="-92" y="-57" width="184" height="84" rx="4" fill="#020617" />
                      <circle cx="-82" cy="-48" r="3" fill="#EF4444" />
                      <circle cx="-74" cy="-48" r="3" fill="#F59E0B" />
                      <circle cx="-66" cy="-48" r="3" fill="#10B981" />
                      <text x="-50" y="-45" fontSize="7" fill="#64748B" fontFamily="monospace">
                        {semester === '2nd' ? 'main.c' : 'SumExample.java'}
                      </text>

                      {/* Dynamic Code Lines */}
                      {codeSnippet.slice(0, 4).map((line, li) => (
                        <text
                          key={li}
                          x="-86"
                          y={-30 + li * 13}
                          fontSize="7.5"
                          fontFamily="Courier, monospace"
                          fontWeight="700"
                          fill={li === 2 ? "#38BDF8" : "#4ADE80"}
                        >
                          {line.length > 25 ? line.substring(0, 24) + '..' : line}
                        </text>
                      ))}

                      {/* Laptop Keyboard Base */}
                      <polygon points="-120,40 120,40 100,32 -100,32" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
                      <rect x="-25" y="34" width="50" height="4" rx="2" fill="#334155" />
                    </g>

                    {/* RIGHT SIDE (8): CIMAGE Patna Modern Building Campus */}
                    <g transform="translate(790, 600)">
                      <rect
                        x="-115"
                        y="-145"
                        width="230"
                        height="240"
                        rx="16"
                        fill={isDiamond ? "#0B132B" : "#F1F5F9"}
                        stroke={isDiamond ? "#1E293B" : "#CBD5E1"}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="-125"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="900"
                        fill={isDiamond ? "#94A3B8" : "#475569"}
                        letterSpacing="1"
                      >
                        CIMAGE PATNA CAMPUS
                      </text>

                      {/* Rooftop Green Garden */}
                      <rect x="-95" y="-110" width="190" height="12" rx="4" fill="#15803D" />
                      <circle cx="-70" cy="-113" r="6" fill="#22C55E" />
                      <circle cx="-30" cy="-113" r="7" fill="#16A34A" />
                      <circle cx="30" cy="-113" r="7" fill="#22C55E" />
                      <circle cx="70" cy="-113" r="6" fill="#16A34A" />

                      {/* Main Multi-story Facade */}
                      <rect x="-90" y="-98" width="180" height="150" fill="#EA580C" rx="4" />
                      
                      {/* Brown / Orange Mesh Architectural Grid */}
                      <rect x="-85" y="-92" width="170" height="135" fill="#9A3412" rx="2" />
                      {/* Top CIMAGE Signboard on building */}
                      <rect x="-55" y="-88" width="110" height="18" rx="3" fill="#0B1953" stroke="#F59E0B" strokeWidth="1" />
                      <text x="0" y="-75" textAnchor="middle" fontSize="10" fontWeight="900" fill="#FDE68A" letterSpacing="2">
                        CIMAGE
                      </text>

                      {/* Glass Windows Grid */}
                      {[-65, -20, 25].map((wx, col) => (
                        <g key={col}>
                          {[-60, -32, -4, 24].map((wy, row) => (
                            <rect
                              key={row}
                              x={wx}
                              y={wy}
                              width="40"
                              height="20"
                              rx="2"
                              fill="#38BDF8"
                              opacity="0.85"
                              stroke="#0369A1"
                              strokeWidth="1"
                            />
                          ))}
                        </g>
                      ))}

                      {/* Bottom Entrance Signage & Brown Fence */}
                      <rect x="-88" y="46" width="176" height="8" fill="#78350F" />
                      {/* White Campus Cars */}
                      <g transform="translate(-40, 60)">
                        <rect x="-20" y="0" width="40" height="14" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
                        <circle cx="-12" cy="14" r="3" fill="#0F172A" />
                        <circle cx="12" cy="14" r="3" fill="#0F172A" />
                      </g>
                      <g transform="translate(40, 60)">
                        <rect x="-20" y="0" width="40" height="14" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1" />
                        <circle cx="-12" cy="14" r="3" fill="#0F172A" />
                        <circle cx="12" cy="14" r="3" fill="#0F172A" />
                      </g>
                    </g>

                    {/* BOTTOM (9): Royal Blue & Golden Ribbon Banner */}
                    <g transform="translate(500, 845)">
                      {/* Ribbon Fold Tails */}
                      <polygon points="-380,20 -330,-5 -340,35" fill="#0B1953" />
                      <polygon points="380,20 330,-5 340,35" fill="#0B1953" />

                      {/* Main Ribbon Body */}
                      <path
                        d="M -340,-15 C -150,-35 150,-35 340,-15 L 330,30 C 150,15 -150,15 -330,30 Z"
                        fill="url(#ribbonGrad)"
                        stroke="url(#goldBorderGrad)"
                        strokeWidth="3.5"
                        filter="url(#goldShine)"
                      />

                      {/* Ribbon Text */}
                      <text
                        x="0"
                        y="12"
                        textAnchor="middle"
                        fontSize="15"
                        fontFamily="Arial, sans-serif"
                        fontWeight="900"
                        fill="#FEF3C7"
                        letterSpacing="2.5"
                      >
                        {slogan}
                      </text>
                    </g>

                    {/* BELOW BANNER (9B): 4 Icons (LEARN, CODE, GROW, SUCCEED) + Coffee Mug + Notebook */}
                    <g transform="translate(500, 920)">
                      {/* 1. LEARN (Book) */}
                      <g transform="translate(-150, 0)">
                        <circle cx="0" cy="0" r="18" fill="#1E3A8A" stroke="#F59E0B" strokeWidth="1.5" />
                        <path d="M -8,-5 Q 0,-9 8,-5 L 8,6 Q 0,2 -8,6 Z" fill="#FFFFFF" />
                        <text x="0" y="27" textAnchor="middle" fontSize="8" fontWeight="800" fill={isDiamond ? "#FDE68A" : "#1E3A8A"}>
                          LEARN
                        </text>
                      </g>

                      {/* 2. CODE (</>) */}
                      <g transform="translate(-50, 0)">
                        <circle cx="0" cy="0" r="18" fill="#047857" stroke="#F59E0B" strokeWidth="1.5" />
                        <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#FFFFFF">
                          &lt;/&gt;
                        </text>
                        <text x="0" y="27" textAnchor="middle" fontSize="8" fontWeight="800" fill={isDiamond ? "#FDE68A" : "#047857"}>
                          CODE
                        </text>
                      </g>

                      {/* 3. GROW (Plant) */}
                      <g transform="translate(50, 0)">
                        <circle cx="0" cy="0" r="18" fill="#16A34A" stroke="#F59E0B" strokeWidth="1.5" />
                        <path d="M 0,8 Q 0,-4 -7,-7 Q 0,-2 0,8 Z" fill="#FFFFFF" />
                        <path d="M 0,8 Q 0,-4 7,-7 Q 0,-2 0,8 Z" fill="#BBF7D0" />
                        <text x="0" y="27" textAnchor="middle" fontSize="8" fontWeight="800" fill={isDiamond ? "#FDE68A" : "#16A34A"}>
                          GROW
                        </text>
                      </g>

                      {/* 4. SUCCEED (Trophy) */}
                      <g transform="translate(150, 0)">
                        <circle cx="0" cy="0" r="18" fill="#D97706" stroke="#FEF3C7" strokeWidth="1.5" />
                        <path d="M -6,-7 L 6,-7 L 5,1 Q 0,7 -5,1 Z" fill="#FEF3C7" />
                        <line x1="0" y1="5" x2="0" y2="8" stroke="#FEF3C7" strokeWidth="2" />
                        <line x1="-5" y1="8" x2="5" y2="8" stroke="#FEF3C7" strokeWidth="2" />
                        <text x="0" y="27" textAnchor="middle" fontSize="8" fontWeight="800" fill={isDiamond ? "#FDE68A" : "#D97706"}>
                          SUCCEED
                        </text>
                      </g>

                      {/* Small Coffee Mug "FOCUS DISCIPLINE CONSISTENCY SUCCESS" */}
                      <g transform="translate(-250, 0)">
                        <rect x="-10" y="-8" width="20" height="18" rx="3" fill="#B45309" stroke="#FEF3C7" strokeWidth="1" />
                        <path d="M 10,-4 C 15,-4 15,6 10,6" fill="none" stroke="#FEF3C7" strokeWidth="1.5" />
                        <path d="M -3,-13 Q 0,-9 -3,-5" fill="none" stroke="#FDE68A" strokeWidth="1" />
                        <path d="M 3,-13 Q 6,-9 3,-5" fill="none" stroke="#FDE68A" strokeWidth="1" />
                        <text x="0" y="20" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDiamond ? "#FDE68A" : "#78350F"}>
                          FOCUS • CONSISTENCY
                        </text>
                      </g>

                      {/* Open Notebook "Plan Prepare Practice Progress" */}
                      <g transform="translate(250, 0)">
                        <path d="M -15,-8 Q 0,-12 15,-8 L 15,10 Q 0,6 -15,10 Z" fill="#F8FAFC" stroke="#334155" strokeWidth="1" />
                        <line x1="0" y1="-10" x2="0" y2="8" stroke="#64748B" strokeWidth="1" />
                        <text x="0" y="20" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDiamond ? "#FDE68A" : "#1E293B"}>
                          PLAN • PRACTICE
                        </text>
                      </g>
                    </g>

                    {/* Lit Diyas with Flame in Diamond Edition */}
                    {isDiamond && (
                      <g>
                        <g transform="translate(105, 870)">
                          <ellipse cx="0" cy="0" rx="14" ry="7" fill="#92400E" stroke="#F59E0B" strokeWidth="1" />
                          <path d="M 0,-3 Q 6,-14 0,-18 Q -6,-14 0,-3 Z" fill="#F59E0B" filter="url(#heavyGlow)" />
                          <circle cx="0" cy="-9" r="3" fill="#FEF3C7" />
                        </g>
                        <g transform="translate(895, 870)">
                          <ellipse cx="0" cy="0" rx="14" ry="7" fill="#92400E" stroke="#F59E0B" strokeWidth="1" />
                          <path d="M 0,-3 Q 6,-14 0,-18 Q -6,-14 0,-3 Z" fill="#F59E0B" filter="url(#heavyGlow)" />
                          <circle cx="0" cy="-9" r="3" fill="#FEF3C7" />
                        </g>
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            )}

            {activeTab === 'ai-render' && aiGeneratedImage && (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                <div className="w-full max-w-[460px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400">
                  <img
                    src={aiGeneratedImage}
                    alt="AI Generated CIMAGE BCA Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={aiGeneratedImage}
                    download={`CIMAGE_BCA_AI_${semester.toUpperCase()}_SEM.png`}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download AI Image</span>
                  </a>
                  <button
                    onClick={() => setActiveTab('canvas')}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Back to Vector Canvas
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'prompt' && (
              <div className="w-full space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-500" />
                    <span>Master Design Prompt (Exact AI Specifications)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed max-h-[380px] overflow-y-auto border border-slate-800 whitespace-pre-wrap selection:bg-amber-400 selection:text-black">
                  {fullPrompt}
                </div>

                {aiAdvice && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2">
                    <h5 className="font-bold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>CIMAGE AI Designer Strategy & Printing Advice</span>
                    </h5>
                    <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {aiAdvice}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Footer Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleDownloadPng(2048)}
              className="p-3 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 hover:border-amber-500 text-slate-800 dark:text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-500" />
              <span>2K Ultra PNG</span>
            </button>

            <button
              onClick={() => handleDownloadPng(4096)}
              className="p-3 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 hover:border-amber-500 text-slate-800 dark:text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Award className="w-4 h-4 text-blue-500" />
              <span>4K Print Master</span>
            </button>

            <button
              onClick={handleDownloadSvg}
              className="p-3 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 hover:border-amber-500 text-slate-800 dark:text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Scalable SVG</span>
            </button>

            <button
              onClick={handleCopyPrompt}
              className="p-3 rounded-2xl bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 hover:border-amber-500 text-slate-800 dark:text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Copy className="w-4 h-4 text-purple-500" />
              <span>{copied ? 'Prompt Copied!' : 'Copy Master Prompt'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
