import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Float } from '@react-three/drei';
import * as THREE from 'three';

const Chestplate = ({ isOpen, children }) => {
  const groupRef = useRef();
  const leftPanelRef = useRef();
  const rightPanelRef = useRef();
  const topPanelRef = useRef();

  useFrame((state, delta) => {
    const targetX = isOpen ? 2 : 0;
    const targetY = isOpen ? 1.5 : 0;
    
    if (leftPanelRef.current) {
      leftPanelRef.current.position.x = THREE.MathUtils.lerp(leftPanelRef.current.position.x, -targetX, delta * 5);
      leftPanelRef.current.rotation.z = THREE.MathUtils.lerp(leftPanelRef.current.rotation.z, isOpen ? 0.2 : 0, delta * 5);
    }
    if (rightPanelRef.current) {
      rightPanelRef.current.position.x = THREE.MathUtils.lerp(rightPanelRef.current.position.x, targetX, delta * 5);
      rightPanelRef.current.rotation.z = THREE.MathUtils.lerp(rightPanelRef.current.rotation.z, isOpen ? -0.2 : 0, delta * 5);
    }
    if (topPanelRef.current) {
      topPanelRef.current.position.y = THREE.MathUtils.lerp(topPanelRef.current.position.y, targetY, delta * 5);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Core Chassis */}
      <Torus args={[2.5, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#1a1a1e" metalness={1} roughness={0.2} />
      </Torus>
      
      {/* Inner Rotating Ring */}
      <Float speed={5} rotationIntensity={2}>
        <Torus args={[2.2, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#334155" emissive="#0ea5e9" emissiveIntensity={0.5} />
        </Torus>
      </Float>

      {/* Mechanical Panels */}
      <group ref={leftPanelRef}>
        <Box args={[1.5, 4, 0.2]} position={[-1.2, 0, 0.5]}>
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </Box>
        <Cylinder args={[0.1, 0.1, 4]} position={[-0.4, 0, 0.6]}>
          <meshStandardMaterial color="#334155" metalness={1} />
        </Cylinder>
      </group>

      <group ref={rightPanelRef}>
        <Box args={[1.5, 4, 0.2]} position={[1.2, 0, 0.5]}>
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </Box>
        <Cylinder args={[0.1, 0.1, 4]} position={[0.4, 0, 0.6]}>
          <meshStandardMaterial color="#334155" metalness={1} />
        </Cylinder>
      </group>

      <group ref={topPanelRef}>
        <Box args={[3, 1, 0.2]} position={[0, 2, 0.5]}>
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </Box>
      </group>

      {/* The Selected Orb */}
      <group position={[0, 0, 0]}>
        {children}
      </group>

      {/* Lighting for the chestplate */}
      <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-3, -3, 2]} intensity={0.5} color="#0ea5e9" />
    </group>
  );
};

export default Chestplate;
