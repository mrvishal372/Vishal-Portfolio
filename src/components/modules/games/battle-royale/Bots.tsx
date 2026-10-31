import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Capsule } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore } from './GameState';

export const Bots: React.FC = () => {
  const botsRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (gameStore.phase !== 'playing') return;
    
    // Very lightweight bot logic
    if (botsRef.current) {
      botsRef.current.children.forEach((botMesh, i) => {
        const botData = gameStore.bots[i];
        if (!botData || !botData.active) {
          botMesh.visible = false;
          return;
        }
        
        botMesh.visible = true;
        
        // Simple AI: Slowly move towards center or random
        const dx = gameStore.playerPos[0] - botData.position[0];
        const dz = gameStore.playerPos[2] - botData.position[2];
        const dist = Math.sqrt(dx*dx + dz*dz);
        
        if (dist < 100 && dist > 5) {
          // Move towards player slowly
          botData.position[0] += (dx / dist) * 2 * delta;
          botData.position[2] += (dz / dist) * 2 * delta;
        } else {
          // Wander slowly
          botData.position[0] += Math.sin(state.clock.elapsedTime + i) * delta * 2;
          botData.position[2] += Math.cos(state.clock.elapsedTime + i) * delta * 2;
        }
        
        botMesh.position.set(botData.position[0], 1, botData.position[2]);
        botMesh.lookAt(gameStore.playerPos[0], 1, gameStore.playerPos[2]);
      });
    }
  });

  return (
    <group ref={botsRef}>
      {gameStore.bots.map((bot, i) => (
        <group key={bot.id} position={[bot.position[0], 1, bot.position[2]]}>
          <Capsule args={[0.5, 1, 4, 8]} castShadow>
            <meshStandardMaterial color="#ef4444" roughness={0.7} />
          </Capsule>
          {/* Simple gun for bot */}
          <mesh position={[0.4, 0.2, 0.4]}>
            <boxGeometry args={[0.1, 0.1, 0.8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
