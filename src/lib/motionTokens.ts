import type { TargetAndTransition, Variants } from 'motion/react';

/**
 * Apple-inspired Motion Tokens & Animation Presets
 * Inspired by Apple's human interface guidelines and modern hardware unveil experiences.
 */

export const appleEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const appleEaseOut: [number, number, number, number] = [0, 0, 0.2, 1];
export const appleEaseInOut: [number, number, number, number] = [0.42, 0, 0.58, 1];

export const appleSpringFast = {
  type: 'spring',
  stiffness: 500,
  damping: 38,
  mass: 0.8
} as const;

export const appleSpringSnappy = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 1
} as const;

export const appleSpringSmooth = {
  type: 'spring',
  stiffness: 320,
  damping: 32,
  mass: 1.1
} as const;

export const appleSpringSubtle = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
  mass: 1
} as const;

/**
 * Tab and View Transition System
 * Physical unfolding and smooth crossfade between tabs
 */
export const appleTabVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12,
      ease: [0.32, 0, 0.67, 0]
    }
  }
};

/**
 * Reduced Motion Variant
 */
export const appleReducedTabVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.08 } }
};

/**
 * Micro-interaction: Apple Button Hover/Tap
 */
export const appleButtonTap: TargetAndTransition = {
  scale: 0.94,
  transition: { duration: 0.08, ease: appleEaseOut }
};

/**
 * Micro-interaction: Apple Card Hover/Tap
 */
export const appleCardHover: TargetAndTransition = {
  y: -3,
  scale: 1,
  transition: { duration: 0.18, ease: appleEase }
};

export const appleCardTap: TargetAndTransition = {
  scale: 0.97,
  transition: { duration: 0.08, ease: appleEaseOut }
};

/**
 * Stagger Container for list reveals
 */
export const appleStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02
    }
  }
};

export const appleStaggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: appleEase
    }
  }
};
