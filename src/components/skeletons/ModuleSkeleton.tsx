import React from 'react';

// Shimmer effect base styling class
const shimmerClass = "relative overflow-hidden bg-slate-200/80 dark:bg-slate-800/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-white/10 before:to-transparent";

export const ShimmerBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-xl ${shimmerClass} ${className}`} />
);

export const AISolutionSkeleton: React.FC = () => {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShimmerBlock className="w-8 h-8 rounded-full" />
          <ShimmerBlock className="w-36 h-5 rounded-lg" />
        </div>
        <ShimmerBlock className="w-20 h-7 rounded-full" />
      </div>

      <div className="space-y-3 pt-1">
        <ShimmerBlock className="w-3/4 h-6 rounded-lg" />
        <ShimmerBlock className="w-full h-4 rounded" />
        <ShimmerBlock className="w-11/12 h-4 rounded" />
        <ShimmerBlock className="w-4/5 h-4 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 space-y-2">
          <ShimmerBlock className="w-28 h-4 rounded" />
          <ShimmerBlock className="w-full h-3 rounded" />
          <ShimmerBlock className="w-3/4 h-3 rounded" />
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-800/50 space-y-2">
          <ShimmerBlock className="w-28 h-4 rounded" />
          <ShimmerBlock className="w-full h-3 rounded" />
          <ShimmerBlock className="w-2/3 h-3 rounded" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <ShimmerBlock className="w-24 h-8 rounded-xl" />
        <div className="flex gap-2">
          <ShimmerBlock className="w-8 h-8 rounded-full" />
          <ShimmerBlock className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 sm:p-5 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
          <div className="flex justify-between items-start">
            <ShimmerBlock className="w-20 h-5 rounded-full" />
            <ShimmerBlock className="w-6 h-6 rounded-full" />
          </div>
          <ShimmerBlock className="w-4/5 h-5 rounded-lg" />
          <ShimmerBlock className="w-full h-12 rounded-xl" />
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <ShimmerBlock className="w-16 h-4 rounded" />
            <ShimmerBlock className="w-24 h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-3.5 sm:p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ShimmerBlock className="w-10 h-10 rounded-2xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <ShimmerBlock className="w-2/5 h-4 rounded" />
              <ShimmerBlock className="w-3/5 h-3 rounded" />
            </div>
          </div>
          <ShimmerBlock className="w-16 h-6 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
};

export const ModuleSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Hero Banner Shimmer */}
      <div className="p-6 rounded-3xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/50 dark:border-slate-700/50 space-y-3">
        <div className="flex items-center justify-between">
          <ShimmerBlock className="w-48 h-8 rounded-xl" />
          <ShimmerBlock className="w-20 h-6 rounded-full" />
        </div>
        <ShimmerBlock className="w-3/4 h-4 rounded" />
      </div>

      {/* Search/Input Bar Shimmer */}
      <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
        <ShimmerBlock className="w-full h-11 rounded-xl" />
        <ShimmerBlock className="w-28 h-11 rounded-xl shrink-0" />
      </div>

      {/* Content Grid Shimmer */}
      <CardSkeleton count={3} />
    </div>
  );
};
