import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, MeshDistortMaterial, Text, Torus, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * StarkOrb: Universal AetherForge Neural Core (v4.0).
 * State-driven architecture support: 'idle', 'selected', 'listening', 'processing', 'activated'.
 * Dynamically adapts visuals to Nova, Sentinel, Echo, Forge, Prism, and Quantum Core registries.
 */
const StarkOrb = ({ 
  orbId = 'sentinel', 
  state = 'idle', // 'idle' | 'selected' | 'listening' | 'processing' | 'activated'
  scale = 1.0,
  position = [0, 0, 0],
  orbOverride = null // Optional manual override config
}) => {
  const groupRef = useRef();
  const innerCoreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const particlesRef = useRef();

  // Get Registry Data
  const orb = useMemo(() => {
    const registries = {
      nova: { color: '#fbbf24', secondary: '#f59e0b', accent: '#fff7ed', ringSpeed: 0.05, distort: 0.4 },
      sentinel: { color: '#06b6d4', secondary: '#0e7490', accent: '#ecfeff', ringSpeed: 0.08, distort: 0.2 },
      echo: { color: '#a855f7', secondary: '#d946ef', accent: '#fdf4ff', ringSpeed: 0.12, distort: 0.8 },
      forge: { color: '#f97316', secondary: '#dc2626', accent: '#fef3c7', ringSpeed: 0.15, distort: 0.6 },
      prism: { color: '#2dd4bf', secondary: '#6366f1', accent: '#f0f9ff', ringSpeed: 0.02, distort: 0.9 },
      quantum: { color: '#ffffff', secondary: '#06b6d4', accent: '#e2e8f0', ringSpeed: 0.25, distort: 1.2 }
    };
    return orbOverride || registries[orbId] || registries.sentinel;
  }, [orbId, orbOverride]);

  // Performance-optimized Particle Generation (Outer Halo)
  const [particles] = useMemo(() => {
    const coords = new Float32Array(300);
    for (let i = 0; i < 300; i++) coords[i] = (Math.random() - 0.5) * 4;
    return [coords];
  }, []);

  useFrame((stateObj) => {
    if (!groupRef.current) return;
    const t = stateObj.clock.getElapsedTime();
    
    // ── 1. STATE-DRIVEN PULSE LOGIC ──
    let pulseFactor = 1.0;
    let ringMultiplier = 1.0;
    
    switch(state) {
        case 'selected': pulseFactor = 1.2; break;
        case 'listening': pulseFactor = 1.3 + Math.sin(t * 12) * 0.1; break;
        case 'processing': 
            pulseFactor = 1.25 + Math.sin(t * 20) * 0.05; 
            ringMultiplier = 4.0;
            break;
        case 'activated': pulseFactor = 1.4; break;
        default: pulseFactor = 1.0 + Math.sin(t * 2) * 0.02; // Idle
    }

    groupRef.current.scale.lerp(new THREE.Vector3().setScalar(pulseFactor * scale), 0.1);

    // ── 2. DYNAMIC RING ROTATION ──
    const rs = orb.ringSpeed * ringMultiplier;
    if (ring1Ref.current) ring1Ref.current.rotation.z += rs;
    if (ring2Ref.current) {
        ring2Ref.current.rotation.z -= rs * 0.6;
        ring2Ref.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
    if (ring3Ref.current) ring3Ref.current.rotation.z += rs * 2.0;

    // ── 3. OUTER HALO PARTICLES ──
    if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.005;
        particlesRef.current.rotation.z += 0.002;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} position={position}>
        
        {/* PHASE 0: SOLID GLOW SINGULARITY (Failsafe Visibility) */}
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
          <pointLight intensity={30} distance={10} color={orb.color} />
        </mesh>

        {/* PHASE 1: INTERNAL NEURAL ENERGY (Distorted Core) */}
        <mesh ref={innerCoreRef}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <MeshDistortMaterial
            color={orb.color}
            speed={state === 'processing' ? 15 : 4}
            distort={orb.distort}
            radius={1}
            wireframe
            transparent
            opacity={0.8}
            emissive={orb.color}
            emissiveIntensity={25}
            toneMapped={false}
          />
        </mesh>

        {/* PHASE 2: PRIMARY STARK-GLASS SHELL (Refraction) */}
        <mesh>
          <sphereGeometry args={[0.95, 48, 48]} />
          <MeshTransmissionMaterial
            samples={6}
            resolution={128}
            thickness={2.2}
            roughness={0.04}
            chromaticAberration={0.6}
            distortion={0.3}
            distortionScale={0.8}
            ior={1.45}
            color={orb.color}
            attenuationDistance={1.5}
            attenuationColor={orb.color}
            transmission={1.0}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* PHASE 3: STARK-GRADE ANALYTIC RINGS */}
        <group ref={ring1Ref}>
           <Torus args={[1.35, 0.012, 8, 64]}>
              <meshStandardMaterial color={orb.color} emissive={orb.color} emissiveIntensity={10} />
           </Torus>
           {/* Analytic Markings (Holographic Text) */}
           <Text 
              position={[0, 1.35, 0]} 
              fontSize={0.06} 
              color={orb.color} 
              font="https://fonts.gstatic.com/s/orbitron/v11/yBbg7gzZ3ol6L5TMaW2UfA.woff"
              anchorX="center"
              emissive={orb.color}
              emissiveIntensity={5}
           >
              AETHERFORCE_CORE_{orbId.toUpperCase()}
           </Text>
        </group>

        {/* Secondary Analytic Ring (Tilted) */}
        <group ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
           <Torus args={[1.25, 0.005, 8, 48]}>
              <meshBasicMaterial color={orb.accent} transparent opacity={0.3} />
           </Torus>
        </group>

        {/* Tertiary Speed Ring (Horizontal) */}
        <group ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
           <Torus args={[1.5, 0.002, 6, 80]}>
              <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
           </Torus>
        </group>

        {/* PHASE 4: OUTER HALO (Star/Particle Cloud) */}
        <Points ref={particlesRef} positions={particles}>
          <PointMaterial
            transparent
            color={orb.color}
            size={0.015}
            sizeAttenuation={true}
            depthWrite={false}
            alphaWrite={false}
          />
        </Points>

      </group>
    </Float>
  );
};

export default StarkOrb;
