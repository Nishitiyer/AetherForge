import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, Stars, MeshWobbleMaterial, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function ChestHero3D({ orb }) {
  const groupRef  = useRef();
  const coreRef   = useRef();
  const shellRef  = useRef();
  const ringsRef  = useRef();
  const mantleRef = useRef();
  const sparklesRef = useRef();

  // ── GLOBAL MOUSE TRACKING (STARK NEURAL LINK) ──
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

  const accentColor = orb?.accent ?? '#22d3ee';

  // Pre-calculate sparkle positions to stabilize the render tree
  const sparkles = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      position: [
        Math.cos(i * Math.PI / 3) * 0.35,
        Math.sin(i * Math.PI / 3) * 0.35,
        (Math.random() - 0.5) * 0.2
      ]
    }));
  }, []);

  const matRing = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', metalness: 1, roughness: 0.05,
    emissive: accentColor, emissiveIntensity: 2.5, clearcoat: 1.0,
  }), [accentColor]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // ── HIGH-INTENSITY NEURAL LEAN ──
    if (groupRef.current) {
      const targetX = mousePos.x * 1.2;
      const targetY = mousePos.y * 0.8;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.06);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.06);
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mousePos.x * 0.6, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mousePos.y * 0.6, 0.06);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += 0.05;
      coreRef.current.rotation.z += 0.03;
      const dist = Math.sqrt(mousePos.x**2 + mousePos.y**2);
      const intensity = Math.max(15, 35 - dist * 20);
      coreRef.current.material.emissiveIntensity = intensity + Math.sin(t * 4) * 5;
    }
    
    if (sparklesRef.current) {
        sparklesRef.current.rotation.y -= 0.02;
        sparklesRef.current.scale.setScalar(1 + Math.sin(t * 5) * 0.03);
    }

    if (mantleRef.current) {
      mantleRef.current.rotation.y -= 0.015;
      mantleRef.current.scale.setScalar(0.96 + Math.sin(t * 2) * 0.04);
    }
    if (shellRef.current) shellRef.current.rotation.y += 0.005;
    
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x += 0.009 * (i + 1);
        ring.rotation.y += 0.015 * (i + 2);
      });
    }
  });

  return (
    <group ref={groupRef} scale={1.3}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>

        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.22, 15]} />
          <MeshDistortMaterial
            color={accentColor} 
            speed={10} 
            distort={0.45} 
            radius={1}
            emissive={accentColor} 
            emissiveIntensity={25}
            toneMapped={false}
          />
        </mesh>

        <group ref={sparklesRef}>
            {sparkles.map((s, i) => (
                <mesh key={i} position={s.position}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial color={accentColor} />
                </mesh>
            ))}
        </group>

        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <MeshWobbleMaterial 
            color={accentColor} 
            factor={0.4} 
            speed={4} 
            transparent 
            opacity={0.08} 
            wireframe 
          />
        </mesh>

        <mesh ref={mantleRef}>
          <sphereGeometry args={[0.55, 64, 64]} />
          <MeshWobbleMaterial 
            factor={1.2} 
            speed={2}
            color={accentColor} 
            wireframe 
            opacity={0.05} 
            transparent 
          />
        </mesh>

        <mesh ref={shellRef}>
          <sphereGeometry args={[0.68, 64, 64]} />
          <MeshTransmissionMaterial
            backside 
            samples={16} 
            thickness={1.5}
            chromaticAberration={0.6} 
            anisotropicBlur={1.0}
            distortion={0.2} 
            distortionScale={0.4}
            temporalDistortion={0.05} 
            ior={1.3}
            color={accentColor} 
            attenuationDistance={2}
            attenuationColor={accentColor} 
            roughness={0.0} 
            transmission={1.0}
            envMapIntensity={4}
          />
        </mesh>

        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.92, 0.008, 32, 120]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={40} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
            <torusGeometry args={[1.12, 0.012, 32, 160]} />
            <primitive object={matRing} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 3.5, -0.6, 0]}>
            <torusGeometry args={[1.32, 0.004, 32, 200]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
          </mesh>
        </group>

        <Stars radius={10} depth={60} count={1200} factor={6} fade speed={2} />
      </Float>

      <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={15} color={accentColor} />
      <pointLight position={[0, 0, 0]} intensity={25} color={accentColor} distance={5} />
      <pointLight position={[-4, 2, 4]} intensity={8} color="#ffffff" />
      <pointLight position={[0, -5, 0]} intensity={10} color={accentColor} />
      <Environment preset="night" />
    </group>
  );
}
