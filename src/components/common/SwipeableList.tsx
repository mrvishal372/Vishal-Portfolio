import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, useAnimation, PanInfo, AnimatePresence } from 'motion/react';
import { Trash2, AlertCircle, Edit2, GripVertical } from 'lucide-react';
import { Language } from '../../types';
import { t } from '../../lib/translations';

export interface SwipeSecondaryAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

export interface SwipeToDeleteItemProps {
  id: string;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  secondaryAction?: SwipeSecondaryAction;
  children: React.ReactNode;
  language?: Language;
  confirmTitle?: string;
  confirmMessage?: string;
  requireConfirm?: boolean;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  showDesktopQuickAction?: boolean;
  isOpen?: boolean;
  onSwipeChange?: (isOpen: boolean) => void;
}

/**
 * Standardized SwipeToDeleteItem component supporting smooth right-to-left
 * swipe gestures on mobile and desktop views, with spring physics,
 * confirmation modal, desktop hover actions, and accessible touch targets.
 */
export const SwipeToDeleteItem: React.FC<SwipeToDeleteItemProps> = memo(({
  id,
  onDelete,
  onEdit,
  secondaryAction,
  children,
  language = 'en',
  confirmTitle,
  confirmMessage,
  requireConfirm = true,
  className = '',
  itemClassName = '',
  disabled = false,
  showDesktopQuickAction = true,
  isOpen: controlledIsOpen,
  onSwipeChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const isHi = language === 'hi';
  const deleteLabel = t('delete', language) || (isHi ? 'हटाएं' : 'Delete');
  const cancelLabel = t('cancel', language) || (isHi ? 'रद्द करें' : 'Cancel');
  const editLabel = t('edit', language) || (isHi ? 'संपादित करें' : 'Edit');

  // Determine total reveal width based on actions present
  const hasSecondary = Boolean(onEdit || secondaryAction);
  const actionWidth = hasSecondary ? 136 : 84;

  const updateOpenState = useCallback((nextOpen: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(nextOpen);
    }
    onSwipeChange?.(nextOpen);
    controls.start({ x: nextOpen ? -actionWidth : 0 });
  }, [actionWidth, controls, isControlled, onSwipeChange]);

  // Synchronize controlled open state
  useEffect(() => {
    if (isControlled) {
      controls.start({ x: controlledIsOpen ? -actionWidth : 0 });
    }
  }, [controlledIsOpen, actionWidth, controls, isControlled]);

  const handleDragStart = () => {
    if (disabled) return;
    setIsSwiping(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    setIsSwiping(false);
    const containerWidth = containerRef.current?.offsetWidth || 320;
    const swipeThreshold = Math.min(48, containerWidth * 0.15);
    const velocityThreshold = -250;

    // Detect swipe left
    if (info.offset.x < -swipeThreshold || info.velocity.x < velocityThreshold) {
      updateOpenState(true);
    } else if (info.offset.x > 20 || info.velocity.x > 200) {
      updateOpenState(false);
    } else {
      controls.start({ x: isOpen ? -actionWidth : 0 });
    }
  };

  const handleDeleteTrigger = () => {
    updateOpenState(false);
    if (requireConfirm && (confirmMessage || confirmTitle)) {
      setShowConfirm(true);
    } else {
      onDelete(id);
    }
  };

  const handleSecondaryTrigger = () => {
    updateOpenState(false);
    if (secondaryAction) {
      secondaryAction.onClick(id);
    } else if (onEdit) {
      onEdit(id);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl group w-full ${className}`}
    >
      {/* Background Actions Revealed on Right-to-Left Swipe */}
      {!disabled && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-end z-0 transition-opacity duration-150 ${
            isOpen || isSwiping ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ width: `${actionWidth}px` }}
        >
          {/* Optional Secondary Action (e.g. Edit) */}
          {hasSecondary && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSecondaryTrigger();
              }}
              className="h-full w-[52px] bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer select-none touch-manipulation"
              aria-label={secondaryAction?.label || editLabel}
              title={secondaryAction?.label || editLabel}
            >
              {secondaryAction?.icon || <Edit2 className="w-4 h-4 pointer-events-none" />}
              <span className="text-[10px] font-bold tracking-tight pointer-events-none line-clamp-1 px-1">
                {secondaryAction?.label || editLabel}
              </span>
            </button>
          )}

          {/* Primary Delete Action */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTrigger();
            }}
            className="h-full flex-1 min-w-[84px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer select-none touch-manipulation"
            aria-label={deleteLabel}
            title={deleteLabel}
          >
            <Trash2 className="w-5 h-5 pointer-events-none" />
            <span className="text-[10px] font-bold tracking-tight pointer-events-none">
              {deleteLabel}
            </span>
          </button>
        </div>
      )}

      {/* Main Swipeable Item Container */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={0.08}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{ type: 'spring', damping: 24, stiffness: 260, mass: 0.75 }}
        className={`relative z-10 w-full touch-pan-y select-none sm:select-auto cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900 rounded-2xl ${itemClassName}`}
        onClick={() => {
          // If drawer is open, tapping anywhere on the card closes it
          if (isOpen) {
            updateOpenState(false);
          }
        }}
      >
        {children}

        {/* Desktop Quick-Action Hover Overlay */}
        {showDesktopQuickAction && !disabled && (
          <div className="hidden sm:flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-1.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {hasSecondary && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSecondaryTrigger();
                }}
                className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
                title={secondaryAction?.label || editLabel}
                aria-label={secondaryAction?.label || editLabel}
              >
                {secondaryAction?.icon || <Edit2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTrigger();
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title={deleteLabel}
              aria-label={deleteLabel}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="text-slate-300 dark:text-slate-600 pl-0.5" title="Swipe left or click to delete">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-gradient-to-br from-white/90 via-amber-50/40 to-blue-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#000080]/20 backdrop-blur-xl border-2 border-amber-400/50 dark:border-amber-400/30 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {confirmTitle || (isHi ? 'क्या आप इसे हटाना चाहते हैं?' : 'Confirm Delete')}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {confirmMessage || (isHi ? 'यह रिकॉर्ड हटा दिया जाएगा।' : 'This item will be permanently removed.')}
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer touch-manipulation min-h-[44px]"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    onDelete(id);
                  }}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md cursor-pointer touch-manipulation min-h-[44px]"
                >
                  {deleteLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export interface SwipeableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, isSwipedOpen: boolean) => React.ReactNode;
  onDelete: (id: string, item: T) => void;
  onEdit?: (id: string, item: T) => void;
  language?: Language;
  confirmTitle?: (item: T) => string;
  confirmMessage?: (item: T) => string;
  requireConfirm?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  showDesktopQuickAction?: boolean;
}

/**
 * Standardized SwipeableList container that renders a collection of items
 * with smooth right-to-left swipe gestures, coordinated single-open state,
 * animated exit collapse transitions, and uniform responsive layouts.
 */
export function SwipeableList<T>({
  items,
  keyExtractor,
  renderItem,
  onDelete,
  onEdit,
  language = 'en',
  confirmTitle,
  confirmMessage,
  requireConfirm = true,
  emptyState,
  className = 'space-y-2.5',
  itemClassName = '',
  disabled = false,
  showDesktopQuickAction = true,
}: SwipeableListProps<T>) {
  const [activeOpenId, setActiveOpenId] = useState<string | null>(null);

  if (items.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const id = keyExtractor(item);
          const isItemOpen = activeOpenId === id;

          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="w-full"
            >
              <SwipeToDeleteItem
                id={id}
                onDelete={(deletedId) => {
                  if (activeOpenId === deletedId) {
                    setActiveOpenId(null);
                  }
                  onDelete(deletedId, item);
                }}
                onEdit={onEdit ? (editedId) => onEdit(editedId, item) : undefined}
                language={language}
                confirmTitle={confirmTitle ? confirmTitle(item) : undefined}
                confirmMessage={confirmMessage ? confirmMessage(item) : undefined}
                requireConfirm={requireConfirm}
                className={itemClassName}
                disabled={disabled}
                showDesktopQuickAction={showDesktopQuickAction}
                isOpen={isItemOpen}
                onSwipeChange={(isOpen) => {
                  setActiveOpenId(isOpen ? id : null);
                }}
              >
                {renderItem(item, index, isItemOpen)}
              </SwipeToDeleteItem>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
