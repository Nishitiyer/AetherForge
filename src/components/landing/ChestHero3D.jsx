import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import StarkOrb from '../common/AssistantOrb';

/**
 * ChestHero3D: The "Active Heart" of the AetherForge Landing interface.
 * Upgraded to the NI-7 Stark-Grade fidelity to match the cinematic neural core.
 */
export function ChestHero3D({ orb }) {
  const groupRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const accentColor = orb?.accent ?? '#00d2ff';

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // ── STARK NEURAL LEAN (Dynamic Spatial Response) ──
    const targetX = mousePos.x * 1.5;
    const targetY = mousePos.y * 1.0;
    
    // Weightier, slow-fluid lerp for industrial feel
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mousePos.x * 0.4, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mousePos.y * 0.4, 0.05);
  });

  const orbConfig = {
    color: accentColor,
    secondaryColor: orb?.secondaryColor || '#0055ff',
    accent: orb?.accent || '#00ffff'
  };

  return (
    <group ref={groupRef} scale={1.8}>
      {/* 
          Using the production-grade StarkOrb component directly.
          Ensures absolute aesthetic parity across the entire platform.
      */}
      <StarkOrb 
         orbId={orb?.id || 'sentinel'} 
         state="activated"
         scale={1.5}
      />

      {/* Cinematic Environmental Infrastructure */}
      <Stars radius={50} depth={50} count={300} factor={4} fade speed={1.5} />
      
      <pointLight position={[0, 0, 2]} intensity={25} color="#ffffff" />
      <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={25} color={accentColor} />
      <pointLight position={[-5, 5, 5]} intensity={15} color="#ffffff" />
      <pointLight position={[0, -10, 0]} intensity={18} color={accentColor} />
      <Environment preset="city" />
    </group>
  );
}
