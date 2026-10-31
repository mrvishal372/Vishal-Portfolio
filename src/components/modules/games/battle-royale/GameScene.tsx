import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';

import { Map3D } from './Map';
import { Player } from './Player';
import { Bots } from './Bots';
import { SafeZone } from './SafeZone';
import { Loot } from './Loot';
import { gameStore } from './GameState';

// Simple crosshair overlay handling shooting logic
const GameLogic = ({ actionControls }: { actionControls: any }) => {
  const { camera, scene } = useThree();
  
  // Audio
  const shootSound = useRef(new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA')); // Dummy short beep if needed, but better to use browser synthetic oscillator
  
  const playShootSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  };

  const playHitSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  };

  // Handle shooting
  useEffect(() => {
    let lastShoot = 0;
    
    const handleShoot = () => {
      if (gameStore.phase !== 'playing') return;
      
      const now = Date.now();
      if (now - lastShoot < 200) return; // Fire rate
      if (gameStore.ammo <= 0) return;
      
      lastShoot = now;
      gameStore.ammo--;
      playShootSound();
      gameStore.notify();

      // Simple raycast from center of camera
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      
      // Check bot hits (AABB check for simplicity instead of heavy raycast against meshes)
      let hit = false;
      for (let i = 0; i < gameStore.bots.length; i++) {
        const bot = gameStore.bots[i];
        if (!bot.active) continue;
        
        // Bot is a capsule at bot.position
        const dx = bot.position[0] - camera.position.x;
        const dy = bot.position[1] - camera.position.y;
        const dz = bot.position[2] - camera.position.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist > 150) continue; // Too far
        
        // Ray direction
        const dir = raycaster.ray.direction;
        
        // Vector to bot
        const toBot = new THREE.Vector3(dx, dy, dz).normalize();
        
        // Dot product to check alignment
        const dot = dir.dot(toBot);
        
        // 0.99 dot product is a roughly 8 degree cone.
        if (dot > 0.99) {
          bot.health -= 34; // 3 shots to kill
          playHitSound();
          hit = true;
          if (bot.health <= 0) {
            bot.active = false;
            gameStore.eliminations++;
            gameStore.placement = gameStore.bots.filter(b => b.active).length + 1;
            
            if (gameStore.placement === 1) {
              gameStore.phase = 'gameover'; // Victory
            }
          }
          break; // Only hit one bot
        }
      }
      
      if (hit) gameStore.notify();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        if (e.button === 0) handleShoot();
      }
    };
    
    window.addEventListener('mousedown', onMouseDown);
    return () => window.removeEventListener('mousedown', onMouseDown);
  }, [camera]);
  
  // Mobile shooting binding
  useEffect(() => {
    if (actionControls?.fire) {
      // Fire triggered from mobile UI
      const ev = new MouseEvent('mousedown', { button: 0 });
      document.dispatchEvent(ev); // simulate for existing listener or just trigger directly
      actionControls.fire = false;
    }
  }, [actionControls?.fire]);

  useFrame((_, delta) => {
    if (gameStore.phase === 'playing' || gameStore.phase === 'dropping') {
      gameStore.timeAlive += delta;
      
      // Simulate bots shooting player randomly
      if (gameStore.phase === 'playing' && Math.random() < 0.02 * delta) { // 2% chance per second
         // check if a bot is close
         const closeBot = gameStore.bots.find(b => b.active && Math.sqrt(Math.pow(b.position[0] - gameStore.playerPos[0], 2) + Math.pow(b.position[2] - gameStore.playerPos[2], 2)) < 50);
         if (closeBot) {
           gameStore.health -= 5;
           if (gameStore.health <= 0) {
             gameStore.health = 0;
             gameStore.phase = 'gameover';
           }
           gameStore.notify();
         }
      }
    }
  });

  return null;
};

export const GameScene = ({ isMobile, actionControls }: { isMobile: boolean, actionControls: any }) => {
  return (
    <Canvas 
      shadows={!isMobile || window.innerWidth > 500} 
      dpr={isMobile ? 1.0 : [1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: !isMobile, alpha: false }}
      camera={{ fov: 75, position: [0, 50, 0] }}
    >
      <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />
      <ambientLight intensity={0.3} />
      <directionalLight 
        castShadow={!isMobile} 
        position={[100, 200, 50]} 
        intensity={1.5} 
        shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]} 
      >
        <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
      </directionalLight>
      
      <Map3D />
      <Player isMobile={isMobile} actionControls={actionControls} />
      <Bots />
      <Loot />
      <SafeZone />
      <GameLogic actionControls={actionControls} />
    </Canvas>
  );
};
