import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

const MK50_RED = "#990000";
const MK50_GOLD = "#ffd700";
const MK50_SILVER = "#e5e7eb";

// Helper for curved armor plates
const CurvedPlate = ({ radius, height, theta, color, metalness = 1, roughness = 0.2, position = [0, 0, 0], rotation = [0, 0, 0] }) => (
  <mesh position={position} rotation={rotation}>
    <cylinderGeometry args={[radius, radius, height, 32, 1, true, 0, theta]} />
    <meshPhysicalMaterial 
      color={color} 
      metalness={metalness} 
      roughness={roughness} 
      clearcoat={1}
      clearcoatRoughness={0.1}
      side={THREE.DoubleSide}
    />
  </mesh>
);

const Chestplate = ({ isOpen, children }) => {
  const groupRef = useRef();
  
  // Refs for animation
  const lPlateRef = useRef();
  const rPlateRef = useRef();
  const topCollarRef = useRef();
  const coreHousingRef = useRef();

  useFrame((state, delta) => {
    const t = isOpen ? 1 : 0;
    const lerpSpeed = 6;
    
    if (lPlateRef.current) {
      lPlateRef.current.position.x = THREE.MathUtils.lerp(lPlateRef.current.position.x, -1.5 - (t * 2), delta * lerpSpeed);
      lPlateRef.current.rotation.y = THREE.MathUtils.lerp(lPlateRef.current.rotation.y, 0.4 - (t * 0.4), delta * lerpSpeed);
    }
    if (rPlateRef.current) {
      rPlateRef.current.position.x = THREE.MathUtils.lerp(rPlateRef.current.position.x, 1.5 + (t * 2), delta * lerpSpeed);
      rPlateRef.current.rotation.y = THREE.MathUtils.lerp(rPlateRef.current.rotation.y, -0.4 + (t * 0.4), delta * lerpSpeed);
    }
    if (topCollarRef.current) {
      topCollarRef.current.position.y = THREE.MathUtils.lerp(topCollarRef.current.position.y, 2.5 + (t * 1.5), delta * lerpSpeed);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. CENTRAL ARC REACTOR SYSTEM (Fixed Position) */}
      <group ref={coreHousingRef}>
        {/* Main circular housing with structural depth */}
        <Torus args={[2.0, 0.12, 16, 100]} rotation={[0, 0, 0]}>
          <meshPhysicalMaterial color={MK50_SILVER} metalness={1} roughness={0.05} />
        </Torus>
        <Torus args={[2.2, 0.05, 12, 100]} position={[0, 0, -0.1]}>
          <meshStandardMaterial color="#444" emissive="#00d4ff" emissiveIntensity={0.5} />
        </Torus>
        
        {/* Honeycomb backing pattern (simulated with torus segments) */}
        <group rotation={[0, 0, Math.PI / 6]} position={[0, 0, -0.3]}>
           {[0, 1, 2].map(i => (
             <Torus key={i} args={[1.5, 0.02, 3, 3]} rotation={[0, 0, (i * Math.PI) / 1.5]}>
               <meshBasicMaterial color={MK50_GOLD} />
             </Torus>
           ))}
        </group>
      </group>

      {/* 2. DYNAMIC ARMOR PLATES (MK50 "V" Flow) */}
      
      {/* LEFT ASSEMBLY */}
      <group ref={lPlateRef} position={[-1.5, 0.5, 0.5]} rotation={[0, 0.4, 0]}>
        {/* Primary Red Chest Plate (Curved) */}
        <CurvedPlate radius={4} height={4} theta={Math.PI / 3} color={MK50_RED} position={[1.8, 0, -3.5]} rotation={[0, -Math.PI/2, 0]} />
        {/* Gold Accent Plate */}
        <Box args={[1, 3, 0.1]} position={[0, -0.5, 0.2]} rotation={[0, 0, 0.2]}>
          <meshPhysicalMaterial color={MK50_GOLD} metalness={1} roughness={0.1} />
        </Box>
        {/* Mechanical Detail */}
        <Cylinder args={[0.05, 0.05, 3.5]} position={[-0.4, 0, 0.1]} rotation={[0, 0, 0.1]}>
          <meshStandardMaterial color={MK50_SILVER} metalness={1} />
        </Cylinder>
      </group>

      {/* RIGHT ASSEMBLY */}
      <group ref={rPlateRef} position={[1.5, 0.5, 0.5]} rotation={[0, -0.4, 0]}>
        {/* Primary Red Chest Plate (Curved) */}
        <CurvedPlate radius={4} height={4} theta={Math.PI / 3} color={MK50_RED} position={[-1.8, 0, -3.5]} rotation={[0, Math.PI/2 + Math.PI/6, 0]} />
        {/* Gold Accent Plate */}
        <Box args={[1, 3, 0.1]} position={[0, -0.5, 0.2]} rotation={[0, 0, -0.2]}>
          <meshPhysicalMaterial color={MK50_GOLD} metalness={1} roughness={0.1} />
        </Box>
        {/* Mechanical Detail */}
        <Cylinder args={[0.05, 0.05, 3.5]} position={[0.4, 0, 0.1]} rotation={[0, 0, -0.1]}>
          <meshStandardMaterial color={MK50_SILVER} metalness={1} />
        </Cylinder>
      </group>

      {/* TOP COLLAR / TRAPS */}
      <group ref={topCollarRef} position={[0, 2.8, 0.2]}>
        <Box args={[3.5, 0.6, 0.2]} rotation={[0.2, 0, 0]}>
          <meshPhysicalMaterial color={MK50_RED} metalness={1} roughness={0.15} />
        </Box>
        <Box args={[1.5, 0.4, 0.1]} position={[0, 0.4, 0.1]} color={MK50_GOLD}>
          <meshPhysicalMaterial color={MK50_GOLD} metalness={1} />
        </Box>
      </group>

      {/* 3. ARC REACTOR CORE (Voice Orb) */}
      <group position={[0, 0, 0.6]} scale={1.2}>
        {children}
      </group>

      {/* Cinematic Lighting Atmosphere */}
      <spotLight position={[10, 10, 10]} intensity={1.5} angle={0.15} penumbra={1} castShadow />
      <pointLight position={[0, 0, 2]} intensity={2} color="#00d4ff" />
      <pointLight position={[5, -5, -2]} intensity={0.5} color={MK50_GOLD} />
    </group>
  );
};

export default Chestplate;
