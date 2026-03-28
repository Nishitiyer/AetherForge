import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, MeshWobbleMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Orb3D = ({ config, isListening }) => {
  const meshRef = useRef();
  const innerRef = useRef();
  const particlesRef = useRef();

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(config.particleCount * 3);
    for (let i = 0; i < config.particleCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);
      positions[i * 3] = 1.2 * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = 1.2 * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = 1.2 * Math.cos(theta);
    }
    return positions;
  }, [config]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5 * config.pulseSpeed;
      meshRef.current.rotation.z = time * 0.3;
    }
    if (innerRef.current) {
      const s = 1 + Math.sin(time * config.pulseSpeed * 2) * (isListening ? 0.2 : 0.05);
      innerRef.current.scale.set(s, s, s);
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= 0.002 * config.pulseSpeed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group>
        {/* Outer Aura */}
        <Sphere args={[1.5, 32, 32]} ref={meshRef}>
          <MeshDistortMaterial
            color={config.color}
            speed={config.pulseSpeed}
            distort={0.4}
            radius={1}
            transparent
            opacity={0.3}
            emissive={config.color}
            emissiveIntensity={2}
          />
        </Sphere>

        {/* Inner Core */}
        <Sphere args={[0.8, 32, 32]} ref={innerRef}>
          <MeshWobbleMaterial
            color={config.secondaryColor}
            speed={config.pulseSpeed * 1.5}
            factor={0.6}
            emissive={config.color}
            emissiveIntensity={5}
          />
        </Sphere>

        {/* Energy Particles */}
        <Points ref={particlesRef}>
          <bufferGeometry key={config.particleCount}>
            <bufferAttribute
              attach="attributes-position"
              count={particlePositions.length / 3}
              array={particlePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <PointMaterial
            transparent
            color={config.color}
            size={0.05}
            sizeAttenuation={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </Points>

        {/* Radial Glow Light */}
        <pointLight intensity={10} distance={5} color={config.color} />
      </group>
    </Float>
  );
};

export default Orb3D;
