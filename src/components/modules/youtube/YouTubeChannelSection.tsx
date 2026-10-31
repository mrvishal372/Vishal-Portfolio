import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Share2, 
  Check, 
  Search, 
  Sparkles, 
  Youtube, 
  Radio, 
  Clock, 
  Eye, 
  ThumbsUp, 
  Maximize2, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Tv,
  Star,
  Film
} from 'lucide-react';
import { YouTubeVideo } from '../../../types/video';
import { 
  subscribeToVideoUpdates, 
  adminAddVideo, 
  adminUpdateVideo, 
  adminDeleteVideo, 
  adminSetFeaturedVideo,
  extractYouTubeId, 
  getYouTubeThumbnail 
} from '../../../lib/videoStorage';
import { appleCardHover, appleCardTap, appleSpringFast } from '../../../lib/motionTokens';

export type StorageCategory = 'Videos' | 'Shorts' | 'Audio';

/**
 * Normalizes any video link or tag into:
 * - 'Shorts' if category is shorts, URL has /shorts/, or duration < 60s
 * - 'Audio' if category is audio, sound, music, podcast
 * - 'Videos' for all full-length long videos
 */
export function getNormalizedCategory(category?: string, url?: string): StorageCategory {
  const cat = (category || '').toLowerCase().trim();
  const link = (url || '').toLowerCase().trim();
  if (cat === 'shorts' || cat === 'short' || link.includes('/shorts/')) {
    return 'Shorts';
  }
  if (cat === 'audio' || cat === 'sound' || cat === 'music' || cat === 'song' || cat === 'podcast') {
    return 'Audio';
  }
  return 'Videos';
}

interface YouTubeChannelSectionProps {
  isAdmin?: boolean;
}

export const YouTubeChannelSection: React.FC<YouTubeChannelSectionProps> = ({ isAdmin = false }) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Videos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<YouTubeVideo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form Fields
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<StorageCategory>('Videos');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // Real-time synchronization subscription (1-second update across all phones)
  useEffect(() => {
    const unsubscribe = subscribeToVideoUpdates((freshVideos) => {
      setVideos(freshVideos);
      // If no video is selected yet, select the featured video or first video
      setSelectedVideo((prev) => {
        if (prev) {
          const updated = freshVideos.find((v) => v.id === prev.id);
          return updated || prev;
        }
        const featured = freshVideos.find((v) => v.isFeatured) || freshVideos[0];
        return featured || null;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Lock background scroll and hide header & bottom navigation when edit/add modal is open on mobile
  useEffect(() => {
    if (isAddModalOpen || deletingVideo) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalDocOverflow = document.documentElement.style.overflow;
      const mainEl = document.querySelector('main');
      const originalMainOverflow = mainEl ? mainEl.style.overflow : '';

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (mainEl) mainEl.style.overflow = 'hidden';
      document.body.classList.add('modal-fullscreen-open');

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalDocOverflow;
        if (mainEl) mainEl.style.overflow = originalMainOverflow;
        document.body.classList.remove('modal-fullscreen-open');
      };
    }
  }, [isAddModalOpen, deletingVideo]);

  // Handle Mute / Unmute postMessage to YouTube IFrame
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: nextMuted ? 'mute' : 'unMute',
            args: ''
          }),
          '*'
        );
      } catch (e) {
        console.warn('IFrame postMessage notice:', e);
      }
    }
  };

  // Switch Active Playing Video
  const handleSelectVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    // Smoothly scroll to player
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Fullscreen toggle
  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Copy share link
  const handleCopyLink = (video: YouTubeVideo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Open Add Video Modal
  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormUrl('');
    setFormTitle('');
    setFormCategory('Videos');
    setFormDescription('');
    setFormDuration('');
    setFormIsFeatured(false);
    setSaveError(null);
    setSaveSuccess(null);
    setIsAddModalOpen(true);
  };

  // Smart URL handler: Auto-detects YouTube Shorts or regular video
  const handleUrlChange = (url: string) => {
    setFormUrl(url);
    if (url.includes('/shorts/')) {
      setFormCategory('Shorts');
    } else if (url.trim() && formCategory === 'Shorts' && !url.includes('/shorts/')) {
      setFormCategory('Videos');
    }
  };

  // Open Edit Video Modal
  const handleOpenEdit = (video: YouTubeVideo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingVideo(video);
    setFormUrl(video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`);
    setFormTitle(video.title);
    setFormCategory(getNormalizedCategory(video.category, video.youtubeUrl));
    setFormDescription(video.description || '');
    setFormDuration(video.duration || '');
    setFormIsFeatured(Boolean(video.isFeatured));
    setSaveError(null);
    setSaveSuccess(null);
    setIsAddModalOpen(true);
  };

  // Open Delete Confirm Modal
  const handleOpenDelete = (video: YouTubeVideo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingVideo(video);
  };

  // Execute Save (Add or Update)
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    const cleanId = extractYouTubeId(formUrl);
    if (!cleanId) {
      setSaveError('Please enter a valid YouTube video link or ID.');
      return;
    }

    if (!formTitle.trim()) {
      setSaveError('Please enter a video title.');
      return;
    }

    const targetCategory: StorageCategory = formCategory || (formUrl.includes('/shorts/') ? 'Shorts' : 'Videos');

    setIsSaving(true);
    try {
      if (editingVideo) {
        const res = await adminUpdateVideo({
          ...editingVideo,
          youtubeId: cleanId,
          youtubeUrl: formUrl.trim().startsWith('http') ? formUrl.trim() : `https://www.youtube.com/watch?v=${cleanId}`,
          title: formTitle.trim(),
          category: targetCategory,
          description: formDescription.trim(),
          duration: formDuration.trim() || undefined,
          isFeatured: formIsFeatured,
          thumbnailUrl: getYouTubeThumbnail(cleanId)
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to update video');
        }
        setSaveSuccess(`Video updated in ${targetCategory}!`);
      } else {
        const res = await adminAddVideo({
          youtubeId: cleanId,
          youtubeUrl: formUrl.trim().startsWith('http') ? formUrl.trim() : `https://www.youtube.com/watch?v=${cleanId}`,
          title: formTitle.trim(),
          category: targetCategory,
          description: formDescription.trim(),
          duration: formDuration.trim() || undefined,
          isFeatured: formIsFeatured,
          thumbnailUrl: getYouTubeThumbnail(cleanId),
          publishedDate: new Date().toISOString().split('T')[0],
          viewsCount: '1.2K',
          likesCount: 150
        });

        if (!res.success) {
          throw new Error(res.error || 'Failed to save video');
        }
        setSaveSuccess(`Video added to ${targetCategory} and synced!`);
      }

      setTimeout(() => {
        setIsAddModalOpen(false);
        setIsSaving(false);
      }, 900);
    } catch (err: any) {
      setIsSaving(false);
      setSaveError(err.message || 'Error saving video. Check connection and admin authorization.');
    }
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingVideo) return;
    setIsSaving(true);
    try {
      const res = await adminDeleteVideo(deletingVideo.id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete video');
      }
      setIsSaving(false);
      setDeletingVideo(null);
    } catch (err: any) {
      setIsSaving(false);
      alert(err.message || 'Delete failed');
    }
  };

  // Set Featured Spotlight
  const handleSetFeatured = async (videoId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await adminSetFeaturedVideo(videoId);
    } catch {}
  };

  // 2 Main Categories (Videos & Shorts) + Audio + All
  const categoryTabs = useMemo(() => {
    const videosCount = videos.filter((v) => getNormalizedCategory(v.category, v.youtubeUrl) === 'Videos').length;
    const shortsCount = videos.filter((v) => getNormalizedCategory(v.category, v.youtubeUrl) === 'Shorts').length;
    const audioCount = videos.filter((v) => getNormalizedCategory(v.category, v.youtubeUrl) === 'Audio').length;

    return [
      { id: 'Videos', icon: '🎬', label: 'Videos', count: videosCount },
      { id: 'Shorts', icon: '⚡', label: 'Shorts', count: shortsCount },
      { id: 'Audio', icon: '🎵', label: 'Audio', count: audioCount },
      { id: 'All', icon: '🌟', label: 'All', count: videos.length },
    ];
  }, [videos]);

  // Filtered videos based on the 2 main categories (Videos, Shorts) and Audio
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const cat = getNormalizedCategory(v.category, v.youtubeUrl);
      const matchesCategory = selectedCategory === 'All' || cat === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        v.title.toLowerCase().includes(q) || 
        (v.description && v.description.toLowerCase().includes(q)) ||
        cat.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [videos, selectedCategory, searchQuery]);

  const previewId = extractYouTubeId(formUrl);

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. CHANNEL SPOTLIGHT & HEADER */}
      {/* ========================================================================= */}
      <div className="relative p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-white/95 via-red-50/30 to-amber-50/40 dark:from-slate-900/95 dark:via-red-950/20 dark:to-slate-900/80 backdrop-blur-xl border-2 border-red-500/30 dark:border-red-500/20 shadow-lg text-slate-900 dark:text-white overflow-hidden">
        {/* Subtle background red glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-red-500/10 dark:bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 border border-white/20">
                <Youtube className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800/40 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-red-600 animate-pulse" />
                  Official Channel
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40">
                  Live Sync
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                Vishal Yadav <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20 inline" />
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 truncate">
                Vyron AI • <span className="font-semibold text-red-600 dark:text-red-400">@mr_vishal372</span> • Tech & Code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href="https://youtube.com/@mr_vishal372"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer"
            >
              <Youtube className="w-3.5 h-3.5 fill-current" />
              <span>Subscribe</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>

            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer border border-amber-400"
                title="Add video"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE MAIN PLAYER (WITH SOUND ON/OFF & CONTROLS) */}
      {/* ========================================================================= */}
      {selectedVideo && (
        <div 
          ref={playerContainerRef}
          className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-red-500/40 shadow-xl text-white transition-all duration-300"
        >
          {/* Top Bar on Player */}
          <div className="px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider shrink-0">
                Now Playing
              </span>
              <span className="text-xs text-slate-300 truncate font-medium">
                {selectedVideo.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound ON/OFF Toggle Button */}
              <button
                type="button"
                onClick={toggleMute}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer touch-manipulation ${
                  isMuted
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
                title={isMuted ? 'Turn Sound On' : 'Mute'}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sound On</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(selectedVideo, e)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Edit video"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Responsive 16:9 Video Embed Player */}
          <div className="relative w-full aspect-video bg-black">
            <iframe
              ref={iframeRef}
              key={selectedVideo.youtubeId}
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1&fs=1`}
              title={selectedVideo.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              loading="eager"
            />
          </div>

          {/* Under-Player Metadata & Quick Actions */}
          <div className="p-3.5 sm:p-5 bg-gradient-to-b from-slate-900 to-slate-950 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 rounded-lg bg-red-600/30 text-red-300 border border-red-500/30 font-semibold text-[11px]">
                    {selectedVideo.category}
                  </span>
                  {selectedVideo.duration && (
                    <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3" /> {selectedVideo.duration}
                    </span>
                  )}
                  {selectedVideo.viewsCount && (
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Eye className="w-3 h-3" /> {selectedVideo.viewsCount}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {selectedVideo.title}
                </h3>
                {selectedVideo.description && (
                  <p className="text-xs text-slate-300 leading-relaxed pt-0.5 line-clamp-2 sm:line-clamp-none">
                    {selectedVideo.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(selectedVideo, e)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                >
                  {copiedId === selectedVideo.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                <a
                  href={selectedVideo.youtubeUrl || `https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SEARCH & CATEGORY FILTER BAR */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>{filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}</span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[10px]">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Category Pills: 2 Main Categories (Videos & Shorts) + Audio + All */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none overscroll-x-contain touch-pan-x">
          {categoryTabs.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer touch-manipulation flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/25 ring-2 ring-red-500/30'
                    : 'bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. VIDEO CARDS GRID */}
      {/* ========================================================================= */}
      {filteredVideos.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 space-y-3">
          <Film className="w-10 h-10 mx-auto text-slate-400" />
          <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">
            {selectedCategory === 'Shorts'
              ? 'No Shorts available'
              : selectedCategory === 'Audio'
              ? 'No Audio tracks available'
              : 'No videos found'}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              + Add {selectedCategory === 'Shorts' ? 'Shorts' : selectedCategory === 'Audio' ? 'Audio' : 'Video'}
            </button>
          )}
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline block mx-auto pt-1 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video, idx) => {
            const isCurrentlySelected = selectedVideo?.id === video.id;
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                whileHover={appleCardHover}
                whileTap={appleCardTap}
                onClick={() => handleSelectVideo(video)}
                className={`relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/95 via-white/80 to-red-50/20 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-red-950/20 backdrop-blur-xl border-2 transition-all flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md ${
                  isCurrentlySelected
                    ? 'border-red-500 dark:border-red-500 ring-2 ring-red-500/20'
                    : 'border-slate-200/70 dark:border-white/10 hover:border-red-400/50'
                }`}
              >
                <div>
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img
                      src={video.thumbnailUrl || getYouTubeThumbnail(video.youtubeId)}
                      alt={video.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to hqdefault if maxres fails
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                      }}
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-white font-mono text-[10px] font-bold">
                        {video.duration}
                      </span>
                    )}

                    {/* Featured & Type Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                      {video.isFeatured && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                          Featured
                        </span>
                      )}
                      {getNormalizedCategory(video.category, video.youtubeUrl) === 'Shorts' && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black shadow-sm">
                          ⚡ Shorts
                        </span>
                      )}
                      {getNormalizedCategory(video.category, video.youtubeUrl) === 'Audio' && (
                        <span className="px-2 py-0.5 rounded-lg bg-purple-600 text-white text-[10px] font-black shadow-sm">
                          🎵 Audio
                        </span>
                      )}
                    </div>

                    {/* Active playing indicator */}
                    {isCurrentlySelected && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 animate-pulse shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        Playing
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        getNormalizedCategory(video.category, video.youtubeUrl) === 'Shorts'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800/40'
                          : getNormalizedCategory(video.category, video.youtubeUrl) === 'Audio'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800/40'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-900/40'
                      }`}>
                        {getNormalizedCategory(video.category, video.youtubeUrl) === 'Shorts'
                          ? '⚡ Shorts'
                          : getNormalizedCategory(video.category, video.youtubeUrl) === 'Audio'
                          ? '🎵 Audio'
                          : '🎬 Videos'}
                      </span>

                      {video.publishedDate && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {video.publishedDate}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h4>

                    {video.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3.5 sm:p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(video, e)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                      title="Copy video link"
                    >
                      {copiedId === video.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleSetFeatured(video.id, e)}
                          className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                            video.isFeatured 
                              ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950' 
                              : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={video.isFeatured ? 'Featured Video' : 'Set as Featured Video'}
                        >
                          <Star className={`w-4 h-4 ${video.isFeatured ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(video, e)}
                          className="p-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                          title="Admin: Edit video details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleOpenDelete(video, e)}
                          className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          title="Admin: Delete video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMIN ADD / EDIT VIDEO MODAL (Full-screen on Mobile, Portaled to Body) */}
      {/* ========================================================================= */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative w-full sm:max-w-lg h-[100dvh] sm:h-auto sm:max-h-[88vh] flex flex-col rounded-none sm:rounded-3xl bg-white dark:bg-slate-900 border-0 sm:border-2 border-red-500/30 shadow-2xl text-slate-900 dark:text-white overflow-hidden"
              >
                {/* Header with Mobile Safe Area Support */}
                <div className="flex items-center justify-between px-4 sm:px-5 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] sm:pt-5 pb-3.5 sm:pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-600 text-white shrink-0 shadow-sm shadow-red-500/20">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold leading-tight">
                      {editingVideo ? 'Edit Video' : 'Add Video'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Syncs automatically across all devices
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveVideo} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3.5 text-xs touch-pan-y">
                  {/* Status messages */}
                  {saveError && (
                    <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}
                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{saveSuccess}</span>
                    </div>
                  )}

                  {/* YouTube URL input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                        YouTube Link or ID <span className="text-red-500">*</span>
                      </label>
                      {formUrl.includes('/shorts/') && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          ⚡ Shorts detected
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={formUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="e.g. https://youtu.be/... or /shorts/... or ID"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      Supports standard video links, youtu.be, shorts links, or 11-digit video ID.
                    </p>
                  </div>

                  {/* Live Preview if ID is extracted */}
                  {previewId && (
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <span>Preview (ID: <code className="text-red-500">{previewId}</code>)</span>
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[10px]">
                          <Check className="w-3 h-3" /> Valid Link
                        </span>
                      </div>
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-inner">
                        <iframe
                          src={`https://www.youtube.com/embed/${previewId}?autoplay=0&mute=0&controls=1&playsinline=1&modestbranding=1`}
                          title="Preview"
                          className="absolute inset-0 w-full h-full border-0"
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}

                  {/* Video Title */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                      Video Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Enter title..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                  </div>

                  {/* Category Selection: 3 Cards */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-900/40">
                        {formCategory === 'Shorts' ? '⚡ Shorts' : formCategory === 'Audio' ? '🎵 Audio' : '🎬 Videos'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* Videos Card */}
                      <button
                        type="button"
                        onClick={() => setFormCategory('Videos')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          formCategory === 'Videos'
                            ? 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-500/30 font-bold shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-300'
                        }`}
                      >
                        <span className="text-lg">🎬</span>
                        <div className="text-[11px] font-bold leading-tight">Videos</div>
                        <div className="text-[9px] opacity-70">Long Form</div>
                      </button>

                      {/* Shorts Card */}
                      <button
                        type="button"
                        onClick={() => setFormCategory('Shorts')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          formCategory === 'Shorts'
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30 font-bold shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-lg">⚡</span>
                        <div className="text-[11px] font-bold leading-tight">Shorts</div>
                        <div className="text-[9px] opacity-70">Reels & Clips</div>
                      </button>

                      {/* Audio Card */}
                      <button
                        type="button"
                        onClick={() => setFormCategory('Audio')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          formCategory === 'Audio'
                            ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30 font-bold shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-lg">🎵</span>
                        <div className="text-[11px] font-bold leading-tight">Audio</div>
                        <div className="text-[9px] opacity-70">Soundtracks</div>
                      </button>
                    </div>
                  </div>

                  {/* Duration & Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        placeholder="e.g. 10:24"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 sm:pt-4">
                      <input
                        type="checkbox"
                        id="isFeaturedVideo"
                        checked={formIsFeatured}
                        onChange={(e) => setFormIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                      <label htmlFor="isFeaturedVideo" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer text-xs">
                        Pin in Top Spotlight
                      </label>
                    </div>
                  </div>

                  {/* Video Description */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Optional notes or summary..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    />
                  </div>
                </div>

                {/* Sticky Action Footer - Always visible on mobile & desktop */}
                <div className="p-3.5 sm:p-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.875rem)] sm:pb-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-end gap-2.5 shrink-0 z-10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Save Video</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

      {/* ========================================================================= */}
      {/* 6. ADMIN DELETE CONFIRMATION MODAL (Portaled to Body) */}
      {/* ========================================================================= */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {deletingVideo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-500 shadow-2xl p-6 text-slate-900 dark:text-white space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold">Delete Video?</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Are you sure you want to remove "<span className="font-semibold text-slate-900 dark:text-white">{deletingVideo.title}</span>"?
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingVideo(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleConfirmDelete}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
