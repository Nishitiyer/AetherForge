import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ORB_MODES } from '../../data/orbs';

const AssistantOrb = ({ orbId = 'nova', active = false }) => {
  const orbRef = useRef();
  const config = useMemo(() => ORB_MODES.find(o => o.id === orbId) || ORB_MODES[0], [orbId]);

  useFrame((state) => {
    if (!orbRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // Smooth pulsing if "active" (responding to AI/Voice)
    const pulseFactor = active ? 1.2 + Math.sin(t * 15) * 0.1 : 1.0;
    orbRef.current.scale.setScalar(THREE.MathUtils.lerp(orbRef.current.scale.x, pulseFactor, 0.1));
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={orbRef} position={[7, 5, -5]}>
        {/* The Core Orb */}
        <Sphere args={[0.8, 64, 64]}>
          <MeshDistortMaterial
            color={config.color}
            speed={config.pulseSpeed}
            distort={0.4}
            radius={1}
            emissive={config.color}
            emissiveIntensity={2}
          />
        </Sphere>
        
        {/* Outer Aura Ring */}
        <Sphere args={[1.2, 32, 32]}>
          <meshPhongMaterial 
            color={config.secondaryColor} 
            transparent 
            opacity={0.15} 
            wireframe 
          />
        </Sphere>

        {/* Neural Particles / Static PointLights */}
        <pointLight intensity={3} distance={5} color={config.color} />
        
        {/* Floating Label (optional HUD element can go here) */}
      </group>
    </Float>
  );
};

export default AssistantOrb;
