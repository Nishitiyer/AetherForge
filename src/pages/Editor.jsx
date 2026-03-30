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
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, TransformControls, Grid, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from 'three';
import {
  Settings, Activity, Plus, Hand, Move, RotateCw, Maximize,
  MousePointer2, Eye, Layers, Film, Trash2, Copy, Clock,
  MessageSquare, AlertCircle, Cpu, ChevronRight, Mic,
  Box as BoxIcon, Circle, Triangle, Bot, Zap, Hexagon,
  Globe, Square, CopyCheck
} from "lucide-react";
import "./Editor.css";
import { useHands } from "../hooks/useHands";

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
};

function makeGeo(type, args) {
  switch (type) {
    case 'box':          return new THREE.BoxGeometry(...args);
    case 'sphere':       return new THREE.SphereGeometry(...args);
    case 'cylinder':     return new THREE.CylinderGeometry(...args);
    case 'cone':         return new THREE.ConeGeometry(...args);
    case 'torus':        return new THREE.TorusGeometry(...args);
    case 'plane':        return new THREE.PlaneGeometry(...args);
    case 'octahedron':   return new THREE.OctahedronGeometry(...args);
    case 'dodecahedron': return new THREE.DodecahedronGeometry(...args);
    default:             return new THREE.BoxGeometry(1,1,1);
  }
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
    color: p.color,
    wireframe: false,
    spin: false,
    keyframes: [],
  };
}

/* ────────────────── SCENE OBJECT ────────────────── */
function SceneObject({ obj, isSelected, onSelect, gestureRef, gesture, handPos, isGestureEnabled }) {
  const meshRef = useRef();
  const geo     = useMemo(() => makeGeo(PRIMITIVES[obj.type]?.geometry || 'box', PRIMITIVES[obj.type]?.args || [1,1,1]), [obj.type]);
  
  // Ref to track the start of a pinch for relative movement
  const pinchStartRef = useRef(null);

  // Sync Three.js mesh directly from obj data on first mount and data changes
  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(obj.position);
    meshRef.current.quaternion.copy(obj.quaternion);
    meshRef.current.scale.copy(obj.scale);
  }, [obj.position, obj.quaternion, obj.scale]);

  // HIGH-PERFORMANCE GESTURE LOOP — runs in WebGL thread, no React re-render
  useFrame((state, delta) => {
    const g = gestureRef.current;
    if (isGestureEnabled && g !== 'NONE') {
       // Debug log limited to once per second to avoid flooding
       if (state.clock.elapsedTime % 1 < 0.02) {
         console.log(`[AetherForge] Gesture: ${g}, Selected: ${isSelected}, Obj: ${obj.name}`);
       }
    }

    if (!meshRef.current || !isSelected || !isGestureEnabled) {
      pinchStartRef.current = null;
      return;
    }
    
    const g = gestureRef.current;
    
    // GESTURE: PINCH -> GRAB AND MOVE
    if (g === 'PINCH' && handPos) {
      // Sensitivity factor to map screen [0-1] to world units
      // We increase sensitivity to make it feel more "snappy" on screen
      const sensX = 14; 
      const sensY = 10;
      
      const currentHand3D = new THREE.Vector3(
        (handPos.x - 0.5) * sensX,
        (0.5 - handPos.y) * sensY,
        0 
      );

      if (!pinchStartRef.current) {
        // Capture initial positions on start of pinch
        pinchStartRef.current = {
          hand: currentHand3D.clone(),
          obj:  meshRef.current.position.clone()
        };
      } else {
        // Calculate delta and apply
        const deltaHand = currentHand3D.clone().sub(pinchStartRef.current.hand);
        meshRef.current.position.copy(pinchStartRef.current.obj).add(deltaHand);
      }
    } else {
      pinchStartRef.current = null;
    }

    // GESTURE: OPEN_HAND -> SCALE UP
    if (g === 'OPEN_HAND') {
      meshRef.current.scale.multiplyScalar(1 + delta * 0.8);
    }
    
    // GESTURE: FIST -> SCALE DOWN
    if (g === 'FIST') {
      meshRef.current.scale.multiplyScalar(1 - delta * 0.8);
    }

    // GESTURE: POINT -> ROTATE
    if (g === 'POINT') {
      meshRef.current.rotation.y += 1.8 * delta;
    }

    // GESTURE: PEACE -> MOVE UP/AWAY
    if (g === 'PEACE') {
      meshRef.current.position.y += 2.2 * delta;
    }

    // Spin animation
    if (obj.spin) meshRef.current.rotation.y += 1.0 * delta;
  });

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geo}
        visible={obj.visible}
        onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}
      >
        <meshStandardMaterial
          color={obj.color}
          wireframe={obj.wireframe}
          emissive={isSelected ? obj.color : '#000'}
          emissiveIntensity={isSelected ? 0.25 : 0}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>
      {/* Selection outline */}
      {isSelected && (
        <mesh geometry={geo} position={obj.position} quaternion={obj.quaternion} scale={obj.scale.clone().multiplyScalar(1.04)}>
          <meshBasicMaterial color={obj.color} wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </>
  );
}

/* ────────────────── VIEWPORT SCENE ────────────────── */
function ViewportScene({ objects, selectedId, onSelect, onTransformCommit, transformMode, gestureRef, gesture, handPos, isGestureEnabled }) {
  const selectedObj = useMemo(() => objects.find(o => o.id === selectedId), [objects, selectedId]);
  const tcGroupRef  = useRef();

  // Sync transform control target when selection changes
  useEffect(() => {
    if (!tcGroupRef.current || !selectedObj) return;
    tcGroupRef.current.position.copy(selectedObj.position);
    tcGroupRef.current.quaternion.copy(selectedObj.quaternion);
    tcGroupRef.current.scale.copy(selectedObj.scale);
  }, [selectedId]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]}  intensity={1.4} castShadow />
      <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#8ab4f8" />
      <pointLight position={[0, 6, 0]} intensity={0.3} />

      <Grid infiniteGrid fadeDistance={28} cellSize={1} cellColor="#2a2a2a" sectionColor="#444" receiveShadow />

      {objects.map(obj => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={obj.id === selectedId}
          onSelect={onSelect}
          gestureRef={gestureRef}
          gesture={gesture}
          handPos={handPos}
          isGestureEnabled={isGestureEnabled}
        />
      ))}

      {selectedObj && (
        <TransformControls
          mode={transformMode}
          onMouseUp={(e) => {
            if (tcGroupRef.current) {
              onTransformCommit(selectedId, {
                position:   tcGroupRef.current.position.clone(),
                quaternion: tcGroupRef.current.quaternion.clone(),
                scale:      tcGroupRef.current.scale.clone(),
              });
            }
          }}
        >
          <group
            ref={tcGroupRef}
            position={selectedObj.position}
            quaternion={selectedObj.quaternion}
            scale={selectedObj.scale}
          />
        </TransformControls>
      )}

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      <GizmoHelper alignment="bottom-right" margin={[56, 56]}>
        <GizmoViewport axisColors={['#ef4444','#22c55e','#3b82f6']} labelColor="#fff" />
      </GizmoHelper>
    </>
  );
}

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

  const { videoRef, gestureRef, gesture, handPos, confidence, permissionState, requestCamera } = useHands();

  useEffect(() => {
    const saved = localStorage.getItem('selectedOrb');
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
  const handleAI = useCallback((msg) => {
    const p = msg.toLowerCase();
    const n = parseFloat(p.match(/[\d.]+/)?.[0]) || 1;

    if (/generate|create|make|add/i.test(p)) {
      setIsGenerating(true);
      let key = 'cube';
      Object.keys(PRIMITIVES).forEach(k => { if (p.includes(k)) key = k; });
      if (p.includes('ball'))   key = 'sphere';
      if (p.includes('ring'))   key = 'torus';
      if (p.includes('ship'))   key = 'drone';
      setTimeout(() => {
        const obj = freshObject(key);
        setObjects(prev => [...prev, obj]);
        setSelectedId(obj.id);
        setIsGenerating(false);
        setChatHistory(prev => [...prev, { role:'assistant', content:`✓ ${PRIMITIVES[key].label} added to scene.` }]);
      }, 1400);
      return;
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
  }, [selectedId, selectedObj, updateSelected, deleteSelected, setRotDeg]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatHistory(prev => [...prev, { role:'user', content:msg }]);
    setChatInput('');
    handleAI(msg);
  };

  /* ── Euler from selected quaternion ── */
  const selEuler = useMemo(() => {
    if (!selectedObj) return new THREE.Euler();
    return new THREE.Euler().setFromQuaternion(selectedObj.quaternion);
  }, [selectedObj]);

  return (
    <div className="editor-root" style={{ "--orb-accent": orb.accent }}>

      {/* Holographic Camera Overlay — Stark Workspace style */}
      <video 
        ref={videoRef}
        className={`stark-hologram-feed ${isGestureEnabled && permissionState === 'granted' ? 'active' : ''}`}
        playsInline 
        muted 
      />

      {/* ── TOP HEADER ── */}
      <header className="ed-global-header">
        <div className="ed-brand-side">
          <div className="ed-logo-hex"><Cpu size={13}/></div>
          <span className="ed-brand-name">AetherForge</span>
        </div>

        <div className="transform-mode-bar">
          {[
            { mode:'translate', icon: Move,          label:'Move',   key:'G' },
            { mode:'rotate',    icon: RotateCw,       label:'Rotate', key:'R' },
            { mode:'scale',     icon: Maximize,       label:'Scale',  key:'S' },
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
          <button className="tm-btn" onClick={()=>{ if(selectedObj){ const d=freshObject(selectedObj.type); d.position=selectedObj.position.clone().add(new THREE.Vector3(1.5,0,0)); d.color=selectedObj.color; setObjects(p=>[...p,d]); setSelectedId(d.id); } }}>
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

          <div className="shelf-section-label">MESH</div>
          <ToolBtn icon={Plus}     label="Add Mesh"   sub="⇧A" onClick={()=>setShowAddPanel(v=>!v)}     accent={orb.accent} />
          <ToolBtn icon={Copy}     label="Duplicate"  sub="⇧D" onClick={()=>{ if(selectedObj){ const d=freshObject(selectedObj.type); d.position=selectedObj.position.clone().add(new THREE.Vector3(1.5,0,0)); d.color=selectedObj.color; setObjects(p=>[...p,d]); setSelectedId(d.id); }}}  accent={orb.accent} />
          <ToolBtn icon={Trash2}   label="Delete"     sub="X"  onClick={deleteSelected} danger tinyLabel="DEL"  accent={orb.accent} />

          <div className="shelf-section-label">OBJECT</div>
          <ToolBtn icon={Eye}   label="Hide/Show" sub="H" onClick={()=>updateSelected({visible:!selectedObj?.visible})} accent={orb.accent} />
          <ToolBtn icon={CopyCheck} label="Wireframe" sub="W" onClick={()=>updateSelected({wireframe:!selectedObj?.wireframe})} active={selectedObj?.wireframe} accent={orb.accent} />

          <div className="shelf-spacer"/>
          <div className="shelf-section-label">SPATIAL</div>
          <ToolBtn icon={Hand} active={isGestureEnabled} label="Gesture" sub="CAM" onClick={toggleGestures} accent={orb.accent} danger={permissionState==='denied'} />
        </aside>

        {/* ── CENTRAL VIEWPORT ── */}
        <section className="ed-viewport-section">

          {/* Viewport top bar */}
          <div className="viewport-header">
            <div className="viewport-menu">
              <span className="menu-active">Object Mode</span>
              <span>View</span><span>Select</span><span>Add</span><span>Object</span>
              <span style={{color: isGestureEnabled ? orb.accent : 'rgba(255,255,255,0.2)'}}>
                {isGestureEnabled ? `✦ GESTURE: ${gesture}` : 'Gesture: Off'}
              </span>
            </div>
          </div>

          {/* ADD MESH PANEL */}
          <AnimatePresence>
            {showAddPanel && (
              <motion.div className="add-object-panel"
                initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
                <div className="aop-header">
                  <span className="aop-title">ADD MESH PRIMITIVE</span>
                  <button className="aop-close" onClick={()=>setShowAddPanel(false)}>✕</button>
                </div>
                <div className="aop-grid">
                  {Object.entries(PRIMITIVES).map(([key, p]) => (
                    <button key={key} className="aop-item" onClick={()=>addObject(key)}
                      style={{borderColor: p.color+'44'}}>
                      <span className="aop-icon" style={{color: p.color}}>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* REAL THREE.JS CANVAS */}
          <div className="viewport-canvas-area">
            {isGenerating && (
              <div className="generation-overlay">
                <motion.div className="loader-ring"
                  animate={{rotate:360}}
                  transition={{repeat:Infinity,duration:0.8,ease:'linear'}}
                  style={{borderTopColor:orb.accent}}/>
                <span className="loader-text">GENERATING...</span>
              </div>
            )}

            <Canvas
              shadows
              dpr={[1, 2]}
              gl={{ alpha: true, antialias: true }}
              camera={{ position:[3,2.5,3], fov:50 }}
              style={{width:'100%',height:'100%', background:'transparent'}}
              onCreated={({gl}) => { 
                gl.setClearColor(0x000000, 0); 
                gl.shadowMap.enabled = true; 
              }}
            >
              <ViewportScene
                objects={objects}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onTransformCommit={commitTransform}
                transformMode={transformMode}
                gestureRef={gestureRef}
                gesture={gesture}
                handPos={handPos}
                isGestureEnabled={isGestureEnabled}
              />
            </Canvas>

            {/* Overlays */}
            {permissionState === 'denied' && (
              <div className="stark-error-msg">
                <AlertCircle size={13}/> Camera denied — check browser settings
              </div>
            )}
            {isGestureEnabled && permissionState === 'granted' && (
              <div className="gesture-status-float" style={{borderColor: orb.accent+'44', left: 'auto', right: '14px', transform: 'none'}}>
                <div className="pulse-dot" style={{background:orb.accent}}/>
                <span style={{color:orb.accent}}>{gesture}</span>
                <span className="conf">{(confidence*100).toFixed(0)}%</span>
              </div>
            )}

            {/* Hand Landmark HUD Overlay */}
            {isGestureEnabled && landmarks && (
              <HandHUD landmarks={landmarks} accent={orb.accent} />
            )}

            {/* User Guidance Overlay */}
            {isGestureEnabled && permissionState === 'granted' && !selectedId && (
              <div className="stark-hint-msg" style={{color: orb.accent}}>
                <BoxIcon size={14}/> Select an object to manipulate with gestures
              </div>
            )}
            {isGestureEnabled && permissionState === 'granted' && !landmarks && (
              <div className="stark-hint-msg" style={{top: '120px', color: '#fca5a5'}}>
                <Hand size={14}/> Waiting for hand... (Move hand closer to camera)
              </div>
            )}
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
            <div className="css-orb-box">
              <div className="css-orb" style={{
                '--oa': orb.accent,
                background: `radial-gradient(circle at 35% 35%, white, ${orb.accent} 40%, #000 100%)`
              }}>
                <div className="orb-ring r1" style={{borderColor:orb.accent}}/>
                <div className="orb-ring r2" style={{borderColor:orb.accent+'88'}}/>
                <div className="orb-ring r3" style={{borderColor:orb.accent+'44'}}/>
                <div className="orb-glow"    style={{background:orb.accent}}/>
              </div>
              <div className="core-info">
                <h2 className="core-title">{orb.name}</h2>
                <div className="core-subtitle">{orb.personality}</div>
              </div>
            </div>
            <div className="core-actions">
              <button className={`stark-btn-action ${isGestureEnabled?'active':''}`}
                style={isGestureEnabled?{background:orb.accent,color:'#000',borderColor:'transparent'}:{}}
                onClick={toggleGestures}>
                <Hand size={14}/><span>{isGestureEnabled?'SUSPEND':'ENGAGE HANDS'}</span>
              </button>
              <button className="stark-btn-action"><Mic size={14}/><span>VOICE</span></button>
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

                  <div className="prop-section-title">MATERIAL</div>
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
function HandHUD({ landmarks, accent }) {
  if (!landmarks || landmarks.length === 0) return null;
  const hand = landmarks[0];
  
  return (
    <svg className="hand-hud-overlay" viewBox="0 0 1 1" preserveAspectRatio="none">
      {/* Draw skeletal connections */}
      <path 
        d={`M ${hand[0].x} ${hand[0].y} L ${hand[1].x} ${hand[1].y} L ${hand[2].x} ${hand[2].y} L ${hand[3].x} ${hand[3].y} L ${hand[4].x} ${hand[4].y}`} 
        className="hud-path" style={{ stroke: accent }}
      />
      <path 
        d={`M ${hand[0].x} ${hand[0].y} L ${hand[5].x} ${hand[5].y} L ${hand[6].x} ${hand[6].y} L ${hand[7].x} ${hand[7].y} L ${hand[8].x} ${hand[8].y}`} 
        className="hud-path" style={{ stroke: accent }}
      />
      <path 
        d={`M ${hand[9].x} ${hand[9].y} L ${hand[10].x} ${hand[10].y} L ${hand[11].x} ${hand[11].y} L ${hand[12].x} ${hand[12].y}`} 
        className="hud-path" style={{ stroke: accent }}
      />
      <path 
        d={`M ${hand[13].x} ${hand[13].y} L ${hand[14].x} ${hand[14].y} L ${hand[15].x} ${hand[15].y} L ${hand[16].x} ${hand[16].y}`} 
        className="hud-path" style={{ stroke: accent }}
      />
      <path 
        d={`M ${hand[17].x} ${hand[17].y} L ${hand[18].x} ${hand[18].y} L ${hand[19].x} ${hand[19].y} L ${hand[20].x} ${hand[20].y}`} 
        className="hud-path" style={{ stroke: accent }}
      />
      <path 
        d={`M ${hand[5].x} ${hand[5].y} L ${hand[9].x} ${hand[9].y} L ${hand[13].x} ${hand[13].y} L ${hand[17].x} ${hand[17].y} L ${hand[0].x} ${hand[0].y}`} 
        className="hud-path" style={{ stroke: accent }}
      />

      {/* Draw landmarks */}
      {hand.map((pt, i) => (
        <circle key={i} cx={pt.x} cy={pt.y} r="0.005" fill={i === 8 || i === 4 ? '#fff' : accent} className="hud-dot" />
      ))}
    </svg>
  );
}

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
            value={obj[prop][ax==='x'?0:ax==='y'?1:2].toFixed(3)}
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
