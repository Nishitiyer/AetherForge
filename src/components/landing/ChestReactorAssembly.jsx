import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Torus, Extrude } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================
// V8 — FRONT-FACING EXOSUIT TORSO CHESTPLATE
// Silhouette first. Reactor embedded inside. Torso reads first.
// ============================================================

const COLORS = {
  RED:      '#7a0000',   // Pectoral armor shell
  GOLD:     '#c9a84c',   // Edge trim, seams
  GUNMETAL: '#14141a',   // Sternum internals, chassis
  TITANIUM: '#2e2e38',   // Structural secondary masses
  CYAN:     '#00e5ff',   // Reactor glow only
};

// ── REUSABLE SHAPE FACTORIES ────────────────────────────────

/** Extruded convex pectoral armor panel */
const PectoralPanel = ({ mirror, color }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Left-side pectoral (mirrored for right via scale)
    // Wide at top, slightly tapered at inner-bottom edge
    s.moveTo( 0.0,  3.2);  // upper-inner corner
    s.lineTo(-3.2,  2.8);  // upper-outer
    s.bezierCurveTo(-4.0, 1.5, -4.2, -0.5, -3.6, -2.4); // outer curve
    s.lineTo(-1.4, -3.0);  // lower-outer
    s.bezierCurveTo(-0.6, -2.0, -0.1, -1.0,  0.0, -0.5); // inner taper
    s.closePath();
    return s;
  }, []);

  return (
    <group scale={[mirror ? -1 : 1, 1, 1]}>
      {/* Main thick shell */}
      <mesh>
        <extrudeGeometry args={[shape, {
          depth: 0.9,
          bevelEnabled: true,
          bevelThickness: 0.18,
          bevelSize: 0.18,
          bevelSegments: 5,
          curveSegments: 32
        }]} />
        <meshPhysicalMaterial color={color} metalness={0.75} roughness={0.38} clearcoat={0.4} clearcoatRoughness={0.3} />
      </mesh>
      {/* Gold edge accent strip */}
      <mesh position={[0, 0, 1.06]}>
        <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: false }]} />
        <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} roughness={0.15} />
      </mesh>
    </group>
  );
};

/** Collarbone/upper-chest armor band */
const CollarBand = () => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-4.8,  0.0);
    s.lineTo( 4.8,  0.0);
    s.lineTo( 4.0,  1.3);
    s.bezierCurveTo(2.0, 2.0, -2.0, 2.0, -4.0, 1.3);
    s.closePath();
    return s;
  }, []);

  return (
    <group position={[0, 3.0, 0.8]}>
      <mesh>
        <extrudeGeometry args={[shape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.12, bevelSegments: 4 }]} />
        <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Red accent stripe across collar */}
      <Box args={[7.0, 0.25, 0.7]} position={[0, 0.55, 0.3]}>
        <meshPhysicalMaterial color={COLORS.RED} metalness={0.9} roughness={0.2} clearcoat={1} />
      </Box>
      <Box args={[7.4, 0.1, 0.75]} position={[0, 0.12, 0.3]}>
        <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} />
      </Box>
    </group>
  );
};

/** Central sternum armor frame (vertical spine of the chest) */
const SternumFrame = () => (
  <group position={[0, 0, 0.5]}>
    {/* Main vertical body */}
    <Box args={[2.2, 7.5, 0.8]}>
      <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={0.95} roughness={0.4} />
    </Box>
    {/* Vertical ridge detail */}
    <Box args={[0.35, 7.6, 0.95]} position={[0, 0, 0.08]}>
      <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.35} />
    </Box>
    {/* Gold seam line left */}
    <Box args={[0.06, 6.8, 1.0]} position={[-1.0, 0.2, 0.1]}>
      <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} />
    </Box>
    {/* Gold seam line right */}
    <Box args={[0.06, 6.8, 1.0]} position={[1.0, 0.2, 0.1]}>
      <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} />
    </Box>
    {/* Horizontal cross-braces */}
    {[-2.4, -0.8, 0.8, 2.4].map((y, i) => (
      <Box key={i} args={[2.0, 0.14, 0.9]} position={[0, y, 0.05]}>
        <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.3} />
      </Box>
    ))}
  </group>
);

/** Mechanical iris blade (8 of these surround the core) */
const IrisBlade = ({ index, totalBlades, animState }) => {
  const ref = useRef();
  const angle = (index / totalBlades) * Math.PI * 2;

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(1.3, 0.1);
    s.lineTo(1.5, 0.65);
    s.lineTo(0.3, 1.1);
    s.closePath();
    return s;
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const prog = ref.current.userData.p || 0;
    let target = 0;
    if (animState === 'initialize_open' || animState === 'settle_open' || animState === 'idle_active') target = 1;
    if (animState === 'orb_swap') target = 0.5;
    const p = THREE.MathUtils.lerp(prog, target, delta * 5);
    ref.current.userData.p = p;
    ref.current.position.x = p * 0.9;
    ref.current.rotation.z = p * (-Math.PI / 3.5);
  });

  return (
    <group rotation={[0, 0, angle]}>
      <mesh ref={ref}>
        <extrudeGeometry args={[shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }]} />
        <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
};

// ── MAIN COMPONENT ───────────────────────────────────────────

const ChestReactorAssembly = ({ animState, children }) => {
  const phaseRef = useRef({ p: 0 });

  const topFlapRef     = useRef();
  const leftPecRef     = useRef();
  const rightPecRef    = useRef();
  const pedestalRef    = useRef();
  const chamberRingRef = useRef();
  const glowRef        = useRef();

  useFrame((_, delta) => {
    const spd = 4.0;
    let tgt = 0;
    if (animState === 'initialize_open' || animState === 'settle_open' || animState === 'idle_active') tgt = 1;
    if (animState === 'orb_swap') tgt = 0.35;

    const p = THREE.MathUtils.lerp(phaseRef.current.p, tgt, delta * spd);
    phaseRef.current.p = p;

    // 1. Upper collar flap rises
    if (topFlapRef.current) {
      topFlapRef.current.position.y = 4.5 + p * 1.2;
      topFlapRef.current.rotation.x = -p * 0.35;
    }

    // 2. Pectoral panels shift slightly apart around chamber
    if (leftPecRef.current)  leftPecRef.current.position.x  = -p * 0.25;
    if (rightPecRef.current) rightPecRef.current.position.x =  p * 0.25;

    // 3. Chamber ring rotation
    if (chamberRingRef.current) {
      if (animState === 'orb_swap') chamberRingRef.current.rotation.z += delta * 5;
      else if (tgt > 0) chamberRingRef.current.rotation.z += delta * 0.7;
    }

    // 4. Pedestal rises out of chamber
    if (pedestalRef.current) {
      let pedTgt = -1.8;
      if (tgt === 1) pedTgt = 0.1;
      if (animState === 'orb_swap') pedTgt = -1.2;
      pedestalRef.current.position.z = THREE.MathUtils.lerp(pedestalRef.current.position.z, pedTgt, delta * 4.5);
    }

    // 5. Glow intensity
    if (glowRef.current) {
      let gi = 1;
      if (animState === 'initialize_open') gi = 18;
      if (animState === 'settle_open' || animState === 'idle_active') gi = 7;
      if (animState === 'orb_swap') gi = 2;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, gi, delta * 8);
    }
  });

  return (
    <group position={[0, 0.5, 0]} scale={[0.76, 0.76, 0.76]}>

      {/* ── 1. LEFT PECTORAL ARMOR ── */}
      <group ref={leftPecRef} position={[0, 0, 0.6]}>
        <PectoralPanel mirror={false} color={COLORS.RED} />
        {/* Inner dark under-plate */}
        <group scale={[0.88, 0.88, 1]} position={[0.1, 0.1, -0.15]}>
          <PectoralPanel mirror={false} color={COLORS.TITANIUM} />
        </group>
      </group>

      {/* ── 2. RIGHT PECTORAL ARMOR (mirrored) ── */}
      <group ref={rightPecRef} position={[0, 0, 0.6]}>
        <PectoralPanel mirror={true} color={COLORS.RED} />
        <group scale={[0.88, 0.88, 1]} position={[-0.1, 0.1, -0.15]}>
          <PectoralPanel mirror={true} color={COLORS.TITANIUM} />
        </group>
      </group>

      {/* ── 3. CENTRAL STERNUM FRAME ── */}
      <SternumFrame />

      {/* ── 4. UPPER COLLAR / COLLARBONE STRUCTURE ── */}
      <group ref={topFlapRef} position={[0, 4.5, 0]}>
        <CollarBand />
        {/* Shoulder side panels */}
        <Box args={[1.2, 0.6, 0.9]} position={[-4.0, 0.7, 0.9]}>
          <meshPhysicalMaterial color={COLORS.RED} metalness={0.9} roughness={0.2} clearcoat={1} />
        </Box>
        <Box args={[1.2, 0.6, 0.9]} position={[4.0, 0.7, 0.9]}>
          <meshPhysicalMaterial color={COLORS.RED} metalness={0.9} roughness={0.2} clearcoat={1} />
        </Box>
      </group>

      {/* ── 5. EMBEDDED REACTOR CHAMBER (inside sternum) ── */}
      <group position={[0, 1.0, 1.3]}>

        {/* Outer circular housing ring */}
        <Torus args={[2.0, 0.28, 24, 80]}>
          <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={1} roughness={0.4} />
        </Torus>
        {/* Gold accent ring */}
        <Torus args={[2.3, 0.07, 16, 80]}>
          <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} />
        </Torus>
        {/* Inner gear track ring with teeth */}
        <group ref={chamberRingRef}>
          <Torus args={[1.65, 0.1, 16, 64]}>
            <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.3} />
          </Torus>
          {[...Array(14)].map((_, i) => (
            <Box
              key={i}
              args={[0.1, 0.5, 0.25]}
              position={[
                Math.sin((i / 14) * Math.PI * 2) * 1.65,
                Math.cos((i / 14) * Math.PI * 2) * 1.65,
                0
              ]}
              rotation={[0, 0, -(i / 14) * Math.PI * 2]}
            >
              <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={1} roughness={0.25} />
            </Box>
          ))}
        </group>

        {/* Recessed cavity disc */}
        <Cylinder args={[1.55, 1.55, 0.4, 64]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.3]}>
          <meshPhysicalMaterial color={COLORS.GUNMETAL} metalness={1} roughness={0.6} side={THREE.BackSide} />
        </Cylinder>

        {/* 8-blade mechanical iris */}
        <group position={[0, 0, 0.12]}>
          {[0,1,2,3,4,5,6,7].map(i => (
            <IrisBlade key={i} index={i} totalBlades={8} animState={animState} />
          ))}
        </group>

        {/* Core orb pedestal */}
        <group ref={pedestalRef} position={[0, 0, -1.8]}>
          {children}
          {/* Magnetic lock ring */}
          <Torus args={[1.1, 0.07, 16, 64]} position={[0, 0, 0.2]}>
            <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} />
          </Torus>
          {/* Pedestal shaft */}
          <Cylinder args={[0.7, 0.9, 1.2, 32]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.7]}>
            <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.4} />
          </Cylinder>
        </group>
      </group>

      {/* ── 6. LOWER CHEST TAPER ── */}
      <group position={[0, -3.8, 0.5]}>
        <Box args={[5.5, 1.2, 0.7]}>
          <meshPhysicalMaterial color={COLORS.TITANIUM} metalness={0.9} roughness={0.4} />
        </Box>
        <Box args={[5.7, 0.18, 0.75]} position={[0, 0.55, 0.05]}>
          <meshPhysicalMaterial color={COLORS.RED} metalness={0.9} roughness={0.2} clearcoat={1} />
        </Box>
        <Box args={[5.9, 0.09, 0.8]} position={[0, 0.2, 0.05]}>
          <meshPhysicalMaterial color={COLORS.GOLD} metalness={1} roughness={0.1} />
        </Box>
      </group>

      {/* ── CINEMATIC LIGHTING ── */}
      <ambientLight intensity={0.6} />
      {/* Key: top-left fill */}
      <spotLight position={[-12, 18, 12]} intensity={5} angle={0.4} penumbra={1} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
      {/* Rim: top-right warm */}
      <spotLight position={[14, 8, -8]} intensity={2.5} angle={0.5} penumbra={0.9} color="#ffe8c0" />
      {/* Side fill to break up the studio over-exposure */}
      <directionalLight position={[-8, 0, 5]} intensity={2.0} color="#ff3333" />
      <directionalLight position={[8, 0, 5]} intensity={1.5} color="#cc2222" />
      {/* Base fill from below */}
      <directionalLight position={[0, -10, 6]} intensity={0.8} color={COLORS.RED} />
      {/* Reactor core glow */}
      <pointLight ref={glowRef} position={[0, 1.0, 3.5]} intensity={1} distance={18} decay={2} color={COLORS.CYAN} />
    </group>
  );
};

export default ChestReactorAssembly;
