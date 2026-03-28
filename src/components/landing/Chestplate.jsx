import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ArmorPlate = ({ position, rotation, color = "#1a1a1e", args = [1, 2, 0.1] }) => (
  <Box position={position} rotation={rotation} args={args}>
    <meshStandardMaterial 
      color={color} 
      metalness={1} 
      roughness={0.2} 
      envMapIntensity={2} 
    />
  </Box>
);

const MechanicalJoint = ({ position, rotation }) => (
  <Cylinder position={position} rotation={rotation} args={[0.05, 0.05, 0.5, 8]}>
    <meshStandardMaterial color="#334155" metalness={1} />
  </Cylinder>
);

const Chestplate = ({ isOpen, children }) => {
  const groupRef = useRef();
  
  // Refs for animated plates
  const lPlate1 = useRef();
  const rPlate1 = useRef();
  const tPlate = useRef();
  const bPlate = useRef();

  useFrame((state, delta) => {
    const t = isOpen ? 1 : 0;
    const lerpSpeed = 6;

    if (lPlate1.current) {
      lPlate1.current.position.x = THREE.MathUtils.lerp(lPlate1.current.position.x, -1.8 - t * 1.5, delta * lerpSpeed);
      lPlate1.current.rotation.y = THREE.MathUtils.lerp(lPlate1.current.rotation.y, t * 0.5, delta * lerpSpeed);
    }
    if (rPlate1.current) {
      rPlate1.current.position.x = THREE.MathUtils.lerp(rPlate1.current.position.x, 1.8 + t * 1.5, delta * lerpSpeed);
      rPlate1.current.rotation.y = THREE.MathUtils.lerp(rPlate1.current.rotation.y, -t * 0.5, delta * lerpSpeed);
    }
    if (tPlate.current) {
      tPlate.current.position.y = THREE.MathUtils.lerp(tPlate.current.position.y, 2.5 + t * 1, delta * lerpSpeed);
    }
    if (bPlate.current) {
      bPlate.current.position.y = THREE.MathUtils.lerp(bPlate.current.position.y, -2.5 - t * 1, delta * lerpSpeed);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. CENTRAL ARC REACTOR HOUSING (Fixed) */}
      <group>
        <Torus args={[1.8, 0.15, 16, 120]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#222" metalness={1} roughness={0.1} />
        </Torus>
        <Torus args={[2.0, 0.05, 12, 120]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#444" emissive="#00d4ff" emissiveIntensity={0.5} />
        </Torus>
        
        {/* Internal Glow for Reactor Base */}
        <Sphere args={[1.7, 32, 16]} position={[0, 0, -0.5]}>
          <meshBasicMaterial color="#001122" transparent opacity={0.8} />
        </Sphere>
      </group>

      {/* 2. MECHANICAL ARMOR PLATES (Animated) */}
      
      {/* Left Assembly */}
      <group ref={lPlate1} position={[-1.8, 0, 0.2]}>
        <ArmorPlate position={[0, 0, 0]} args={[1.2, 3.5, 0.2]} color="#111" />
        <ArmorPlate position={[-0.2, 0, 0.1]} args={[0.8, 2.5, 0.1]} color="#222" />
        <MechanicalJoint position={[0.6, 1.5, 0]} rotation={[0, 0, Math.PI/2]} />
        <MechanicalJoint position={[0.6, -1.5, 0]} rotation={[0, 0, Math.PI/2]} />
      </group>

      {/* Right Assembly */}
      <group ref={rPlate1} position={[1.8, 0, 0.2]}>
        <ArmorPlate position={[0, 0, 0]} args={[1.2, 3.5, 0.2]} color="#111" />
        <ArmorPlate position={[0.2, 0, 0.1]} args={[0.8, 2.5, 0.1]} color="#222" />
        <MechanicalJoint position={[-0.6, 1.5, 0]} rotation={[0, 0, Math.PI/2]} />
        <MechanicalJoint position={[-0.6, -1.5, 0]} rotation={[0, 0, Math.PI/2]} />
      </group>

      {/* Top and Bottom Guards */}
      <group ref={tPlate} position={[0, 2.5, 0.2]}>
        <ArmorPlate args={[2.5, 0.8, 0.2]} color="#0a0a0d" />
      </group>
      <group ref={bPlate} position={[0, -2.5, 0.2]}>
        <ArmorPlate args={[2.5, 0.8, 0.2]} color="#0a0a0d" />
      </group>

      {/* 3. THE VOICE ORB (Injected as Child) */}
      <group position={[0, 0, 0.5]} scale={1.2}>
        {children}
      </group>

      {/* Atmosphere Lights Focused on Reactor */}
      <pointLight position={[0, 0, 2]} intensity={2} color="#00d4ff" distance={5} />
      <spotLight position={[10, 10, 10]} intensity={1.5} angle={0.2} penumbra={1} castShadow />
    </group>
  );
};

export default Chestplate;
