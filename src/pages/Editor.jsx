import React, { useEffect, useState, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, TransformControls, Grid, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from 'three';
import {
  Box as BoxIcon, Settings, Activity, ChevronRight, Mic, MessageSquare,
  AlertCircle, Cpu, Globe, Play, Plus, Zap, Circle, Triangle, Hexagon, Bot,
  Hand, Move, RotateCw, Maximize, MousePointer2, Eye, Layers, Film, Trash2,
  Copy, ArrowUp, ArrowDown, Clock
} from "lucide-react";
import "./Editor.css";
import { useHands } from "../hooks/useHands";
import { ChestHero3D } from "../components/landing/ChestHero3D";

/* ────────────────── ORB / IDENTITY ────────────────── */
const ORBS = {
  nova:     { name: "Nova Core",     personality: "Cinematic Director",   accent: "#fbbf24" },
  sentinel: { name: "Sentinel Core", personality: "Technical Architect",  accent: "#22d3ee" },
  echo:     { name: "Echo Core",     personality: "Voice Companion",      accent: "#e879f9" },
  prism:    { name: "Prism Core",    personality: "Creative Catalyst",    accent: "#818cf8" },
  quantum:  { name: "Quantum Core",  personality: "Efficiency Engine",    accent: "#34d399" },
};

/* ────────────────── PRIMITIVE DEFINITIONS ────────────────── */
const PRIMITIVES = {
  cube:     { label: "Cube",     color: "#60a5fa", geometry: "box",          args: [1,1,1] },
  sphere:   { label: "Sphere",   color: "#f472b6", geometry: "sphere",       args: [0.6,32,32] },
  cylinder: { label: "Cylinder", color: "#34d399", geometry: "cylinder",     args: [0.4,0.4,1.2,32] },
  cone:     { label: "Cone",     color: "#fb923c", geometry: "cone",         args: [0.5,1.2,32] },
  torus:    { label: "Torus",    color: "#a78bfa", geometry: "torus",        args: [0.5,0.18,16,100] },
  plane:    { label: "Plane",    color: "#94a3b8", geometry: "plane",        args: [2,2] },
  drone:    { label: "Drone",    color: "#f87171", geometry: "octahedron",   args: [0.7, 3] },
  crystal:  { label: "Crystal",  color: "#67e8f9", geometry: "dodecahedron", args: [0.6, 0] },
};

function makeGeometry(type, args) {
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

let objectIdCounter = 1;
function makeObject(primKey) {
  const p = PRIMITIVES[primKey] || PRIMITIVES.cube;
  return {
    id: objectIdCounter++,
    name: `${p.label}_${objectIdCounter}`,
    type: primKey,
    visible: true,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: p.color,
    wireframe: false,
    // Animation keyframes
    keyframes: [],
    animPlaying: false,
  };
}

/* ────────────────── 3D SCENE OBJECT ────────────────── */
function SceneObject({ obj, isSelected, onSelect, transformMode }) {
  const meshRef = useRef();
  const prim = PRIMITIVES[obj.type] || PRIMITIVES.cube;
  const geo  = React.useMemo(() => makeGeometry(prim.geometry, prim.args), [prim]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.set(...obj.position);
    meshRef.current.rotation.set(...obj.rotation);
    meshRef.current.scale.set(...obj.scale);
  });

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geo}
        onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}
        visible={obj.visible}
      >
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : obj.color}
          wireframe={obj.wireframe}
          emissive={isSelected ? obj.color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>
      {isSelected && (
        <mesh geometry={geo} scale={1.02}>
          <meshBasicMaterial color={obj.color} wireframe transparent opacity={0.4} />
        </mesh>
      )}
    </>
  );
}

/* ────────────────── VIEWPORT SCENE ────────────────── */
function ViewportScene({ objects, selectedId, onSelect, onTransform, transformMode }) {
  const { gl } = useThree();
  const selectedObj = objects.find(o => o.id === selectedId);
  const targetRef = useRef();

  // Deselect on background click
  const handleMissed = useCallback(() => onSelect(null), [onSelect]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#8ab4f8" />

      <Grid infiniteGrid fadeDistance={30} cellColor="#333" sectionColor="#555" />

      {objects.map(obj => (
        <SceneObject
          key={obj.id}
          obj={obj}
          isSelected={obj.id === selectedId}
          onSelect={onSelect}
          transformMode={transformMode}
        />
      ))}

      {selectedObj && (
        <TransformControls
          mode={transformMode}
          onObjectChange={(e) => {
            if (!e.target.object) return;
            const o = e.target.object;
            onTransform(selectedObj.id, {
              position: [o.position.x, o.position.y, o.position.z],
              rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
              scale:    [o.scale.x, o.scale.y, o.scale.z],
            });
          }}
        >
          <group position={selectedObj.position} rotation={selectedObj.rotation} scale={selectedObj.scale} />
        </TransformControls>
      )}

      <OrbitControls makeDefault />

      <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN EDITOR PAGE
═══════════════════════════════════════════════════════════════ */
export default function Editor() {
  const [selectedOrbId, setSelectedOrbId]     = useState("sentinel");
  const [objects, setObjects]                 = useState([makeObject('cube')]);
  const [selectedId, setSelectedId]           = useState(1);
  const [transformMode, setTransformMode]     = useState("translate"); // translate|rotate|scale
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);
  const [isGenerating, setIsGenerating]       = useState(false);
  const [chatInput, setChatInput]             = useState("");
  const [showAddPanel, setShowAddPanel]       = useState(false);
  const [activePanel, setActivePanel]         = useState("properties"); // properties|outliner|animation
  const [isPlaying, setIsPlaying]             = useState(false);
  const [currentFrame, setCurrentFrame]       = useState(0);
  const [chatHistory, setChatHistory]         = useState([
    { role: "assistant", content: "Stark-Elite ready. Type 'generate a drone', 'rotate 45', 'scale 2x', or 'move up' to control objects. I can also create and animate them." }
  ]);

  const { videoRef, gesture, confidence, permissionState, requestCamera } = useHands();
  const animFrameRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("selectedOrb");
    if (saved && ORBS[saved]) setSelectedOrbId(saved);
  }, []);

  const orb = ORBS[selectedOrbId] || ORBS.sentinel;
  const selectedObj = objects.find(o => o.id === selectedId) || null;

  /* ── Update selected object props ── */
  const updateSelected = useCallback((updates) => {
    setObjects(prev => prev.map(o => o.id === selectedId ? { ...o, ...updates } : o));
  }, [selectedId]);

  const updateTransform = useCallback((id, tf) => {
    setObjects(prev => prev.map(o => o.id === id ? { ...o, ...tf } : o));
  }, []);

  /* ── Add object ── */
  const addObject = (primKey) => {
    const obj = makeObject(primKey);
    setObjects(prev => [...prev, obj]);
    setSelectedId(obj.id);
    setShowAddPanel(false);
  };

  /* ── Delete selected ── */
  const deleteSelected = () => {
    if (!selectedId) return;
    setObjects(prev => prev.filter(o => o.id !== selectedId));
    setSelectedId(null);
  };

  /* ── Gesture → Transform ── */
  useEffect(() => {
    if (!isGestureEnabled || !selectedId || gesture === "NONE" || gesture === "IDLE") return;
    setObjects(prev => prev.map(o => {
      if (o.id !== selectedId) return o;
      const [x, y, z] = o.position;
      const [rx, ry, rz] = o.rotation;
      const [sx, sy, sz] = o.scale;
      switch (gesture) {
        case "PINCH_GRAB":    return { ...o, position: [x, y + 0.05, z] };
        case "POINTING_UP":   return { ...o, rotation: [rx, ry + 0.05, rz] };
        case "CLOSED_FIST":   return { ...o, scale: [Math.max(0.2, sx - 0.01), Math.max(0.2, sy - 0.01), Math.max(0.2, sz - 0.01)] };
        case "OPEN_HAND":     return { ...o, scale: [Math.min(5, sx + 0.01), Math.min(5, sy + 0.01), Math.min(5, sz + 0.01)] };
        default: return o;
      }
    }));
  }, [gesture, isGestureEnabled, selectedId]);

  /* ── Toggle gesture ── */
  const handleToggleGestures = async () => {
    if (!isGestureEnabled) { await requestCamera(); }
    setIsGestureEnabled(prev => !prev);
  };

  /* ── AI Command Handler ── */
  const handleAICommand = (msg) => {
    const p = msg.toLowerCase();

    // Generate / Create
    if (/generate|create|make|add/i.test(p)) {
      setIsGenerating(true);
      let primKey = 'cube';
      Object.keys(PRIMITIVES).forEach(k => { if (p.includes(k)) primKey = k; });
      if (p.includes('drone'))   primKey = 'drone';
      if (p.includes('crystal')) primKey = 'crystal';
      if (p.includes('ball'))    primKey = 'sphere';
      if (p.includes('ring'))    primKey = 'torus';
      setTimeout(() => {
        const obj = makeObject(primKey);
        setObjects(prev => [...prev, obj]);
        setSelectedId(obj.id);
        setIsGenerating(false);
        setChatHistory(prev => [...prev, {
          role: "assistant",
          content: `✓ "${PRIMITIVES[primKey]?.label || primKey}" added to scene. Object selected — use transform tools or gestures to position it.`
        }]);
      }, 1800);
      return;
    }

    // Move / Translate
    if (/move|translate/i.test(p) && selectedId) {
      const amt = parseFloat(p.match(/[\d.]+/)?.[0]) || 1;
      setObjects(prev => prev.map(o => {
        if (o.id !== selectedId) return o;
        const [x, y, z] = o.position;
        if (/up/i.test(p))    return { ...o, position: [x, y + amt, z] };
        if (/down/i.test(p))  return { ...o, position: [x, y - amt, z] };
        if (/left/i.test(p))  return { ...o, position: [x - amt, y, z] };
        if (/right/i.test(p)) return { ...o, position: [x + amt, y, z] };
        return { ...o, position: [x, y + amt, z] };
      }));
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "assistant", content: `✓ Object moved.` }]);
      }, 300);
      return;
    }

    // Rotate
    if (/rotate/i.test(p) && selectedId) {
      const deg = parseFloat(p.match(/[\d.]+/)?.[0]) || 45;
      const rad = (deg * Math.PI) / 180;
      setObjects(prev => prev.map(o => {
        if (o.id !== selectedId) return o;
        const [rx, ry, rz] = o.rotation;
        return { ...o, rotation: [rx, ry + rad, rz] };
      }));
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "assistant", content: `✓ Rotated ${deg}°.` }]);
      }, 300);
      return;
    }

    // Scale
    if (/scale|resize/i.test(p) && selectedId) {
      const factor = parseFloat(p.match(/[\d.]+/)?.[0]) || 2;
      setObjects(prev => prev.map(o => {
        if (o.id !== selectedId) return o;
        return { ...o, scale: [factor, factor, factor] };
      }));
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "assistant", content: `✓ Scaled to ${factor}x.` }]);
      }, 300);
      return;
    }

    // Animate
    if (/animate|spin|rotate forever/i.test(p) && selectedId) {
      // Add a simple spin keyframe animation definition
      updateSelected({ animPlaying: true });
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "assistant", content: `✓ Animation applied to selected object. Press Play to preview.` }]);
      }, 300);
      setIsPlaying(true);
      return;
    }

    // Delete
    if (/delete|remove/i.test(p)) {
      deleteSelected();
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: "assistant", content: `✓ Object removed from scene.` }]);
      }, 300);
      return;
    }

    setChatHistory(prev => [...prev, { role: "assistant",
      content: `Commands: "generate [type]" · "move up/down/left/right [n]" · "rotate [deg]" · "scale [n]x" · "animate" · "delete"` }]);
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatHistory(prev => [...prev, { role: "user", content: msg }]);
    setChatInput("");
    handleAICommand(msg);
  };

  /* ── Animation Playback (spin selected) ── */
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentFrame(f => f + 1);
      setObjects(prev => prev.map(o => {
        if (!o.animPlaying) return o;
        const [rx, ry, rz] = o.rotation;
        return { ...o, rotation: [rx, ry + 0.02, rz] };
      }));
    }, 16);
    return () => clearInterval(id);
  }, [isPlaying]);

  /* ── Numeric field update helper ── */
  const setPropValue = (axis, component, value) => {
    if (!selectedObj) return;
    const vectors = {
      position: [...selectedObj.position],
      rotation: [...selectedObj.rotation],
      scale:    [...selectedObj.scale],
    };
    const idx = ['x','y','z'].indexOf(axis);
    vectors[component][idx] = parseFloat(value) || 0;
    updateSelected({ [component]: vectors[component] });
  };

  return (
    <div className="editor-root" style={{ "--orb-accent": orb.accent }}>

      {/* ALWAYS-MOUNTED hidden video for gesture camera */}
      <video ref={videoRef} style={{ position:"fixed", opacity:0, pointerEvents:"none", width:1, height:1, zIndex:-1 }} playsInline muted />

      {/* ── TOP HEADER ── */}
      <header className="ed-global-header">
        <div className="ed-brand-side">
          <div className="ed-logo-hex"><Cpu size={13}/></div>
          <span className="ed-brand-name">AetherWorkspace</span>
        </div>

        {/* TRANSFORM MODES */}
        <div className="transform-mode-bar">
          <button className={`tm-btn ${transformMode==='translate'?'active':''}`} onClick={()=>setTransformMode('translate')} title="Move (G)">
            <Move size={14}/><span>Move</span>
          </button>
          <button className={`tm-btn ${transformMode==='rotate'?'active':''}`} onClick={()=>setTransformMode('rotate')} title="Rotate (R)">
            <RotateCw size={14}/><span>Rotate</span>
          </button>
          <button className={`tm-btn ${transformMode==='scale'?'active':''}`} onClick={()=>setTransformMode('scale')} title="Scale (S)">
            <Maximize size={14}/><span>Scale</span>
          </button>
          <div className="tm-sep"/>
          <button className="tm-btn" onClick={()=>setShowAddPanel(v=>!v)}>
            <Plus size={14}/><span>Add</span>
          </button>
          <button className="tm-btn danger" onClick={deleteSelected} disabled={!selectedId}>
            <Trash2 size={14}/><span>Delete</span>
          </button>
        </div>

        <div className="ed-header-right">
          <div className="header-telemetry">
            <Activity size={11} style={{ color: orb.accent }}/>
            <span>NEURAL_LINK: ACTIVE</span>
          </div>
          <button className="header-icon-btn"><Settings size={15}/></button>
        </div>
      </header>

      <main className="ed-main-container">

        {/* ── LEFT TOOL SHELF ── */}
        <aside className="ed-tool-shelf">
          <ToolBtn icon={MousePointer2} active={transformMode==='translate'} label="Select / Move" onClick={()=>setTransformMode('translate')} />
          <ToolBtn icon={RotateCw}      active={transformMode==='rotate'}    label="Rotate"        onClick={()=>setTransformMode('rotate')} />
          <ToolBtn icon={Maximize}      active={transformMode==='scale'}      label="Scale"         onClick={()=>setTransformMode('scale')} />
          <div className="shelf-divider"/>
          <ToolBtn icon={Eye}           label="Toggle Visibility"            onClick={()=>updateSelected({ visible: !selectedObj?.visible })} />
          <ToolBtn icon={Copy}          label="Duplicate"                    onClick={()=>{ if(!selectedObj) return; const d={...makeObject(selectedObj.type), position:[...selectedObj.position.map((v,i)=>v+(i===0?1.5:0))], color:selectedObj.color}; setObjects(p=>[...p,d]); setSelectedId(d.id); }} />
          <div className="shelf-spacer"/>
          <ToolBtn icon={Hand}          active={isGestureEnabled}            label="Toggle Gestures" onClick={handleToggleGestures} />
        </aside>

        {/* ── CENTRAL VIEWPORT ── */}
        <section className="ed-viewport-section">
          {/* Viewport Header */}
          <div className="viewport-header">
            <div className="viewport-menu">
              <span className="menu-active">Object Mode</span>
              <span>View</span>
              <span>Object</span>
              <span style={{color: isGestureEnabled ? orb.accent : 'rgba(255,255,255,0.2)'}}>
                {isGestureEnabled ? `✦ GESTURE: ${gesture}` : 'Gesture Off'}
              </span>
            </div>
          </div>

          {/* ADD OBJECT PANEL */}
          <AnimatePresence>
            {showAddPanel && (
              <motion.div className="add-object-panel"
                initial={{opacity:0, y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
                <div className="aop-title">INSERT MESH PRIMITIVE</div>
                <div className="aop-grid">
                  {Object.entries(PRIMITIVES).map(([key,p]) => (
                    <button key={key} className="aop-item" onClick={()=>addObject(key)}
                      style={{ borderColor: p.color+'33' }}>
                      <span style={{fontSize:18}}>⬡</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* REAL 3D VIEWPORT */}
          <div className="viewport-canvas-area">
            {isGenerating && (
              <div className="generation-overlay">
                <motion.div className="loader-ring"
                  animate={{rotate:360}} transition={{repeat:Infinity, duration:0.85, ease:"linear"}}
                  style={{borderTopColor: orb.accent}} />
                <span className="loader-text">AI_GENERATING...</span>
              </div>
            )}
            <Canvas
              shadows
              camera={{ position: [4, 3, 4], fov: 50 }}
              style={{ width: '100%', height: '100%' }}
              onCreated={({ gl }) => {
                gl.setClearColor('#09090b');
              }}
            >
              <ViewportScene
                objects={objects}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onTransform={updateTransform}
                transformMode={transformMode}
              />
            </Canvas>

            {/* Gesture status */}
            {isGestureEnabled && (
              <div className="gesture-status-float">
                <div className="pulse-dot" style={{background: orb.accent}}/>
                <span>{gesture || "SEARCHING..."}</span>
                <span className="conf">{(confidence*100).toFixed(0)}%</span>
              </div>
            )}
            {permissionState === 'denied' && (
              <div className="stark-error-msg">
                <AlertCircle size={13}/> Camera access denied — click ENGAGE_HANDS to retry
              </div>
            )}
          </div>

          {/* TIMELINE */}
          <div className="timeline-zone">
            <button className={`tl-play-btn ${isPlaying?'playing':''}`} onClick={()=>setIsPlaying(v=>!v)}
              style={{ color: orb.accent }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <div className="tl-frame-counter">
              <Clock size={10}/> Frame {currentFrame}
            </div>
            <div className="timeline-ticker">
              {Array.from({length:30}).map((_,i)=>(
                <div key={i} className={`tick ${i===currentFrame%30?'current':''}`} style={{ height: i%5===0?'10px':'5px', background: i===currentFrame%30 ? orb.accent : undefined }} />
              ))}
            </div>
            {/* Keyframe list for selected object */}
            <button className="tl-key-btn" onClick={()=>{
              if(!selectedObj) return;
              updateSelected({ keyframes: [...(selectedObj.keyframes||[]), { frame: currentFrame, position: [...selectedObj.position], rotation: [...selectedObj.rotation], scale: [...selectedObj.scale] }]});
            }}>◆ Keyframe</button>
          </div>
        </section>

        {/* ── RIGHT PANEL (N-Panel like Blender) ── */}
        <aside className="ed-sidebar">

          {/* AI Core Visual */}
          <div className="assistant-core-panel">
            <div className="core-visual-box">
              <div className="core-canvas-wrapper">
                <Canvas camera={{ position:[0,0,3], fov:40 }}>
                  <ChestHero3D orb={orb}/>
                </Canvas>
              </div>
              <div className="core-info">
                <h2 className="core-title">{orb.name}</h2>
                <div className="core-subtitle">{orb.personality}</div>
              </div>
            </div>
            <div className="core-actions">
              <button
                className={`stark-btn-action ${isGestureEnabled?'active':''}`}
                style={isGestureEnabled?{background:orb.accent,color:'#000',borderColor:'transparent'}:{}}
                onClick={handleToggleGestures}
              ><Hand size={14}/><span>{isGestureEnabled?'SUSPEND':'ENGAGE_HANDS'}</span></button>
              <button className="stark-btn-action"><Mic size={14}/><span>VOICE</span></button>
            </div>
            <div className="cam-status-row">
              <span className={`cam-dot ${permissionState}`}/>
              <span className={`cam-label ${permissionState}`}>CAM: {permissionState.toUpperCase()}</span>
            </div>
          </div>

          <div className="sidebar-divider"/>

          {/* PANEL TABS */}
          <div className="panel-tabs">
            {['properties','outliner','animation'].map(tab => (
              <button key={tab} className={`ptab ${activePanel===tab?'active':''}`}
                onClick={()=>setActivePanel(tab)}>
                {tab === 'properties' && <Settings size={12}/>}
                {tab === 'outliner'   && <Layers size={12}/>}
                {tab === 'animation'  && <Film size={12}/>}
                <span>{tab.charAt(0).toUpperCase()+tab.slice(1)}</span>
              </button>
            ))}
          </div>

          {/* PROPERTIES PANEL */}
          {activePanel === 'properties' && selectedObj && (
            <div className="properties-body">
              <div className="prop-section-title">TRANSFORM</div>

              {/* POSITION */}
              <div className="prop-group-label">Location</div>
              {['x','y','z'].map(ax => (
                <div key={ax} className="prop-numrow">
                  <span className={`axis-badge ${ax}`}>{ax.toUpperCase()}</span>
                  <input type="number" step="0.1"
                    value={selectedObj.position[['x','y','z'].indexOf(ax)].toFixed(3)}
                    onChange={e=>setPropValue(ax,'position',e.target.value)}
                    className="prop-num-input"
                  />
                </div>
              ))}

              {/* ROTATION */}
              <div className="prop-group-label">Rotation</div>
              {['x','y','z'].map(ax => (
                <div key={ax} className="prop-numrow">
                  <span className={`axis-badge ${ax}`}>{ax.toUpperCase()}</span>
                  <input type="number" step="0.01"
                    value={(selectedObj.rotation[['x','y','z'].indexOf(ax)] * 180/Math.PI).toFixed(1)}
                    onChange={e=>setPropValue(ax,'rotation', e.target.value * Math.PI/180)}
                    className="prop-num-input"
                  />
                  <span className="prop-unit">°</span>
                </div>
              ))}

              {/* SCALE */}
              <div className="prop-group-label">Scale</div>
              {['x','y','z'].map(ax => (
                <div key={ax} className="prop-numrow">
                  <span className={`axis-badge ${ax}`}>{ax.toUpperCase()}</span>
                  <input type="number" step="0.05"
                    value={selectedObj.scale[['x','y','z'].indexOf(ax)].toFixed(3)}
                    onChange={e=>setPropValue(ax,'scale',e.target.value)}
                    className="prop-num-input"
                  />
                </div>
              ))}

              <div className="prop-section-title" style={{marginTop:12}}>APPEARANCE</div>
              <div className="prop-numrow">
                <span className="prop-label">Color</span>
                <input type="color" value={selectedObj.color}
                  onChange={e=>updateSelected({color:e.target.value})}
                  className="prop-color-input"
                />
              </div>
              <div className="prop-numrow">
                <span className="prop-label">Wireframe</span>
                <button className={`prop-toggle ${selectedObj.wireframe?'on':''}`}
                  onClick={()=>updateSelected({wireframe:!selectedObj.wireframe})}
                  style={selectedObj.wireframe?{background:orb.accent,color:'#000'}:{}}>
                  {selectedObj.wireframe ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="prop-numrow">
                <span className="prop-label">Visible</span>
                <button className={`prop-toggle ${selectedObj.visible?'on':''}`}
                  onClick={()=>updateSelected({visible:!selectedObj.visible})}
                  style={selectedObj.visible?{background:orb.accent,color:'#000'}:{}}>
                  {selectedObj.visible ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* OUTLINER */}
          {activePanel === 'outliner' && (
            <div className="outliner-body">
              <div className="prop-section-title">SCENE OBJECTS</div>
              {objects.map(obj => (
                <div key={obj.id}
                  className={`outliner-item ${obj.id===selectedId?'active':''}`}
                  onClick={()=>setSelectedId(obj.id)}
                  style={obj.id===selectedId?{borderLeftColor:orb.accent}:{}}>
                  <span className="oi-icon">⬡</span>
                  <span className="oi-name">{obj.name}</span>
                  <button className="oi-vis" onClick={e=>{e.stopPropagation(); setObjects(prev=>prev.map(o=>o.id===obj.id?{...o,visible:!o.visible}:o));}}>
                    <Eye size={11} opacity={obj.visible?1:0.3}/>
                  </button>
                  <button className="oi-del" onClick={e=>{e.stopPropagation(); setObjects(prev=>prev.filter(o=>o.id!==obj.id)); if(selectedId===obj.id) setSelectedId(null);}}>
                    <Trash2 size={11}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ANIMATION */}
          {activePanel === 'animation' && (
            <div className="animation-body">
              <div className="prop-section-title">ANIMATION</div>
              <div className="anim-controls">
                <button className="anim-btn" onClick={()=>setIsPlaying(v=>!v)} style={{background:orb.accent,color:'#000'}}>
                  {isPlaying ? '⏸ Stop' : '▶ Play'}
                </button>
                <button className="anim-btn" onClick={()=>{setIsPlaying(false);setCurrentFrame(0);}}>
                  ⏮ Reset
                </button>
              </div>
              <div className="anim-frame-row">
                <span className="prop-label">Frame</span>
                <input type="number" value={currentFrame}
                  onChange={e=>setCurrentFrame(parseInt(e.target.value)||0)}
                  className="prop-num-input" style={{width:60}}/>
              </div>
              {selectedObj && (
                <>
                  <div className="anim-subsection">
                    <span className="prop-label">Auto Spin</span>
                    <button className={`prop-toggle ${selectedObj.animPlaying?'on':''}`}
                      onClick={()=>updateSelected({animPlaying:!selectedObj.animPlaying})}
                      style={selectedObj.animPlaying?{background:orb.accent,color:'#000'}:{}}>
                      {selectedObj.animPlaying?'ON':'OFF'}
                    </button>
                  </div>
                  <div className="anim-kf-list">
                    <div className="prop-section-title" style={{marginTop:8}}>KEYFRAMES ({selectedObj.keyframes?.length||0})</div>
                    {(selectedObj.keyframes||[]).map((kf,i)=>(
                      <div key={i} className="kf-item">
                        <span>◆ Frame {kf.frame}</span>
                      </div>
                    ))}
                    <button className="anim-btn" style={{marginTop:8}} onClick={()=>{
                      if(!selectedObj) return;
                      updateSelected({ keyframes:[...(selectedObj.keyframes||[]),{frame:currentFrame,position:[...selectedObj.position],rotation:[...selectedObj.rotation],scale:[...selectedObj.scale]}]});
                    }}>+ Insert Keyframe at {currentFrame}</button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="sidebar-divider"/>

          {/* AI CHAT */}
          <div className="assistant-chat-panel">
            <div className="chat-header">
              <MessageSquare size={12}/>
              <span>AI COMMAND</span>
            </div>
            <div className="chat-log-area">
              {chatHistory.map((msg,i)=>(
                <div key={i} className={`log-entry ${msg.role}`}>
                  <div className="entry-author">{msg.role==='assistant'?orb.name:'OPERATOR'}</div>
                  <div className="entry-content">{msg.content}</div>
                </div>
              ))}
              {isGenerating && (
                <div className="log-entry assistant">
                  <div className="entry-author">{orb.name}</div>
                  <div className="entry-content">Generating geometry...</div>
                </div>
              )}
            </div>
            <div className="chat-input-zone">
              <input type="text" value={chatInput}
                onChange={e=>setChatInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSend()}
                placeholder="generate a drone / move up 2 / rotate 45..."
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

function ToolBtn({ icon: Icon, active=false, label, onClick }) {
  return (
    <div className={`tool-icon-box ${active?'active':''}`} title={label} onClick={onClick}>
      <Icon size={17}/>
    </div>
  );
}
