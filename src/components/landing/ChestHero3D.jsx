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

  const accentColor = orb?.accent ?? '#0e7490';

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
    color: '#ffffff', metalness: 1, roughness: 0.1,
    emissive: accentColor, emissiveIntensity: 1.5, clearcoat: 1.0,
  }), [accentColor]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // ── HIGH-INTENSITY NEURAL LEAN ──
    if (groupRef.current) {
      const targetX = mousePos.x * 1.2;
      const targetY = mousePos.y * 0.8;
      // Weightier, slow-fluid lerp
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.04);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.04);
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mousePos.x * 0.6, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mousePos.y * 0.6, 0.04);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y += 0.03;
      coreRef.current.rotation.z += 0.02;
      const dist = Math.sqrt(mousePos.x**2 + mousePos.y**2);
      // Softened core pulse
      const intensity = Math.max(8, 20 - dist * 10);
      coreRef.current.material.emissiveIntensity = intensity + Math.sin(t * 2) * 2;
    }
    
    if (sparklesRef.current) {
        sparklesRef.current.rotation.y -= 0.01;
        sparklesRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.02);
    }

    if (mantleRef.current) {
      mantleRef.current.rotation.y -= 0.008;
      mantleRef.current.scale.setScalar(0.97 + Math.sin(t * 1.5) * 0.02);
    }
    if (shellRef.current) shellRef.current.rotation.y += 0.003;
    
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x += 0.005 * (i + 1);
        ring.rotation.y += 0.008 * (i + 2);
      });
    }
  });

  return (
    <group ref={groupRef} scale={1.3}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>

        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.22, 15]} />
          <MeshDistortMaterial
            color={accentColor} 
            speed={6} 
            distort={0.4} 
            radius={1}
            emissive={accentColor} 
            emissiveIntensity={12}
            toneMapped={false}
          />
        </mesh>

        <group ref={sparklesRef}>
            {sparkles.map((s, i) => (
                <mesh key={i} position={s.position}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshBasicMaterial color={accentColor} transparent opacity={0.6} />
                </mesh>
            ))}
        </group>

        <mesh>
          <sphereGeometry args={[0.42, 32, 32]} />
          <MeshWobbleMaterial 
            color={accentColor} 
            factor={0.3} 
            speed={2} 
            transparent 
            opacity={0.06} 
            wireframe 
          />
        </mesh>

        <mesh ref={mantleRef}>
          <sphereGeometry args={[0.55, 64, 64]} />
          <MeshWobbleMaterial 
            factor={0.8} 
            speed={1.5}
            color={accentColor} 
            wireframe 
            opacity={0.04} 
            transparent 
          />
        </mesh>

        {/* Premium Fluid Shell - Sophisticated Refraction */}
        <mesh ref={shellRef}>
          <sphereGeometry args={[0.68, 64, 64]} />
          <MeshTransmissionMaterial
            backside 
            samples={12} 
            thickness={2.2}
            chromaticAberration={0.4} 
            anisotropicBlur={1.0}
            distortion={0.3} 
            distortionScale={0.8}
            temporalDistortion={0.03} 
            ior={1.2}
            color={accentColor} 
            attenuationDistance={2.5}
            attenuationColor={accentColor} 
            roughness={0.05} 
            transmission={1.0}
            envMapIntensity={3}
          />
        </mesh>

        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.92, 0.006, 32, 120]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={15} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
            <torusGeometry args={[1.12, 0.01, 32, 160]} />
            <primitive object={matRing} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI / 3.5, -0.6, 0]}>
            <torusGeometry args={[1.32, 0.003, 32, 200]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </mesh>
        </group>

        <Stars radius={10} depth={60} count={800} factor={4} fade speed={1.2} />
      </Float>

      <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} intensity={10} color={accentColor} />
      <pointLight position={[0, 0, 0]} intensity={12} color={accentColor} distance={5} />
      <pointLight position={[-4, 2, 4]} intensity={5} color="#ffffff" />
      <pointLight position={[0, -5, 0]} intensity={6} color={accentColor} />
      <Environment preset="night" />
    </group>
  );
}
