import React, { useMemo, useState, useEffect } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  cascadeIndex?: number;
  yOffset?: number;
  duration?: number;
  blur?: number;
  className?: string;
  reducedMotion?: boolean;
  once?: boolean;
  margin?: string;
  as?: 'div' | 'section' | 'article' | 'header';
}

/**
 * Premium progressive reveal component with hardware acceleration.
 * Slower, softer, cinematic blur-to-sharp opening & scroll reveal:
 * Slight blur (4-8px) → gradually become sharp → fade in → gently move into position.
 * Easing: [0.16, 1, 0.3, 1] (smooth Apple ease-out deceleration).
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = React.memo(({
  children,
  delay,
  cascadeIndex,
  yOffset,
  duration = 0.4,
  blur = 0,
  className = '',
  reducedMotion = false,
  once = true,
  margin = '20px 0px -10px 0px',
  as = 'div',
  style,
  ...rest
}) => {
  // Prevent layout shift at the top of the viewport (yOffset is 0 for cascadeIndex 0)
  const calculatedYOffset = yOffset !== undefined ? yOffset : (cascadeIndex === 0 ? 0 : 12);

  // Snappy, smooth calculated delay based on cascadeIndex (0s, 0.04s, 0.08s...)
  const calculatedDelay = useMemo(() => {
    if (delay !== undefined) return Math.min(delay, 0.25);
    if (cascadeIndex !== undefined) return Math.min(cascadeIndex * 0.04, 0.2);
    return 0;
  }, [delay, cascadeIndex]);

  const prefersReduced = useMemo(() => {
    if (reducedMotion) return true;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, [reducedMotion]);

  const Component = as === 'section' ? motion.section : as === 'article' ? motion.article : as === 'header' ? motion.header : motion.div;

  if (prefersReduced) {
    return (
      <Component
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once, margin }}
        transition={{ duration: 0.2 }}
        className={className}
        style={style}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  // Cap animation duration so it remains snappy and never hangs or lags
  const animDuration = Math.min(Math.max(duration, 0.2), 0.45);

  return (
    <Component
      initial={{
        opacity: 0,
        y: calculatedYOffset,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once, margin, amount: 0.01 }}
      transition={{
        duration: animDuration,
        delay: calculatedDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{
        transform: 'translate3d(0,0,0)',
        ...style
      }}
      {...rest}
    >
      {children}
    </Component>
  );
});

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  reducedMotion?: boolean;
  once?: boolean;
}> = ({
  children,
  className = '',
  delayChildren = 0.1,
  staggerChildren = 0.2,
  reducedMotion = false,
  once = true
}) => {
  const prefersReduced = useMemo(() => {
    if (reducedMotion) return true;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, [reducedMotion]);

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '10px 0px -20px 0px' }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReduced ? 0 : staggerChildren,
            delayChildren: prefersReduced ? 0 : delayChildren
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
  duration?: number;
  blur?: number;
  reducedMotion?: boolean;
}> = React.memo(({
  children,
  className = '',
  yOffset = 16,
  duration = 0.35,
  blur = 0,
  reducedMotion = false
}) => {
  const prefersReduced = useMemo(() => {
    if (reducedMotion) return true;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, [reducedMotion]);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: prefersReduced ? 0 : yOffset },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: Math.min(duration, 0.45),
            ease: [0.16, 1, 0.3, 1]
          }
        }
      }}
      className={className}
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      {children}
    </motion.div>
  );
});
