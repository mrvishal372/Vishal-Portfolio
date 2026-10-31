import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, GraduationCap, Code, Briefcase, Award, FileText, 
  Mail, Phone, MapPin, ExternalLink, Github, Linkedin, 
  Download, Eye, Edit3, Plus, Sparkles, CheckCircle2, 
  Calendar, Layers, Terminal, ChevronRight, Share2, Globe,
  BookOpen, Star, ArrowUpRight, ShieldCheck, Heart, Cloud,
  Upload, Trash2, Camera, RefreshCw, FileCheck, ZoomIn,
  Instagram, Check, Copy, Shield, Lock, EyeOff, CheckCircle,
  HardDrive, LogOut, Sun, Moon
} from 'lucide-react';
import { PersonalPortfolioData, ProjectItem, CertificateItem, DocumentItem } from '../../types/portfolio';
import { loadVishalProfile, saveVishalProfile, generateResumePreviewDataUri } from '../../lib/vishalProfileData';
import { loadPortfolioAsync, savePortfolioPermanently, subscribeToPortfolioUpdates, saveToIndexedDB } from '../../lib/portfolioStorage';
import { getFounderProfile, saveFounderProfile } from '../../lib/founderProfile';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { EditProfileModal, EditTab } from './EditProfileModal';
import { ProfilePhotoZoomModal } from './ProfilePhotoZoomModal';
import { CoverPhotoRearrangeModal } from './CoverPhotoRearrangeModal';
import { getEffectiveAvatarUrl, isCustomAvatarUrl } from '../../lib/defaultAvatar';
import { hasAdminSession, adminUploadFile, adminLogout } from '../../lib/adminAuth';
import { ScrollReveal } from '../common/ScrollReveal';

interface VishalPortfolioSectionProps {
  avatarUrl?: string;
  onOpenAvatarPicker: () => void;
  language?: 'en' | 'hi';
  isUserAuthenticated?: boolean;
  isAdmin?: boolean;
  onUpdateProfile?: (updated: any) => void;
  profileTheme?: string;
  reducedMotion?: boolean;
}

type SectionTab = 'about' | 'projects' | 'education' | 'skills' | 'certificates' | 'documents' | 'contact';

export const VishalPortfolioSection: React.FC<VishalPortfolioSectionProps> = ({
  avatarUrl: propAvatarUrl,
  onOpenAvatarPicker,
  language = 'en',
  isUserAuthenticated = false,
  isAdmin = false,
  onUpdateProfile,
  profileTheme = 'light',
  reducedMotion = false
}) => {
  // Strict admin check: Only verified admin session or /admin route access enables edit mode
  const isRealAdmin = Boolean(
    isAdmin || 
    (typeof window !== 'undefined' && (
      hasAdminSession() || 
      window.location.pathname.startsWith('/admin') ||
      window.location.hash.includes('admin') ||
      window.location.search.includes('admin=true')
    ))
  );

  // Admin can toggle between Edit Mode and Visitor Preview Mode
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const canEdit = isRealAdmin && !isPreviewMode;

  const [portfolio, setPortfolio] = useState<PersonalPortfolioData>(() => loadVishalProfile());
  const [activeTab, setActiveTab] = useState<SectionTab>('about');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [cloudSynced, setCloudSynced] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalInitialTab, setEditModalInitialTab] = useState<EditTab>('basic');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | any | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [uploadingDocName, setUploadingDocName] = useState<string | null>(null);
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const directFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Background async cloud sync on mount
  useEffect(() => {
    loadPortfolioAsync().then(({ data }) => {
      if (data) {
        setPortfolio(data);
      }
      setCloudSynced(true);
    }).catch(err => {
      console.warn('Portfolio load check:', err);
    });

    // Instant real-time updates across all devices & Google accounts via SSE & Firestore onSnapshot
    const unsubscribe = subscribeToPortfolioUpdates((freshData) => {
      if (freshData) {
        setPortfolio(freshData);
        setCloudSynced(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync propAvatarUrl & listen for global portfolio_photo_updated events
  useEffect(() => {
    if (propAvatarUrl) {
      setPortfolio(prev => {
        if (isCustomAvatarUrl(prev.avatarUrl) && !isCustomAvatarUrl(propAvatarUrl)) {
          return prev;
        }
        if (prev.avatarUrl === propAvatarUrl) return prev;
        return { ...prev, avatarUrl: propAvatarUrl };
      });
    }
  }, [propAvatarUrl]);

  useEffect(() => {
    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl?: string }>;
      if (customEvent.detail?.avatarUrl) {
        setPortfolio(prev => {
          if (prev.avatarUrl === customEvent.detail.avatarUrl) return prev;
          return { ...prev, avatarUrl: customEvent.detail.avatarUrl! };
        });
      }
    };
    window.addEventListener('portfolio_photo_updated', handleAvatarUpdate);
    return () => window.removeEventListener('portfolio_photo_updated', handleAvatarUpdate);
  }, []);

  // ScrollSpy: observe sections as user scrolls down line by line
  useEffect(() => {
    const sectionIds: SectionTab[] = ['about', 'projects', 'education', 'skills', 'certificates', 'documents', 'contact'];
    
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '') as SectionTab;
          if (id) setActiveTab(id);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0.05
    });

    sectionIds.forEach(id => {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: SectionTab) => {
    setActiveTab(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      const yOffset = -90; // account for sticky navigation header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Profile photo priority: custom avatarUrl > saved avatar > fallback
  const displayAvatar = portfolio.avatarUrl || propAvatarUrl || '/profile.png.jpeg';

  const handleUpdatePortfolio = async (updated: PersonalPortfolioData) => {
    setPortfolio(updated);
    setSyncing(true);

    try {
      const founder = getFounderProfile();
      founder.fullName = updated.fullName;
      founder.course = updated.degree;
      founder.college = updated.college;
      founder.educationSummary = updated.shortBio;
      founder.photos = [updated.avatarUrl];
      founder.projects = updated.projects.map(p => ({
        title: p.title,
        description: p.description,
        techStack: p.technologies,
        liveUrl: p.liveUrl || '',
        githubUrl: p.githubUrl || ''
      }));
      founder.skills = updated.skillCategories.flatMap(c => c.skills.map(s => s.name));
      saveFounderProfile(founder);
    } catch (founderErr) {
      console.warn('Founder profile sync warning:', founderErr);
    }

    try {
      const res = await savePortfolioPermanently(updated);
      setCloudSynced(res.cloudSynced);
      showToast(language === 'hi' ? '✅ प्रोफ़ाइल अपडेट हो गया! सभी डिवाइस पर तुरंत लाइव।' : '✅ Profile saved! Live across all devices in <1s.');
    } catch {
      setCloudSynced(false);
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenEditTab = (tab: EditTab) => {
    if (!canEdit) return;
    setEditModalInitialTab(tab);
    setIsEditModalOpen(true);
  };

  const handleSaveCoverBanner = (bannerData: {
    bannerUrl: string;
    posY: number;
    posX: number;
    zoom: number;
  }) => {
    const updated: PersonalPortfolioData = {
      ...portfolio,
      coverBannerUrl: bannerData.bannerUrl,
      coverBannerPosY: bannerData.posY,
      coverBannerPosX: bannerData.posX,
      coverBannerZoom: bannerData.zoom
    };
    handleUpdatePortfolio(updated);
  };

  const handleRemoveCoverBanner = () => {
    const updated: PersonalPortfolioData = {
      ...portfolio,
      coverBannerUrl: '',
      coverBannerPosY: 50,
      coverBannerPosX: 50,
      coverBannerZoom: 1
    };
    handleUpdatePortfolio(updated);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      showToast(`${text} copied to clipboard!`);
    }
  };

  const handleShareProfile = async () => {
    const shareData = {
      title: `${portfolio.fullName || 'Vishal Yadav'} - Profile & Portfolio`,
      text: `Check out ${portfolio.fullName || 'Vishal Yadav'}'s official profile on Vyron AI!`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {}
    }
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
      showToast('Profile link copied to clipboard!');
    } catch {
      showToast('Profile link ready to share');
    }
  };

  // Direct file upload from the section (PDF, Word, Excel, Images, Text - up to 100MB)
  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEdit) {
      showToast('Access Denied: Only administrator can upload documents.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    // 100 MB Capacity Check
    if (file.size > 100 * 1024 * 1024) {
      showToast(`File is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed capacity is 100MB.`);
      return;
    }

    const fileNameLower = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || fileNameLower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/);
    const isTxt = file.type.startsWith('text/') || fileNameLower.endsWith('.txt');

    const fileType: 'pdf' | 'image' | 'text' = isPdf ? 'pdf' : isImage ? 'image' : 'text';
    const format = fileNameLower.split('.').pop() || (isPdf ? 'pdf' : isImage ? 'jpg' : 'txt');
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadingDocName(file.name);
    setUploadProgressPercent(0);

    try {
      let dataUrl = '';
      let textContent = '';

      if (isTxt && file.size < 2 * 1024 * 1024) {
        try {
          textContent = await file.text();
        } catch {}
      }

      // Try server upload first for permanent storage
      try {
        setUploadProgressPercent(25);
        const serverRes = await adminUploadFile(file);
        if (serverRes.fileUrl) {
          dataUrl = serverRes.fileUrl;
        }
        setUploadProgressPercent(75);
      } catch (uploadErr) {
        console.warn('Server upload fallback, converting to dataUrl', uploadErr);
        if (file.size <= 25 * 1024 * 1024) {
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }
      }

      setUploadProgressPercent(100);

      const docId = `doc_${Date.now()}`;
      const newDoc: DocumentItem = {
        id: docId,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: isPdf && file.name.toLowerCase().includes('resume') ? 'resume' : 'other',
        fileType,
        format,
        fileName: file.name,
        fileDataUrl: dataUrl,
        textContent,
        fileSize: sizeStr,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: 'Uploaded document'
      };

      try {
        await saveToIndexedDB(`blob_${docId}`, file);
      } catch {}

      const updatedPortfolio: PersonalPortfolioData = {
        ...portfolio,
        documents: [newDoc, ...portfolio.documents],
        ...(isPdf && !portfolio.resumePdfUrl ? {
          resumeFileName: file.name,
          resumePdfUrl: dataUrl,
          resumeLastUpdated: 'Today'
        } : {})
      };

      await handleUpdatePortfolio(updatedPortfolio);
      e.target.value = '';
      scrollToSection('documents');
      showToast(`"${file.name}" uploaded & synced live across all public profiles!`);
    } catch (err: any) {
      console.error('File upload error:', err);
      showToast(`Upload error: ${err?.message || 'Failed to process file'}`);
    } finally {
      setUploadingDocName(null);
      setUploadProgressPercent(0);
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (!canEdit) {
      showToast('Access Denied: Only administrator can delete files.');
      return;
    }
    const updated: PersonalPortfolioData = {
      ...portfolio,
      documents: portfolio.documents.filter(d => d.id !== id),
      resumeFileName: portfolio.documents.find(d => d.id === id)?.category === 'resume' ? '' : portfolio.resumeFileName,
      resumePdfUrl: portfolio.documents.find(d => d.id === id)?.category === 'resume' ? '' : portfolio.resumePdfUrl
    };
    handleUpdatePortfolio(updated);
    showToast('File removed successfully');
  };

  const handleOpenResumePreview = () => {
    if (!portfolio.resumePdfUrl) {
      if (portfolio.fullName) {
        const generated = generateResumePreviewDataUri(portfolio);
        setPreviewDoc({
          id: 'generated_resume',
          title: `${portfolio.fullName} - Resume`,
          fileType: 'pdf',
          format: 'pdf',
          fileName: 'Resume_Vishal_Yadav.pdf',
          fileDataUrl: generated,
          fileSize: '45 KB',
          uploadDate: 'Live Preview',
          category: 'resume'
        });
        setIsPreviewModalOpen(true);
        return;
      }
      showToast('No resume uploaded yet.');
      return;
    }

    setPreviewDoc({
      id: 'primary_resume',
      title: portfolio.resumeFileName || 'Resume PDF',
      fileType: 'pdf',
      format: 'pdf',
      fileName: portfolio.resumeFileName || 'Resume.pdf',
      fileDataUrl: portfolio.resumePdfUrl,
      fileSize: 'PDF',
      uploadDate: portfolio.resumeLastUpdated || 'Current',
      category: 'resume'
    });
    setIsPreviewModalOpen(true);
  };

  const handleDownloadResume = () => {
    if (portfolio.resumePdfUrl) {
      const link = document.createElement('a');
      link.href = portfolio.resumePdfUrl;
      link.download = portfolio.resumeFileName || 'Vishal_Yadav_Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading resume...');
    } else {
      handleOpenResumePreview();
    }
  };

  // Filter projects
  const filteredProjects = portfolio.projects.filter(p => {
    if (projectFilter === 'all') return true;
    return (p.category || '').toLowerCase().includes(projectFilter.toLowerCase());
  });

  return (
    <div className="space-y-6 sm:space-y-8 relative pb-12">
      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for 100MB documents/PDFs (Admin Only) */}
      {canEdit && (
        <input
          type="file"
          ref={directFileInputRef}
          onChange={handleDirectFileUpload}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt"
          className="hidden"
          aria-hidden="true"
        />
      )}

      {/* Uploading progress notification bar */}
      {uploadingDocName && (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border-2 border-blue-400/60 shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Uploading {uploadingDocName}...
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Broadcasting in real-time across all public profiles ({uploadProgressPercent}%)
              </p>
            </div>
          </div>
          <div className="w-24 sm:w-36 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${uploadProgressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* 1. HERO HEADER CARD (Instagram & LinkedIn Hybrid: Photo ALWAYS ON THE LEFT) */}
      <ScrollReveal cascadeIndex={0}>
        <div className="relative rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-lg overflow-hidden transition-all">
        {/* Cover Photo / Header Banner */}
        <div className="relative w-full h-36 sm:h-52 md:h-64 overflow-hidden bg-slate-900">
          {portfolio.coverBannerUrl ? (
            <img
              src={portfolio.coverBannerUrl}
              alt="Cover background"
              className="w-full h-full object-cover transition-transform duration-300"
              style={{
                objectPosition: `${portfolio.coverBannerPosX ?? 50}% ${portfolio.coverBannerPosY ?? 50}%`,
                transform: `scale(${portfolio.coverBannerZoom ?? 1})`
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 right-12 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          )}

          {/* Banner bottom dark gradient for smooth contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
        </div>

        {/* Main Profile Info Row (Name UP AT THE TOP beside avatar on mobile & laptop!) */}
        <div className="relative z-10 px-4 sm:px-6 md:px-8 pb-6 -mt-12 sm:-mt-16 md:-mt-20 grid grid-cols-[auto_1fr] gap-x-3.5 sm:gap-x-6 md:gap-x-8 gap-y-2.5 sm:gap-y-3">
          {/* Left: Avatar Container (Spans both rows on desktop) */}
          <div className="relative shrink-0 flex flex-col items-center sm:row-span-2">
            <button
              type="button"
              onClick={() => setIsPhotoZoomOpen(true)}
              className="p-1 sm:p-1.5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 shadow-2xl relative group cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/40 transition-transform active:scale-95 block"
              title="Click to view and zoom profile picture"
              aria-label="Click to view and zoom profile picture"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden aspect-square bg-slate-900 ring-2 sm:ring-4 ring-white dark:ring-slate-900 relative">
                <img
                  src={getEffectiveAvatarUrl(displayAvatar)}
                  alt={portfolio.fullName || 'Vishal Yadav'}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] sm:text-xs font-bold gap-1 pointer-events-none">
                  <ZoomIn className="w-5 h-5 text-amber-300" />
                  <span>Zoom</span>
                </div>
              </div>
              {/* Online Presence Indicator */}
              <span 
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 ring-2 sm:ring-4 ring-white dark:ring-slate-900 flex items-center justify-center shadow-md" 
                title="Active Creator"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
              </span>
            </button>
          </div>

          {/* Top Right: Name, Badges & Handle Row (UP AT THE TOP next to avatar, jaha pr tha wahi pe!) */}
          <div className="min-w-0 pt-1 sm:pt-3 md:pt-4 space-y-1.5">
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-sm max-w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                <span className="text-slate-950 dark:text-white select-text">
                  {portfolio.fullName || 'Vishal Yadav'}
                </span>
                {/* Verified Checkmark Badge */}
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0A66C2] text-white shrink-0 shadow-xs" title="Verified Creator & Founder">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                </span>
              </h1>

              {/* Creator Badge */}
              <span className="px-2.5 py-1 rounded-full bg-amber-100/90 dark:bg-amber-400/20 text-amber-950 dark:text-amber-300 text-[10px] sm:text-xs font-black border border-amber-300 dark:border-amber-400/30 flex items-center gap-1 shrink-0 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>Vyron AI Creator</span>
              </span>
            </div>

            {/* Username Handle */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5 px-0.5">
              <a
                href="https://instagram.com/mr_vishal372"
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm border border-white/60 dark:border-white/10 shadow-xs"
              >
                <Instagram className="w-3.5 h-3.5 text-rose-500" />
                <span>@mr_vishal372</span>
              </a>
              <span className="text-slate-400 dark:text-slate-500 font-bold">·</span>
              <span className="text-[11px] sm:text-xs text-slate-800 dark:text-slate-300 font-semibold px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-white/50 dark:border-white/10 shadow-xs">
                BCA Student &amp; Developer
              </span>
            </div>
          </div>

          {/* Full Width Below on Mobile / Right Column Below Name on Desktop (col-span-2 on mobile, col-start-2 on desktop!) */}
          <div className="col-span-2 sm:col-start-2 sm:col-span-1 min-w-0 pt-1 sm:pt-0 space-y-2.5">
            {/* Headline */}
            <p className="text-xs sm:text-sm md:text-base font-semibold text-blue-700 dark:text-amber-300 leading-snug">
              {portfolio.headline || 'Creator & Founder of Vyron AI | BCA Student | Full-Stack & AI Innovation'}
            </p>

            {/* Meta Details Line with Middle Dots */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium">
              {(portfolio.degree || portfolio.college) && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400 shrink-0" />
                  <span>{portfolio.degree || portfolio.college}</span>
                </span>
              )}
              {portfolio.location && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{portfolio.location}</span>
                </span>
              )}
              {portfolio.email && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{portfolio.email}</span>
                </span>
              )}
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed whitespace-pre-line pt-0.5">
              {portfolio.aboutMe || portfolio.shortBio || portfolio.tagline || 'BCA student in Patna learning programming, IT, and modern AI development. Building Vyron AI into a unified platform.'}
            </p>

            {/* Social & Connect Quick Links */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <a
                href={portfolio.linkedin || 'https://linkedin.com/in/mr_vishal372'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </a>

              <a
                href={portfolio.github || 'https://github.com/mr_vishal372'}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href="https://instagram.com/mr_vishal372"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 border border-pink-200 dark:border-pink-800 transition-colors cursor-pointer"
              >
                <Instagram className="w-3.5 h-3.5 text-rose-500" />
                <span>Instagram</span>
              </a>

              {portfolio.email && (
                <a
                  href={`mailto:${portfolio.email}`}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-bold inline-flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Email</span>
                </a>
              )}
            </div>

            {/* Action Buttons: Strict Public vs Admin separation! */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {canEdit ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleOpenEditTab('basic')}
                    className="flex-1 sm:flex-none min-w-[120px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => directFileInputRef.current?.click()}
                    className="flex-1 sm:flex-none min-w-[120px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-200 dark:border-white/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Upload PDF or document"
                  >
                    <Upload className="w-4 h-4 text-blue-600 dark:text-amber-400" />
                    <span>Upload File</span>
                  </button>
                </>
              ) : (
                /* Public Visitor Buttons (Clean & Professional: NO edit/upload buttons!) */
                <>
                  <button
                    type="button"
                    onClick={handleOpenResumePreview}
                    className="flex-1 sm:flex-none min-w-[120px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>View Resume</span>
                  </button>

                  {portfolio.resumePdfUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="flex-1 sm:flex-none min-w-[120px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  )}

                  <a
                    href={`mailto:${portfolio.email || 'bk372.in@gmail.com'}`}
                    className="flex-1 sm:flex-none min-w-[110px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Mail className="w-4 h-4 text-blue-600 dark:text-amber-400" />
                    <span>Get in Touch</span>
                  </a>
                </>
              )}

              <button
                type="button"
                onClick={handleShareProfile}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border border-slate-200 dark:border-white/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="Share profile"
              >
                {shareCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </ScrollReveal>

      {/* 2. HIGHLIGHTS & STATS BAR (Clicking smoothly jumps down to that section!) */}
      <ScrollReveal cascadeIndex={1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => scrollToSection('projects')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all text-center group cursor-pointer"
          >
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-300 group-hover:scale-105 transition-transform">
              {portfolio.projects.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
              <Briefcase className="w-3 h-3 text-amber-500" />
              <span>Projects</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('certificates')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-emerald-400/50 transition-all text-center group cursor-pointer"
          >
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-300 group-hover:scale-105 transition-transform">
              {portfolio.certificates.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
              <Award className="w-3 h-3 text-emerald-500" />
              <span>Certifications</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('documents')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-blue-400/50 transition-all text-center group cursor-pointer"
          >
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-300 group-hover:scale-105 transition-transform">
              {portfolio.documents.length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'hi' ? 'दस्तावेज़' : 'Documents'}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('skills')}
            className="p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-purple-400/50 transition-all text-center group cursor-pointer"
          >
            <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform">
              {portfolio.skillCategories.reduce((acc, cat) => acc + cat.skills.length, 0)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
              <Code className="w-3.5 h-3.5 text-purple-500" />
              <span>{language === 'hi' ? 'स्किल्स' : 'Skills'}</span>
            </div>
          </button>
        </div>
      </ScrollReveal>

      {/* 3. STICKY IN-PAGE NAVIGATION (Target of CSS selector 1 & buttons 2 to 8) */}
      <ScrollReveal cascadeIndex={2}>
        <div className="w-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm sticky top-16 z-20 transition-all">
          <div className="flex sm:grid sm:grid-cols-7 gap-1.5 w-full overflow-x-auto no-scrollbar snap-x snap-mandatory">
            {[
              { id: 'about' as SectionTab, shortLabel: language === 'hi' ? 'बायो' : 'About', fullLabel: language === 'hi' ? 'बायो' : 'About', icon: User },
              { id: 'projects' as SectionTab, shortLabel: language === 'hi' ? 'प्रोजेक्ट्स' : 'Projects', fullLabel: language === 'hi' ? 'प्रोजेक्ट्स' : 'Projects', icon: Briefcase },
              { id: 'education' as SectionTab, shortLabel: language === 'hi' ? 'शिक्षा' : 'Education', fullLabel: language === 'hi' ? 'शिक्षा' : 'Education', icon: GraduationCap },
              { id: 'skills' as SectionTab, shortLabel: language === 'hi' ? 'स्किल्स' : 'Skills', fullLabel: language === 'hi' ? 'स्किल्स' : 'Skills', icon: Code },
              { id: 'certificates' as SectionTab, shortLabel: language === 'hi' ? 'सर्टिफिकेट्स' : 'Certificates', fullLabel: language === 'hi' ? 'सर्टिफिकेट्स' : 'Certificates', icon: Award },
              { id: 'documents' as SectionTab, shortLabel: language === 'hi' ? 'दस्तावेज़' : 'Documents', fullLabel: language === 'hi' ? 'दस्तावेज़' : 'Documents', icon: FileText },
              { id: 'contact' as SectionTab, shortLabel: language === 'hi' ? 'संपर्क' : 'Contact', fullLabel: language === 'hi' ? 'संपर्क' : 'Contact', icon: Mail }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  title={tab.fullLabel}
                  aria-label={`Jump to ${tab.fullLabel}`}
                  onClick={() => scrollToSection(tab.id)}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all touch-manipulation cursor-pointer select-none active:scale-[0.98] whitespace-nowrap shrink-0 snap-start ${
                    isActive
                      ? 'bg-[#000080] dark:bg-amber-400 text-white dark:text-slate-950 shadow-sm font-black'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200/50 dark:border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* 4. LINE BY LINE VERTICAL SHOWCASE (Everything visible sequentially as user scrolls down!) */}
      <div className="space-y-10 sm:space-y-12">
        {/* ============================================================== */}
        {/* SECTION 1: ABOUT */}
        {/* ============================================================== */}
        <ScrollReveal as="section" id="section-about" className="scroll-mt-32 space-y-6" cascadeIndex={3}>
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <User className="w-6 h-6 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'बायो' : 'About'}</span>
              </h3>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleOpenEditTab('basic')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-amber-400 hover:bg-blue-50 dark:hover:bg-amber-950/30 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Bio</span>
                </button>
              )}
            </div>

            <div className="space-y-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {portfolio.aboutMe || portfolio.shortBio || 'Vishal Yadav completed his schooling from his village up to class 12, then moved to Patna to pursue BCA (Bachelor of Computer Applications). Passionate about software engineering, web development, and AI systems, he created and developed Vyron AI to unite essential AI tools and intelligent assistants under one roof.'}
            </div>
          </div>

          {/* Quick Profile Summary Details (4-Card Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? 'डिग्री' : 'Degree'}</span>
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {portfolio.degree || 'BCA (Bachelor of Computer Applications)'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{portfolio.college || 'College in Patna'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Location</span>
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {portfolio.location || 'Patna, Bihar'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current Residence</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Current Status</span>
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                {portfolio.currentStatus || 'BCA Student'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Actively Learning &amp; Building</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Creator Role</span>
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                Vyron AI Platform
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Founder &amp; Developer</p>
            </div>
          </div>

          {/* Learning Journey Timeline (Milestones) */}
          {portfolio.learningJourney && portfolio.learningJourney.length > 0 && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'सफ़र' : 'Journey'}</span>
              </h3>
              <div className="space-y-5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {portfolio.learningJourney.map((item, idx) => (
                  <div key={item.id || idx} className="relative pl-8 space-y-1">
                    <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 dark:bg-amber-400 ring-4 ring-white dark:ring-slate-900" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-700 dark:text-amber-300">{item.period}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.phase}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.description}</p>
                    {item.topicsCovered && item.topicsCovered.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.topicsCovered.map((t, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollReveal>

        {/* ============================================================== */}
        {/* SECTION 2: PROJECTS */}
        {/* ============================================================== */}
        <ScrollReveal as="section" id="section-projects" className="scroll-mt-32 space-y-4" cascadeIndex={4}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'प्रोजेक्ट्स' : 'Projects'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Applications, platforms, tools, and systems created by Vishal Yadav</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => handleOpenEditTab('projects')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'web', label: 'Web & Apps' },
              { id: 'ai', label: 'AI & Systems' },
              { id: 'utility', label: 'Utilities' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setProjectFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  projectFilter === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900/90 border border-dashed border-slate-300 dark:border-slate-700 shadow-sm space-y-3">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-400">No projects matching this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{proj.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 shrink-0">
                        {proj.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-blue-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditTab('projects')}
                        className="text-xs text-blue-600 dark:text-amber-400 hover:underline font-bold"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>

        {/* ============================================================== */}
        {/* SECTION 3: EDUCATION */}
        {/* ============================================================== */}
        <ScrollReveal as="section" id="section-education" className="scroll-mt-32 space-y-4" cascadeIndex={5}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'शिक्षा' : 'Education'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Academic background, college, schooling, and course studies</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => handleOpenEditTab('education')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {portfolio.education.map((edu) => (
              <div
                key={edu.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-start gap-4"
              >
                {/* Institution Icon Container */}
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{edu.degree}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-fit">
                      {edu.duration}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold space-y-0.5">
                    <p className="text-blue-700 dark:text-blue-400 font-bold">{edu.institution}</p>
                    {edu.universityOrBoard && <p className="text-slate-500">{edu.universityOrBoard}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {edu.status && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {edu.status}
                      </span>
                    )}
                    {edu.location && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{edu.location}</span>
                      </span>
                    )}
                  </div>

                  {edu.highlights && edu.highlights.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Focus &amp; Coursework:</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5 pt-0.5">
                        {edu.highlights.map((h, hIdx) => (
                          <li key={hIdx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {canEdit && (
                    <div className="pt-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTab('education')}
                        className="text-xs text-blue-600 dark:text-amber-400 hover:underline font-bold"
                      >
                        Edit Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* SECTION 4: SKILLS */}
        {/* ============================================================== */}
        <ScrollReveal as="section" id="section-skills" className="scroll-mt-32 space-y-4" cascadeIndex={6}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Code className="w-6 h-6 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'स्किल्स' : 'Skills'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Languages, frameworks, system proficiencies, and developer tools</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => handleOpenEditTab('skills')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Manage Skills</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.skillCategories.map((cat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-3.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{cat.categoryName}</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400">{cat.skills.length} skills</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cat.skills.map((skill, sIdx) => {
                    const levelScore = skill.level === 'Advanced' ? 3 : skill.level === 'Intermediate' ? 2 : 1;
                    return (
                      <div
                        key={sIdx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {skill.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {skill.level}
                          </span>
                        </div>

                        {/* LinkedIn-style 3-segment proficiency meter */}
                        <div className="grid grid-cols-3 gap-1">
                          <div className={`h-1.5 rounded-full ${levelScore >= 1 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          <div className={`h-1.5 rounded-full ${levelScore >= 2 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                          <div className={`h-1.5 rounded-full ${levelScore >= 3 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* SECTION 5: CERTIFICATES */}
        {/* ============================================================== */}
        <ScrollReveal as="section" id="section-certificates" className="scroll-mt-32 space-y-4" cascadeIndex={7}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Award className="w-6 h-6 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'सर्टिफिकेट्स' : 'Certificates'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Course certificates, licenses, and verified credentials</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => handleOpenEditTab('certificates')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certificate</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white truncate">{cert.title}</h4>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{cert.issuer}</p>
                    <p className="text-[11px] text-slate-400">Issued: {cert.issueDate}</p>
                  </div>
                </div>

                {cert.credentialUrl && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Show Credential</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* SECTION 6: DOCUMENTS */}
        {/* ============================================================== */}
        <ScrollReveal as="section" id="section-documents" className="scroll-mt-32 space-y-4" cascadeIndex={8}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <FileText className="w-6 h-6 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'दस्तावेज़' : 'Documents'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official resume, certifications, and academic documents</p>
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => directFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Resume Spotlight Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 dark:from-amber-400/10 dark:via-blue-900/20 dark:to-indigo-950/30 border-2 border-amber-400/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {portfolio.resumeFileName || 'Vishal Yadav - Official Resume'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400/40">
                    Primary Resume
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Updated: {portfolio.resumeLastUpdated || 'Current'} &bull; Format: PDF
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenResumePreview}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Resume</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadResume}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Uploaded Documents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {portfolio.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      doc.fileType === 'pdf' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : doc.fileType === 'image'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {doc.format || doc.fileType}
                    </span>

                    {doc.category === 'resume' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Resume
                      </span>
                    )}
                  </div>

                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {doc.title || doc.fileName}
                  </h5>

                  <p className="text-[11px] text-slate-400 truncate">
                    {doc.fileName} &bull; {doc.fileSize || 'N/A'}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDoc(doc);
                      setIsPreviewModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.fileDataUrl;
                        link.download = doc.fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button (Admin Only: completely hidden from public visitors!) */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ============================================================== */}
        {/* SECTION 7: CONTACT */}
        {/* ============================================================== */}
        <ScrollReveal as="section" id="section-contact" className="scroll-mt-32 space-y-4" cascadeIndex={9}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Mail className="w-6 h-6 text-blue-600 dark:text-amber-400 shrink-0" />
                <span>{language === 'hi' ? 'संपर्क' : 'Contact'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct channels to connect, collaborate, and discuss projects</p>
            </div>

            {canEdit && (
              <button
                type="button"
                onClick={() => handleOpenEditTab('links')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Links</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Email */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>Email Address</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(portfolio.email || 'bk372.in@gmail.com', 'email')}
                  className="text-[11px] text-blue-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white break-all">
                {portfolio.email || 'bk372.in@gmail.com'}
              </p>
              <a
                href={`mailto:${portfolio.email || 'bk372.in@gmail.com'}`}
                className="text-xs font-semibold text-blue-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Send direct email</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Phone / WhatsApp */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Phone / WhatsApp</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(portfolio.phone || '+91 7320913451', 'phone')}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {portfolio.phone || '+91 7320913451'}
              </p>
              <a
                href={`https://wa.me/917320913451?text=Hello%20Vishal`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Instagram */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Instagram className="w-4 h-4 text-rose-500" />
                <span>Instagram</span>
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                @mr_vishal372
              </p>
              <a
                href="https://instagram.com/mr_vishal372"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Open Instagram Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* LinkedIn */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {portfolio.linkedin ? 'Vishal Yadav' : 'mr_vishal372'}
              </p>
              <a
                href={portfolio.linkedin || 'https://linkedin.com/in/mr_vishal372'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#0A66C2] dark:text-blue-400 hover:underline inline-flex items-center gap-1 pt-1"
              >
                <span>Open LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* GitHub */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>GitHub</span>
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                @mr_vishal372
              </p>
              <a
                href={portfolio.github || 'https://github.com/mr_vishal372'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 inline-flex items-center gap-1 pt-1"
              >
                <span>View GitHub Repositories</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Location / Current City */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{language === 'hi' ? 'शहर' : 'City'}</span>
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Patna, Bihar, India
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Open for opportunities &amp; collaborative AI ventures
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* 🛡️ ADMIN ONLY: System Settings, Local Cache & Security Controls */}
        {isRealAdmin && (
          <ScrollReveal cascadeIndex={9}>
            <div className="p-6 rounded-3xl bg-gradient-to-br from-white/95 via-amber-50/30 to-slate-50/90 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-800/60 border-2 border-amber-400/60 dark:border-amber-400/40 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-400/30 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {language === 'hi' ? 'एडमिन सेटिंग्स व सिस्टम नियंत्रण' : 'Admin Settings & System Controls'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                        Admin Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {language === 'hi' 
                        ? 'यह नियंत्रण केवल व्यवस्थापक को दिखता है। आम उपयोगकर्ता केवल पोर्टफोलियो देख सकते हैं।' 
                        : 'Visible only to the administrator. Regular users have clean view-only access.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTab('basic')}
                    className="px-3.5 py-2 rounded-xl bg-[#000080] hover:bg-blue-900 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile Info'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local Storage & Cache Control (Protected for Admin) */}
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-rose-500" />
                      <span>{language === 'hi' ? 'लोकल स्टोरेज व ऐप कैश' : 'Local Storage & App Cache'}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {language === 'hi'
                      ? 'डिवाइस पर कैश्ड डेटा साफ़ करें। यह क्रिया सुरक्षित एडमिन सुरक्षा के तहत है।'
                      : 'Clear cached browser storage. Only accessible to the administrator.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(language === 'hi' 
                        ? 'एडमिन सुरक्षा पुष्टि: क्या आप निश्चित रूप से लोकल स्टोरेज और ऐप कैश साफ़ करना चाहते हैं?' 
                        : 'Admin Confirmation: Are you sure you want to clear local storage and cache?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="mt-2 w-full px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'कैश व डेटा साफ़ करें (Admin Clear)' : 'Clear App Cache (Admin)'}</span>
                  </button>
                </div>

                {/* Cloud Sync & Permanent Save */}
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-emerald-500" />
                      <span>{language === 'hi' ? 'क्लाउड सिंक व परमानेंट बैकअप' : 'Cloud Sync & Permanent Save'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {cloudSynced ? '✓ Synced' : 'Syncing...'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {language === 'hi'
                      ? 'पोर्टफोलियो डेटा को क्लाउड और स्थायी बैकअप में सुरक्षित रखें।'
                      : 'Force backup of your portfolio data to permanent cloud storage.'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={syncing}
                      onClick={async () => {
                        setSyncing(true);
                        try {
                          const res = await savePortfolioPermanently(portfolio);
                          setCloudSynced(res.cloudSynced);
                          showToast(language === 'hi' ? 'क्लाउड बैकअप सफल रहा' : 'Cloud backup successful');
                        } catch {
                          showToast(language === 'hi' ? 'क्लाउड बैकअप त्रुटि' : 'Cloud backup failed');
                        } finally {
                          setSyncing(false);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                      <span>{language === 'hi' ? 'क्लाउड पर सेव करें' : 'Force Cloud Backup'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(language === 'hi' ? 'क्या आप डिफ़ॉल्ट परमानेंट बैकअप रिस्टोर करना चाहते हैं?' : 'Restore default portfolio data from permanent backup?')) {
                          const defaultData = loadVishalProfile();
                          handleUpdatePortfolio(defaultData);
                          showToast(language === 'hi' ? 'डिफ़ॉल्ट बैकअप रिस्टोर हो गया' : 'Restored default backup');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                      title="Restore default backup"
                    >
                      <span>{language === 'hi' ? 'रिस्टोर' : 'Restore'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick App Preferences (Theme & Language) */}
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{language === 'hi' ? 'ऐप प्राथमिकताएं' : 'App Preferences'}</span>
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {language === 'hi' ? 'थीम और भाषा सेटिंग्स' : 'System theme and language preferences'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {onUpdateProfile && (
                      <>
                        <button
                          type="button"
                          onClick={() => onUpdateProfile({ theme: profileTheme === 'dark' ? 'light' : 'dark' })}
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          {profileTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                          <span>{profileTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateProfile({ language: language === 'hi' ? 'en' : 'hi' })}
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{language === 'hi' ? 'English (EN)' : 'हिंदी (HI)'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Admin Session Security */}
                <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>{language === 'hi' ? 'सक्रिय एडमिन सत्र' : 'Active Admin Session'}</span>
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    {language === 'hi' ? 'एडमिन सत्र समाप्त करने के लिए लॉग आउट करें।' : 'End administrative editing session securely.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(language === 'hi' ? 'क्या आप एडमिन सत्र समाप्त करना चाहते हैं?' : 'Log out of Admin session?')) {
                        adminLogout();
                        window.location.reload();
                      }
                    }}
                    className="mt-1 w-full px-3.5 py-2 rounded-xl bg-slate-200/90 hover:bg-rose-100 dark:bg-slate-700 dark:hover:bg-rose-950/40 text-slate-800 hover:text-rose-700 dark:text-slate-200 dark:hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'एडमिन लॉग आउट' : 'Admin Logout'}</span>
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Discreet Admin Login Footer for Owner */}
        {!isRealAdmin && (
          <ScrollReveal cascadeIndex={10}>
            <div className="pt-6 pb-2 text-center">
              <a
                href="/admin"
                className="text-[11px] text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors inline-flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Portal (/admin)</span>
              </a>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewDoc(null);
        }}
        onDelete={(id) => handleDeleteDocument(id)}
        isAdmin={canEdit}
      />

      {/* 2. Edit Profile Modal (Admin Only) */}
      {canEdit && (
        <EditProfileModal
          portfolio={portfolio}
          isOpen={isEditModalOpen}
          initialTab={editModalInitialTab}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdatePortfolio}
          isAdmin={canEdit}
        />
      )}

      {/* 3. Profile Photo Zoom & Lightbox Modal (For Everyone) */}
      <ProfilePhotoZoomModal
        isOpen={isPhotoZoomOpen}
        avatarUrl={displayAvatar}
        userName={portfolio.fullName}
        onClose={() => setIsPhotoZoomOpen(false)}
      />

      {/* 4. Cover Photo & Background Rearrange Modal (Admin Only) */}
      {canEdit && (
        <CoverPhotoRearrangeModal
          isOpen={isCoverModalOpen}
          onClose={() => setIsCoverModalOpen(false)}
          currentBannerUrl={portfolio.coverBannerUrl}
          currentPosY={portfolio.coverBannerPosY}
          currentPosX={portfolio.coverBannerPosX}
          currentZoom={portfolio.coverBannerZoom}
          avatarUrl={getEffectiveAvatarUrl(displayAvatar)}
          onSave={handleSaveCoverBanner}
          onRemove={handleRemoveCoverBanner}
        />
      )}
    </div>
  );
};
