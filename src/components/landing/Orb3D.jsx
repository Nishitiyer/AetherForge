import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Float, PointLight } from '@react-three/drei';
import * as THREE from 'three';

const Orb3D = ({ config, isListening }) => {
  const outerRingRef = useRef();
  const innerRingRef = useRef();
  const nucleusRef = useRef();
  const lightRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += delta * 1.5;
      outerRingRef.current.rotation.z += delta * 0.5;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x -= delta * 2;
      innerRingRef.current.rotation.y += delta * 1;
    }
    if (nucleusRef.current) {
      nucleusRef.current.scale.setScalar(
        1 + Math.sin(time * (isListening ? 10 : 2)) * 0.05
      );
    }
    if (lightRef.current) {
      lightRef.current.intensity = 15 + Math.sin(time * 3) * 5;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* 1. CORE NUCLEUS */}
        <Sphere ref={nucleusRef} args={[0.8, 64, 64]}>
          <meshStandardMaterial 
            color={config.color} 
            emissive={config.color} 
            emissiveIntensity={isListening ? 10 : 2} 
            metalness={1}
            roughness={0}
          />
        </Sphere>

        {/* 2. ATMOSPHERIC SHELL */}
        <Sphere args={[1.2, 32, 32]}>
           <meshPhysicalMaterial 
             color={config.color} 
             transparent 
             opacity={0.15} 
             roughness={0.1} 
             metalness={0.9} 
             clearcoat={1} 
             transmission={0.8} 
             thickness={1}
           />
        </Sphere>

        {/* 3. ROTATING TECHNICAL RINGS */}
        <group ref={outerRingRef}>
          <Torus args={[1.6, 0.03, 16, 100]}>
            <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={5} />
          </Torus>
          {/* Segmented Detail Bits */}
          {[0, 1, 2, 3].map(i => (
             <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
               <mesh position={[1.6, 0, 0]}>
                  <boxGeometry args={[0.1, 0.4, 0.1]} />
                  <meshStandardMaterial color="#fff" emissive="#fff" />
               </mesh>
             </group>
          ))}
        </group>

        <group ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <Torus args={[1.4, 0.02, 16, 100]}>
            <meshStandardMaterial color={config.color} emissive={config.color} />
          </Torus>
        </group>

        {/* 4. VOLUMETRIC GLOW */}
        <pointLight ref={lightRef} color={config.color} intensity={15} distance={10} decay={2} />
        
        {/* 5. MOUNTING INTERFACE (Internal) */}
        <group position={[0, -0.8, 0]}>
           <Torus args={[0.6, 0.05, 12, 48]} rotation={[Math.PI/2, 0, 0]}>
              <meshStandardMaterial color="#222" metalness={1} />
           </Torus>
        </group>
      </Float>
    </group>
  );
};

export default Orb3D;
