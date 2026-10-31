import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Upload, Move, ZoomIn, ZoomOut, RotateCcw, 
  Check, Trash2, Camera, Sparkles, Image as ImageIcon,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import { adminUploadFile } from '../../lib/adminAuth';

interface CoverPhotoRearrangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBannerUrl?: string;
  currentPosY?: number;
  currentPosX?: number;
  currentZoom?: number;
  avatarUrl?: string;
  onSave: (bannerData: {
    bannerUrl: string;
    posY: number;
    posX: number;
    zoom: number;
  }) => void;
  onRemove: () => void;
}

// Curated high quality presets for tech, dark aesthetic and creative profiles
const CURATED_PRESETS = [
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'cyber-code',
    name: 'Cyber Code Matrix',
    category: 'Tech',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'gradient-abstract',
    name: 'Indigo Silk Mesh',
    category: 'Modern',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'neon-circuits',
    name: 'Neon Grid Circuits',
    category: 'Cyber',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'retro-synth',
    name: 'Synthwave Horizon',
    category: 'Creative',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'minimal-ocean',
    name: 'Midnight Ocean',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80'
  }
];

export const CoverPhotoRearrangeModal: React.FC<CoverPhotoRearrangeModalProps> = ({
  isOpen,
  onClose,
  currentBannerUrl = '',
  currentPosY = 50,
  currentPosX = 50,
  currentZoom = 1,
  avatarUrl = '/profile.png.jpeg',
  onSave,
  onRemove
}) => {
  const [bannerUrl, setBannerUrl] = useState<string>(currentBannerUrl);
  const [posY, setPosY] = useState<number>(currentPosY);
  const [posX, setPosX] = useState<number>(currentPosX);
  const [zoom, setZoom] = useState<number>(currentZoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ clientX: 0, clientY: 0, startPosY: 50, startPosX: 50 });
  const [activeTab, setActiveTab] = useState<'upload' | 'presets'>('upload');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setBannerUrl(currentBannerUrl);
      setPosY(typeof currentPosY === 'number' ? currentPosY : 50);
      setPosX(typeof currentPosX === 'number' ? currentPosX : 50);
      setZoom(typeof currentZoom === 'number' ? currentZoom : 1);
      
      // Prevent background scrolling
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = 'hidden';
      }
    }
    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, currentBannerUrl, currentPosY, currentPosX, currentZoom]);

  // Handle local file selection with client-side canvas compression & server upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Image size exceeds 50MB. Please choose a slightly smaller image.');
      return;
    }

    // 1. Instant client-side compression (max 1920x1080, quality 0.82) for immediate preview & fast sync
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const rawDataUri = event.target.result as string;
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxWidth = 1920;
          const maxHeight = 1080;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setBannerUrl(compressed);
          } else {
            setBannerUrl(rawDataUri);
          }
          setPosY(50);
          setPosX(50);
          setZoom(1);
        };
        img.src = rawDataUri;
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to backend server storage in background to get permanent /api/uploads/ URL
    adminUploadFile(file).then((res) => {
      if (res.success && res.fileUrl) {
        setBannerUrl(res.fileUrl);
      }
    }).catch(() => {});

    e.target.value = '';
  };

  // Pointer/Mouse/Touch drag handling for repositioning
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!bannerUrl) return;
    setIsDragging(true);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      startPosY: posY,
      startPosX: posX
    });
    // Capture pointer
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Calculate percentage shift based on container dimensions
    // Dragging down moves image down (lower percentage of focal point or higher)
    const deltaY = ((e.clientY - dragStart.clientY) / rect.height) * 100;
    const deltaX = ((e.clientX - dragStart.clientX) / rect.width) * 100;

    // Invert delta because dragging up pulls bottom into view (increases translateY or focal point percentage)
    const newY = Math.min(Math.max(dragStart.startPosY - deltaY, 0), 100);
    const newX = Math.min(Math.max(dragStart.startPosX - deltaX, 0), 100);

    setPosY(Math.round(newY));
    setPosX(Math.round(newX));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  const handleResetPosition = () => {
    setPosY(50);
    setPosX(50);
    setZoom(1);
  };

  const handleSave = () => {
    if (!bannerUrl) {
      alert('Please select or upload an image first, or click Remove.');
      return;
    }
    onSave({
      bannerUrl,
      posY,
      posX,
      zoom
    });
    onClose();
  };

  const handleRemoveCover = () => {
    if (confirm('Remove custom background cover and revert to default gradient?')) {
      onRemove();
      onClose();
    }
  };

  if (!isOpen || typeof window === 'undefined' || !window.document) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="cover-rearrange-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          key="cover-rearrange-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-400/30">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Cover Photo &amp; Rearrange
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag to position how your background appears on your profile
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* 1. INTERACTIVE DRAG-TO-REARRANGE PREVIEW CANVAS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-blue-600 dark:text-amber-400" />
                  <span>Interactive Live Preview (Drag to Reposition)</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetPosition}
                  className="text-[11px] font-semibold text-blue-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Position</span>
                </button>
              </div>

              {/* Banner Canvas Container */}
              <div
                ref={previewContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative w-full h-36 sm:h-48 rounded-2xl overflow-hidden select-none touch-none border-2 transition-colors ${
                  isDragging
                    ? 'border-amber-400 ring-4 ring-amber-400/20 cursor-grabbing'
                    : 'border-slate-300 dark:border-slate-700 cursor-grab hover:border-amber-400/60'
                } ${!bannerUrl ? 'bg-gradient-to-r from-[#000080] via-[#1e1b4b] to-[#0f172a]' : 'bg-slate-950'}`}
              >
                {bannerUrl ? (
                  <>
                    <img
                      src={bannerUrl}
                      alt="Rearrange Cover"
                      draggable={false}
                      className="w-full h-full object-cover pointer-events-none transition-none"
                      style={{
                        objectPosition: `${posX}% ${posY}%`,
                        transform: `scale(${zoom})`,
                        transformOrigin: `${posX}% ${posY}%`
                      }}
                    />

                    {/* Gradient Overlay for realism */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

                    {/* Drag Guidance Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 shadow-md pointer-events-none animate-pulse">
                      <Move className="w-3 h-3 text-amber-300" />
                      <span>{isDragging ? 'Dragging...' : 'Drag up/down to reposition'}</span>
                    </div>

                    {/* Position HUD Badge */}
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono pointer-events-none border border-white/10">
                      Y: {posY}% &bull; Zoom: {zoom.toFixed(1)}x
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 text-white">
                    <ImageIcon className="w-8 h-8 text-amber-400 mb-2 opacity-80" />
                    <p className="font-bold text-xs sm:text-sm">No cover photo selected</p>
                    <p className="text-[11px] text-slate-300 max-w-xs mt-0.5">
                      Upload an image below or choose from modern curated presets
                    </p>
                  </div>
                )}

                {/* Avatar Silhouette Outline (Shows exactly where user photo sits on bottom-left) */}
                <div 
                  className="absolute -bottom-8 left-4 sm:left-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-amber-300 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center pointer-events-none shadow-xl"
                  title="Avatar position"
                >
                  <img
                    src={avatarUrl}
                    alt="Avatar Silhouette"
                    className="w-full h-full rounded-full object-cover opacity-60"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-300 bg-black/40 rounded-full">
                    Profile DP
                  </span>
                </div>
              </div>
            </div>

            {/* 2. REPOSITION SLIDERS & CONTROLS */}
            {bannerUrl && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3.5">
                {/* Vertical Reposition Slider (Y-Axis) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ArrowUp className="w-3 h-3 text-blue-500" />
                      <span>Vertical Alignment (Top to Bottom): {posY}%</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPosY(15)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          posY === 15 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosY(50)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          posY === 50 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosY(85)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          posY === 85 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Bottom
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={posY}
                    onChange={(e) => setPosY(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#000080] dark:accent-amber-400"
                  />
                </div>

                {/* Zoom / Scale Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-3 h-3 text-amber-500" />
                      <span>Zoom / Scale: {zoom.toFixed(1)}x</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setZoom(Math.max(1, +(zoom - 0.1).toFixed(1)))}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                        title="Zoom Out"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(1)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                          zoom === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        1.0x
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoom(Math.min(2.5, +(zoom + 0.1).toFixed(1)))}
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                        title="Zoom In"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#000080] dark:accent-amber-400"
                  />
                </div>
              </div>
            )}

            {/* 3. PHOTO SOURCE TABS (UPLOAD OR CHOOSE PRESET) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-[#000080] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload From Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'presets'
                      ? 'bg-[#000080] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Curated Presets</span>
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-amber-400 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        Click to select photo from Phone or Computer
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Supports JPG, PNG, WebP (Landscape recommended)
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CURATED_PRESETS.map((preset) => {
                    const isSelected = bannerUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setBannerUrl(preset.url);
                          setPosY(50);
                          setPosX(50);
                          setZoom(1);
                        }}
                        className={`relative h-20 rounded-xl overflow-hidden border-2 text-left group transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-500'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2">
                          <span className="text-[10px] font-bold text-white truncate">{preset.name}</span>
                          <span className="text-[9px] text-amber-300 font-medium">{preset.category}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            {currentBannerUrl ? (
              <button
                type="button"
                onClick={handleRemoveCover}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Cover</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!bannerUrl}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#000080] hover:bg-blue-900 disabled:opacity-50 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Apply Cover Photo</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
