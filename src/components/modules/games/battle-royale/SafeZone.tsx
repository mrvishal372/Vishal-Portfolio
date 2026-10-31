import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore } from './GameState';

export const SafeZone: React.FC = () => {
  const zoneRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (gameStore.phase === 'playing') {
      // Shrink safe zone slowly
      if (gameStore.safeZoneRadius > 10) {
        gameStore.safeZoneRadius -= 2 * delta;
      }
      
      // Check if player is outside
      const dx = gameStore.playerPos[0] - gameStore.safeZoneCenter[0];
      const dz = gameStore.playerPos[2] - gameStore.safeZoneCenter[1];
      const dist = Math.sqrt(dx*dx + dz*dz);
      
      if (dist > gameStore.safeZoneRadius) {
        // Player takes damage
        gameStore.health -= 5 * delta;
        if (gameStore.health <= 0) {
          gameStore.health = 0;
          gameStore.phase = 'gameover';
        }
        gameStore.notify();
      }
    }
    
    if (zoneRef.current) {
      zoneRef.current.scale.set(gameStore.safeZoneRadius, 1, gameStore.safeZoneRadius);
    }
  });

  return (
    <group position={[gameStore.safeZoneCenter[0], 0, gameStore.safeZoneCenter[1]]}>
      <Cylinder 
        ref={zoneRef}
        args={[1, 1, 100, 32, 1, true]} 
        position={[0, 50, 0]}
      >
        <meshBasicMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
      </Cylinder>
    </group>
  );
};
