import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Octahedron, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// Unique Geometries based on Core ID
const CoreGeometry = ({ id, color }) => {
  const innerRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!innerRef.current) return;
    
    switch (id) {
      case 'nova':
        innerRef.current.rotation.x = t * 2.5;
        innerRef.current.rotation.y = t * 1.5;
        break;
      case 'sentinel':
        innerRef.current.rotation.y = t * 1.0;
        break;
      case 'quantum':
        innerRef.current.rotation.x = t * 3.0;
        innerRef.current.rotation.z = Math.sin(t) * 2.0;
        break;
      case 'echo':
        const scale = 1.0 + Math.sin(t * 8) * 0.15;
        innerRef.current.scale.set(scale, scale, scale);
        break;
      case 'forge':
        innerRef.current.rotation.y = -t * 0.5;
        break;
      case 'prism':
        innerRef.current.rotation.x = t;
        innerRef.current.rotation.y = t * 1.2;
        break;
      default:
        innerRef.current.rotation.y = t;
    }
  });

  // Render distinct shapes
  if (id === 'sentinel') {
    return (
      <group ref={innerRef}>
        <Octahedron args={[0.3, 0]}>
           <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={4} metalness={1} roughness={0.1} />
        </Octahedron>
      </group>
    );
  }
  
  if (id === 'prism') {
    return (
      <group ref={innerRef}>
        <Icosahedron args={[0.35, 0]}>
           <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={3} wireframe={true} />
        </Icosahedron>
        <Sphere args={[0.2, 16, 16]}>
           <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} />
        </Sphere>
      </group>
    );
  }

  if (id === 'nova') {
    return (
      <group ref={innerRef}>
        <Sphere args={[0.25, 32, 32]}>
           <meshStandardMaterial color={color} emissive={color} emissiveIntensity={8} />
        </Sphere>
        <Torus args={[0.4, 0.02, 16, 32]} rotation={[Math.PI/4, 0, 0]}>
           <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
        </Torus>
      </group>
    );
  }

  // Default / Echo / Forge / Quantum fallbacks
  return (
    <group ref={innerRef}>
      <Sphere args={[0.3, 32, 32]}>
         <meshStandardMaterial color={color} emissive={color} emissiveIntensity={id === 'quantum' ? 10 : 5} />
      </Sphere>
    </group>
  );
};


const Orb3D = ({ config, animState, isExiting }) => {
  const groupRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  // Initially hide the orb if it just spawned so we can lerp it up
  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.scale.set(0.01, 0.01, 0.01);
        groupRef.current.position.z = -1.5;
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();

    // 1. Structural ring rotations
    if (ringRef1.current) {
        ringRef1.current.rotation.x = Math.sin(t * 0.5) * 0.4;
        ringRef1.current.rotation.y = t * 1.2;
    }
    if (ringRef2.current) {
        ringRef2.current.rotation.x = Math.cos(t * 0.3) * 0.8;
        ringRef2.current.rotation.y = -t * 0.9;
    }

    // 2. State Machine Transitions (Scale and Height)
    let targetZ = 0;
    let targetScale = 1;

    if (animState === 'idle_closed') {
        targetZ = -0.5;
    }

    if (isExiting) {
        // We are old orb during swap -> die out
        targetZ = -1.8;
        targetScale = 0;
    }

    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 4.0);
    const newScale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 5.0);
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  return (
    <group ref={groupRef}>
      {/* Central Distinct Core */}
      <CoreGeometry id={config.id} color={config.color} />

      {/* Primary Containment Field Sphere (Glass) */}
      <Sphere args={[0.45, 32, 32]}>
        <meshPhysicalMaterial 
           color={config.color}
           transmission={0.9} 
           opacity={1} 
           metalness={0.1} 
           roughness={0} 
           ior={1.5} 
           thickness={0.5} 
           transparent={true} 
           side={THREE.DoubleSide}
        />
      </Sphere>

      {/* Fragmentation Rings */}
      <group ref={ringRef1}>
        <Torus args={[0.55, 0.01, 16, 64, Math.PI * 1.5]}>
           <meshPhysicalMaterial color={config.color} emissive={config.color} emissiveIntensity={2} />
        </Torus>
      </group>

      <group ref={ringRef2}>
        <Torus args={[0.65, 0.005, 16, 64, Math.PI * 1.2]}>
           <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
        </Torus>
      </group>
      
      {/* Light Source */}
      <pointLight distance={3} intensity={isExiting ? 0 : 2} color={config.color} />
    </group>
  );
};

export default Orb3D;
