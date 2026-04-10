/**
 * AetherForge Editor — Production Workspace
 *
 * Performance Architecture:
 * - Single WebGL Canvas (sidebar orb replaced with CSS animation)
 * - Gesture transforms use a shared gestureRef READ inside useFrame
 *   → No React re-renders during gesture-driven movement (true 60fps)
 * - Object state only updates on: add/delete/AI command (not on every frame)
 * - TransformControls handles click-drag manipulation natively in GL thread
 */
import React, { useEffect, useState, useRef, useCallback, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, TransformControls, Grid, GizmoHelper, GizmoViewport, Environment, Float, Sphere, MeshDistortMaterial, Line, useVideoTexture } from '@react-three/drei';
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from 'three';
import { useHands } from '../hooks/useHands';
import { useAIEngine } from '../hooks/useAIEngine';
import StarkOrb from '../components/common/AssistantOrb';
import { ORB_MODES } from '../data/orbs';
import {
  Settings, Activity, Plus, Hand, Move, RotateCw, Maximize,
  MousePointer2, Eye, Layers, Film, Trash2, Copy, Clock,
  MessageSquare, AlertCircle, Cpu, ChevronRight, Mic, Camera,
  Box as BoxIcon, Circle, Triangle, Bot, Zap, Hexagon,
  Globe, Square, CopyCheck, Play, Save, HelpCircle
} from "lucide-react";
import "./Editor.css";
import { ChestHero3D } from "../components/landing/ChestHero3D";
import { MODEL_TEMPLATES, assembleFromAI, applyAnimation } from '../utils/ModelFactory';

/* ────────────────── AR BACKGROUND ────────────────── */
function ARBackground({ videoRef, isEnabled, frameData }) {
  if (!isEnabled) return null;
  return <ARBackgroundInside videoRef={videoRef} frameData={frameData} />;
}

function ARBackgroundInside({ videoRef, frameData }) {
  const { scene } = useThree();
  const textureRef = useRef(null);
  
  useEffect(() => {
    if (!textureRef.current) {
        textureRef.current = new THREE.Texture();
        textureRef.current.encoding = THREE.sRGBEncoding;
        scene.background = textureRef.current;
    }

    if (frameData) {
        const img = new Image();
        img.onload = () => {
            if (textureRef.current) {
                textureRef.current.image = img;
                textureRef.current.needsUpdate = true;
            }
        };
        img.src = frameData;
    }

    return () => {
      if (textureRef.current) {
          textureRef.current.dispose();
          textureRef.current = null;
      }
      scene.background = new THREE.Color('#0f1115'); // Reset to AetherForge dark
    };
  }, [frameData, scene]);

  return null;
}

/* ────────────────── FREE GRAB HANDLER ────────────────── */
function FreeGrabHandler({ obj, onCommit }) {
  const { camera, mouse, raycaster } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);
  
  useFrame(() => {
    plane.setComponents(0, 1, 0, -obj.position.y);
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.ray.intersectPlane(plane, intersection)) {
      obj.position.set(intersection.x, obj.position.y, intersection.z);
    }
  });

  // Commit on click
  useEffect(() => {
    const handleUp = () => {
      onCommit(obj.id, { 
        position: obj.position.clone(),
        quaternion: obj.quaternion.clone(),
        scale: obj.scale.clone()
      });
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, [obj, onCommit]);

  return null;
}

/* ────────────────── ORB CONFIG ────────────────── */
const ORBS = {
  nova:     { name: "Nova Core",     personality: "Cinematic Director",   accent: "#fbbf24" },
  sentinel: { name: "Sentinel Core", personality: "Technical Architect",  accent: "#22d3ee" },
  echo:     { name: "Echo Core",     personality: "Voice Companion",      accent: "#e879f9" },
  prism:    { name: "Prism Core",    personality: "Creative Catalyst",    accent: "#818cf8" },
  quantum:  { name: "Quantum Core",  personality: "Efficiency Engine",    accent: "#34d399" },
};


/* ────────────────── MESH PRIMITIVES ────────────────── */
const PRIMITIVES = {
  cube:     { label: "Cube",     icon: "■", color: "#60a5fa", geometry: "box",          args: [1,1,1] },
  sphere:   { label: "Sphere",   icon: "●", color: "#f472b6", geometry: "sphere",       args: [0.62,32,32] },
  cylinder: { label: "Cylinder", icon: "⬤", color: "#34d399", geometry: "cylinder",     args: [0.4,0.4,1.2,32] },
  cone:     { label: "Cone",     icon: "▲", color: "#fb923c", geometry: "cone",         args: [0.5,1.2,32] },
  torus:    { label: "Torus",    icon: "◎", color: "#a78bfa", geometry: "torus",        args: [0.5,0.18,16,80] },
  plane:    { label: "Plane",    icon: "▬", color: "#94a3b8", geometry: "plane",        args: [2,2] },
  drone:    { label: "Drone",    icon: "✦", color: "#f87171", geometry: "octahedron",   args: [0.65, 2] },
  crystal:  { label: "Crystal",  icon: "◆", color: "#67e8f9", geometry: "dodecahedron", args: [0.58, 0] },
  knot:     { label: "Knot",     icon: "◎", color: "#f472b6", geometry: "torusKnot",    args: [0.4, 0.12, 128, 32] },
  ico:      { label: "Ico",      icon: "⌬", color: "#fbbf24", geometry: "icosahedron",  args: [0.6, 0] },
  capsule:  { label: "Capsule",  icon: "⬭", color: "#34d399", geometry: "capsule",      args: [0.35, 0.8, 4, 16] },
};

const _geoCache = {};
function makeGeo(type, args) {
  const key = `${type}-${args ? args.join(',') : 'default'}`;
  if (_geoCache[key]) return _geoCache[key];
  
  let geo;
  switch (type) {
    case 'box':          geo = new THREE.BoxGeometry(...args); break;
    case 'sphere':       geo = new THREE.SphereGeometry(...args); break;
    case 'cylinder':     geo = new THREE.CylinderGeometry(...args); break;
    case 'cone':         geo = new THREE.ConeGeometry(...args); break;
    case 'torus':        geo = new THREE.TorusGeometry(...args); break;
    case 'plane':        geo = new THREE.PlaneGeometry(...args); break;
    case 'octahedron':   geo = new THREE.OctahedronGeometry(...args); break;
    case 'dodecahedron': geo = new THREE.DodecahedronGeometry(...args); break;
    case 'torusKnot':    geo = new THREE.TorusKnotGeometry(...args); break;
    case 'icosahedron':  geo = new THREE.IcosahedronGeometry(...args); break;
    case 'capsule':      geo = new THREE.CapsuleGeometry(...args); break;
    default:             geo = new THREE.BoxGeometry(1,1,1); break;
  }
  _geoCache[key] = geo;
  return geo;
}

let _id = 0;
function freshObject(primKey) {
  const p = PRIMITIVES[primKey] || PRIMITIVES.cube;
  return {
    id: ++_id,
    name: `${p.label}.${String(_id).padStart(3,'0')}`,
    type: primKey,
    visible: true,
    position: new THREE.Vector3(0, 0, 0),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3(1, 1, 1),
    color: p.color || '#8b5cf6',
    emissive: '#000000',
    emissiveIntensity: 0,
    castShadow: true,
    receiveShadow: true,
    wireframe: false,
    spin: false,
    keyframes: [],
  };
}

const SceneObject = React.memo(({ obj, isSelected, onSelect, onDelete, gestureRef, handPosRef, isGestureEnabled, orb, onTransformCommit, transformMode }) => {
  const meshRef = useRef();
  const dualHandBaseDistRef = useRef(null);
  const dualHandBaseScaleRef = useRef(null);
  
  const [parts, setParts] = useState(obj.parts || []);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(obj.position);
    meshRef.current.quaternion.copy(obj.quaternion);
    meshRef.current.scale.copy(obj.scale);
  }, [obj.position, obj.quaternion, obj.scale]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (obj.parts && obj.animation) {
      setParts(applyAnimation(obj.parts, obj.animation, time));
    }
    
    // ── HIGH-PERFORMANCE JARVIS GESTURE LOOP ──
    if (!isGestureEnabled) return;

    const gList = gestureRef?.current || ['NONE', 'NONE'];
    const hpList = handPosRef?.current || [{ x:0.5, y:0.5, z:0 }];
    
    const g0 = gList[0] || 'NONE';
    const hp0 = hpList[0];

    if (!meshRef.current || !hp0) return;

    // ── DISTANCE-BASED SPATIAL ATTENTION ──
    const camPos = new THREE.Vector3((hp0.x - 0.5) * 14, (0.5 - hp0.y) * 10, hp0.z * -10);
    const distToHand = meshRef.current.position.distanceTo(camPos);
    const isNear = distToHand < 3.0;

    // A. GRAB TO MOVE (Unified for all objects)
    if ((g0 === 'GRAB' || g0 === 'FIST') && (isSelected || isNear)) {
      // Direct position follow with high responsive lerp (feels normal)
      meshRef.current.position.lerp(camPos, 0.25);

      // Rotational mirroring (Subtle tilt matching hand)
      const tiltX = (hp0.vy * 0.01);
      const tiltY = (hp0.vx * 0.01);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, tiltX, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, tiltY, 0.1);

      // FLICK-TO-DELETE (Stark Discard)
      if (Math.abs(hp0.vx) > 150 || Math.abs(hp0.vy) > 150) {
          onDelete(); 
      }
    }
    
    // COMMIT PINCH WORK
    if (g0 !== 'PINCH' && g0 !== 'GRAB' && (isSelected || isNear)) {
       // Check if we need to commit
        if (meshRef.current.position.distanceTo(obj.position) > 0.1 || meshRef.current.scale.distanceTo(obj.scale) > 0.05) {
          onTransformCommit(obj.id, { 
            position: meshRef.current.position.clone(), 
            quaternion: meshRef.current.quaternion.clone(),
            scale: meshRef.current.scale.clone() 
          });
       }
    }
    
    // B. PINCH TO SCULPT (Neural Deformation)
    if (g0 === 'PINCH' && (isSelected || isNear)) {
       // Stark Sculp logic: Bidirectional scale based on movement direction
       meshRef.current.scale.x += (hp0.vx * 0.0015);
       meshRef.current.scale.y -= (hp0.vy * 0.0015); // Inverted Y for intuitive drag
       meshRef.current.position.lerp(camPos, 0.05);

       // "Detailing" HUD effect
       if (isSelected) {
          meshRef.current.scale.multiplyScalar(1 + Math.sin(time * 30) * 0.005);
       }
    }
    
    // C. DUAL-HAND PINCH (SCALE)
    const g1 = gList[1];
    const hp1 = hpList[1];
    if (hp1 && g0 === 'PINCH' && g1 === 'PINCH' && isSelected) {
       const dist = Math.sqrt((hp0.x-hp1.x)**2 + (hp0.y-hp1.y)**2);
       if (dualHandBaseDistRef.current === null) {
         dualHandBaseDistRef.current = dist;
         dualHandBaseScaleRef.current = meshRef.current.scale.x;
       } else {
         const factor = dist / dualHandBaseDistRef.current;
         meshRef.current.scale.setScalar(dualHandBaseScaleRef.current * factor);
       }
    } else {
       if (dualHandBaseDistRef.current !== null) {
           onTransformCommit(obj.id, { 
             position: meshRef.current.position.clone(),
             quaternion: meshRef.current.quaternion.clone(),
             scale: meshRef.current.scale.clone() 
           });
       }
       dualHandBaseDistRef.current = null;
    }

    // Spin animation
    if (obj.spin) meshRef.current.rotation.y += 1.0 * delta;
  });

  const renderPart = (part, idx) => {
    const PartGeo = makeGeo(part.type.toLowerCase(), part.args || [1,1,1]);
    return (
      <mesh key={idx} position={part.position} scale={part.scale} rotation={part.rotation} castShadow receiveShadow>
        <primitive object={PartGeo} attach="geometry" />
        <meshStandardMaterial 
          color={part.color} 
          wireframe={obj.wireframe} 
          emissive={part.emissive || '#000000'} 
          emissiveIntensity={part.emissiveIntensity || 0} 
        />
      </mesh>
    );
  };

  const renderMeshContent = () => (
    <>
      {isSelected && (
        <mesh visible={false}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="cyan" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      {obj.parts ? (
        <group>{parts.map((p, i) => renderPart(p, i))}</group>
      ) : (
        <mesh castShadow receiveShadow>
          <primitive object={makeGeo(obj.type.toLowerCase(), PRIMITIVES[obj.type]?.args || [1,1,1])} attach="geometry" />
          {isSelected && (gestureRef.current?.[0] === 'PINCH') ? (
            <MeshDistortMaterial 
              color={obj.color} speed={5} distort={0.4} wireframe={obj.wireframe} 
              emissive={orb?.accent || '#22d3ee'} emissiveIntensity={1}
            />
          ) : (
            <meshStandardMaterial color={obj.color} wireframe={obj.wireframe} emissive={obj.emissive} emissiveIntensity={obj.emissiveIntensity} />
          )}
        </mesh>
      )}
    </>
  );

  return (
    <group name={obj.id.toString()} onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}>
      <group ref={meshRef}>
        {renderMeshContent()}
      </group>
      {isSelected && transformMode !== 'grab' && (
        <TransformControls 
           makeDefault
           object={meshRef} 
           mode={transformMode} 
           onMouseUp={() => { if(meshRef.current) onTransformCommit(obj.id, { position: meshRef.current.position.clone(), quaternion: meshRef.current.quaternion.clone(), scale: meshRef.current.scale.clone() }) }} 
        />
      )}
    </group>
  );
});

/* ────────────────── STARK WORKSPACE GRID ────────────────── */
function StarkWorkspace({ accent }) {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();
    // Pulse effect
    meshRef.current.material.opacity = 0.05 + Math.sin(time * 2) * 0.02;
    // Follow hand focus
    meshRef.current.position.y = -2;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial color={accent} wireframe transparent opacity={0.05} />
    </mesh>
  );
}

/* ────────────────── HOLOGRAPHIC HUD COMPONENTS ────────────────── */
function FingertipHUD({ handPosRef, gestureRef, orb }) {
  const groupRefs = [useRef(), useRef()];
  const meshRefs  = [useRef(), useRef()];

  useFrame(() => {
    const hpList = handPosRef.current;
    const gList  = gestureRef.current;
    hpList.forEach((hp, i) => {
      if (!hp || !groupRefs[i].current) return;
      groupRefs[i].current.position.set((hp.x - 0.5) * 14, (0.5 - hp.y) * 10, 0);
      if (meshRefs[i].current) {
        const s = gList[i] === 'PINCH' ? 1.5 : 1;
        meshRefs[i].current.scale.lerp(new THREE.Vector3(s, s, s), 0.2);
      }
    });
  });

  return [0, 1].map(i => (
    <group key={i} ref={groupRefs[i]}>
       <mesh ref={meshRefs[i]}>
         <sphereGeometry args={[0.04, 16, 16]} />
         <meshStandardMaterial color={orb.accent} emissive={orb.accent} emissiveIntensity={3} />
       </mesh>
       <mesh rotation={[Math.PI/2, 0, 0]}>
         <ringGeometry args={[0.08, 0.1, 32]} />
         <meshBasicMaterial color={orb.accent} transparent opacity={0.4} />
       </mesh>
       <mesh rotation={[Math.PI/4, Math.PI/4, 0]}>
         <ringGeometry args={[0.12, 0.13, 32]} />
         <meshBasicMaterial color={orb.accent} transparent opacity={0.2} />
       </mesh>
    </group>
  ));
}

/* ────────────────── TOP TELEMETRY PANEL ────────────────── */
const TopTelemetry = React.memo(({ orb, gestures = [], handPosList = [], confidenceList = [] }) => {
  const g0 = (gestures && gestures[0]) || 'IDLE';
  const c0 = (confidenceList && confidenceList[0]) || 0;
  
  return (
    <div className="stark-top-telemetry">
      <div className="telem-block">
        <div className="telem-label">GESTURE_STATE</div>
        <div className="telem-value" style={{ color: orb.accent }}>{g0}</div>
      </div>
      <div className="telem-divider" />
      <div className="telem-block">
        <div className="telem-label">CONFIDENCE</div>
        <div className="telem-value">{ (c0 * 100).toFixed(1) }%</div>
      </div>
      <div className="telem-divider" />
      <div className="telem-block">
        <div className="telem-label">SYSTEM_LNK</div>
        <div className="telem-value" style={{ color: '#4ade80' }}>STABLE</div>
      </div>
      <div className="telem-graph-area">
        <div className="telem-bar" style={{ height: '40%', opacity: 0.3 }} />
        <div className="telem-bar" style={{ height: '70%', background: orb.accent }} />
        <div className="telem-bar" style={{ height: '20%', opacity: 0.5 }} />
        <div className="telem-bar pulse-anim" style={{ height: '90%', background: orb.accent }} />
      </div>
    </div>
  );
});

function TetherHUD({ handPosRef, selectedObj, orb }) {
  const geomRef = useRef();

  useFrame(() => {
    if (!geomRef.current || !selectedObj) return;
    const hp = handPosRef.current[0];
    if (!hp) {
      geomRef.current.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      return;
    }
    const h3d = new THREE.Vector3((hp.x - 0.5) * 14, (0.5 - hp.y) * 10, 0);
    geomRef.current.setFromPoints([h3d, selectedObj.position]);
  });

  return (
    <line>
      <bufferGeometry ref={geomRef} />
      <lineBasicMaterial color={orb.accent} transparent opacity={0.5} />
    </line>
  );
}

/* ────────────────── VIEWPORT SCENE ────────────────── */
const ViewportScene = React.memo(({ objects, selectedId, onSelect, onDelete, onTransformCommit, transformMode, gestureRef, handPosRef, orb, isGestureEnabled }) => {
  const selectedObj = useMemo(() => objects.find(o => o.id === selectedId), [objects, selectedId]);
  const tcGroupRef  = useRef();

  // Sync transform control target when selection changes
  useEffect(() => {
    if (!tcGroupRef.current || !selectedObj) return;
    tcGroupRef.current.position.copy(selectedObj.position);
    tcGroupRef.current.quaternion.copy(selectedObj.quaternion);
    tcGroupRef.current.scale.copy(selectedObj.scale);
  }, [selectedId]);

    // ── JARVIS INTERACTION GRID ──
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]}  intensity={1.4} castShadow />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#8ab4f8" />
      <pointLight position={[0, 6, 0]} intensity={0.3} />

      <StarkWorkspace accent={orb.accent} />

      <FingertipHUD handPosRef={handPosRef} gestureRef={gestureRef} orb={orb} />

      {selectedObj && (
        <TetherHUD handPosRef={handPosRef} selectedObj={selectedObj} orb={orb} />
      )}

      {transformMode === 'grab' && selectedObj && (
        <FreeGrabHandler obj={selectedObj} onCommit={onTransformCommit} />
      )}

      {objects.map(obj => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={obj.id === selectedId}
          onSelect={onSelect}
          onDelete={() => onDelete(obj.id)}
          onTransformCommit={onTransformCommit}
          gestureRef={gestureRef}
          handPosRef={handPosRef}
          isGestureEnabled={isGestureEnabled}
          orb={orb}
          transformMode={transformMode}
        />
      ))}


      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      <GizmoHelper alignment="bottom-right" margin={[56, 56]}>
        <GizmoViewport axisColors={['#ef4444','#22c55e','#3b82f6']} labelColor="#fff" />
      </GizmoHelper>
    </>
  );
});

/* ════════════════════════════════════════════════════════════
                     MAIN EDITOR PAGE
═════════════════════════════════════════════════════════════ */
export default function Editor() {
  const [selectedOrbId, setSelectedOrbId] = useState('sentinel');
  const [objects,   setObjects]   = useState(() => [freshObject('cube')]);
  const [selectedId, setSelectedId] = useState(1);
  const [transformMode, setTransformMode] = useState('translate');
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [activePanel, setActivePanel] = useState('properties');
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'AetherForge ready. Commands: "generate [type]" · "move up/down/left/right [n]" · "rotate [deg]" · "scale [n]" · "spin on/off" · "delete"' }
  ]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDiagnostic, setIsDiagnostic] = useState(false);
  const [isVisionRunning, setIsVisionRunning] = useState(false);
  const [mockLandmarks, setMockLandmarks] = useState(null);
  const recognitionRef = useRef(null);
  
  // Dragging states for Neural PIP
  const [pipPos, setPipPos] = useState({ x: 20, y: 20 }); 
  const pipRef = useRef(null);
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const pipDragStart = useRef({ startX: 0, startY: 0, initialMouseX: 0, initialMouseY: 0 });

  const handlePipPointerDown = (e) => {
    setIsDraggingPip(true);
    pipDragStart.current = { startX: pipPos.x, startY: pipPos.y, initialMouseX: e.clientX, initialMouseY: e.clientY };
    e.target.setPointerCapture(e.pointerId);
  };
  const handlePipPointerMove = (e) => {
    if (!isDraggingPip) return;
    setPipPos({
      x: pipDragStart.current.startX - (e.clientX - pipDragStart.current.initialMouseX),
      y: pipDragStart.current.startY - (e.clientY - pipDragStart.current.initialMouseY)
    });
  };
  const handlePipPointerUp = (e) => {
    setIsDraggingPip(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const [dockedObject, setDockedObject] = useState(null);
  const [promptDetails, setPromptDetails] = useState('');

  const { 
    videoRef, 
    gestureRef, 
    handPosRef, 
    gestures, 
    landmarksList, 
    handPosList, 
    confidenceList, 
    permissionState, 
    requestCamera, 
    isInitializing,
    frameData
  } = useHands();
  
  // HUD Link: Map the primary hand's data for singular HUD components
  const gesture    = gestures[0];
  const handPos    = handPosList[0];
  const confidence = confidenceList[0];

  // STARK_LINK: Core state for gesture-driven creation
  const [ghostObject, setGhostObject] = useState({ type: 'cube', parts: null }); 
  const creationCooldownRef = useRef(0);
  const { generateFromPython, isSynthesizing: isAISynthesizing } = useAIEngine();


  // Internal state to override useHands during diagnostics
  const [activeGesture, setActiveGesture] = useState('NONE');
  const [activeHandPos, setActiveHandPos] = useState({ x: 0.5, y: 0.5 });
  const [isSynthesizing, setIsSynthesizing] = useState(false); // Local state for synthesis UI
  
  useEffect(() => {
    if (!isDiagnostic) {
      setActiveGesture(gestures[0] || 'NONE');
      setActiveHandPos(handPosList[0] || { x: 0.5, y: 0.5 });
    }
  }, [gestures, handPosList, isDiagnostic]);

  useEffect(() => {
    const saved = localStorage.getItem('selectedOrbId');
    if (saved && ORBS[saved]) setSelectedOrbId(saved);
  }, []);

  const orb         = ORBS[selectedOrbId] || ORBS.sentinel;
  const selectedObj = useMemo(() => objects.find(o => o.id === selectedId), [objects, selectedId]);

  /* ── Helpers ── */
  const updateSelected = useCallback((updates) => {
    setObjects(prev => prev.map(o => o.id === selectedId ? { ...o, ...updates } : o));
  }, [selectedId]);

  const setNumProp = useCallback((component, axis, val) => {
    const idx = { x:0, y:1, z:2 }[axis];
    setObjects(prev => prev.map(o => {
      if (o.id !== selectedId) return o;
      const v = o[component].clone();
      if (component === 'position') v.setComponent(idx, parseFloat(val)||0);
      else if (component === 'scale') v.setComponent(idx, parseFloat(val)||0.01);
      return { ...o, [component]: v };
    }));
  }, [selectedId]);

  const setRotDeg = useCallback((axis, deg) => {
    const idx = { x:0, y:1, z:2 }[axis];
    setObjects(prev => prev.map(o => {
      if (o.id !== selectedId) return o;
      const euler = new THREE.Euler().setFromQuaternion(o.quaternion);
      const arr   = euler.toArray();
      arr[idx]    = ((parseFloat(deg)||0) * Math.PI) / 180;
      const q     = new THREE.Quaternion().setFromEuler(new THREE.Euler(...arr.slice(0,3)));
      return { ...o, quaternion: q };
    }));
  }, [selectedId]);

  /* ── Add object ── */
  const addObject = useCallback((primKey) => {
    const obj = freshObject(primKey);
    obj.position = new THREE.Vector3((Math.random()-0.5)*2, 0, (Math.random()-0.5)*2);
    setObjects(prev => [...prev, obj]);
    setSelectedId(obj.id);
    setShowAddPanel(false);
  }, []);

  /* ── Delete ── */
  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setObjects(prev => {
      const next = prev.filter(o => o.id !== selectedId);
      setSelectedId(next[0]?.id ?? null);
      return next;
    });
  }, [selectedId]);

  /* ── Commit drag-transform from TransformControls ── */
  const commitTransform = useCallback((id, { position, quaternion, scale }) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, position, quaternion, scale } : o));
  }, []);

  const handleDuplicate = useCallback(() => {
    if (!selectedObj) return;
    const clone = {
      ...freshObject(selectedObj.type),
      position:   selectedObj.position.clone().add(new THREE.Vector3(1, 0, 1)),
      quaternion: selectedObj.quaternion.clone(),
      scale:      selectedObj.scale.clone(),
      color:      selectedObj.color,
      wireframe:  selectedObj.wireframe,
      spin:       selectedObj.spin,
    };
    setObjects(prev => [...prev, clone]);
    setSelectedId(clone.id);
  }, [selectedObj]);

  /* ── Gesture toggle ── */
  const toggleGestures = useCallback(async () => {
    if (!isGestureEnabled) { await requestCamera(); }
    setIsGestureEnabled(v => !v);
  }, [isGestureEnabled, requestCamera]);

  /* ── Animation loop (spin) ── */
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setFrame(f => f + 1), 16);
    return () => clearInterval(id);
  }, [isPlaying]);

  /* ── AI command parser ── */
  const handleAI = useCallback(async (msg) => {
    const p = msg.toLowerCase();
    const n = parseFloat(p.match(/[\d.]+/)?.[0]) || 1;

    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);

    // 1. COMPLEX SYNTHESIS (Python Backend)
    if (/generate|create|make|add|vision|scan/i.test(p) && (p.includes("camera") || p.includes("vision") || p.includes("drone") || p.includes("tree") || p.includes("building") || p.includes("tower") || p.split(' ').length > 2)) {
      setIsGenerating(true);
      const useCamera = p.includes("camera") || p.includes("vision") || p.includes("scan");
      const data = await generateFromPython(p, orb.accent, useCamera);
      if (data) {
        setObjects(prev => [...prev, data]);
        setSelectedId(data.id);
        const source = useCamera ? 'Rodin Vision Engine' : 'Python Neural Engine';
        setChatHistory(prev => [...prev, { role:'assistant', content:`✓ ${source} synthesized: ${data.name}` }]);
      }
      setIsGenerating(false);
      return;
    }

    // 2. PRIMITIVE GENERATION (Local)
    if (/generate|create|make|add/i.test(p)) {
      setIsGenerating(true);
      let key = 'cube';
      Object.keys(PRIMITIVES).forEach(k => { if (p.includes(k)) key = k; });
      if (p.includes('ball'))   key = 'sphere';
      if (p.includes('ring'))   key = 'torus';
      
      const template = MODEL_TEMPLATES[key.toUpperCase()];
      const newObj = freshObject(key);
      if (template) {
        newObj.parts = template(orb.accent).parts;
        newObj.name = template(orb.accent).name;
      }

      setTimeout(() => {
        setObjects(prev => [...prev, newObj]);
        setSelectedId(newObj.id);
        setIsGenerating(false);
        setChatHistory(prev => [...prev, { role:'assistant', content:`✓ ${newObj.name} added to scene.` }]);
      }, 800);
      return;
    }

    // 3. DETAILING (Shadows, Glow, Materials)
    if (selectedId) {
      const updates = {};
      if (/shadow/i.test(p)) updates.castShadow = !/off|remove/i.test(p);
      if (/glow|emissive/i.test(p)) {
        updates.emissive = orb.accent;
        updates.emissiveIntensity = /off/i.test(p) ? 0 : 2;
      }
      if (/metal|chrome/i.test(p)) {
        updates.metalness = 1;
        updates.roughness = 0.1;
      }
      if (/plastic|matte/i.test(p)) {
        updates.metalness = 0;
        updates.roughness = 0.8;
      }
      if (/color|make it/i.test(p)) {
        const colors = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', white: '#ffffff', black: '#111111' };
        Object.entries(colors).forEach(([name, hex]) => {
          if (p.includes(name)) updates.color = hex;
        });
      }

      if (Object.keys(updates).length > 0) {
        updateSelected(updates);
        setChatHistory(prev => [...prev, { role:'assistant', content:'✓ Detailing applied to active selection.' }]);
        return;
      }
    }

    if (/move|translate/i.test(p) && selectedId) {
      setObjects(prev => prev.map(o => {
        if (o.id !== selectedId) return o;
        const pos = o.position.clone();
        if (/up/i.test(p))    pos.y += n;
        if (/down/i.test(p))  pos.y -= n;
        if (/left/i.test(p))  pos.x -= n;
        if (/right/i.test(p)) pos.x += n;
        if (/forward/i.test(p)) pos.z -= n;
        if (/back/i.test(p))  pos.z += n;
        return { ...o, position: pos };
      }));
      setChatHistory(prev => [...prev, { role:'assistant', content:`✓ Moved.` }]);
      return;
    }
    if (/rotate/i.test(p) && selectedId) {
      const axis = /x/i.test(p) ? 'x' : /z/i.test(p) ? 'z' : 'y';
      const deg  = parseFloat(p.match(/[\d.]+/)?.[0]) || 45;
      setRotDeg(axis, deg + (selectedObj ? new THREE.Euler().setFromQuaternion(selectedObj.quaternion)[axis] * 180/Math.PI : 0));
      setChatHistory(prev => [...prev, { role:'assistant', content:`✓ Rotated ${axis.toUpperCase()} by ${deg}°.` }]);
      return;
    }
    if (/scale|resize/i.test(p) && selectedId) {
      setObjects(prev => prev.map(o => o.id !== selectedId ? o : { ...o, scale: new THREE.Vector3(n, n, n) }));
      setChatHistory(prev => [...prev, { role:'assistant', content:`✓ Scale set to ${n}.` }]);
      return;
    }
    if (/spin on/i.test(p)) { updateSelected({ spin:true });  setChatHistory(prev=>[...prev,{role:'assistant',content:'✓ Spin enabled.'}]); return; }
    if (/spin off/i.test(p)){ updateSelected({ spin:false }); setChatHistory(prev=>[...prev,{role:'assistant',content:'✓ Spin stopped.'}]); return; }
    if (/delete|remove/i.test(p)) { deleteSelected(); setChatHistory(prev=>[...prev,{role:'assistant',content:'✓ Deleted.'}]); return; }
    if (/wireframe on/i.test(p)) { updateSelected({ wireframe:true }); return; }
    if (/wireframe off/i.test(p)){ updateSelected({ wireframe:false }); return; }

    setChatHistory(prev => [...prev, { role:'assistant', content:'Commands: generate [type] · move up/down/left/right/forward/back [n] · rotate [axis] [deg] · scale [n] · spin on/off · wireframe on/off · delete' }]);
  }, [selectedId, selectedObj, updateSelected, deleteSelected, setRotDeg, addObject]);

  // --- SPATIAL AIR DRAWING MONITOR ---
  useEffect(() => {
    const handleDrawn = (e) => {
       const shape = e.detail;
       if (Date.now() > creationCooldownRef.current) {
          addObject(shape);
          setChatHistory(prev => [...prev, { role: 'assistant', content: `Protocol: Air-Drawn Geometry Detected. Instantiating ${shape.toUpperCase()} Matrix.` }]);
          creationCooldownRef.current = Date.now() + 2000;
       }
    };
    window.addEventListener('stark:drawn', handleDrawn);
    return () => window.removeEventListener('stark:drawn', handleDrawn);
  }, [addObject]);

  // PUSH-TO-CREATE MONITOR (Stark Spatial Protocol)
  useEffect(() => {
     const interval = setInterval(() => {
        if (!isGestureEnabled) return;
        const h0 = handPosRef.current[0];
        
        // Detection Logic: High-velocity PUSH or THUMBS_UP gesture
        const isPushing = h0 && h0.v > 50; 
        const isCreating = isPushing;

        // UI COMMANDS VIA GESTURES
        if (gestures[0] === 'THUMBS_UP' && !showAddPanel && Date.now() > creationCooldownRef.current) {
           setShowAddPanel(true);
           setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol Initiated: Accessing Mesh Primitives.' }]);
           creationCooldownRef.current = Date.now() + 2000;
        }

        if (gestures[0] === 'PEACE' && Date.now() > creationCooldownRef.current) {
          if (selectedId) {
             setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol Engaged: Analyzing Geometry for Neural Refinement...' }]);
             // Simulate "detailing" by slightly randomized scaling of parts or calling vision
             updateSelected({ scale: selectedObj.scale.clone().multiplyScalar(1.1) });
             creationCooldownRef.current = Date.now() + 1000;
          } else {
             handleVisionAI();
             creationCooldownRef.current = Date.now() + 5000;
          }
        }

        // NEW STARK GESTURES
        if (gestures[0] === 'ROCK_ON' && selectedObj && Date.now() > creationCooldownRef.current) {
          updateSelected({ wireframe: !selectedObj.wireframe });
          setChatHistory(prev => [...prev, { role: 'assistant', content: `Protocol: Telemetry Wireframe ${!selectedObj.wireframe ? 'Engaged' : 'Dismissed'}.` }]);
          creationCooldownRef.current = Date.now() + 1000;
        }

        if (gestures[0] === 'PALM' && Date.now() > creationCooldownRef.current) {
          setSelectedId(null);
          setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: Global Selection Flush.' }]);
          creationCooldownRef.current = Date.now() + 1500;
        }

        if (gestures[0] === 'POINT' && !selectedObj) {
           // Proximity selection logic in SceneObject handles the selection if pointed
        }

        if (gestures[0] === 'L_SIGN' && Date.now() > creationCooldownRef.current) {
          setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: JARVIS UI System Reboot.' }]);
          creationCooldownRef.current = Date.now() + 2000;
        }

        // --- INSTANT SHAPE GESTURES ---
        if (Date.now() > creationCooldownRef.current) {
          const spawnPos = new THREE.Vector3((h0.x - 0.5) * 14, (0.5 - h0.y) * 10, -5);
          
          if (gestures[0] === 'C_SIGN') {
             addObject('box');
             setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: Cubic Matrix Manifested.' }]);
             creationCooldownRef.current = Date.now() + 1500;
          } else if (gestures[0] === 'O_SIGN') {
             addObject('sphere');
             setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: Spherical Core Synthesized.' }]);
             creationCooldownRef.current = Date.now() + 1500;
          } else if (gestures[0] === 'T_SIGN') {
             addObject('torus');
             setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: Toroidal Geometry Synchronized.' }]);
             creationCooldownRef.current = Date.now() + 1500;
          } else if (gestures[0] === 'GUN' && selectedId) {
             // Explode effect logic
             updateSelected({ animation: 'EXPLODE' });
             setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: Kinetic Disruption Initialized.' }]);
             creationCooldownRef.current = Date.now() + 2000;
          } else if (gestures[0] === 'OK' && !selectedId) {
             // Auto-select nearest
             setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: Analysis Context Locked.' }]);
             creationCooldownRef.current = Date.now() + 1000;
          } else if (gestures[0] === 'THUMBS_UP') {
             // Zoom In (Perspective adjust)
             setChatHistory(prev => [...prev, { role: 'assistant', content: 'Protocol: Magnifying Spatial Grid.' }]);
             creationCooldownRef.current = Date.now() + 500;
          }
        }

        if (isCreating && Date.now() > creationCooldownRef.current) {
           setIsSynthesizingLocal(true);
           setTimeout(() => setIsSynthesizingLocal(false), 1000);
           
           const obj = freshObject(ghostObject.type);
           const spawnPos = new THREE.Vector3((h0.x - 0.5) * 14, (0.5 - h0.y) * 10, -5);
           
           const newObj = { 
             ...obj, 
             position: spawnPos,
             parts: ghostObject.parts ? JSON.parse(JSON.stringify(ghostObject.parts)) : null, 
             name: ghostObject.name || 'AI_SPATIAL_SPAWN',
             animation: 'PULSE'
           };
           
           setObjects(prev => [...prev, newObj]);
           setSelectedId(newObj.id);
           creationCooldownRef.current = Date.now() + 1200; 
        }
     }, 50);
     return () => clearInterval(interval);
  }, [isGestureEnabled, gestures, ghostObject, addObject]);

  /* ── External Command Link ── */
  useEffect(() => {
    const onExtAI = (e) => {
      const { action, type, color } = e.detail;
      if (action === 'ANIMATE') updateSelected({ spin: type === 'SPIN' });
      if (action === 'MATERIAL') updateSelected({ color });
      if (action === 'PROCESSING') setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 2000);
    };
    window.addEventListener('aether-ai-command', onExtAI);
    return () => window.removeEventListener('aether-ai-command', onExtAI);
  }, [updateSelected]);

  /* ── Voice Assistant Initialization ── */
  useEffect(() => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Speech) {
      const recognition = new Speech();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setChatHistory(prev => [...prev, { role:'user', content: transcript }]);
        handleAI(transcript);
        setIsVoiceActive(false);
      };
      recognition.onerror = () => setIsVoiceActive(false);
      recognition.onend = () => setIsVoiceActive(false);
      recognitionRef.current = recognition;
    }
  }, [handleAI]);

  const toggleVoice = useCallback(() => {
    if (isVoiceActive) {
      recognitionRef.current?.stop();
      setIsVoiceActive(false);
    } else {
      recognitionRef.current?.start();
      setIsVoiceActive(true);
      setIsProcessing(true); // Pulse while listening
    }
  }, [isVoiceActive]);

  /* ── Diagnostic Link Test ── */
  const runDiagnostic = useCallback(() => {
    if (isDiagnostic) return;
    setIsDiagnostic(true);
    setIsGestureEnabled(true);
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const x = 0.5 + Math.sin(frame * 0.1) * 0.2;
      const y = 0.5 + Math.cos(frame * 0.1) * 0.2;
      // Simulate landmark 8 (index tip)
      const mock = Array.from({length:21}, (_, i) => ({ x: 0.5, y: 0.5, z: 0 }));
      mock[8] = { x, y, z: 0 };
      setMockLandmarks(mock);
      setActiveGesture('PINCH');
      setActiveHandPos({ x, y });
      gestureRef.current = 'PINCH'; // Force ref for SceneObject
      
      if (frame > 100) {
        clearInterval(interval);
        setIsDiagnostic(false);
        setMockLandmarks(null);
      }
    }, 50);
  }, [isDiagnostic]);

  /* ── Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (key === 'G') setTransformMode('translate');
      if (key === 'R') setTransformMode('rotate');
      if (key === 'S') setTransformMode('scale');
      if (key === 'F') setTransformMode('grab');
      if (key === 'X' || key === 'DELETE') deleteSelected();
      if (key === 'W') updateSelected({ wireframe: !selectedObj?.wireframe });
      if (key === 'H') updateSelected({ visible: !selectedObj?.visible });
      if (e.shiftKey && key === 'A') setShowAddPanel(true);
      if (e.shiftKey && key === 'D') handleDuplicate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedObj, deleteSelected, updateSelected, handleDuplicate]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatHistory(prev => [...prev, { role:'user', content:msg }]);
    setChatInput('');
    handleAI(msg);
  };

  const handleVisionAI = useCallback(async () => {
    setIsGenerating(true);
    setChatHistory(prev => [...prev, { role:'assistant', content:'Initiating Spatial Vision Scan via Rodin AI...' }]);
    
    // Call the Python backend with use_camera=true
    const data = await generateFromPython("Analyze vision input", orb.accent, true);
    
    if (data) {
      setObjects(prev => [...prev, data]);
      setSelectedId(data.id);
      setChatHistory(prev => [...prev, { role:'assistant', content: `✓ Rodin Synthesis Protocol complete: ${data.name} generated.` }]);
    } else {
      setChatHistory(prev => [...prev, { role:'assistant', content: '⚠ Vision Scan failed. Ensure Python server is online.' }]);
    }
    setIsGenerating(false);
  }, [generateFromPython, orb.accent]);

  /* ── Euler from selected quaternion ── */
  const selEuler = useMemo(() => {
    if (!selectedObj) return new THREE.Euler();
    return new THREE.Euler().setFromQuaternion(selectedObj.quaternion);
  }, [selectedObj]);

  return (
    <div className="editor-root" style={{ "--orb-accent": orb.accent }}>

      {/* Neural Monitor PIP will be handled inside the viewport section */}

      {/* ── TOP HEADER ── */}
      <header className="ed-global-header">
        <div className="ed-brand-side">
          <div className="ed-logo-hex"><Cpu size={13}/></div>
          <span className="ed-brand-name">AetherForge</span>
        </div>

        <div className="transform-mode-bar">
          {[
            { mode:'translate', icon: Move,          label:'Grab',   key:'G' },
            { mode:'rotate',    icon: RotateCw,       label:'Rotate', key:'R' },
            { mode:'scale',     icon: Maximize,       label:'Scale',  key:'S' },
            { mode:'grab',      icon: Hand,           label:'Free',   key:'F' },
          ].map(({ mode, icon: Icon, label, key }) => (
            <button key={mode} className={`tm-btn ${transformMode===mode?'active':''}`}
              onClick={()=>setTransformMode(mode)} title={`${label} (${key})`}>
              <Icon size={14}/><span>{label}</span><span className="tm-key">{key}</span>
            </button>
          ))}
          <div className="tm-sep"/>
          <button className="tm-btn accent" onClick={()=>setShowAddPanel(v=>!v)}>
            <Plus size={14}/><span>Add Mesh</span>
          </button>
          <button className="tm-btn danger" onClick={deleteSelected} disabled={!selectedId}>
            <Trash2 size={14}/><span>Delete</span>
          </button>
          <button className="tm-btn" onClick={handleDuplicate} disabled={!selectedId}>
            <Copy size={14}/><span>Duplicate</span>
          </button>
        </div>

        <div className="ed-header-right">
          <div className="header-telemetry">
            <Activity size={10} style={{color:orb.accent}}/>
            <span>NEURAL_LINK: ACTIVE</span>
          </div>
          <div className="header-telemetry">
            <span className={`cam-dot ${permissionState}`}/>
            <span>CAM: {permissionState.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <main className="ed-main-container">

        {/* ── LEFT BLENDER TOOL SHELF ── */}
        <aside className="ed-tool-shelf">
          <div className="shelf-section-label">SELECT</div>
          <ToolBtn icon={MousePointer2} active={transformMode==='translate'} label="Select / Move" sub="G" onClick={()=>setTransformMode('translate')} accent={orb.accent} />

          <div className="shelf-section-label">TRANSFORM</div>
          <ToolBtn icon={Move}     active={transformMode==='translate'} label="Grab / Move" sub="G" onClick={()=>setTransformMode('translate')} accent={orb.accent} />
          <ToolBtn icon={RotateCw} active={transformMode==='rotate'}    label="Rotate"      sub="R" onClick={()=>setTransformMode('rotate')}    accent={orb.accent} />
          <ToolBtn icon={Maximize} active={transformMode==='scale'}     label="Scale"       sub="S" onClick={()=>setTransformMode('scale')}     accent={orb.accent} />

          <div className="shelf-section-label">AI PROTOCOL</div>
          <div style={{ height: '80px', position: 'relative', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {/* Unified Assistant Orb Preview */}
             <div className={`status-orb-css ${isVoiceActive ? 'active' : ''}`} style={{ 
               width: '40px', 
               height: '40px', 
               borderRadius: '50%', 
               background: orb.accent,
               boxShadow: `0 0 20px ${orb.accent}`,
               animation: isProcessing ? 'pulse 1s infinite' : 'none'
             }} />
          </div>
          
          <div className="shelf-section-label">NEURAL SELECTOR</div>
          <div className="orb-selection-grid">
            {Object.entries(ORBS).map(([id, o]) => (
              <div 
                key={id} 
                className={`orb-selection-item ${selectedOrbId === id ? 'active' : ''}`}
                onClick={() => setSelectedOrbId(id)}
                title={o.name}
              >
                 <div className="orb-preview-container" style={{ background: o.accent + '22', borderRadius: '50%', width: '100%', height: '100%', border: `1px solid ${o.accent}44` }}>
                    {/* Replaced per-item Canvas with CSS preview to save WebGL contexts */}
                    <div className="orb-preview-glow" style={{ boxShadow: `0 0 15px ${o.accent}` }} />
                 </div>
              </div>
            ))}
          </div>

           <ToolBtn 
            icon={Bot} 
            label="Vision" 
            active={isVisionRunning || (gestureRef.current && gestureRef.current[0] === 'PEACE')}
            onClick={handleVisionAI}
          />

          <div className="shelf-section-label">MESH</div>
          <ToolBtn icon={Plus}     label="Add Mesh"   sub="⇧A" onClick={()=>setShowAddPanel(v=>!v)}     accent={orb.accent} />
          <ToolBtn icon={Copy}     label="Duplicate"  sub="⇧D" onClick={handleDuplicate}     accent={orb.accent} />
          <ToolBtn icon={Trash2}   label="Delete"     sub="X"  onClick={deleteSelected} danger tinyLabel="DEL"  accent={orb.accent} />

          <div className="shelf-section-label">OBJECT</div>
          <ToolBtn icon={Eye}   label="Hide/Show" sub="H" onClick={()=>updateSelected({visible:!selectedObj?.visible})} accent={orb.accent} />
          <ToolBtn icon={CopyCheck} label="Wireframe" sub="W" onClick={()=>updateSelected({wireframe:!selectedObj?.wireframe})} active={selectedObj?.wireframe} accent={orb.accent} />
          <ToolBtn icon={Film} label={dockedObject && dockedObject.id === selectedId ? "Undock" : "Holo-Dock"} sub="PIP" active={dockedObject?.id === selectedId} onClick={()=>{
             if(dockedObject && dockedObject.id === selectedId) setDockedObject(null);
             else if (selectedObj) setDockedObject(selectedObj);
          }} accent={orb.accent} />

          <div className="shelf-spacer"/>
          <div className="shelf-section-label">AI PROTOCOL</div>
          <div style={{ height: '60px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={`status-orb-css ${isVoiceActive ? 'active' : ''}`} style={{ 
               width: '30px', 
               height: '30px', 
               borderRadius: '50%', 
               background: orb.accent,
               boxShadow: `0 0 20px ${orb.accent}`,
               animation: isProcessing ? 'pulse 1s infinite' : 'none'
             }} />
          </div>
          <ToolBtn 
            icon={Bot} 
            label="Vision Scan" 
            sub="RODIN" 
            onClick={handleVisionAI} 
            accent={orb.accent} 
          />

          <div className="shelf-section-label">SPATIAL</div>
          <ToolBtn icon={Hand} active={isGestureEnabled} label="Gesture" sub="CAM" onClick={toggleGestures} accent={orb.accent} danger={permissionState==='denied'} />
          
          {/* Removed shelf-monitor-container from here to move to PIP window */}
        </aside>

        {/* ── CENTRAL VIEWPORT ── */}
        <section className="ed-viewport-section">

          {/* Viewport top bar */}
          <div className="viewport-header">
            <div className="viewport-menu">
              <span className="menu-active">Object Mode</span>
              <span>View</span><span>Select</span><span>Add</span><span>Object</span>
              <span style={{color: isGestureEnabled ? orb.accent : 'rgba(255,255,255,0.2)'}}>
                {isGestureEnabled ? `✦ GESTURE: ${gestures[0] || 'IDLE'}` : 'Gesture: Off'}
              </span>
            </div>
          </div>

          {/* ADD MESH PANEL */}
          {/* MESH PANEL - Simplified for stability */}
          {showAddPanel && (
            <div className="add-object-panel glass-panel">
              <div className="aop-header">
                <span className="aop-title">ADD MESH PRIMITIVE</span>
                <button className="aop-close" onClick={()=>setShowAddPanel(false)}>✕</button>
              </div>
              <div className="aop-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {Object.entries(PRIMITIVES).map(([key, p]) => (
                  <button key={key} className="aop-item" onClick={()=>addObject(key)}
                    style={{borderColor: p.color+'44'}}>
                    <span className="aop-icon" style={{color: p.color}}>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── HOLOGRAM OVERLAY ── */}
          {isGestureEnabled && permissionState === 'granted' && !isInitializing && (
            <>
              <TopTelemetry orb={orb} gestures={gestures} handPosList={handPosList} confidenceList={confidenceList} />
              <div className="viewport-hologram-overlay">
                {landmarksList.map((hand, i) => (
                  <HandHUD key={i} landmarks={hand} accent={orb.accent} gesture={gestures[i]} confidence={confidenceList[i]} isSecondary={i > 0} />
                ))}
                <StarkHUD accent={orb.accent} handPos={handPosList[0]} gesture={gestures[0]} confidence={confidenceList[0]} />
              </div>
            </>
          )}

          {/* ── REAL THREE.JS CANVAS ── */}
          <div className="viewport-canvas-area">
            <AnimatePresence>
              {(isGenerating || isAISynthesizing || isSynthesizingLocal) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="generation-overlay"
                  key="gen-overlay"
                >
                  <motion.div className="loader-ring"
                    animate={{rotate:360}}
                    transition={{repeat:Infinity,duration:0.8,ease:'linear'}}
                    style={{borderTopColor:orb.accent}}/>
                  <span className="loader-text">GENERATING...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Canvas
              shadows
              dpr={[1, 2]}
              gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
              camera={{ position:[0, 2, 10], fov:50 }}
              style={{width:'100%',height:'100%', background:'transparent'}}
              onCreated={({gl}) => { 
                gl.setClearColor(0x000000, 0); 
              }}
            >
              <Suspense fallback={null}>
                <Environment preset="city" />
                <ARBackground videoRef={videoRef} isEnabled={isGestureEnabled} frameData={frameData} />
                
                <ViewportScene
                  objects={objects}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onDelete={deleteSelected}
                  onTransformCommit={commitTransform}
                  transformMode={transformMode}
                  gestureRef={gestureRef}
                  handPosRef={handPosRef}
                  isGestureEnabled={isGestureEnabled}
                  orb={orb}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Overlays */}
            {permissionState === 'denied' && (
              <div className="stark-error-msg">
                <AlertCircle size={13}/> Camera denied — check browser settings
              </div>
            )}
            {isInitializing && (
              <div className="gesture-status-float" style={{borderColor: orb.accent+'44'}}>
                <span className="animate-pulse" style={{color:orb.accent}}>INITIALIZING SPATIAL LINK...</span>
              </div>
            )}
            


            {/* User Guidance Overlay */}
            {isGestureEnabled && permissionState === 'granted' && !selectedId && (
              <div className="stark-hint-msg" style={{color: orb.accent}}>
                <BoxIcon size={14}/> Select an object to manipulate with gestures
              </div>
            )}
            {isGestureEnabled && permissionState === 'granted' && !landmarksList[0] && (
              <div className="stark-hint-msg" style={{top: '120px', color: '#fca5a5'}}>
                <Hand size={14}/> Waiting for hand... (Move hand closer to camera)
              </div>
            )}

            {/* ── STARK NEURAL MONITOR PIP ── */}
            <div className={`stark-monitor-pip ${isGestureEnabled ? 'active' : ''}`} 
                 ref={pipRef}
                 style={{"--orb-accent": orb.accent, right: pipPos.x + 'px', bottom: pipPos.y + 'px', position: 'absolute', cursor: isDraggingPip ? 'grabbing' : 'default'}}>
              <div className="pip-header" onPointerDown={handlePipPointerDown} onPointerMove={handlePipPointerMove} onPointerUp={handlePipPointerUp} onPointerCancel={handlePipPointerUp} style={{cursor: 'grab'}}>
                <div className="pip-signal">
                   <div className="pip-dot pulse" />
                   <span>NEURAL_LINK_085</span>
                </div>
                <div className="signal-bars">
                  {[1,2,3,4,5].map(i => <div key={i} className={`sig-bar ${i<4?'active':''}`} />)}
                </div>
              </div>
              <div className="pip-content">
                {frameData ? (
                  <img src={frameData} className="pip-video" alt="Neural Feed" />
                ) : (
                  <div className="pip-placeholder">
                    <Camera size={32} opacity={0.2} />
                    <span>LINKING_SENSORS...</span>
                  </div>
                )}
                {dockedObject && (
                   <div className="pip-docked-hologram" style={{position:'absolute', inset: 0, zIndex: 25}}>
                     <Canvas gl={{alpha:true}} camera={{position:[0,0,5]}}>
                        <ambientLight intensity={1}/>
                        <pointLight position={[5,5,5]} intensity={2} color={orb.accent}/>
                        <group rotation={[frame * 0.02, frame * 0.03, 0]}>
                           <SceneObject 
                             obj={dockedObject} 
                             isSelected={false} 
                             onSelect={()=>{}} 
                             onDelete={()=>{}} 
                             onTransformCommit={()=>{}} 
                             orb={orb}
                             gestureRef={gestureRef}
                             handPosRef={handPosRef}
                             isGestureEnabled={isGestureEnabled}
                           />
                        </group>
                        <Environment preset="city"/>
                     </Canvas>
                   </div>
                )}
                <div className="pip-status-overlay">
                   <span className="status-label">SYS_READY</span>
                   <span className="status-gesture">{gestures[0] || 'IDLE'}</span>
                </div>
                <div className="holographic-pip-overlay">
                  {/* Miniature Hand HUD in PIP */}
                  {landmarksList[0] && (
                    <HandHUD landmarks={landmarksList[0]} accent={orb.accent} gesture={gestures[0]} confidence={confidenceList[0]} isMini />
                  )}
                </div>
              </div>
              <div className="pip-footer" style={{ height: '4px', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                 <div className="pip-footer-fill" style={{ width: (confidenceList[0]*100)+'%', background: orb.accent, height: '100%', transition: 'width 0.1s' }} />
              </div>
            </div>

          {/* TIMELINE */}
          <div className="timeline-zone">
            <button className="tl-play-btn" onClick={()=>setIsPlaying(v=>!v)}
              style={{color:orb.accent}}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <span className="tl-frame">{String(frame).padStart(4,'0')}</span>
            <div className="timeline-ticker">
              {Array.from({length:32}).map((_,i)=>(
                <div key={i} className={`tick ${i===frame%32?'current':''}`}
                  style={{height:i%8===0?'10px':'4px', background: i===frame%32?orb.accent:undefined}}/>
              ))}
            </div>
            <button className="tl-key-btn" onClick={()=>{
              if(!selectedObj) return;
              updateSelected({ keyframes:[...(selectedObj.keyframes||[]),{
                frame,
                position:  selectedObj.position.toArray(),
                scale:     selectedObj.scale.toArray(),
                quaternion:selectedObj.quaternion.toArray(),
              }]});
            }}>◆ Keyframe</button>
          </div>
        </section>

        {/* ── RIGHT N-PANEL ── */}
        <aside className="ed-sidebar">

          {/* AI CORE (CSS orb — no second Canvas!) */}
          <div className="assistant-core-panel">
            <div className="sidebar-3d-orb-container" style={{height: 100, position:'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
               <div className={`status-orb-css ${isProcessing || isVoiceActive ? 'active' : ''}`} style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: orb.accent,
                boxShadow: `0 0 30px ${orb.accent}`,
                animation: isProcessing ? 'pulse 0.8s infinite' : 'none'
              }} />
              <div className="core-info-overlay" style={{ textAlign: 'center', marginTop: 10 }}>
                <h2 className="core-title" style={{ fontSize: '10px', color: orb.accent, fontStyle: 'italic' }}>{orb.name}</h2>
                <div className="core-subtitle" style={{ fontSize: '8px', opacity: 0.5 }}>{orb.personality}</div>
              </div>
            </div>
            <div className="core-actions">
              <button className={`stark-btn-action ${isGestureEnabled?'active':''}`}
                style={isGestureEnabled?{background:orb.accent,color:'#000',borderColor:'transparent'}:{}}
                onClick={toggleGestures}>
                <Hand size={14}/><span>{isGestureEnabled?'SUSPEND':'ENGAGE HANDS'}</span>
              </button>
              <button 
                className={`stark-btn-action ${isVoiceActive ? 'active' : ''}`}
                onClick={toggleVoice}
                style={isVoiceActive ? { background: '#f87171', color: '#000' } : {}}
              >
                <Mic size={14}/><span>{isVoiceActive ? 'LISTENING...' : 'VOICE'}</span>
              </button>
              <button 
                className={`stark-btn-action ${isDiagnostic ? 'active' : ''}`}
                onClick={runDiagnostic}
                style={isDiagnostic ? { borderColor: '#4ade80', color: '#4ade80', flex: '1 1 100%' } : { flex: '1 1 100%' }}
              >
                <Activity size={14}/><span>{isDiagnostic ? 'VERIFYING...' : 'RUN DIAGNOSTIC'}</span>
              </button>
            </div>
          </div>

          <div className="sidebar-divider"/>

          {/* PANEL TABS */}
          <div className="panel-tabs">
            {[
              { id:'properties', icon:'⚙', label:'Properties' },
              { id:'outliner',   icon:'☰', label:'Outliner' },
              { id:'animation',  icon:'▶', label:'Animation' },
            ].map(({id,icon,label}) => (
              <button key={id} className={`ptab ${activePanel===id?'active':''}`}
                onClick={()=>setActivePanel(id)}>
                <span>{icon}</span><span>{label}</span>
              </button>
            ))}
          </div>

          {/* PROPERTIES */}
          {activePanel==='properties' && (
            <div className="properties-body">
              {!selectedObj ? (
                <div className="no-selection">No object selected</div>
              ) : (
                <>
                  <div className="prop-section-title">TRANSFORM</div>
                  <VecInput label="Location" obj={selectedObj} prop="position" onChange={setNumProp} />
                  <RotInput label="Rotation" euler={selEuler} onChange={setRotDeg} />
                  <VecInput label="Scale"    obj={selectedObj} prop="scale"    onChange={setNumProp} />

                  <div className="prop-section-title">PROMPT-TO-3D SYNTHESIS</div>
                  <div className="prop-numrow" style={{flexDirection:'column', alignItems:'stretch', gap:'6px'}}>
                    <input type="text" value={promptDetails} onChange={e=>setPromptDetails(e.target.value)}
                      placeholder='e.g. Plasma Gun, Black Hole' className="prop-num-input" style={{width:'100%'}}/>
                    <button className="anim-btn" style={{background:orb.accent,color:'#000'}} onClick={() => {
                        if(!promptDetails) return;
                        handleAI("generate " + promptDetails);
                        setPromptDetails('');
                    }}>
                      GENERATE 3D
                    </button>
                  </div>

                  <div className="prop-section-title">MATERIAL DETAILS</div>
                  <div className="prop-numrow">
                    <span className="prop-label">Base Color</span>
                    <input type="color" value={selectedObj.color}
                      onChange={e=>updateSelected({color:e.target.value})}
                      className="prop-color-input"/>
                  </div>
                  <div className="prop-numrow">
                    <span className="prop-label">Wireframe</span>
                    <button className={`prop-toggle ${selectedObj.wireframe?'on':''}`}
                      onClick={()=>updateSelected({wireframe:!selectedObj.wireframe})}
                      style={selectedObj.wireframe?{background:orb.accent,color:'#000'}:{}}>
                      {selectedObj.wireframe?'ON':'OFF'}
                    </button>
                  </div>
                  <div className="prop-numrow">
                    <span className="prop-label">Visible</span>
                    <button className={`prop-toggle ${selectedObj.visible?'on':''}`}
                      onClick={()=>updateSelected({visible:!selectedObj.visible})}
                      style={selectedObj.visible?{background:orb.accent+'33',color:orb.accent}:{}}>
                      {selectedObj.visible?'SHOW':'HIDDEN'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* OUTLINER */}
          {activePanel==='outliner' && (
            <div className="outliner-body">
              <div className="prop-section-title">SCENE ({objects.length} objects)</div>
              {objects.map(obj => (
                <div key={obj.id}
                  className={`outliner-item ${obj.id===selectedId?'active':''}`}
                  onClick={()=>setSelectedId(obj.id)}
                  style={obj.id===selectedId?{borderLeftColor:orb.accent}:{}}>
                  <span className="oi-icon" style={{color:obj.color}}>{PRIMITIVES[obj.type]?.icon||'■'}</span>
                  <span className="oi-name">{obj.name}</span>
                  <button className="oi-vis" onClick={e=>{e.stopPropagation(); setObjects(prev=>prev.map(o=>o.id===obj.id?{...o,visible:!o.visible}:o));}}>
                    <Eye size={11} opacity={obj.visible?1:0.3}/>
                  </button>
                  <button className="oi-del" onClick={e=>{e.stopPropagation(); setObjects(prev=>{ const next=prev.filter(o=>o.id!==obj.id); if(selectedId===obj.id) setSelectedId(next[0]?.id??null); return next; });}}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              ))}
              <button className="outliner-add-btn" onClick={()=>setShowAddPanel(true)}>
                <Plus size={12}/> Add Object
              </button>
            </div>
          )}

          {/* ANIMATION */}
          {activePanel==='animation' && (
            <div className="animation-body">
              <div className="prop-section-title">PLAYBACK</div>
              <div className="anim-controls">
                <button className="anim-btn" onClick={()=>setIsPlaying(v=>!v)}
                  style={{background:orb.accent,color:'#000'}}>{isPlaying?'⏸ Stop':'▶ Play'}</button>
                <button className="anim-btn" onClick={()=>{setIsPlaying(false);setFrame(0);}}>⏮ Reset</button>
              </div>
              <div className="anim-frame-row">
                <span className="prop-label">Frame</span>
                <input type="number" value={frame} onChange={e=>setFrame(parseInt(e.target.value)||0)} className="prop-num-input" style={{width:60}}/>
              </div>
              {selectedObj && (
                <>
                  <div className="prop-section-title">OBJECT ANIMATION</div>
                  <div className="anim-subsection">
                    <span className="prop-label">Auto Spin</span>
                    <button className={`prop-toggle ${selectedObj.spin?'on':''}`}
                      onClick={()=>updateSelected({spin:!selectedObj.spin})}
                      style={selectedObj.spin?{background:orb.accent,color:'#000'}:{}}>
                      {selectedObj.spin?'ON':'OFF'}
                    </button>
                  </div>
                  <div className="prop-section-title">KEYFRAMES ({selectedObj.keyframes?.length||0})</div>
                  {(selectedObj.keyframes||[]).map((kf,i)=>(
                    <div key={i} className="kf-item">◆ Frame {kf.frame}</div>
                  ))}
                  <button className="anim-btn" style={{marginTop:8}} onClick={()=>{
                    if(!selectedObj) return;
                    updateSelected({ keyframes:[...(selectedObj.keyframes||[]),{frame,position:selectedObj.position.toArray(),scale:selectedObj.scale.toArray(),quaternion:selectedObj.quaternion.toArray()}]});
                  }}>+ Insert at Frame {frame}</button>
                </>
              )}
            </div>
          )}

          <div className="sidebar-divider"/>

          {/* AI CHAT */}
          <div className="assistant-chat-panel">
            <div className="chat-header">
              <MessageSquare size={12}/><span>AI COMMAND</span>
            </div>
            <div className="chat-log-area" id="chat-log">
              {chatHistory.map((msg,i)=>(
                <div key={i} className={`log-entry ${msg.role}`}>
                  <div className="entry-author">{msg.role==='assistant'?orb.name:'YOU'}</div>
                  <div className="entry-content">{msg.content}</div>
                </div>
              ))}
              {isGenerating && <div className="log-entry assistant"><div className="entry-content">Generating...</div></div>}
            </div>
            <div className="chat-input-zone">
              <input type="text" value={chatInput}
                onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSend()}
                placeholder='generate a drone / move up 2 / rotate y 45'
                className="chat-input-field"/>
              <button className="chat-send-btn" onClick={handleSend} style={{background:orb.accent}}>
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>

        </aside>
      </main>
    </div>
  );
}

/* ── Sub-components ── */
const HandHUD = React.memo(({ landmarks, accent, gesture, confidence, isSecondary }) => {
  if (!landmarks || landmarks.length === 0) return null;
  const hand = landmarks; 
  
  return (
    <svg className={`hand-hud-overlay stark-ui-theme ${isSecondary ? 'secondary' : ''}`} viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.003" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Neural Pathways (Skeleton) */}
      <g filter="url(#glow)">
        {[
          [0,1,2,3,4], [0,5,6,7,8], [9,10,11,12], [13,14,15,16], [17,18,19,20],
          [5,9,13,17,0]
        ].map((indices, i) => (
          <path 
            key={i}
            d={`M ${indices.map(idx => `${hand[idx].x} ${hand[idx].y}`).join(' L ')}`} 
            className="hud-path-neural" 
            style={{ stroke: accent, strokeWidth: 0.004, fill: 'none' }}
          />
        ))}
      </g>

      {/* Active Recognition Nodes */}
      {hand.map((pt, i) => {
        const isCritical = [0, 4, 8, 12, 16, 20].includes(i);
        return (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={isCritical ? "0.012" : "0.006"} 
              fill={isCritical ? '#fff' : accent} className={`hud-dot-stark ${isCritical ? 'pulse' : ''}`} />
            
            {/* Holographic Projection Lines */}
            {isCritical && (
               <line 
                 x1={pt.x} y1={pt.y} x2={pt.x + 0.05} y2={pt.y - 0.05} 
                 stroke={accent} strokeWidth="0.001" opacity="0.3" 
               />
            )}

            {/* Geometric Lock Frames on Tips */}
            {isCritical && i !== 0 && (
              <g transform={`rotate(45, ${pt.x}, ${pt.y})`}>
                <rect 
                  x={pt.x - 0.015} y={pt.y - 0.015} width="0.03" height="0.03" 
                  fill="none" stroke={accent} strokeWidth="0.001" opacity="0.5"
                />
                <circle cx={pt.x} cy={pt.y} r="0.02" fill="none" stroke={accent} strokeWidth="0.0005" strokeDasharray="0.005 0.005" />
              </g>
            )}
          </g>
        );
      })}

      {/* Gesture State Widget */}
      <g transform={`translate(${hand[0].x}, ${hand[0].y - 0.1})`}>
        <circle r="0.05" fill="none" stroke={accent} strokeWidth="0.002" strokeDasharray="0.01 0.01" className="rotate-fast" />
        <text x="0.06" y="0.005" className="hud-stark-text" fill="#fff" style={{fontSize: '0.02px', fontWeight: 900}}>
          {gesture || "SCANNING..."}
        </text>
      </g>
    </svg>
  );
});

const StarkHUD = React.memo(({ accent, handPos, gesture, confidence }) => {
  return (
    <div className="stark-hud-container">
      {/* Target Crosshair */}
      <div className="stark-reticle" style={{ left: `${handPos.x * 100}%`, top: `${handPos.y * 100}%`, borderColor: accent }}>
        <div className="reticle-inner" style={{ background: accent }} />
        <span className="reticle-label" style={{ color: accent }}>LOCK_FIX: {gesture}</span>
        
        {/* Reticle Tech Lines */}
        <div className="reticle-line-h" style={{ background: accent }} />
        <div className="reticle-line-v" style={{ background: accent }} />
      </div>

      {/* Screen Corners Telemetry */}
      <div className="stark-corner top-left" style={{ borderColor: accent }}>
        <div className="telem-row"><span className="label">NEURAL_SYNC:</span> <span className="val">ACTIVE</span></div>
        <div className="telem-row"><span className="label">BITRATE:</span> <span className="val">12.4 GB/S</span></div>
      </div>
      <div className="stark-corner bottom-left" style={{ borderColor: accent }}>
        <div className="telem-row"><span className="label">POS_X:</span> <span className="val">{handPos.x.toFixed(4)}</span></div>
        <div className="telem-row"><span className="label">POS_Y:</span> <span className="val">{handPos.y.toFixed(4)}</span></div>
        <div className="telem-row"><span className="label">CONF:</span> <span className="val" style={{ color: '#4ade80' }}>{(confidence*100).toFixed(0)}%</span></div>
      </div>
      
      {/* Scanline Effect */}
      <div className="stark-scanlines" />
    </div>
  );
});

function ToolBtn({ icon: Icon, active, label, sub, onClick, accent, danger, tinyLabel }) {
  return (
    <button
      className={`tool-btn ${active?'active':''}${danger?' danger':''}`}
      title={`${label}${sub?' ('+sub+')':''}`}
      onClick={onClick}
      style={active?{color: accent, borderLeftColor: accent}:{}}>
      <Icon size={16}/>
      <span className="tool-btn-label">{label}</span>
      {sub && <span className="tool-btn-sub">{sub}</span>}
    </button>
  );
}

function VecInput({ label, obj, prop, onChange }) {
  return (
    <>
      <div className="prop-group-label">{label}</div>
      {['x','y','z'].map(ax => (
        <div key={ax} className="prop-numrow">
          <span className={`axis-badge ${ax}`}>{ax.toUpperCase()}</span>
          <input type="number" step={prop==='scale'?0.05:0.1}
            value={(obj[prop][ax] || 0).toFixed(3)}
            onChange={e=>onChange(prop,ax,e.target.value)}
            className="prop-num-input"/>
        </div>
      ))}
    </>
  );
}

function RotInput({ label, euler, onChange }) {
  return (
    <>
      <div className="prop-group-label">{label} (°)</div>
      {['x','y','z'].map((ax,i) => (
        <div key={ax} className="prop-numrow">
          <span className={`axis-badge ${ax}`}>{ax.toUpperCase()}</span>
          <input type="number" step={1}
            value={((euler[ax]||0)*180/Math.PI).toFixed(1)}
            onChange={e=>onChange(ax, e.target.value)}
            className="prop-num-input"/>
          <span className="prop-unit">°</span>
        </div>
      ))}
    </>
  );
}
