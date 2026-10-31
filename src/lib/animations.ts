/**
 * Vyron AI - Unified Animation System
 * Pro-level, lightweight, 60fps animations inspired by Apple iOS design principles.
 * Optimized for zero layout-shift, hardware-acceleration, and reduced-motion support.
 */

import { Transition, Variants } from 'motion/react';

// Common Apple-standard Spring & Easing curves
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.8
};

export const gentleSpringTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 1
};

export const snappyTransition: Transition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1] // cubic-bezier smooth outExpo
};

export const smoothFadeTransition: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1]
};

// Page / Tab Transitions
export const tabContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.14,
      ease: [0.4, 0, 1, 1]
    }
  }
};

// Modal & Popup Backdrop and Dialog Transitions
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.2, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15, ease: 'easeIn' } 
  }
};

export const modalDialogVariants: Variants = {
  initial: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10 
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 28,
      mass: 0.9
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    y: 6,
    transition: { 
      duration: 0.15, 
      ease: [0.4, 0, 1, 1] 
    } 
  }
};

// Chat / AI Response Reveal Variants
export const chatMessageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 8,
    scale: 0.98
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Card Hover & Tap Variants
export const interactiveCardVariants: Variants = {
  idle: { scale: 1, y: 0 },
  hover: { 
    y: -2, 
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } 
  },
  tap: { 
    scale: 0.98, 
    transition: { duration: 0.1, ease: 'easeOut' } 
  }
};

// Micro Button Tap
export const buttonTapScale = {
  whileTap: { scale: 0.96 },
  transition: { duration: 0.1, ease: 'easeOut' }
};
