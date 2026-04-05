import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StarkOrb from '../common/AssistantOrb';

/**
 * Orb3D: Landing Page version of the Stark Universal Orb.
 * Maintains the exact high-fidelity refractive aesthetic while adding landing-specific entry/exit animations.
 */
const Orb3D = ({ config, animState, isExiting, responsive = false }) => {
  const groupRef = useRef();

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.scale.set(0.01, 0.01, 0.01);
        groupRef.current.position.z = -2.5; 
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Structural Motion Sync
    let targetZ = 0.5; 
    let targetScale = 1.0;
    
    if (animState === 'idle_closed') {
        targetZ = -0.5;
        targetScale = 0.8;
    }
    
    if (isExiting) { 
        targetZ = -3.0; 
        targetScale = 0; 
    }

    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3.0);
    const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 3.5);
    groupRef.current.scale.setScalar(s);
  });

  return (
    <group ref={groupRef}>
      {/* 
          Using the universal StarkOrb to ensure 1:1 aesthetic consistency 
          between the Landing Page and the Editor workspace.
      */}
      <StarkOrb 
        config={config} 
        active={responsive} 
        processing={responsive} 
        scale={0.8}
      />
    </group>
  );
};

export default Orb3D;
