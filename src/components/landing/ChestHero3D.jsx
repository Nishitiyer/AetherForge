import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, MeshTransmissionMaterial, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion-3d';

export function ChestHero3D({ orb, isOpen }) {
  const group = useRef();
  
  // Premium Materials
  const armorRed = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#8c1515', metalness: 0.9, roughness: 0.1, 
    emissive: '#400000', emissiveIntensity: 0.1 
  }), []);
  
  const armorGold = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#d4a830', metalness: 1, roughness: 0.05,
    emissive: '#2a1a00', emissiveIntensity: 0.05
  }), []);

  const carbonFiber = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#111', metalness: 0.8, roughness: 0.6 
  }), []);

  const internalGunmetal = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#1a1a1a', metalness: 0.8, roughness: 0.4 
  }), []);

  const reactorGlow = useMemo(() => new THREE.MeshStandardMaterial({
    color: orb.accent, emissive: orb.accent, emissiveIntensity: 4, transparent: true, opacity: 0.9
  }), [orb.accent]);

  return (
    <group ref={group} scale={1.2} position={[0, -0.6, 0]}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
        
        {/* COLLAR STRUCTURE */}
        <mesh position={[0, 1.45, -0.3]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[1.8, 0.4, 0.5]} />
          <primitive object={internalGunmetal} attach="material" />
        </mesh>

        {/* LEFT ARMOR ASSEMBLY */}
        <motion.group 
          initial={false}
          animate={{ 
            x: isOpen ? -0.7 : 0, 
            z: isOpen ? 0.2 : 0,
            rotateY: isOpen ? -0.2 : 0 
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main Plate */}
          <RoundedBox args={[1.2, 1.8, 0.3]} radius={0.15} softness={0.05} position={[-0.65, 0.5, 0]}>
            <primitive object={armorGold} attach="material" />
          </RoundedBox>
          {/* Detail Layer */}
          <RoundedBox args={[0.3, 1.4, 0.1]} radius={0.05} softness={0.02} position={[-1.1, 0.5, 0.15]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
          <RoundedBox args={[0.8, 0.2, 0.05]} radius={0.02} softness={0.01} position={[-0.6, 1.2, 0.18]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
        </motion.group>

        {/* RIGHT ARMOR ASSEMBLY */}
        <motion.group 
          initial={false}
          animate={{ 
            x: isOpen ? 0.7 : 0, 
            z: isOpen ? 0.2 : 0,
            rotateY: isOpen ? 0.2 : 0 
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Main Plate */}
          <RoundedBox args={[1.2, 1.8, 0.3]} radius={0.15} softness={0.05} position={[0.65, 0.5, 0]}>
            <primitive object={armorGold} attach="material" />
          </RoundedBox>
          {/* Detail Layer */}
          <RoundedBox args={[0.3, 1.4, 0.1]} radius={0.05} softness={0.02} position={[1.1, 0.5, 0.15]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
          <RoundedBox args={[0.8, 0.2, 0.05]} radius={0.02} softness={0.01} position={[0.6, 1.2, 0.18]}>
            <primitive object={armorRed} attach="material" />
          </RoundedBox>
        </motion.group>

        {/* FIXED STERNUM RIDGE (Stays in center) */}
        <mesh position={[0, 0.5, -0.1]}>
          <boxGeometry args={[0.1, 2.0, 0.4]} />
          <primitive object={internalGunmetal} attach="material" />
        </mesh>

        {/* REACTOR CORE ASSEMBLY */}
        <group position={[0, 0.5, -0.4]}>
          {/* Internal Chamber */}
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.6, 48]} />
            <primitive object={internalGunmetal} attach="material" />
          </mesh>

          {/* Glowing Orb */}
          <mesh position={[0, 0, 0.4]}>
            <sphereGeometry args={[0.32, 64, 64]} />
            <primitive object={reactorGlow} attach="material" />
          </mesh>

          {/* Glass Cover */}
          <mesh position={[0, 0, 0.45]}>
             <sphereGeometry args={[0.35, 64, 64]} />
             <MeshTransmissionMaterial 
               backside 
               samples={16} 
               thickness={0.05} 
               anisotropicBlur={0.1} 
               iridescence={0.8} 
               iridescenceIOR={1} 
               iridescenceThicknessRange={[0, 1400]} 
             />
          </mesh>

          {/* Decorative Bezel */}
          <mesh position={[0, 0, 0.3]} rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.55, 0.06, 32, 100]} />
            <primitive object={armorGold} attach="material" />
          </mesh>
        </group>

        {/* LOWER TORSO PLATE */}
        <RoundedBox args={[1.5, 0.8, 0.3]} radius={0.1} softness={0.05} position={[0, -0.7, -0.1]}>
          <primitive object={armorGold} attach="material" />
        </RoundedBox>

      </Float>

      {/* Cinematic Lighting */}
      <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color={orb.accent} />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ffffff" />
      <directionalLight position={[0, 5, 5]} intensity={0.5} />
      <Environment preset="night" />
      <ContactShadows opacity={0.5} scale={10} blur={2} far={4} />
    </group>
  );
}
