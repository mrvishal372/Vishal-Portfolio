import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore } from './GameState';

export const Loot: React.FC = () => {
  const lootGroupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (gameStore.phase !== 'playing') return;
    
    // Rotate loot items and check proximity
    let foundNear: string | null = null;
    
    if (lootGroupRef.current) {
      lootGroupRef.current.children.forEach((mesh, i) => {
        const lootData = gameStore.loot[i];
        if (!lootData || !lootData.active) {
          mesh.visible = false;
          return;
        }
        
        mesh.visible = true;
        mesh.rotation.y += delta;
        
        // Proximity check
        const dx = gameStore.playerPos[0] - lootData.position[0];
        const dz = gameStore.playerPos[2] - lootData.position[2];
        const dist = Math.sqrt(dx*dx + dz*dz);
        
        if (dist < 4) {
          foundNear = lootData.id;
        }
      });
    }

    if (gameStore.nearLoot !== foundNear) {
      gameStore.nearLoot = foundNear;
      gameStore.notify();
    }
  });

  return (
    <group ref={lootGroupRef}>
      {gameStore.loot.map((loot) => (
        <group key={loot.id} position={[loot.position[0], 0.5, loot.position[2]]}>
          <Box args={[1, 1, 1]} castShadow>
            <meshStandardMaterial color={loot.type === 'health' ? '#10b981' : '#f59e0b'} roughness={0.5} metalness={0.8} />
          </Box>
        </group>
      ))}
    </group>
  );
};
