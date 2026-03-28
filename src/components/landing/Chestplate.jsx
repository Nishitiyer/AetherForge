import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Sphere, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const MK50_RED = "#990000";
const MK50_GOLD = "#ffd700";
const MK50_SILVER = "#e5e7eb";
const DARK_METAL = "#1a1a1e";

const ScupltedPlate = ({ position, rotation, scale, color = MK50_RED, segments = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main Plate Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          metalness={1} 
          roughness={0.15} 
          envMapIntensity={2} 
        />
      </mesh>
      {/* Metallic Trim/Edge */}
      <mesh position={[0, 0, 0.06]} scale={[1.05, 1.05, 0.1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={MK50_SILVER} metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
};

const Chestplate = ({ isOpen, children }) => {
  const groupRef = useRef();
  const platesRef = useRef([]);

  // mk50 inspired v-shape layout
  const armorLayout = useMemo(() => [
    // Top Collar Bones (Red)
    { pos: [-1.5, 3.2, 0], rot: [0.1, 0, 0.3], scale: [2, 0.6, 0.2], color: MK50_RED },
    { pos: [1.5, 3.2, 0], rot: [0.1, 0, -0.3], scale: [2, 0.6, 0.2], color: MK50_RED },
    
    // Main Chest V-Plates (Large Red)
    { pos: [-1.2, 1.8, 0.4], rot: [0.2, 0.1, 0.5], scale: [1.8, 2.5, 0.3], color: MK50_RED },
    { pos: [1.2, 1.8, 0.4], rot: [0.2, -0.1, -0.5], scale: [1.8, 2.5, 0.3], color: MK50_RED },
    
    // Inward Gold Accents
    { pos: [-0.9, 1.5, 0.5], rot: [0.3, 0.2, 0.6], scale: [0.6, 2, 0.1], color: MK50_GOLD },
    { pos: [0.9, 1.5, 0.5], rot: [0.3, -0.2, -0.6], scale: [0.6, 2, 0.1], color: MK50_GOLD },
    
    // Side Latals (Silver/Red)
    { pos: [-2.5, 0, 0.2], rot: [0, 0.3, 0.1], scale: [1, 3.5, 0.2], color: MK50_RED },
    { pos: [2.5, 0, 0.2], rot: [0, -0.3, -0.1], scale: [1, 3.5, 0.2], color: MK50_RED },
    
    // Lower Ab-Plates (V-Shaped)
    { pos: [-1.0, -2.0, 0.4], rot: [-0.2, 0, -0.4], scale: [1.5, 1.2, 0.2], color: MK50_RED },
    { pos: [1.0, -2.0, 0.4], rot: [-0.2, 0, 0.4], scale: [1.5, 1.2, 0.2], color: MK50_RED },
  ], []);

  useFrame((state, delta) => {
    const t = isOpen ? 1 : 0;
    const lerpSpeed = 7;
    
    platesRef.current.forEach((plate, i) => {
      if (!plate) return;
      const layout = armorLayout[i];
      const dir = layout.pos[0] > 0 ? 1 : -1;
      
      const targetX = layout.pos[0] + (t * 2.5 * dir);
      const targetY = layout.pos[1] + (t * 1.5);
      const targetRotY = layout.rot[1] + (t * 0.8 * dir);
      
      plate.position.x = THREE.MathUtils.lerp(plate.position.x, targetX, delta * lerpSpeed);
      plate.position.y = THREE.MathUtils.lerp(plate.position.y, targetY, delta * lerpSpeed);
      plate.rotation.y = THREE.MathUtils.lerp(plate.rotation.y, targetRotY, delta * lerpSpeed);
    });
  });

  return (
    <group ref={groupRef}>
      {/* 1. ARC REACTOR COMPARTMENT */}
      <group>
        {/* Outer Circular Rim */}
        <Torus args={[2.0, 0.15, 16, 60]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={MK50_SILVER} metalness={1} roughness={0.05} />
        </Torus>
        
        {/* Inner Light Chamber */}
        <Sphere args={[1.9, 32, 16]} scale={[1, 1, 0.1]} position={[0, 0, -0.2]}>
          <meshBasicMaterial color="#001122" />
        </Sphere>
        
        {/* Triangular Core Housing (MK50 Style) */}
        <Torus args={[1.2, 0.08, 3, 3]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color={MK50_GOLD} emissive="#00d4ff" emissiveIntensity={3} />
        </Torus>
      </group>

      {/* 2. ARMORED ASSEMBLY */}
      <group>
        {armorLayout.map((layout, i) => (
          <group key={i} ref={el => platesRef.current[i] = el} position={layout.pos} rotation={layout.rot}>
            <ScupltedPlate scale={layout.scale} color={layout.color} />
          </group>
        ))}
      </group>

      {/* 3. CORE VOICE ORB (Arc Reactor) */}
      <group position={[0, 0, 0.5]} scale={1.2}>
        {children}
      </group>

      {/* Lighting for Realism */}
      <pointLight position={[2, 2, 5]} intensity={10} color="#fff" />
      <pointLight position={[-2, -2, 5]} intensity={5} color={MK50_RED} />
      <spotLight position={[0, 10, 0]} intensity={2} angle={0.5} penumbra={1} castShadow />
    </group>
  );
};

export default Chestplate;
