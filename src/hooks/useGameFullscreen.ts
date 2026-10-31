import { useState, useEffect, RefObject, useCallback, useRef } from 'react';

export function useGameFullscreen(containerRef: RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportSize, setViewportSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });
  const rafRef = useRef<number | null>(null);

  const notifyFullscreenChange = useCallback((active: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      if (active) {
        document.body.classList.add('game-fullscreen', 'app-fullscreen');
        document.documentElement.classList.add('in-fullscreen');
        if (document.body) document.body.style.overflow = 'hidden';
      } else {
        document.body.classList.remove('game-fullscreen', 'app-fullscreen');
        document.documentElement.classList.remove('in-fullscreen');
        if (document.body) document.body.style.overflow = '';
      }
      window.dispatchEvent(new CustomEvent('vyron_fullscreen_changed', { detail: { isFullscreen: active } }));
    } catch {}
  }, []);

  const enterFullscreen = useCallback(async () => {
    setIsFullscreen(true);
    notifyFullscreenChange(true);
    try {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      }
    } catch {}
  }, [containerRef, notifyFullscreenChange]);

  const exitFullscreen = useCallback(async () => {
    setIsFullscreen(false);
    notifyFullscreenChange(false);
    try {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch {}
  }, [notifyFullscreenChange]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Handle escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  // Listen for browser fullscreen changes (e.g. Esc pressed natively)
  useEffect(() => {
    const handleBrowserFullscreenChange = () => {
      const isDocFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isDocFs && isFullscreen) {
        setIsFullscreen(false);
        notifyFullscreenChange(false);
      } else if (isDocFs && !isFullscreen) {
        setIsFullscreen(true);
        notifyFullscreenChange(true);
      }
    };
    document.addEventListener('fullscreenchange', handleBrowserFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleBrowserFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleBrowserFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleBrowserFullscreenChange);
    };
  }, [isFullscreen, notifyFullscreenChange]);

  useEffect(() => {
    notifyFullscreenChange(isFullscreen);
    return () => {
      notifyFullscreenChange(false);
    };
  }, [isFullscreen, notifyFullscreenChange]);

  // Centralized resize listener for smooth 60fps layout adjustments
  useEffect(() => {
    const handleResize = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        const vp = window.visualViewport;
        const width = vp ? vp.width : window.innerWidth;
        const height = vp ? vp.height : window.innerHeight;
        
        setViewportSize({ width, height });
        
        // Directly apply to container for zero-latency CSS adaptations
        if (containerRef.current) {
          containerRef.current.style.setProperty('--vv-width', `${width}px`);
          containerRef.current.style.setProperty('--vv-height', `${height}px`);
          if (vp) {
            containerRef.current.style.setProperty('--vv-offset-top', `${vp.offsetTop}px`);
          }
        }
      });
    };

    const vp = window.visualViewport;
    if (vp) {
      vp.addEventListener('resize', handleResize);
      vp.addEventListener('scroll', handleResize);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Trigger initial calculation
    handleResize();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (vp) {
        vp.removeEventListener('resize', handleResize);
        vp.removeEventListener('scroll', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [containerRef]);

  return {
    isFullscreen,
    viewportSize,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
}
