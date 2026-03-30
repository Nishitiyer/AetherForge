import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, Stars, MeshWobbleMaterial, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function ChestHero3D({ orb }) {
  const groupRef  = useRef();
  const coreRef   = useRef();
  const shellRef  = useRef();
  const ringsRef  = useRef();
  const mantleRef = useRef();

  const accentColor = orb?.accent ?? '#22d3ee';

  const matRing = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', metalness: 1, roughness: 0.05,
    emissive: accentColor, emissiveIntensity: 1.5, clearcoat: 1.0,
  }), [accentColor]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const { mouse } = state;

    // ── NEURAL LEAN (CURSOR INTERACTION) ──
    if (groupRef.current) {
      // Lerp position toward cursor (normalized with lower intensity for cinematic feel)
      const targetX = mouse.x * 0.8;
      const targetY = mouse.y * 0.5;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
      
      // Add a subtle rotation toward the cursor
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.5, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.5, 0.05);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += 0.04;
      coreRef.current.rotation.z += 0.02;
      coreRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
    if (mantleRef.current) {
      mantleRef.current.rotation.y -= 0.01;
      mantleRef.current.scale.setScalar(0.95 + Math.sin(t * 2) * 0.04);
    }
    if (shellRef.current) {
      shellRef.current.rotation.y += 0.005;
    }
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x += 0.007 * (i + 1);
        ring.rotation.y += 0.012 * (i + 2);
      });
    }
  });

  return (
    <group ref={groupRef} scale={1.3}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>

        {/* Inner Plasma Singularity - High Energy Core */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.25, 15]} />
          <MeshDistortMaterial
            color={accentColor} 
            speed={8} 
            distort={0.4} 
            radius={1}
            emissive={accentColor} 
            emissiveIntensity={25}
            toneMapped={false}
          />
        </mesh>

        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} wireframe />
        </mesh>

        {/* Neural Mantle - Ghost Layer */}
        <mesh ref={mantleRef}>
          <sphereGeometry args={[0.48, 64, 64]} />
          <MeshWobbleMaterial 
            factor={0.8} 
            speed={3}
            color={accentColor} 
            wireframe 
            opacity={0.1} 
            transparent 
          />
        </mesh>

        {/* Premium Glass Shell - Advanced Refraction */}
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.65, 64, 64]} />
          <MeshTransmissionMaterial
            backside 
            samples={16} 
            thickness={1.2}
            chromaticAberration={0.4} 
            anisotropicBlur={0.8}
            distortion={0.3} 
            distortionScale={0.5}
            temporalDistortion={0.1} 
            ior={1.4}
            color={accentColor} 
            attenuationDistance={1.5}
            attenuationColor={accentColor} 
            roughness={0.0} 
            transmission={1.0}
            envMapIntensity={3}
          />
        </mesh>

        {/* Elite Orbital Rings */}
        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.85, 0.01, 32, 120]} />
            <meshStandardMaterial 
              color={accentColor} 
              emissive={accentColor} 
              emissiveIntensity={30} 
              toneMapped={false} 
            />
          </mesh>
          <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
            <torusGeometry args={[1.05, 0.015, 32, 160]} />
            <primitive object={matRing} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 3.5, -0.6, 0]}>
            <torusGeometry args={[1.25, 0.005, 32, 200]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        </group>

        <Stars radius={10} depth={60} count={1000} factor={6} fade speed={1.5} />
      </Float>

      {/* Cinematic Lighting */}
      <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={12} color={accentColor} />
      <pointLight position={[0, 0, 0]} intensity={20} color={accentColor} distance={4} />
      <pointLight position={[-4, 2, 4]} intensity={6} color="#ffffff" />
      <pointLight position={[0, -5, 0]} intensity={8} color={accentColor} />
      <Environment preset="night" />
    </group>
  );
}
