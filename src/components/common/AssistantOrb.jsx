import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ORB_MODES } from '../../data/orbs';

/**
 * AssistantOrb: High-Fidelity Stark-grade Neural Interface.
 * Implements refractive depth, frequency-sync distortion, and neural-ring rotation.
 */
const AssistantOrb = ({ orbId = 'nova', active = false, processing = false }) => {
  const groupRef = useRef();
  const coreRef  = useRef();
  const shellRef = useRef();
  const ringRef  = useRef();
  
  const config = useMemo(() => ORB_MODES.find(o => o.id === orbId) || ORB_MODES[0], [orbId]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    // 1. DYNAMIC NEURAL PULSE
    // Faster, more intense pulsing when "active" or "processing"
    const pulseBase = active ? 1.2 : 1.0;
    const pulseFreq = processing ? 15 : 6;
    const pulseAmt  = (active || processing) ? 0.08 : 0.03;
    const currentPulse = pulseBase + Math.sin(t * pulseFreq) * pulseAmt;
    
    groupRef.current.scale.lerp(new THREE.Vector3().setScalar(currentPulse), 0.1);

    // 2. CORE DISTORTION (Simulated Frequency)
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.01;
      coreRef.current.rotation.z += 0.02;
    }

    // 3. NEURAL RING ROTATION
    if (ringRef.current) {
       ringRef.current.rotation.z += processing ? 0.2 : 0.05;
       ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={groupRef} position={[6.5, 4.5, -4]}>
        
        {/* INNER NEURAL SINGULARITY (Core) */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.5, 64, 64]} />
          <MeshDistortMaterial
            color={config.color}
            speed={processing ? 6 : 2}
            distort={processing ? 0.6 : 0.4}
            radius={1}
            emissive={config.color}
            emissiveIntensity={active ? 15 : 5}
            toneMapped={false}
          />
        </mesh>

        {/* REFRACTIVE NEURAL SHELL (Stark-grade Glass) */}
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.9, 128, 128]} />
          <MeshTransmissionMaterial
            backside
            samples={16}
            resolution={512}
            thickness={2.5}
            roughness={0.02}
            anisotropy={1.0}
            chromaticAberration={0.6}
            distortion={0.4}
            distortionScale={0.8}
            temporalDistortion={0.05}
            ior={1.4}
            color={config.color}
            attenuationDistance={1.2}
            attenuationColor={config.color}
            transmission={1.0}
            envMapIntensity={3.0}
          />
        </mesh>

        {/* NEURAL ACCELERATOR RING */}
        <group ref={ringRef}>
           <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.2, 0.01, 16, 100]} />
              <meshBasicMaterial color={config.color} transparent opacity={0.4} />
           </mesh>
           <mesh rotation={[Math.PI / 4, 0, 0]}>
              <torusGeometry args={[1.15, 0.005, 16, 80]} />
              <meshBasicMaterial color={config.secondaryColor} transparent opacity={0.2} />
           </mesh>
        </group>

        {/* REACTIVE SYSTEM LIGHTING */}
        <pointLight intensity={active ? 20 : 8} distance={12} color={config.color} />
        <spotLight 
          position={[0, 5, 2]} 
          angle={0.3} 
          penumbra={1} 
          intensity={processing ? 2 : 1} 
          color={config.secondaryColor} 
        />
        
      </group>
    </Float>
  );
};

export default AssistantOrb;
