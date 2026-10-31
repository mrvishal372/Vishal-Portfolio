import { createPortal } from 'react-dom';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, RotateCcw, User } from 'lucide-react';
import { getEffectiveAvatarUrl } from '../../lib/defaultAvatar';

interface ProfilePhotoZoomModalProps {
  isOpen: boolean;
  avatarUrl?: string;
  userName?: string;
  onClose: () => void;
}

export const ProfilePhotoZoomModal: React.FC<ProfilePhotoZoomModalProps> = ({
  isOpen,
  avatarUrl,
  userName,
  onClose
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && document.body) {
      if (document.body) document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else if (document.body) {
      if (document.body) document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      if (document.body) {
        if (document.body) document.body.style.overflow = 'unset';
        document.documentElement.style.overflow = 'unset';
      }
    };
  }, [isOpen]);

  // early return removed for exit animation

  const effectiveUrl = avatarUrl ? getEffectiveAvatarUrl(avatarUrl) : '';

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.2, 3.5));
    } else {
      setZoom((prev) => {
        const next = Math.max(prev - 0.2, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const maxOffset = (zoom - 1) * 160;
    const nextX = Math.max(-maxOffset, Math.min(maxOffset, e.clientX - dragStartRef.current.x));
    const nextY = Math.max(-maxOffset, Math.min(maxOffset, e.clientY - dragStartRef.current.y));
    setPosition({ x: nextX, y: nextY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const maxOffset = (zoom - 1) * 160;
    const nextX = Math.max(-maxOffset, Math.min(maxOffset, e.touches[0].clientX - dragStartRef.current.x));
    const nextY = Math.max(-maxOffset, Math.min(maxOffset, e.touches[0].clientY - dragStartRef.current.y));
    setPosition({ x: nextX, y: nextY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const toggleDoubleClickZoom = () => {
    if (zoom > 1.2) {
      handleReset();
    } else {
      setZoom(2);
    }
  };

  if (typeof window === 'undefined' || typeof window.document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col items-center select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="min-w-0 pr-2">
              <h3 className="text-base font-black text-white truncate">
                {userName || 'Profile Picture'}
              </h3>
              <p className="text-[11px] text-amber-400/90 font-semibold">
                Zoom &amp; Preview Photo
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close (बंद करें)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Circle Photo Stage */}
          <div className="my-5 flex flex-col items-center justify-center w-full">
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={toggleDoubleClickZoom}
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full aspect-square relative overflow-hidden bg-slate-950 border-4 border-amber-400 shadow-2xl flex items-center justify-center ${
                zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
              }`}
            >
              {effectiveUrl ? (
                <img
                  src={effectiveUrl}
                  alt={userName || 'Profile'}
                  draggable={false}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                  }}
                  className="w-full h-full object-cover object-center pointer-events-none select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <User className="w-20 h-20 text-slate-700 dark:text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-300">No profile photo uploaded</span>
                  <span className="text-[10px] text-amber-400 mt-1">Use "Set Up Profile" below to add photo</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              {zoom > 1 
                ? 'Drag to pan • Double-click or reset to 100%' 
                : 'Double-click, scroll or use buttons below to zoom'}
            </p>
          </div>

          {/* Zoom Controls Bar */}
          <div className="w-full bg-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 border border-slate-700/60">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3.5}
                className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Percentage */}
            <div className="text-xs font-black text-amber-300 font-mono">
              {Math.round(zoom * 100)}%
            </div>

            {/* Reset & Close Button */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                disabled={zoom === 1 && position.x === 0 && position.y === 0}
                className="px-2.5 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    window.document.body
  );
};
