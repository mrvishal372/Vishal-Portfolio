import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Capsule } from '@react-three/drei';
import * as THREE from 'three';
import { gameStore } from './GameState';

const GRAVITY = 30;
const JUMP_FORCE = 15;
const SPEED = 15;

export const Player = ({ isMobile, actionControls }: { isMobile: boolean, actionControls: any }) => {
  const { camera } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const isGrounded = useRef(false);
  
  // Input state
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false, shift: false });
  
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': setKeys(k => ({...k, w: true})); break;
        case 'KeyA': setKeys(k => ({...k, a: true})); break;
        case 'KeyS': setKeys(k => ({...k, s: true})); break;
        case 'KeyD': setKeys(k => ({...k, d: true})); break;
        case 'Space': setKeys(k => ({...k, space: true})); break;
        case 'ShiftLeft':
        case 'ShiftRight': setKeys(k => ({...k, shift: true})); break;
        case 'KeyC': if (actionControls) actionControls.crouch = !actionControls.crouch; break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch(e.code) {
        case 'KeyW': setKeys(k => ({...k, w: false})); break;
        case 'KeyA': setKeys(k => ({...k, a: false})); break;
        case 'KeyS': setKeys(k => ({...k, s: false})); break;
        case 'KeyD': setKeys(k => ({...k, d: false})); break;
        case 'Space': setKeys(k => ({...k, space: false})); break;
        case 'ShiftLeft':
        case 'ShiftRight': setKeys(k => ({...k, shift: false})); break;
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  }, []);

  useFrame((state, delta) => {
    if (gameStore.phase !== 'playing' && gameStore.phase !== 'dropping') return;

    // Movement Logic
    const isSprinting = keys.shift || actionControls?.sprint;
    const speed = isSprinting ? SPEED * 1.6 : SPEED;
    
    velocity.current.x = 0;
    velocity.current.z = 0;
    
    // Joystick override or keyboard
    let moveForward = keys.w ? 1 : (keys.s ? -1 : 0);
    let moveRight = keys.d ? 1 : (keys.a ? -1 : 0);
    
    if (actionControls?.joystick) {
      moveForward = actionControls.joystick.y;
      moveRight = actionControls.joystick.x;
    }

    if (moveForward || moveRight) {
      direction.current.set(moveRight, 0, -moveForward).normalize();
      
      // Rotate movement to camera direction
      const rotation = camera.rotation.y;
      direction.current.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation);
      
      velocity.current.x = direction.current.x * speed;
      velocity.current.z = direction.current.z * speed;
    }
    
    // Jump
    const doJump = keys.space || actionControls?.jump;
    if (doJump && isGrounded.current) {
      velocity.current.y = JUMP_FORCE;
      isGrounded.current = false;
      if (actionControls) actionControls.jump = false;
    }

    // Gravity
    velocity.current.y -= GRAVITY * delta;

    // Update Position
    if (playerRef.current) {
      playerRef.current.position.x += velocity.current.x * delta;
      playerRef.current.position.y += velocity.current.y * delta;
      playerRef.current.position.z += velocity.current.z * delta;
      
      // Basic Floor Collision
      if (playerRef.current.position.y <= 1) {
        playerRef.current.position.y = 1;
        velocity.current.y = 0;
        isGrounded.current = true;
        if (gameStore.phase === 'dropping') {
          gameStore.phase = 'playing';
          gameStore.notify();
        }
      }

      // Sync camera to player
      camera.position.copy(playerRef.current.position);
      
      const targetY = actionControls?.crouch ? 0.3 : 0.8;
      camera.position.y += THREE.MathUtils.lerp(camera.position.y - playerRef.current.position.y, targetY, 0.15); // Smooth crouch
      
      const targetFov = actionControls?.aim ? 45 : 75;
      if ((camera as THREE.PerspectiveCamera).fov) {
        (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp((camera as THREE.PerspectiveCamera).fov, targetFov, 0.15);
        camera.updateProjectionMatrix();
      }

      // Sync store
      gameStore.playerPos = [
        playerRef.current.position.x,
        playerRef.current.position.y,
        playerRef.current.position.z
      ];
    }
  });

  return (
    <group ref={playerRef} position={[0, 50, 0]}>
      {/* Player Model - Invisible in First Person */}
      {!isMobile && <PointerLockControls />}
    </group>
  );
};
