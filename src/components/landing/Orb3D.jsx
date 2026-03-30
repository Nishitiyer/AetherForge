import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Octahedron, Icosahedron, Box, Cylinder, MeshTransmissionMaterial, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Premium distinct geometries per Core
const CoreGeometry = ({ id, color, responsive }) => {
  const innerRef = useRef();
  const fragmentsRef = useRef();
  const sparklesRef = useRef();

  // Pre-calculate sparkles for stability
  const sparkles = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      position: [
        Math.cos(i * Math.PI / 4) * 0.35,
        Math.sin(i * Math.PI / 4) * 0.35,
        (Math.random() - 0.5) * 0.2
      ]
    }));
  }, []);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!innerRef.current) return;
    
    // Voice-Reactive Pulse
    const pulseFactor = responsive ? 1 + Math.sin(t * 15) * 0.1 : 1;
    innerRef.current.scale.setScalar(pulseFactor);

    if (sparklesRef.current) {
        sparklesRef.current.rotation.y += 0.02;
    }

    // Core specific motion
    switch (id) {
      case 'nova':
        innerRef.current.rotation.x = t * 2.0;
        innerRef.current.rotation.y = t * 1.5;
        break;
      case 'sentinel':
        innerRef.current.rotation.y = t * 1.5;
        break;
      case 'quantum':
        innerRef.current.rotation.x = t * 4.0;
        innerRef.current.rotation.z = Math.sin(t*2) * 2.0;
        break;
      case 'prism':
        innerRef.current.rotation.x = t;
        innerRef.current.rotation.y = t * 1.2;
        break;
      default:
        innerRef.current.rotation.y = t;
    }
  });

  const coreMaterial = (
    <MeshDistortMaterial
      color={color}
      speed={responsive ? 8 : 4}
      distort={responsive ? 0.6 : 0.4}
      radius={1}
      emissive={color}
      emissiveIntensity={responsive ? 20 : 10}
      toneMapped={false}
    />
  );

  return (
    <group>
      {/* 1. The Singing Core / Singularity */}
      <group ref={innerRef}>
        {id === 'sentinel' ? (
           <Octahedron args={[0.25, 0]}>{coreMaterial}</Octahedron>
        ) : id === 'prism' ? (
           <Icosahedron args={[0.25, 0]}>{coreMaterial}</Icosahedron>
        ) : (
           <Sphere args={[0.2, 32, 32]}>{coreMaterial}</Sphere>
        )}
      </group>

      {/* 2. Inner Energy Sparkles */}
      <group ref={sparklesRef}>
          {sparkles.map((s, i) => (
              <mesh key={i} position={s.position}>
                  <sphereGeometry args={[0.015, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
              </mesh>
          ))}
      </group>

      {/* 3. Containment Field */}
      <Sphere args={[0.32, 16, 16]}>
         <MeshWobbleMaterial color={color} factor={0.5} speed={3} transparent opacity={0.1} wireframe />
      </Sphere>
    </group>
  );
};


const Orb3D = ({ config, animState, isExiting, responsive = false }) => {
  const groupRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.scale.set(0.01, 0.01, 0.01);
        groupRef.current.position.z = -2.5; 
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Structural rotations
    if (ringRef1.current) {
        ringRef1.current.rotation.y = t * (responsive ? 4 : 1.5);
    }
    if (ringRef2.current) {
        ringRef2.current.rotation.x = Math.cos(t * 0.3) * (responsive ? 2 : 0.8);
        ringRef2.current.rotation.y = -t * 1.5;
    }

    // 2. State Lerps
    let targetZ = 0.5; 
    let targetScale = 1;
    if (animState === 'idle_closed') targetZ = -0.5;
    if (isExiting) { targetZ = -2.0; targetScale = 0; }

    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3.5);
    const newScale = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 5.0);
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  return (
    <group ref={groupRef}>
      {/* 1. Core Assembly */}
      <CoreGeometry id={config.id} color={config.color} responsive={responsive} />

      {/* 2. Premium Refractive Shell */}
      <mesh>
        <sphereGeometry args={[0.6, 64, 64]} />
        <MeshTransmissionMaterial
            backside
            samples={12}
            thickness={1.2}
            chromaticAberration={0.4}
            anisotropicBlur={0.8}
            distortion={0.2}
            distortionScale={responsive ? 0.6 : 0.3}
            temporalDistortion={0.1}
            ior={1.4}
            color={config.color}
            attenuationDistance={1.0}
            attenuationColor={config.color}
            roughness={0.0}
            transmission={1.0}
            envMapIntensity={2}
        />
      </mesh>

      {/* 3. Magnetic Retention Rings */}
      <group ref={ringRef1}>
        <Torus args={[0.75, 0.008, 16, 64]}>
           <meshPhysicalMaterial color={config.color} emissive={config.color} emissiveIntensity={responsive ? 15 : 5} toneMapped={false} />
        </Torus>
      </group>
      <group ref={ringRef2}>
        <Torus args={[0.82, 0.005, 16, 64]}>
           <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </Torus>
      </group>
      
      <pointLight distance={5} intensity={responsive ? 12 : 4} color={config.color} decay={2} />
    </group>
  );
};

export default Orb3D;
