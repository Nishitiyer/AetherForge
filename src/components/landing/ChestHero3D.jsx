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
      <Float speed={3} rotationIntensity={0.7} floatIntensity={0.7}>

        {/* Inner Plasma Core (Distorted) */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.28, 4]} />
          <MeshDistortMaterial
            color={accentColor} speed={4} distort={0.5} radius={1}
            emissive={accentColor} emissiveIntensity={3}
          />
        </mesh>

        {/* Neural Mantle (Wobble) */}
        <mesh ref={mantleRef}>
          <sphereGeometry args={[0.44, 48, 48]} />
          <MeshWobbleMaterial factor={0.5} speed={2}
            color={accentColor} wireframe opacity={0.12} transparent />
        </mesh>

        {/* Outer Glass Shell */}
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.62, 64, 64]} />
          <MeshTransmissionMaterial
            backside samples={8} thickness={0.35}
            chromaticAberration={0.12} anisotropicBlur={0.8}
            distortion={0.7} distortionScale={0.5}
            temporalDistortion={0.15} ior={1.4}
            color={accentColor} attenuationDistance={1}
            attenuationColor={accentColor} roughness={0} transmission={1}
          />
        </mesh>

        {/* Orbiting Rings */}
        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.82, 0.008, 16, 100]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={5} />
          </mesh>
          <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
            <torusGeometry args={[1.0, 0.012, 24, 120]} />
            <primitive object={matRing} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 4, -0.4, 0]}>
            <torusGeometry args={[1.15, 0.004, 16, 120]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </mesh>
        </group>

        <Stars radius={5} depth={50} count={400} factor={4} fade speed={1} />
      </Float>

      <spotLight position={[8, 8, 8]}   angle={0.15} penumbra={1} intensity={8}  color={accentColor} />
      <pointLight position={[-2, 1, 2]} intensity={4} color="#ffffff" />
      <pointLight position={[0, -2, 0]} intensity={3} color={accentColor} />
      <Environment preset="city" />
    </group>
  );
}
