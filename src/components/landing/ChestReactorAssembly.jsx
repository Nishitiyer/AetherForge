import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Extrude } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  CANDY_RED: "#7a0000",
  CHAMPAGNE_GOLD: "#d4af37",
  GUNMETAL: "#121214",
  TITANIUM: "#2c2c30",
  CYAN_GLOW: "#00e5ff",
};

// Intricate Mechanical Support Arm (replaces the giant shells)
const SupportRib = ({ position, rotation, mirror }) => (
  <group position={position} rotation={rotation} scale={[mirror ? -1 : 1, 1, 1]}>
    {/* Main Strut */}
    <Box args={[1.5, 6.0, 0.4]} position={[1.8, 0, 0]}>
      <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.3} />
    </Box>
    {/* Red Armor Accent */}
    <Box args={[0.5, 4.0, 0.5]} position={[2.6, 0, 0.1]}>
      <meshPhysicalMaterial color={COLORS.CANDY_RED} metalness={0.95} roughness={0.15} clearcoat={1.0} />
    </Box>
    {/* Hydraulic Connector */}
    <Cylinder args={[0.15, 0.15, 2.0]} rotation={[0, 0, Math.PI/2]} position={[0.8, 2, -0.1]}>
      <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.2} />
    </Cylinder>
    <Cylinder args={[0.15, 0.15, 2.0]} rotation={[0, 0, Math.PI/2]} position={[0.8, -2, -0.1]}>
      <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.2} />
    </Cylinder>
  </group>
);

// Overlapping Iris Blades for realistic aperture
const HeavyIrisBlade = ({ rotation, animState }) => {
  const meshRef = useRef();
  
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.2);
    s.lineTo(1.8, -0.2);
    s.lineTo(2.2, 0.8);
    s.lineTo(0.5, 1.4);
    s.closePath();
    return s;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    let target = 0; // closed
    if (animState === 'initialize_open' || animState === 'settle_open' || animState === 'idle_active') target = 1;
    if (animState === 'orb_swap') target = 0.5;

    const p = THREE.MathUtils.lerp(meshRef.current.userData.progress || 0, target, delta * 6.0);
    meshRef.current.userData.progress = p;
    
    // Retract outward and rotate into the housing
    meshRef.current.position.x = p * 1.5;
    meshRef.current.rotation.z = p * (-Math.PI / 4);
  });

  return (
    <group rotation={[0, 0, rotation]}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 }]} />
        <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.4} />
      </mesh>
    </group>
  );
};

// The True Centerpiece Machine
const ChestReactorAssembly = ({ animState, children }) => {
  const stateRef = useRef({ phase: 0 });
  
  const crownRef = useRef();
  const leftRibRef = useRef();
  const rightRibRef = useRef();
  const pedestalRef = useRef();
  const chamberRingRef = useRef();
  const glowRef = useRef();
  const lowerJawRef = useRef();

  useFrame((state, delta) => {
    let target = 0;
    if (animState === 'initialize_open' || animState === 'settle_open' || animState === 'idle_active') target = 1;
    if (animState === 'orb_swap') target = 0.4;
    
    // Snappy, mechanical lerp
    const p = THREE.MathUtils.lerp(stateRef.current.phase, target, delta * 4.5);
    stateRef.current.phase = p;

    // 1. Extreme Crown Lift
    if (crownRef.current) {
      crownRef.current.position.y = 4.0 + (p * 1.5);
      crownRef.current.rotation.x = -p * 0.4; // Tilts back
    }
    
    // 2. Lower Jaw Drop
    if (lowerJawRef.current) {
      lowerJawRef.current.position.y = -3.5 - (p * 1.0);
      lowerJawRef.current.rotation.x = p * 0.2;
    }

    // 3. Side Ribs Retract laterally
    if (leftRibRef.current) leftRibRef.current.position.x = -p * 0.8;
    if (rightRibRef.current) rightRibRef.current.position.x = p * 0.8;

    // 4. Chamber Ring Fast Spin
    if (chamberRingRef.current) {
      if (animState === 'orb_swap') chamberRingRef.current.rotation.z += delta * 6;
      else if (target > 0) chamberRingRef.current.rotation.z += delta * 0.8;
      else chamberRingRef.current.rotation.z = p * Math.PI;
    }

    // 5. Powerful Pedestal Strike
    if (pedestalRef.current) {
      let pedTarget = -2.5; // Deep inside
      if (target === 1) pedTarget = 0; // Fully locked forward
      if (animState === 'orb_swap') pedTarget = -1.8;
      pedestalRef.current.position.z = THREE.MathUtils.lerp(pedestalRef.current.position.z, pedTarget, delta * 5.0);
    }

    // 6. Chamber Glow
    if (glowRef.current) {
      let intensityTarget = 1;
      if (animState === 'initialize_open') intensityTarget = 20; // Flash!
      if (target === 1) intensityTarget = 8;
      if (animState === 'orb_swap') intensityTarget = 2;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, intensityTarget, delta * 8);
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* 1. THE CENTRAL MACHINE (Heavy Vertical Column) */}
      <group position={[0, 0, -1.0]}>
         {/* Main Reactor Block */}
         <Box args={[4.2, 8.0, 1.5]} position={[0, 0, 0]}>
            <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={0.95} roughness={0.5} />
         </Box>
         {/* Internal Power Rails */}
         <Cylinder args={[0.3, 0.3, 8.2, 16]} position={[-1.2, 0, 0.8]}>
            <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.2} />
         </Cylinder>
         <Cylinder args={[0.3, 0.3, 8.2, 16]} position={[1.2, 0, 0.8]}>
            <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.2} />
         </Cylinder>
      </group>

      {/* 2. EMBEDDED CHAMBER */}
      <group position={[0, 0.5, 0]}>
         {/* Deep Cavity Housing */}
         <Cylinder args={[3.2, 3.2, 2.0, 64]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -1.0]}>
            <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={1} roughness={0.6} side={THREE.DoubleSide} />
         </Cylinder>

         {/* Chamber Track Ring */}
         <group ref={chamberRingRef} position={[0, 0, 0]}>
            <Torus args={[2.5, 0.15, 16, 64]}>
               <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.2} />
            </Torus>
            {[...Array(12)].map((_, i) => (
               <Box key={i} args={[0.1, 0.8, 0.4]} position={[Math.sin((i/12)*Math.PI*2)*2.5, Math.cos((i/12)*Math.PI*2)*2.5, 0]} rotation={[0, 0, -(i/12)*Math.PI*2]}>
                   <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} roughness={0.3} />
               </Box>
            ))}
         </group>

         {/* Mechanical Iris */}
         <group position={[0, 0, 0.3]}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <HeavyIrisBlade key={i} rotation={(i * Math.PI * 2) / 8} animState={animState} />
            ))}
         </group>

         {/* Core Pedestal (The true mounting bracket) */}
         <group ref={pedestalRef} position={[0, 0, -2.5]}>
             <group position={[0, 0, 0.5]}>
               {children}
             </group>
             {/* The physical mount locking ring */}
             <Torus args={[1.6, 0.1, 16, 64]} position={[0, 0, 0.2]}>
                 <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.1} />
             </Torus>
             <Cylinder args={[1.2, 1.6, 1.5, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.6]}>
                 <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.5} />
             </Cylinder>
         </group>
      </group>

      {/* 3. ARMOR & SUPPORT (No large red doors) */}
      
      {/* Lateral Support Ribs */}
      <group ref={leftRibRef} position={[0, 0, 0]}>
         <SupportRib position={[-1.0, 0.5, 0.5]} rotation={[0, -0.1, 0]} mirror={false} />
      </group>
      <group ref={rightRibRef} position={[0, 0, 0]}>
         <SupportRib position={[1.0, 0.5, 0.5]} rotation={[0, 0.1, 0]} mirror={true} />
      </group>

      {/* Upper Mechanical Crown */}
      <group ref={crownRef} position={[0, 4.0, 1.0]}>
         <Box args={[3.8, 1.5, 1.2]}>
            <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.2} />
         </Box>
         <Box args={[4.0, 0.4, 1.4]} position={[0, -0.4, 0.1]}>
            <meshPhysicalMaterial color={COLORS.CANDY_RED} metalness={0.95} roughness={0.15} clearcoat={1.0} />
         </Box>
         <Box args={[1.0, 0.8, 1.5]} position={[0, 0.2, 0.2]}>
            <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.1} />
         </Box>
      </group>

      {/* Lower Sternum Jaw */}
      <group ref={lowerJawRef} position={[0, -3.5, 1.0]}>
         <Box args={[3.2, 1.5, 1.0]}>
            <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.2} />
         </Box>
         <Box args={[3.4, 0.3, 1.1]} position={[0, 0.4, 0.1]}>
            <meshPhysicalMaterial color={COLORS.CANDY_RED} metalness={0.95} roughness={0.15} clearcoat={1.0} />
         </Box>
      </group>

      {/* 4. PREMIUM SCENE LIGHTING */}
      <ambientLight intensity={0.4} />
      <spotLight position={[-10, 20, 15]} intensity={8.0} angle={0.4} penumbra={1} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
      <spotLight position={[15, -10, 10]} intensity={4.0} angle={0.6} penumbra={0.8} color="#ffe0b2" castShadow />
      <pointLight ref={glowRef} position={[0, 0.5, 2.0]} intensity={1} distance={20} decay={2} color={COLORS.CYAN_GLOW} />
    </group>
  );
};

export default ChestReactorAssembly;
