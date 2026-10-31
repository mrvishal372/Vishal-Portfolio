import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X, Camera, Move } from 'lucide-react';

interface ProfilePhotoCropModalProps {
  imageSrc: string;
  onSave: (croppedBase64: string) => void;
  onCancel: () => void;
}

export const ProfilePhotoCropModal: React.FC<ProfilePhotoCropModalProps> = ({
  imageSrc,
  onSave,
  onCancel,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load image
  useEffect(() => {
    if (document.body) {
      if (document.body) document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      if (document.body) {
        if (document.body) document.body.style.overflow = 'unset';
        document.documentElement.style.overflow = 'unset';
      }
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      updatePreview(img, 1, { x: 0, y: 0 });
    };
  }, [imageSrc]);

  const updatePreview = (
    img: HTMLImageElement,
    currentZoom: number,
    currentPan: { x: number; y: number }
  ) => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill canvas background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate image render dimensions to cover 280x280
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * currentZoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    const drawX = (canvas.width - drawWidth) / 2 + currentPan.x;
    const drawY = (canvas.height - drawHeight) / 2 + currentPan.y;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.88));
  };

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    if (imageRef.current) {
      updatePreview(imageRef.current, newZoom, pan);
    }
  };

  const handlePanChange = (newPan: { x: number; y: number }) => {
    setPan(newPan);
    if (imageRef.current) {
      updatePreview(imageRef.current, zoom, newPan);
    }
  };

  // Mouse & Touch Dragging for Panning
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newPan = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    };
    handlePanChange(newPan);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (imageRef.current) {
      updatePreview(imageRef.current, 1, { x: 0, y: 0 });
    }
  };

  const handleSave = () => {
    if (previewUrl) {
      onSave(previewUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-slate-950/70 animate-fade-in">
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-md bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 shadow-2xl rounded-3xl p-5 sm:p-6 space-y-5 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#FF9933]" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Crop & Position Photo
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Crop Viewport Area */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl cursor-grab active:cursor-grabbing touch-none bg-slate-900 flex items-center justify-center group"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Crop preview"
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            ) : (
              <span className="text-xs text-slate-400">Loading image...</span>
            )}

            {/* Subtle drag prompt overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                <Move className="w-3 h-3" /> Drag to adjust
              </span>
            </div>
          </div>

          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 text-center">
            <Move className="w-3 h-3 text-amber-500" />
            <span>Drag image to pan • Adjust zoom slider below</span>
          </p>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <ZoomIn className="w-4 h-4 text-[#000080] dark:text-amber-400" /> Zoom Level
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-mono">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleZoomChange(Math.max(1, zoom - 0.2))}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-sm"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 accent-[#000080] dark:accent-amber-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg"
            />

            <button
              onClick={() => handleZoomChange(Math.min(3, zoom + 0.2))}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-sm"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 shadow-sm transition-colors"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#000080] to-[#138808] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Save Profile Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
