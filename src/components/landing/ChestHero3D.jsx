import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, Stars, MeshWobbleMaterial, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function ChestHero3D({ orb }) {
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
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.04;
      coreRef.current.rotation.z += 0.02;
    }
    if (mantleRef.current) {
      mantleRef.current.rotation.y -= 0.01;
      mantleRef.current.scale.setScalar(0.95 + Math.sin(t * 2) * 0.04);
    }
    if (shellRef.current) {
      shellRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      shellRef.current.rotation.z = Math.cos(t * 0.3) * 0.2;
    }
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x += 0.007 * (i + 1);
        ring.rotation.y += 0.012 * (i + 2);
      });
    }
  });

  return (
    <group scale={1.3}>
      <Float speed={4} rotationIntensity={1.2} floatIntensity={1.2}>

        {/* Inner Plasma Core - High Pulse */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.3, 10]} />
          <MeshDistortMaterial
            color={accentColor} 
            speed={5} 
            distort={0.6} 
            radius={1}
            emissive={accentColor} 
            emissiveIntensity={12}
            toneMapped={false}
          />
        </mesh>

        {/* Neural Mantle - Ghost Layer */}
        <mesh ref={mantleRef}>
          <sphereGeometry args={[0.48, 64, 64]} />
          <MeshWobbleMaterial 
            factor={0.8} 
            speed={3}
            color={accentColor} 
            wireframe 
            opacity={0.15} 
            transparent 
          />
        </mesh>

        {/* Premium Glass Shell - Advanced Refraction */}
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.65, 64, 64]} />
          <MeshTransmissionMaterial
            backside 
            samples={16} 
            thickness={0.8}
            chromaticAberration={0.12} 
            anisotropicBlur={0.8}
            distortion={0.5} 
            distortionScale={0.5}
            temporalDistortion={0.2} 
            ior={1.5}
            color={accentColor} 
            attenuationDistance={1.2}
            attenuationColor={accentColor} 
            roughness={0.02} 
            transmission={1.0}
            envMapIntensity={2}
          />
        </mesh>

        {/* Elite Orbital Rings */}
        <group ref={ringsRef}>
          {/* Inner Fast Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.85, 0.015, 32, 120]} />
            <meshStandardMaterial 
              color={accentColor} 
              emissive={accentColor} 
              emissiveIntensity={20} 
              toneMapped={false} 
            />
          </mesh>
          {/* Middle Pattern Ring */}
          <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
            <torusGeometry args={[1.05, 0.02, 32, 160]} />
            <primitive object={matRing} attach="material" />
          </mesh>
          {/* Outer Thin Halo */}
          <mesh rotation={[Math.PI / 3.5, -0.6, 0]}>
            <torusGeometry args={[1.25, 0.006, 32, 200]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
          </mesh>
        </group>

        <Stars radius={10} depth={60} count={600} factor={6} fade speed={1.5} />
      </Float>

      {/* Cinematic Lighting */}
      <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={12} color={accentColor} />
      <pointLight position={[0, 0, 0]} intensity={15} color={accentColor} distance={3} />
      <pointLight position={[-4, 2, 4]} intensity={6} color="#ffffff" />
      <pointLight position={[0, -5, 0]} intensity={8} color={accentColor} />
      <Environment preset="night" />
    </group>
  );
}
