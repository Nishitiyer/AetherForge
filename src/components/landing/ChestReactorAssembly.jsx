import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Extrude } from '@react-three/drei';
import * as THREE from 'three';

// V6 Premium Cinematic Materials
const COLORS = {
  CANDY_RED: "#7a0000",      // Metallic automotive outer shell
  CHAMPAGNE_GOLD: "#d4af37", // Internal accents and housing
  GUNMETAL: "#121214",       // Structural frame
  TITANIUM: "#2c2c30",       // Actuators
  CYAN_GLOW: "#00e5ff",      // Core energy bleed
};

/* --- PRECISION HARD-SURFACE ARCHITECTURE --- */

// Reusable Armor Plate with heavy beveling for realism
const ArmorPlate = ({ shape, position, rotation, color, thickness, bevel, mirror }) => (
  <group position={position} rotation={rotation} scale={[mirror ? -1 : 1, 1, 1]}>
    <Extrude args={[shape, { depth: thickness, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 32 }]}>
      <meshPhysicalMaterial 
        color={color} 
        metalness={0.95} 
        roughness={0.15} 
        clearcoat={1.0} 
        clearcoatRoughness={0.1} 
      />
    </Extrude>
  </group>
);

// Mechanical Frame Rib
const FrameRib = ({ position, rotation }) => (
  <group position={position} rotation={rotation}>
    <Box args={[0.5, 0.2, 2.0]}>
      <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={0.9} roughness={0.4} />
    </Box>
    <Cylinder args={[0.1, 0.1, 2.1]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.2, 0]}>
      <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.95} roughness={0.2} />
    </Cylinder>
  </group>
);

// Sequenced Iris Blade
const IrisBlade = ({ rotation, animState }) => {
  const meshRef = useRef();
  
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.4, 0);
    s.lineTo(1.7, 0.8);
    s.lineTo(0.4, 1.3);
    s.closePath();
    return s;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    let target = 0; // 0 = closed
    if (animState === 'initialize_open' || animState === 'settle_open' || animState === 'idle_active') target = 1;
    if (animState === 'orb_swap') target = 0.5; // partial close

    const uZero = meshRef.current.userData.progress || 0;
    const p = THREE.MathUtils.lerp(uZero, target, delta * 5.0);
    meshRef.current.userData.progress = p;
    
    // Rotate and shift outwards
    meshRef.current.rotation.z = p * (-Math.PI / 3);
    meshRef.current.position.x = p * 1.0;
  });

  return (
    <group rotation={[0, 0, rotation]}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <extrudeGeometry args={[shape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }]} />
        <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

// Main V6 ChestReactorAssembly
const ChestReactorAssembly = ({ animState, children }) => {
  // Kinematic References
  const topFlapRef = useRef();
  const leftOuterRef = useRef();
  const rightOuterRef = useRef();
  const leftInnerRef = useRef();
  const rightInnerRef = useRef();
  const pedestalRef = useRef();
  const chamberRingRef = useRef();
  const glowRef = useRef();

  // Unified controller state
  const stateRef = useRef({ phase: 0 }); // 0 to 1 open status

  /* --- TRUE ANATOMICAL CAD SHAPES --- */
  
  // 1. Outer Pectoral Plate (The wide Torso shoulder wrap)
  const outerPectoralShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(2.0, -1.0);
    s.lineTo(4.5, -0.2);
    s.bezierCurveTo(5.2, 1.5, 5.5, 4.0, 4.8, 6.2); // Outer shoulder
    s.lineTo(2.5, 6.8); // Upper shoulder connection
    s.bezierCurveTo(1.8, 4.0, 1.8, 1.5, 2.0, -1.0); // Inner boundary
    return s;
  }, []);

  // 2. Inner Armor Segment (Near Core)
  const innerSegmentShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.8, -1.8);
    s.lineTo(2.1, -1.1);
    s.bezierCurveTo(1.9, 1.5, 1.9, 4.0, 2.6, 6.6);
    s.lineTo(1.2, 6.0);
    s.bezierCurveTo(0.8, 4.5, 0.6, 2.5, 0.8, -1.8);
    return s;
  }, []);

  // 3. Upper Sternum Flap (Collar)
  const topFlapShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-2.2, 0);
    s.lineTo(2.2, 0);
    s.lineTo(1.6, 1.8);
    s.lineTo(-1.6, 1.8);
    s.closePath();
    return s;
  }, []);

  /* --- FINITE STATE MACHINE KINEMATICS --- */
  useFrame((state, delta) => {
    const lerpSpeed = 4.0;
    
    // Determine target openness based on animState
    let target = 0;
    if (animState === 'initialize_open' || animState === 'settle_open' || animState === 'idle_active') target = 1;
    if (animState === 'orb_swap') target = 0.3; // retract partially during swap
    
    const p = THREE.MathUtils.lerp(stateRef.current.phase, target, delta * lerpSpeed);
    stateRef.current.phase = p;

    // 1. Flap Hinge
    if (topFlapRef.current) {
      topFlapRef.current.rotation.x = -p * 2.2; 
      topFlapRef.current.position.y = 5.8 + (p * 0.5); 
    }

    // 2. Outer Pectoral Plates (Swing outward)
    if (leftOuterRef.current) {
      leftOuterRef.current.position.x = -p * 1.5;
      leftOuterRef.current.rotation.y = -p * 0.2;
    }
    if (rightOuterRef.current) {
      rightOuterRef.current.position.x = p * 1.5;
      rightOuterRef.current.rotation.y = p * 0.2; // slight angle out
    }

    // 3. Inner Armor Segments (Retract laterally)
    if (leftInnerRef.current) leftInnerRef.current.position.x = -p * 0.8;
    if (rightInnerRef.current) rightInnerRef.current.position.x = p * 0.8;

    // 4. Chamber Ring Constant Idle + Swap Spin
    if (chamberRingRef.current) {
        if (animState === 'orb_swap') {
             chamberRingRef.current.rotation.z += delta * 4; // fast spin over
        } else if (animState === 'idle_active' || animState === 'settle_open') {
             chamberRingRef.current.rotation.z += delta * 0.5; // active idle
        } else {
             chamberRingRef.current.rotation.z = p * (Math.PI / 4); // open spin
        }
    }

    // 5. Core Pedestal Dynamic Elevation
    if (pedestalRef.current) {
        let pedTarget = -1.5;
        if (animState === 'initialize_open' || animState === 'settle_open' || animState === 'idle_active') pedTarget = 0;
        if (animState === 'orb_swap') pedTarget = -1.2; // sink down to swap
        pedestalRef.current.position.z = THREE.MathUtils.lerp(pedestalRef.current.position.z, pedTarget, delta * 3.5);
    }
    
    // 6. Chamber Glow Intensity
    if (glowRef.current) {
        let intensityTarget = 2; // idle closed
        if (animState === 'initialize_open') intensityTarget = 15; // massive flash
        if (animState === 'settle_open' || animState === 'idle_active') intensityTarget = 6;
        if (animState === 'orb_swap') intensityTarget = 2;
        glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, intensityTarget, delta * 6);
    }
  });

  return (
    <group position={[0, -2.8, 0]}>
      {/* 1. INTERNAL FRAME (Heavy Gunmetal Chassis) */}
      <group position={[0, 3, -1.8]}>
        <Box args={[2.0, 10, 0.6]} position={[0, 0, 0]}>
          <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={0.9} roughness={0.6} />
        </Box>
        {[-3.5, -1.5, 1.5, 3.5].map((y, i) => (
          <React.Fragment key={i}>
            <FrameRib position={[-2.6, y, 0.2]} rotation={[0, 0, 0.15]} />
            <FrameRib position={[2.6, y, 0.2]} rotation={[0, 0, -0.15]} />
          </React.Fragment>
        ))}
        {/* Pistons */}
        <Cylinder args={[0.15, 0.15, 9, 24]} position={[-3.2, 0, -0.2]} rotation={[0, 0, 0.2]}>
           <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.95} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.15, 0.15, 9, 24]} position={[3.2, 0, -0.2]} rotation={[0, 0, -0.2]}>
           <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.95} roughness={0.2} />
        </Cylinder>
      </group>

      {/* 2. CENTRAL REACTOR HOUSING */}
      <group position={[0, 3.2, 0]}>
        {/* Deep Recessed Chamber */}
        <Cylinder args={[3.4, 3.6, 2.5, 48, 1, false]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.6]}>
          <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={1} roughness={0.5} side={THREE.DoubleSide} />
        </Cylinder>
        
        {/* Inner Rotating Tech Ring */}
        <group ref={chamberRingRef} position={[0, 0, 0.4]}>
          <Torus args={[2.7, 0.1, 16, 64]}>
             <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.15} />
          </Torus>
          {/* Engineered Gear Teeth */}
          {[...Array(16)].map((_, i) => (
             <Box key={i} args={[0.2, 0.6, 0.3]} position={[Math.sin((i/16)*Math.PI*2)*2.7, Math.cos((i/16)*Math.PI*2)*2.7, 0]} rotation={[0, 0, -(i/16)*Math.PI*2]}>
                 <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} />
             </Box>
          ))}
        </group>

        {/* 8-Blade Mechanical Iris */}
        <group position={[0, 0, 0.6]}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <IrisBlade key={i} rotation={(i * Math.PI * 2) / 8} animState={animState} />
          ))}
        </group>

        {/* Dynamic Core Pedestal Mount */}
        <group ref={pedestalRef} position={[0, 0, -1.5]}>
            {children}
            {/* Magnetic Suspension Collar */}
            <Cylinder args={[1.5, 1.7, 0.9, 48]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.45]}>
                <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} roughness={0.25} />
            </Cylinder>
            {/* Telescoping Sub-Shaft */}
            <Cylinder args={[0.8, 0.8, 2.0, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -1.8]}>
                <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={0.9} roughness={0.4} />
            </Cylinder>
        </group>
      </group>

      {/* 3. CHEST ASSEMBLY: ANATOMICAL LAYERS */}
      
      {/* Outer Left Pectoral */}
      <group ref={leftOuterRef} position={[0, 0, 1.4]}>
        <ArmorPlate shape={outerPectoralShape} position={[0, 0, 0]} color={COLORS.CANDY_RED} thickness={1.2} bevel={0.2} mirror={false} />
        <ArmorPlate shape={outerPectoralShape} position={[0.2, 0.2, 1.1]} color={COLORS.CHAMPAGNE_GOLD} thickness={0.15} bevel={0.06} mirror={false} />
      </group>
      
      {/* Outer Right Pectoral */}
      <group ref={rightOuterRef} position={[0, 0, 1.4]}>
        <ArmorPlate shape={outerPectoralShape} position={[0, 0, 0]} color={COLORS.CANDY_RED} thickness={1.2} bevel={0.2} mirror={true} />
        <ArmorPlate shape={outerPectoralShape} position={[-0.2, 0.2, 1.1]} color={COLORS.CHAMPAGNE_GOLD} thickness={0.15} bevel={0.06} mirror={true} />
      </group>

      {/* Inner Left Armor Segment */}
      <group ref={leftInnerRef} position={[0, 0, 1.0]}>
         <ArmorPlate shape={innerSegmentShape} position={[0, 0, 0]} color={COLORS.TITANIUM} thickness={0.6} bevel={0.1} mirror={false} />
         {/* Detail accents */}
         <Box args={[0.2, 2.0, 0.2]} position={[-1.6, 2, 0.6]}>
             <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.2} />
         </Box>
      </group>

      {/* Inner Right Armor Segment */}
      <group ref={rightInnerRef} position={[0, 0, 1.0]}>
         <ArmorPlate shape={innerSegmentShape} position={[0, 0, 0]} color={COLORS.TITANIUM} thickness={0.6} bevel={0.1} mirror={true} />
         <Box args={[0.2, 2.0, 0.2]} position={[1.6, 2, 0.6]}>
             <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.2} />
         </Box>
      </group>

      {/* 4. UPPER STERNUM FLAP */}
      <group position={[0, 6.0, 1.6]}>
        <group ref={topFlapRef}>
            <ArmorPlate shape={topFlapShape} position={[0, -1.8, 0]} color={COLORS.CANDY_RED} thickness={0.8} bevel={0.15} mirror={false} />
            <Cylinder args={[0.3, 0.3, 4.6, 32]} rotation={[0, 0, Math.PI/2]} position={[0, 0, 0.4]}>
                <meshPhysicalMaterial color={COLORS.CHAMPAGNE_GOLD} metalness={1} roughness={0.15} />
            </Cylinder>
        </group>
      </group>

      {/* 5. CINEMATIC PRODUCT LIGHTING */}
      <ambientLight intensity={0.5} />
      <spotLight position={[-20, 15, -5]} intensity={6.0} angle={0.5} penumbra={1} color="#ffffff" castShadow />
      <spotLight position={[20, 5, -10]} intensity={5.0} angle={0.5} penumbra={1} color="#ffe0b2" castShadow />
      <directionalLight position={[0, 20, 15]} intensity={4.5} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[0, -15, 10]} intensity={1.5} color={COLORS.CANDY_RED} />
      <pointLight ref={glowRef} position={[0, 3.2, 2.5]} intensity={2} distance={15} decay={2} color={COLORS.CYAN_GLOW} />
    </group>
  );
};

export default ChestReactorAssembly;
