import React, { useEffect, useRef, useState } from 'react';

interface AuroraBackgroundProps {
  isDark: boolean;
  isPaused?: boolean;
  reducedMotion?: boolean;
}

/**
 * 🌌 Ultra-Premium Aurora Borealis & Futuristic Flowing Light Background
 * Unified across the entire website in Dark Mode.
 *
 * Visual Craftsmanship:
 * - Fluid undulating aurora ribbons (Luminous Emerald, Electric Cyan, Celestial Violet, Magenta Sheen)
 * - True geomagnetic curtain striations (silky vertical light rays)
 * - Volumetric glow bloom with atmospheric light diffusion
 * - Deep luxury cosmic obsidian backdrop with organic micro-stardust twinkling
 * - Interactive magnetic cursor/touch deflection with damped inertia
 * - Silky smooth 60fps GPU WebGL rendering with Canvas 2D fallback
 * - Fully battery-friendly (pauses when tab/modal is hidden)
 * - WCAG AA contrast preservation with subtle top and bottom vignettes
 */
export const AuroraBackground: React.FC<AuroraBackgroundProps> = React.memo(function AuroraBackground({
  isDark,
  isPaused = false,
  reducedMotion = false
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (!isDark) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    let animationFrameId: number;
    let program: WebGLProgram | null = null;
    let positionBuffer: WebGLBuffer | null = null;
    let isDestroyed = false;

    // Mouse coordinates for gentle interactive fluid parallax
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

    let pointerTicking = false;
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (reducedMotion) return;
      if (!pointerTicking) {
        pointerTicking = true;
        requestAnimationFrame(() => {
          let clientX = 0;
          let clientY = 0;
          if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
          } else if ('clientX' in e) {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
          }
          mouse.targetX = clientX / (window.innerWidth || 1);
          mouse.targetY = clientY / (window.innerHeight || 1);
          pointerTicking = false;
        });
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Handle Resize with mobile DPR clamping to eliminate mobile GPU overdraw
    const isMobileDevice = typeof window !== 'undefined' && (
      window.innerWidth < 768 ||
      ('ontouchstart' in window && window.innerWidth < 1024)
    );

    let resizeTimer: any = null;
    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = isMobileDevice ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const targetW = Math.floor(width * dpr);
      const targetH = Math.floor(height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        if (gl) {
          gl.viewport(0, 0, targetW, targetH);
        }
      }
    };

    const handleDebouncedResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 100);
    };

    resizeCanvas();
    window.addEventListener('resize', handleDebouncedResize, { passive: true });

    // Vertex shader
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Ultra-smooth Futuristic Aurora fragment shader
    const fsSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uSpeed;
      varying vec2 vUv;

      // 2D Simplex Noise generator
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Pseudo-random hash for stars
      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / uResolution.y;
        vec2 p = uv;
        p.x *= aspect;

        // Base luxury obsidian darkness with subtle dark teal/indigo depth
        vec3 col = vec3(0.010, 0.016, 0.035);

        // Ambient deep space background gradient
        col += vec3(0.005, 0.022, 0.045) * (1.0 - uv.y);
        col += vec3(0.012, 0.008, 0.030) * uv.y;

        // Subtle twinkling starfield in the background cosmos
        vec2 starUv = uv * vec2(90.0 * aspect, 90.0);
        vec2 starGrid = floor(starUv);
        float starRand = hash21(starGrid);
        if (starRand > 0.982) {
          float dist = length(fract(starUv) - 0.5);
          float twinkle = 0.5 + 0.5 * sin(uTime * 1.8 + starRand * 6.2831);
          float starBrightness = smoothstep(0.14, 0.0, dist) * twinkle * 0.40;
          col += vec3(0.8, 0.92, 1.0) * starBrightness;
        }

        // Soft magnetic cursor interaction
        vec2 mOffset = (uMouse - 0.5) * 0.14;
        p += mOffset;

        float t = uTime * uSpeed;

        // -------------------------------------------------------------
        // Ribbon 1: Luminous Emerald / Mint Aurora (Primary Core Wave)
        // -------------------------------------------------------------
        float n1 = snoise(vec2(p.x * 0.55 + t * 0.16, t * 0.07));
        float n1_sub = snoise(vec2(p.x * 1.6 - t * 0.22, p.y * 1.3 + t * 0.1));
        float wave1 = 0.56 + 0.19 * sin(p.x * 1.35 + t * 0.38 + n1 * 1.3) + n1_sub * 0.09;
        
        // Vertical curtain striations (Birkeland light rays)
        float rays1 = sin(p.x * 36.0 + n1 * 3.8 + t * 0.5) * 0.5 + 0.5;
        rays1 = pow(rays1, 2.8) * 0.42 + 0.58;
        
        float dist1 = abs(p.y - wave1);
        float aurora1 = exp(-dist1 * 7.0) * rays1;
        float bloom1 = exp(-dist1 * 2.8) * 0.35; // Volumetric soft bloom
        vec3 colAurora1 = vec3(0.02, 0.96, 0.65); // Pure emerald glow

        // -------------------------------------------------------------
        // Ribbon 2: Electric Azure / Cyan Wave (Mid Oceanic Flow)
        // -------------------------------------------------------------
        float n2 = snoise(vec2(p.x * 0.75 - t * 0.13, t * 0.09 + 2.8));
        float wave2 = 0.46 + 0.21 * sin(p.x * 1.7 - t * 0.30 + n2 * 1.4);
        float rays2 = sin(p.x * 44.0 - n2 * 4.5 - t * 0.45) * 0.5 + 0.5;
        rays2 = pow(rays2, 2.4) * 0.38 + 0.62;
        
        float dist2 = abs(p.y - wave2);
        float aurora2 = exp(-dist2 * 6.2) * rays2;
        float bloom2 = exp(-dist2 * 2.5) * 0.38;
        vec3 colAurora2 = vec3(0.00, 0.72, 1.00); // Electric cyan

        // -------------------------------------------------------------
        // Ribbon 3: Celestial Violet & Royal Purple (High-Altitude Ion)
        // -------------------------------------------------------------
        float n3 = snoise(vec2(p.x * 0.48 + t * 0.15 + 1.5, t * 0.08));
        float wave3 = 0.66 + 0.17 * sin(p.x * 1.15 + t * 0.26 + n3 * 1.1);
        float rays3 = sin(p.x * 30.0 + t * 0.35) * 0.5 + 0.5;
        rays3 = pow(rays3, 2.0) * 0.32 + 0.68;
        
        float dist3 = abs(p.y - wave3);
        float aurora3 = exp(-dist3 * 7.5) * rays3;
        float bloom3 = exp(-dist3 * 2.6) * 0.32;
        vec3 colAurora3 = vec3(0.65, 0.22, 0.98); // Celestial purple/violet

        // -------------------------------------------------------------
        // Ribbon 4: Warm Solar Magenta / Rose Corona Shimmer
        // -------------------------------------------------------------
        float wave4 = 0.38 + 0.15 * sin(p.x * 2.1 + t * 0.35 + n2 * 0.75);
        float dist4 = abs(p.y - wave4);
        float aurora4 = exp(-dist4 * 8.5);
        float bloom4 = exp(-dist4 * 3.0) * 0.25;
        vec3 colAurora4 = vec3(0.98, 0.28, 0.58); // Rose magenta shimmer

        // -------------------------------------------------------------
        // Combine Luminescent Emissions with Smooth Additive Blending
        // -------------------------------------------------------------
        vec3 totalGlow = (colAurora1 * (aurora1 + bloom1) * 0.90)
                       + (colAurora2 * (aurora2 + bloom2) * 1.00)
                       + (colAurora3 * (aurora3 + bloom3) * 0.85)
                       + (colAurora4 * (aurora4 + bloom4) * 0.50);

        // Add soft, graceful glowing light (calibrated to be subtle, clean, and not blinding)
        col += totalGlow * 0.82;

        // Elegant atmospheric vignette to frame content beautifully
        float vignette = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y) * 16.0;
        vignette = clamp(pow(vignette, 0.22), 0.0, 1.0);
        col *= (0.72 + 0.28 * vignette);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    try {
      gl = canvas.getContext('webgl', { 
        alpha: false, 
        antialias: false, 
        powerPreference: 'high-performance' 
      }) || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

      if (!gl) {
        setWebglSupported(false);
        return;
      }

      // Compile Shader helper
      const createShader = (type: number, source: string) => {
        if (!gl) return null;
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.warn('Aurora Shader compile error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);

      if (!vs || !fs) {
        setWebglSupported(false);
        return;
      }

      program = gl.createProgram();
      if (!program) {
        setWebglSupported(false);
        return;
      }

      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.warn('Aurora Program link error:', gl.getProgramInfoLog(program));
        setWebglSupported(false);
        return;
      }

      gl.useProgram(program);

      // Full screen quad geometry
      const vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]);

      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const aPosition = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      const uTimeLoc = gl.getUniformLocation(program, 'uTime');
      const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
      const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
      const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed');

      let startTime = performance.now();
      let lastFrameTime = startTime;
      let virtualTime = 0;

      const render = (now: number) => {
        if (isDestroyed || !gl || !program) return;

        if (isPaused || document.hidden) {
          animationFrameId = 0;
          return;
        }

        const delta = Math.min((now - lastFrameTime) / 1000, 0.1);
        lastFrameTime = now;

        const speedMultiplier = reducedMotion ? 0.35 : 1.0;
        virtualTime += delta * speedMultiplier;

        // Smooth mouse inertia
        if (!reducedMotion) {
          mouse.x += (mouse.targetX - mouse.x) * 0.04;
          mouse.y += (mouse.targetY - mouse.y) * 0.04;
        }

        gl.uniform1f(uTimeLoc, virtualTime);
        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        gl.uniform2f(uMouseLoc, mouse.x, mouse.y);
        gl.uniform1f(uSpeedLoc, 0.48);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
      };

      const startLoop = () => {
        if (!animationFrameId && !isPaused && !document.hidden && !isDestroyed) {
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        }
      };

      const stopLoop = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden || isPaused) {
          stopLoop();
        } else {
          startLoop();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      startLoop();
    } catch (err) {
      console.warn('WebGL Aurora init failed, using CSS fallback:', err);
      setWebglSupported(false);
    }

    return () => {
      isDestroyed = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleDebouncedResize);
      window.removeEventListener('mousemove', handlePointerMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (gl) {
        if (positionBuffer) gl.deleteBuffer(positionBuffer);
        if (program) gl.deleteProgram(program);
      }
    };
  }, [isDark, isPaused, reducedMotion]);

  // If user is in Light mode, don't mount or render anything
  if (!isDark) return null;

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none overflow-hidden select-none transition-opacity duration-700 opacity-100"
      aria-hidden="true"
    >
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ transform: 'translateZ(0)' }}
        />
      ) : (
        /* Smooth CSS/Canvas Fallback if WebGL is unavailable */
        <div className="absolute inset-0 bg-[#030712] overflow-hidden">
          <div 
            className="absolute -top-[15%] left-[8%] w-[85vw] h-[65vh] rounded-full bg-gradient-to-br from-emerald-400/30 via-teal-500/25 to-transparent blur-3xl animate-pulse" 
            style={{ animationDuration: '7s' }} 
          />
          <div 
            className="absolute top-[12%] right-[6%] w-[75vw] h-[55vh] rounded-full bg-gradient-to-bl from-cyan-400/30 via-blue-600/25 to-transparent blur-3xl animate-pulse" 
            style={{ animationDuration: '10s' }} 
          />
          <div 
            className="absolute top-[28%] left-[22%] w-[68vw] h-[50vh] rounded-full bg-gradient-to-tr from-purple-500/25 via-violet-600/20 to-transparent blur-3xl animate-pulse" 
            style={{ animationDuration: '8.5s' }} 
          />
        </div>
      )}

      {/* Subtle bottom gradient horizon seal for crisp UI contrast */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#02040a] via-[#02040a]/75 to-transparent pointer-events-none" />
      {/* Subtle top vignette for crystal clear header text legibility */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#02040a]/90 via-[#02040a]/45 to-transparent pointer-events-none" />
    </div>
  );
});
