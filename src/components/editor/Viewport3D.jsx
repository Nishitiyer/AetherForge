import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  TransformControls,
  BakeShadows,
  Float,
  Sphere as DreiSphere
} from '@react-three/drei';
import AssistantOrb from '../common/AssistantOrb.jsx';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette, SSAO, ToneMapping } from '@react-three/postprocessing';
import * as THREE from 'three';

const GestureHand = ({ gestureData, selectedObjectId, sceneObjects, setSceneObjects, lastGesturePos }) => {
  useFrame((state, delta) => {
    if (!gestureData || !gestureData.landmarks || !selectedObjectId) {
      lastGesturePos.current = null;
      return;
    }

    // 1. PINCH -> TRANSLATE
    if (gestureData.gesture === 'PINCH') {
      const indexTip = gestureData.landmarks[8];
      const currentPos = { x: (indexTip.x - 0.5) * 20, y: (0.5 - indexTip.y) * 20 };

      if (lastGesturePos.current) {
        const dx = currentPos.x - lastGesturePos.current.x;
        const dy = currentPos.y - lastGesturePos.current.y;

        setSceneObjects(prev => prev.map(obj => {
          if (obj.id === selectedObjectId) {
            return {
              ...obj,
              position: [
                obj.position[0] + dx,
                obj.position[1] + dy,
                obj.position[2]
              ]
            };
          }
          return obj;
        }));
      }
      lastGesturePos.current = currentPos;
    }

    // 2. PALM_OPEN -> ROTATION ANIMATION (AUTO)
    if (gestureData.gesture === 'PALM_OPEN') {
       setSceneObjects(prev => prev.map(obj => {
         if (obj.id === selectedObjectId) {
           return { ...obj, animation: 'SPIN' };
         }
         return obj;
       }));
    }
  });

  return null;
};

const MeshObject = ({ obj, isSelected, onClick, transformMode }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (obj.animation === 'SPIN') {
      meshRef.current.rotation.y += delta * 2;
    }
    if (obj.animation === 'PULSE') {
      const s = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={meshRef} position={obj.position} scale={obj.scale}>
      {obj.parts.map((part, index) => (
        <mesh 
          key={index}
          position={part.position}
          scale={part.scale}
          rotation={part.rotation || [0, 0, 0]}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            onClick(obj.id, index);
          }}
        >
          {part.type === 'Box' && <boxGeometry />}
          {part.type === 'Sphere' && <sphereGeometry args={[1, 64, 64]} />}
          {part.type === 'Cylinder' && <cylinderGeometry args={[1, 1, 2, 32]} />}
          {part.type === 'Torus' && <torusGeometry args={[1, 0.4, 32, 100]} />}
          {part.type === 'Plane' && <planeGeometry args={[1, 1]} />}
          {!['Box', 'Sphere', 'Cylinder', 'Torus', 'Plane'].includes(part.type) && <boxGeometry />}
          
          <meshStandardMaterial 
            color={part.color} 
            roughness={part.roughness ?? 0.2}
            metalness={part.metalness ?? 0.8}
            emissive={isSelected ? "#00d4ff" : (part.emissive || "#000")}
            emissiveIntensity={isSelected ? 0.2 : (part.emissiveIntensity || 0)}
            wireframe={part.wireframe}
            envMapIntensity={1}
            transparent={part.opacity < 1}
            opacity={part.opacity ?? 1}
            transmission={part.transmission ?? 0}
            thickness={part.thickness ?? 1}
            clearcoat={part.clearcoat ?? 0}
          />
        </mesh>
      ))}
    </group>
  );
};

const Viewport3D = ({ 
  sceneObjects, 
  setSceneObjects,
  selectedObjectId, 
  setSelectedObjectId, 
  setSelectedPartIndex,
  transformMode,
  gestureData,
  selectedOrbId
}) => {
  const lastGesturePos = useRef(null);
  const [isAIActive, setIsAIActive] = React.useState(false);

  // Listen for AI commands from AIPanel
  React.useEffect(() => {
    const handleAI = (e) => {
      const { action, type, color } = e.detail;
      setIsAIActive(true);
      setTimeout(() => setIsAIActive(false), 2000); // 2 second pulse on action
      
      setSceneObjects(prev => prev.map(obj => {
        if (obj.id === selectedObjectId) {
          if (action === 'ANIMATE') return { ...obj, animation: type };
          if (action === 'MATERIAL') {
            return {
              ...obj,
              parts: obj.parts.map(p => ({ ...p, color }))
            };
          }
        }
        return obj;
      }));
    };
    window.addEventListener('aether-ai-command', handleAI);
    return () => window.removeEventListener('aether-ai-command', handleAI);
  }, [selectedObjectId, setSceneObjects]);

  const selectedObj = sceneObjects.find(o => o.id === selectedObjectId);

  return (
    <div className="viewport-3d-canvas-root">
      <Canvas 
         shadows 
         legacy={true}
         gl={{ 
           antialias: false, 
           powerPreference: "high-performance",
           alpha: false,
           stencil: false,
           depth: true
         }}
         dpr={[1, 2]}
         onPointerUp={() => { lastGesturePos.current = null; }}
      >
        <color attach="background" args={['#1a1a1a']} />
        
        {/* <Suspense fallback={null}> */}
          <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={45} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          
          <GestureHand 
            gestureData={gestureData} 
            selectedObjectId={selectedObjectId}
            sceneObjects={sceneObjects}
            setSceneObjects={setSceneObjects}
            lastGesturePos={lastGesturePos}
          />
          
          {/* High-Performance Lighting */}
          <ambientLight intensity={0.5} />
          <spotLight 
            position={[10, 15, 10]} 
            angle={0.3} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />
          
          <Environment preset="city" />

          {/* Scene Content */}
          <group>
            {sceneObjects.map(obj => (
              <MeshObject 
                key={obj.id} 
                obj={obj} 
                isSelected={selectedObjectId === obj.id}
                transformMode={transformMode}
                onClick={(id, partIdx) => {
                  setSelectedObjectId(id);
                  setSelectedPartIndex(partIdx);
                }}
              />
            ))}
            {selectedObj && (
              <TransformControls 
                object={sceneObjects.find(o => o.id === selectedObjectId)} 
                mode={transformMode} 
                size={0.6} 
              />
            )}
          </group>
          
          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.4} 
            scale={40} 
            blur={2} 
            far={10} 
            color="#000000"
          />
          
          <gridHelper args={[100, 100, "#222", "#111"]} />
          
          {/* AI VOICE ASSISTANT (Holographic Orb) */}
          <AssistantOrb orbId={selectedOrbId} active={isAIActive} />
          
          <BakeShadows />
        {/* </Suspense> */}
      </Canvas>
      
      <style>{`
        .viewport-3d-canvas-root {
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default Viewport3D;
