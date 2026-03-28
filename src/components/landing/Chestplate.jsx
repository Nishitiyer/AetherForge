import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

const MK50_RED = "#8b0000";
const MK50_GOLD = "#d4af37";
const MK50_SILVER = "#a1a1a1";

const ArmorSegment = ({ position, rotation, scale, color = MK50_RED, opacity = 1 }) => (
  <mesh position={position} rotation={rotation} scale={scale}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial 
      color={color} 
      metalness={1} 
      roughness={0.2} 
      transparent={opacity < 1}
      opacity={opacity}
    />
  </mesh>
);

const Chestplate = ({ isOpen, children }) => {
  const groupRef = useRef();
  
  // Animation state refs
  const platesRef = useRef([]);

  const armorLayout = useMemo(() => [
    // Center V-Plates (Main Red)
    { pos: [-0.8, 1.2, 0.2], rot: [0, 0, 0.4], scale: [1.2, 2.5, 0.15], color: MK50_RED },
    { pos: [0.8, 1.2, 0.2], rot: [0, 0, -0.4], scale: [1.2, 2.5, 0.15], color: MK50_RED },
    
    // Side Wing Plates (Gold Accents)
    { pos: [-1.8, 0.5, 0.1], rot: [0, 0, 0.2], scale: [1, 3, 0.1], color: MK50_GOLD },
    { pos: [1.8, 0.5, 0.1], rot: [0, 0, -0.2], scale: [1, 3, 0.1], color: MK50_GOLD },
    
    // Lower Core Guards (Silver/Dark)
    { pos: [-0.6, -1.5, 0.2], rot: [0, 0, -0.3], scale: [1, 1.5, 0.1], color: MK50_SILVER },
    { pos: [0.6, -1.5, 0.2], rot: [0, 0, 0.3], scale: [1, 1.5, 0.1], color: MK50_SILVER },
    
    // Shoulder Brackets
    { pos: [-2.2, 2.5, 0], rot: [0.2, 0, 0], scale: [1.5, 0.8, 0.1], color: MK50_RED },
    { pos: [2.2, 2.5, 0], rot: [0.2, 0, 0], scale: [1.5, 0.8, 0.1], color: MK50_RED },
  ], []);

  useFrame((state, delta) => {
    const t = isOpen ? 1 : 0;
    const lerpSpeed = 5;
    
    platesRef.current.forEach((plate, i) => {
      if (!plate) return;
      
      const multiplier = (i % 2 === 0 ? -1 : 1);
      const targetX = armorLayout[i].pos[0] + (t * 2 * multiplier);
      const targetY = armorLayout[i].pos[1] + (t * 1.5);
      const targetRotZ = armorLayout[i].rot[2] + (t * 1 * multiplier);
      
      plate.position.x = THREE.MathUtils.lerp(plate.position.x, targetX, delta * lerpSpeed);
      plate.position.y = THREE.MathUtils.lerp(plate.position.y, targetY, delta * lerpSpeed);
      plate.rotation.z = THREE.MathUtils.lerp(plate.rotation.z, targetRotZ, delta * lerpSpeed);
    });
  });

  return (
    <group ref={groupRef}>
      {/* 1. ARC REACTOR HOUSING (MK50 Style) */}
      <group position={[0, 0, 0]}>
        {/* Outer Circular Frame */}
        <Torus args={[1.6, 0.1, 16, 120]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color={MK50_SILVER} metalness={1} roughness={0.1} />
        </Torus>
        
        {/* Transparent Glass Cover */}
        <Sphere args={[1.5, 32, 16]} scale={[1, 1, 0.1]} position={[0, 0, 0.2]}>
          <meshPhysicalMaterial 
            color="#00d4ff" 
            transparent 
            opacity={0.1} 
            transmission={1} 
            thickness={0.5} 
            roughness={0} 
          />
        </Sphere>

        {/* Inner Triangular Housing */}
        <Torus args={[1.0, 0.05, 3, 3]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={MK50_GOLD} emissive="#00d4ff" emissiveIntensity={2} />
        </Torus>
      </group>

      {/* 2. ARMORED PLATES */}
      {armorLayout.map((layout, i) => (
        <group key={i} ref={el => platesRef.current[i] = el} position={layout.pos} rotation={layout.rot}>
          <ArmorSegment scale={layout.scale} color={layout.color} />
        </group>
      ))}

      {/* 3. CORE VOICE ORB INTEGRATION */}
      <group position={[0, 0, 0.4]} scale={1.1}>
        {children}
      </group>

      {/* Accent Lights */}
      <pointLight position={[0, 0, 2]} intensity={5} color="#00d4ff" distance={4} />
      <spotLight position={[5, 10, 5]} intensity={1} angle={0.2} penumbra={1} castShadow />
    </group>
  );
};

export default Chestplate;
