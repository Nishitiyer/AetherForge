import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Sphere, Float, Extrude } from '@react-three/drei';
import * as THREE from 'three';

// Premium Cinematic Palette
const COLORS = {
  RED: "#8a0000",        // Deep Matte Crimson
  GOLD: "#c5a059",       // Champagne Gold
  GUNMETAL: "#1a1a1c",   // Internal Frame
  TITANIUM: "#2a2a2e",   // Functional Details
  CYAN: "#00f2fe",       // Energy Glow
};

// Component: Mechanical Iris Blade (Symmetrical/Rotational)
const IrisBlade = ({ rotation, isOpen }) => {
  const meshRef = useRef();
  
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.2, 0);
    s.bezierCurveTo(1.5, 0.5, 1.5, 1.0, 1.2, 1.5);
    s.lineTo(0, 1.5);
    s.closePath();
    return s;
  }, []);

  useFrame((state, delta) => {
    const targetZ = isOpen ? -Math.PI / 4 : 0;
    const targetX = isOpen ? 0.5 : 0;
    if (meshRef.current) {
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetZ, delta * 5);
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 5);
    }
  });

  return (
    <group rotation={[0, 0, rotation]}>
      <mesh ref={meshRef} position={[0, 0, 0.1]}>
        <extrudeGeometry args={[shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 }]} />
        <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

// Component: Symmetrical Armor Plate
const ArmorPlate = ({ shape, position, rotation, color, thickness = 0.3, mirror = false }) => (
  <group position={position} rotation={rotation} scale={[mirror ? -1 : 1, 1, 1]}>
    <Extrude args={[shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 }]}>
      <meshPhysicalMaterial 
        color={color} 
        metalness={1} 
        roughness={0.2} 
        clearcoat={1} 
        clearcoatRoughness={0.1} 
      />
    </Extrude>
  </group>
);

const Chestplate = ({ isOpen, children }) => {
  const groupRef = useRef();
  const topFlapRef = useRef();
  const leftPlateRef = useRef();
  const rightPlateRef = useRef();
  const platformRef = useRef();

  // Create anatomically inspired breastplate shape
  const breastShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(2.5, 0.5);
    s.bezierCurveTo(3.5, 1, 3.8, 3, 3.5, 5);
    s.lineTo(0, 6);
    s.bezierCurveTo(-0.5, 4, -0.5, 2, 0, 0);
    return s;
  }, []);

  const topFlapShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.5, 0);
    s.lineTo(2.5, 0);
    s.lineTo(2, 1.2);
    s.lineTo(-2, 1.2);
    s.closePath();
    return s;
  }, []);

  useFrame((state, delta) => {
    const t = isOpen ? 1 : 0;
    const lerpSpeed = 6;

    if (topFlapRef.current) {
      topFlapRef.current.position.y = THREE.MathUtils.lerp(topFlapRef.current.position.y, 4.5 + (t * 1.5), delta * lerpSpeed);
      topFlapRef.current.rotation.x = THREE.MathUtils.lerp(topFlapRef.current.rotation.x, -0.1 - (t * 0.6), delta * lerpSpeed);
    }
    if (leftPlateRef.current) {
      leftPlateRef.current.position.x = THREE.MathUtils.lerp(leftPlateRef.current.position.x, -0.2 - (t * 2.0), delta * lerpSpeed);
      leftPlateRef.current.rotation.y = THREE.MathUtils.lerp(leftPlateRef.current.rotation.y, 0.1 - (t * 0.3), delta * lerpSpeed);
    }
    if (rightPlateRef.current) {
      rightPlateRef.current.position.x = THREE.MathUtils.lerp(rightPlateRef.current.position.x, 0.2 + (t * 2.0), delta * lerpSpeed);
      rightPlateRef.current.rotation.y = THREE.MathUtils.lerp(rightPlateRef.current.rotation.y, -0.1 + (t * 0.3), delta * lerpSpeed);
    }
    if (platformRef.current) {
        platformRef.current.position.z = THREE.MathUtils.lerp(platformRef.current.position.z, 0 + (t * 1.8), delta * lerpSpeed);
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      {/* 1. CENTRAL MECHANICAL CORE (Symmetrical) */}
      <group position={[0, 2.5, 0]}>
        {/* Deep Internal Housing */}
        <Cylinder args={[2.2, 2.4, 1.2, 6, 1, false]} rotation={[Math.PI/2, 0, 0]}>
          <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={1} roughness={0.5} side={THREE.DoubleSide} />
        </Cylinder>
        
        {/* Cyan Energy Ring */}
        <Torus args={[2.0, 0.08, 16, 100]} position={[0, 0, 0.4]}>
          <meshStandardMaterial color={COLORS.CYAN} emissive={COLORS.CYAN} emissiveIntensity={10} />
        </Torus>

        {/* Mechanical Iris Shutters */}
        <group position={[0, 0, 0.5]}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <IrisBlade key={i} rotation={(i * Math.PI * 2) / 8} isOpen={isOpen} />
          ))}
        </group>

        {/* AI Core Platform Handle */}
        <group ref={platformRef}>
            {children}
            <Cylinder args={[1.0, 1.1, 0.4, 32]} position={[0, 0, -0.6]} rotation={[Math.PI/2, 0, 0]}>
                <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} />
            </Cylinder>
        </group>
      </group>

      {/* 2. SYMMETRICAL ARMOR ASSEMBLY */}
      
      {/* Left Chestplate Section */}
      <group ref={leftPlateRef} position={[-0.2, 0, 0.2]}>
        <ArmorPlate shape={breastShape} position={[-3.5, 0, 0]} color={COLORS.RED} mirror={false} />
        {/* Inner Gold Frame */}
        <ArmorPlate shape={breastShape} position={[-3.3, 0.2, 0.2]} color={COLORS.GOLD} thickness={0.1} mirror={false} />
      </group>

      {/* Right Chestplate Section */}
      <group ref={rightPlateRef} position={[0.2, 0, 0.2]}>
        <ArmorPlate shape={breastShape} position={[3.5, 0, 0]} color={COLORS.RED} mirror={true} />
        {/* Inner Gold Frame */}
        <ArmorPlate shape={breastShape} position={[3.3, 0.2, 0.2]} color={COLORS.GOLD} thickness={0.1} mirror={true} />
      </group>

      {/* Top Collar / Neck Flap */}
      <group ref={topFlapRef} position={[0, 4.5, 0.5]}>
        <ArmorPlate shape={topFlapShape} position={[-2.5, 0, 0.1]} color={COLORS.RED} thickness={0.2} />
        <Box args={[5.2, 0.4, 0.3]} position={[0, -0.2, 0]}>
           <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} />
        </Box>
      </group>

      {/* 3. INTERNAL FRAME DETAILS (Visible when open) */}
      <group position={[0, 2.5, -0.5]} visible={true}>
         {/* Vertical Rails */}
         <Box args={[0.2, 8, 0.2]} position={[-2.4, 0, 0]}>
            <meshStandardMaterial color={COLORS.TITANIUM} />
         </Box>
         <Box args={[0.2, 8, 0.2]} position={[2.4, 0, 0]}>
            <meshStandardMaterial color={COLORS.TITANIUM} />
         </Box>
         {/* Cross Supports */}
         <Box args={[5, 0.15, 0.15]} position={[0, 3, -0.2]}>
            <meshStandardMaterial color={COLORS.TITANIUM} />
         </Box>
         <Box args={[5, 0.15, 0.15]} position={[0, -3, -0.2]}>
            <meshStandardMaterial color={COLORS.TITANIUM} />
         </Box>
      </group>

      {/* Cinematic Lighting System */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 2.5, 2]} intensity={2} color={COLORS.CYAN} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <directionalLight position={[-10, 5, 5]} intensity={0.5} color={COLORS.RED} />
    </group>
  );
};

export default Chestplate;
