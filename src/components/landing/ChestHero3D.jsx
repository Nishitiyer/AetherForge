import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export function ChestHero3D({ orb, isOpen }) {
  const group = useRef();
  const leftArmor = useRef();
  const rightArmor = useRef();
  const [animationProgress, setAnimationProgress] = useState(0);

  // Premium Materials
  const armorRed = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#911d1d', metalness: 0.95, roughness: 0.1, 
    emissive: '#400000', emissiveIntensity: 0.1 
  }), []);
  
  const armorGold = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#d4af37', metalness: 1, roughness: 0.05,
    emissive: '#2a1a00', emissiveIntensity: 0.05
  }), []);

  const internalFrame = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#1a1a1a', metalness: 0.8, roughness: 0.4 
  }), []);

  const reactorGlow = useMemo(() => new THREE.MeshStandardMaterial({
    color: orb.accent, emissive: orb.accent, emissiveIntensity: 5, transparent: true, opacity: 0.95
  }), [orb.accent]);

  useFrame((state, delta) => {
    const target = isOpen ? 1 : 0;
    const speed = 4.0;
    const nextProgress = THREE.MathUtils.lerp(animationProgress, target, delta * speed);
    setAnimationProgress(nextProgress);

    if (leftArmor.current) {
      leftArmor.current.position.x = -0.65 - (nextProgress * 0.75);
      leftArmor.current.position.z = nextProgress * 0.25;
      leftArmor.current.rotation.y = -nextProgress * 0.15;
    }
    if (rightArmor.current) {
      rightArmor.current.position.x = 0.65 + (nextProgress * 0.75);
      rightArmor.current.position.z = nextProgress * 0.25;
      rightArmor.current.rotation.y = nextProgress * 0.15;
    }
  });

  return (
    <group ref={group} scale={1.1} position={[0, -0.6, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        
        {/* UPPER COLLAR / TRAPEZIUS FRAME */}
        <mesh position={[0, 1.4, -0.4]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[2.0, 0.4, 0.6]} />
          <primitive object={internalFrame} attach="material" />
        </mesh>
        <mesh position={[0, 1.6, -0.5]}>
          <boxGeometry args={[1.2, 0.2, 0.4]} />
          <primitive object={armorGold} attach="material" />
        </mesh>

        {/* LEFT PECTORAL ASSEMBLY */}
        <group ref={leftArmor} position={[-0.65, 0.5, 0]}>
          {/* Main Anatomical Plate */}
          <RoundedBox args={[1.3, 1.9, 0.3]} radius={0.12} softness={0.05}>
            <primitive object={armorGold} attach="material" />
          </RoundedBox>
          {/* Upper Pectoral Detail */}
          <RoundedBox args={[1.0, 0.8, 0.1]} radius={0.05} position={[-0.1, 0.4, 0.18]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
          {/* Lower Detail Layer */}
          <RoundedBox args={[0.4, 1.2, 0.15]} radius={0.08} position={[-0.4, -0.2, 0.15]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
          {/* Mechanical Internal Seal */}
          <mesh position={[0.6, 0, -0.1]}>
             <boxGeometry args={[0.1, 1.6, 0.2]} />
             <primitive object={internalFrame} attach="material" />
          </mesh>
        </group>

        {/* RIGHT PECTORAL ASSEMBLY */}
        <group ref={rightArmor} position={[0.65, 0.5, 0]}>
          {/* Main Anatomical Plate */}
          <RoundedBox args={[1.3, 1.9, 0.3]} radius={0.12} softness={0.05}>
            <primitive object={armorGold} attach="material" />
          </RoundedBox>
          {/* Upper Pectoral Detail */}
          <RoundedBox args={[1.0, 0.8, 0.1]} radius={0.05} position={[0.1, 0.4, 0.18]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
          {/* Lower Detail Layer */}
          <RoundedBox args={[0.4, 1.2, 0.15]} radius={0.08} position={[0.4, -0.2, 0.15]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
          {/* Mechanical Internal Seal */}
          <mesh position={[-0.6, 0, -0.1]}>
             <boxGeometry args={[0.1, 1.6, 0.2]} />
             <primitive object={internalFrame} attach="material" />
          </mesh>
        </group>

        {/* FIXED STERNUM CENTERLINE (Stays centered behind the split) */}
        <mesh position={[0, 0.5, -0.2]}>
          <boxGeometry args={[0.15, 2.0, 0.3]} />
          <primitive object={internalFrame} attach="material" />
        </mesh>

        {/* REACTOR CORE (ARC REACTOR CORE) */}
        <group position={[0, 0.5, -0.3]}>
          {/* Housing Bezel */}
          <mesh rotation={[Math.PI/2, 0, 0]}>
             <torusGeometry args={[0.6, 0.08, 32, 100]} />
             <primitive object={armorGold} attach="material" />
          </mesh>
          <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.1]}>
             <cylinderGeometry args={[0.6, 0.6, 0.2, 48]} />
             <primitive object={internalFrame} attach="material" />
          </mesh>

          {/* AI VOICE ORB (Core) */}
          <mesh position={[0, 0, 0.35]}>
             <sphereGeometry args={[0.3, 64, 64]} />
             <primitive object={reactorGlow} attach="material" />
          </mesh>
          
          {/* Protective Glass Cover */}
          <mesh position={[0, 0, 0.4]}>
             <sphereGeometry args={[0.34, 64, 64]} />
             <MeshTransmissionMaterial 
               backside samples={16} thickness={0.05} anisotropicBlur={0.1}
               distortion={0.5} distortionScale={0.5} temporalDistortion={0.1}
             />
          </mesh>

          {/* Structural Detail Inside Chamber */}
          <mesh position={[0, 0, -0.1]} rotation={[Math.PI/2, 0, 0]}>
             <torusGeometry args={[0.4, 0.02, 16, 64]} />
             <primitive object={armorGold} attach="material" />
          </mesh>
        </group>

        {/* LOWER ABDOMINAL / TORSO PLATE */}
        <RoundedBox args={[1.8, 0.6, 0.4]} radius={0.1} position={[0, -0.8, -0.2]}>
          <primitive object={armorGold} attach="material" />
        </RoundedBox>

      </Float>

      {/* Cinematic Lighting */}
      <spotLight position={[5, 10, 10]} angle={0.25} penumbra={1} intensity={1} color={orb.accent} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ffffff" />
      <Environment preset="studio" />
      <ContactShadows opacity={0.6} scale={10} blur={2.4} far={4} />
    </group>
  );
}
