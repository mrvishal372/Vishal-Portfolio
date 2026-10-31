import React, { useMemo } from 'react';
import { Box, Cylinder, Cone, Plane } from '@react-three/drei';
import * as THREE from 'three';

// Generate random obstacles and trees
const MAP_SIZE = 400;

export const Map3D: React.FC = () => {
  const obstacles = useMemo(() => {
    const items = [];
    
    // Buildings
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * MAP_SIZE * 0.8;
      const z = (Math.random() - 0.5) * MAP_SIZE * 0.8;
      const w = 5 + Math.random() * 10;
      const h = 5 + Math.random() * 10;
      const d = 5 + Math.random() * 10;
      
      // Don't spawn exactly at center 0,0 where player lands
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      
      items.push({ type: 'building', pos: [x, h/2, z], size: [w, h, d], color: '#aaa' });
    }

    // Trees
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() - 0.5) * MAP_SIZE;
      const z = (Math.random() - 0.5) * MAP_SIZE;
      
      if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;

      items.push({ type: 'tree', pos: [x, 0, z] });
    }

    return items;
  }, []);

  return (
    <group>
      {/* Ground */}
      <Plane args={[MAP_SIZE, MAP_SIZE]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </Plane>
      
      {/* Obstacles */}
      {obstacles.map((obs, i) => {
        if (obs.type === 'building') {
          return (
            <Box key={i} args={obs.size as [number,number,number]} position={obs.pos as [number,number,number]} castShadow receiveShadow>
              <meshStandardMaterial color={obs.color} roughness={0.9} />
            </Box>
          );
        } else if (obs.type === 'tree') {
          return (
            <group key={i} position={obs.pos as [number,number,number]}>
              {/* Trunk */}
              <Cylinder args={[0.5, 0.7, 4]} position={[0, 2, 0]} castShadow>
                <meshStandardMaterial color="#78350f" roughness={0.9} />
              </Cylinder>
              {/* Leaves */}
              <Cone args={[3, 6, 8]} position={[0, 6, 0]} castShadow>
                <meshStandardMaterial color="#166534" roughness={0.7} />
              </Cone>
              <Cone args={[2.5, 5, 8]} position={[0, 8, 0]} castShadow>
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </Cone>
            </group>
          );
        }
        return null;
      })}
    </group>
  );
};
