import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Octahedron, Icosahedron, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// Premium distinct geometries per Core
const CoreGeometry = ({ id, color }) => {
  const innerRef = useRef();
  const fragmentsRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!innerRef.current) return;
    
    // Core specific motion
    switch (id) {
      case 'nova':
        innerRef.current.rotation.x = t * 2.0;
        innerRef.current.rotation.y = t * 1.5;
        if(fragmentsRef.current) {
          fragmentsRef.current.rotation.y = -t;
          fragmentsRef.current.rotation.z = Math.sin(t) * 0.5;
        }
        break;
      case 'sentinel':
        innerRef.current.rotation.y = t * 1.5;
        if(fragmentsRef.current) fragmentsRef.current.rotation.x = -t * 0.5;
        break;
      case 'quantum':
        innerRef.current.rotation.x = t * 4.0;
        innerRef.current.rotation.z = Math.sin(t*2) * 2.0;
        if(fragmentsRef.current) fragmentsRef.current.rotation.y = t * 3.0;
        break;
      case 'prism':
        innerRef.current.rotation.x = t;
        innerRef.current.rotation.y = t * 1.2;
        if(fragmentsRef.current) fragmentsRef.current.rotation.z = t * 0.5;
        break;
      default:
        innerRef.current.rotation.y = t;
    }
  });

  if (id === 'sentinel') {
    return (
      <group>
        <group ref={innerRef}>
           <Octahedron args={[0.3, 0]}>
              <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={5} metalness={1} roughness={0.1} />
           </Octahedron>
           <Octahedron args={[0.35, 0]}>
              <meshPhysicalMaterial color="#ffffff" transmission={0.9} ior={1.5} roughness={0.1} thickness={0.5} wireframe />
           </Octahedron>
        </group>
        <group ref={fragmentsRef}>
           <Torus args={[0.5, 0.05, 16, 4]} rotation={[Math.PI/2, 0, 0]}>
              <meshPhysicalMaterial color="#2c2c30" metalness={1} roughness={0.4} />
           </Torus>
           <Torus args={[0.5, 0.01, 16, 64]} rotation={[Math.PI/4, 0, 0]}>
              <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={3} />
           </Torus>
        </group>
      </group>
    );
  }
  
  if (id === 'prism') {
    return (
      <group>
        <group ref={innerRef}>
           <Icosahedron args={[0.35, 0]}>
              <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={3} wireframe={true} />
           </Icosahedron>
           <Sphere args={[0.2, 32, 32]}>
              <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={10} />
           </Sphere>
        </group>
        <group ref={fragmentsRef}>
           {[0, 1, 2].map(i => (
             <Cylinder key={i} args={[0.02, 0.02, 1.2]} rotation={[Math.PI/2, (i*Math.PI)/3, 0]}>
                <meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.1} />
             </Cylinder>
           ))}
        </group>
      </group>
    );
  }

  // Default highly detailed spherical reactor layout
  return (
    <group>
      <group ref={innerRef}>
         <Sphere args={[0.25, 32, 32]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={id === 'quantum' ? 12 : 6} />
         </Sphere>
         {/* Inner metallic cage */}
         <Sphere args={[0.26, 8, 8]}>
            <meshPhysicalMaterial color="#121214" metalness={1} roughness={0.2} wireframe />
         </Sphere>
      </group>
      <group ref={fragmentsRef}>
         <Torus args={[0.4, 0.02, 16, 64]} rotation={[Math.PI/4, 0, 0]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
         </Torus>
         {/* Orbiting fragments */}
         {[0, 1, 2, 3].map(i => (
            <Box key={i} args={[0.1, 0.1, 0.1]} position={[Math.sin((i*Math.PI)/2)*0.5, 0, Math.cos((i*Math.PI)/2)*0.5]}>
               <meshPhysicalMaterial color="#2c2c30" metalness={1} roughness={0.3} />
            </Box>
         ))}
      </group>
    </group>
  );
};


const Orb3D = ({ config, animState, isExiting }) => {
  const groupRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.scale.set(0.01, 0.01, 0.01);
        groupRef.current.position.z = -2.5; // Deep start
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Structural containment field rotations
    if (ringRef1.current) {
        ringRef1.current.rotation.x = Math.sin(t * 0.5) * 0.4;
        ringRef1.current.rotation.y = t * 1.5;
    }
    if (ringRef2.current) {
        ringRef2.current.rotation.x = Math.cos(t * 0.3) * 0.8;
        ringRef2.current.rotation.y = -t * 1.0;
    }

    // 2. FSM Transitions (Scale and Height)
    let targetZ = 0.5; // Final forward position
    let targetScale = 1;

    if (animState === 'idle_closed') {
        targetZ = -0.5; // Partially hidden inside the center
    }

    if (isExiting) {
        // We are strictly the old orb dying out
        targetZ = -2.0;
        targetScale = 0;
    }

    // Dynamic, physical feeling lerp
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3.5);
    const newScale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 5.0);
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  return (
    <group ref={groupRef}>
      {/* 1. Distinct Core Assembly */}
      <CoreGeometry id={config.id} color={config.color} />

      {/* 2. Glass Containment Sphere */}
      <Sphere args={[0.5, 32, 32]}>
        <meshPhysicalMaterial 
           color={config.color}
           transmission={0.95} 
           opacity={1} 
           metalness={0.2} 
           roughness={0.05} 
           ior={1.6} 
           thickness={1.0} 
           transparent={true} 
           side={THREE.DoubleSide}
        />
      </Sphere>

      {/* 3. Outer Magnetic Retention Rings */}
      <group ref={ringRef1}>
        <Torus args={[0.6, 0.015, 16, 64, Math.PI * 1.8]}>
           <meshPhysicalMaterial color={config.color} emissive={config.color} emissiveIntensity={4} />
        </Torus>
      </group>
      <group ref={ringRef2}>
        <Torus args={[0.65, 0.01, 16, 64, Math.PI * 1.5]}>
           <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
        </Torus>
      </group>
      
      {/* 4. Local Environmental Glow */}
      <pointLight distance={4} intensity={isExiting ? 0 : 3} color={config.color} decay={2} />
    </group>
  );
};

export default Orb3D;
