import React, { useRef, useMemo } from 'react';

import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, MeshTransmissionMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ORB_MODES } from '../../data/orbs';

const AssistantOrb = ({ orbId = 'nova', active = false }) => {
  const groupRef = useRef();
  const coreRef  = useRef();
  const config = useMemo(() => ORB_MODES.find(o => o.id === orbId) || ORB_MODES[0], [orbId]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const { mouse } = state;
    
    // Smooth pulsing if "active" (responding to AI/Voice)
    const pulseFactor = active ? 1.1 + Math.sin(t * 12) * 0.05 : 1.0;
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, pulseFactor, 0.1));

    if (coreRef.current) {
      coreRef.current.rotation.z += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} position={[7, 5, -5]}>
        
        {/* Core Singularity - Mature Glow */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <MeshDistortMaterial
            color={config.color}
            speed={3}
            distort={0.4}
            radius={1}
            emissive={config.color}
            emissiveIntensity={6}
            toneMapped={false}
          />
        </mesh>

        {/* Refractive Shell - Fluid Glass */}
        <mesh>
          <sphereGeometry args={[0.8, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={1.8}
            chromaticAberration={0.3}
            anisotropicBlur={0.8}
            distortion={0.3}
            distortionScale={0.5}
            temporalDistortion={0.03}
            ior={1.2}
            color={config.color}
            attenuationDistance={1.0}
            attenuationColor={config.color}
            roughness={0.05}
            transmission={1.0}
            envMapIntensity={2.5}
          />
        </mesh>
        
        {/* Outer Neural Aura - Softened */}
        <mesh>
          <sphereGeometry args={[1.1, 32, 32]} />
          <MeshWobbleMaterial 
            color={config.secondaryColor} 
            transparent 
            opacity={0.05} 
            wireframe 
            factor={0.4}
            speed={1.5}
          />
        </mesh>

        <pointLight intensity={5} distance={8} color={config.color} />
      </group>
    </Float>
  );
};

export default AssistantOrb;
