import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  TransformControls,
  BakeShadows,
  useVideoTexture,
  Html
} from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';

const ARBackground = ({ videoRef }) => {
  const { scene } = useThree();
  const texture = useVideoTexture(videoRef.current?.srcObject ? videoRef.current : null);
  
  useFrame(() => {
    if (texture) {
      scene.background = texture;
    }
  });

  return null;
};

const GestureHand = ({ 
  gestureData, 
  selectedObjectId, 
  sceneObjects, 
  setSceneObjects, 
  lastGesturePos 
}) => {
  const { camera } = useThree();
  const createCooldown = useRef(0);

  useFrame((state, delta) => {
    if (!gestureData || !gestureData.landmarks || gestureData.landmarks.length === 0) {
      lastGesturePos.current = null;
      return;
    }

    createCooldown.current = Math.max(0, createCooldown.current - delta);

    // Multi-hand processing
    gestureData.landmarks.forEach((landmarks, idx) => {
      const gesture = gestureData.gestures[idx];
      const pos = gestureData.handPosList[idx];
      
      // Convert normalized camera coords to 3D world coords
      // Iron Man Projection: Map screen X/Y to a plane at Z=0 in front of camera
      const vector = new THREE.Vector3((pos.x - 0.5) * 2, (0.5 - pos.y) * 2, 0.5);
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = 15; // Interaction plane distance
      const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));

      // 1. CREATION (PUSH or THUMBS_UP)
      if ((gesture === 'THUMBS_UP' || (pos.v > 15)) && createCooldown.current === 0) {
        const newId = `obj-${Date.now()}`;
        const newObj = {
          id: newId,
          position: [worldPos.x, worldPos.y, worldPos.z],
          scale: [1, 1, 1],
          animation: 'PULSE',
          parts: [
            { type: 'Sphere', position: [0, 0, 0], scale: [1, 1, 1], color: '#00e5ff', metalness: 0.9, roughness: 0.1 }
          ]
        };
        setSceneObjects(prev => [...prev, newObj]);
        createCooldown.current = 1.5; // Cooldown for creation
        return;
      }

      // 2. TRANSLATION (GRAB or PINCH)
      if (gesture === 'GRAB' || gesture === 'PINCH') {
        if (selectedObjectId) {
          setSceneObjects(prev => prev.map(obj => {
            if (obj.id === selectedObjectId) {
              // Smooth follow
              return {
                ...obj,
                position: [
                  THREE.MathUtils.lerp(obj.position[0], worldPos.x, 0.2),
                  THREE.MathUtils.lerp(obj.position[1], worldPos.y, 0.2),
                  THREE.MathUtils.lerp(obj.position[2], worldPos.z, 0.2)
                ]
              };
            }
            return obj;
          }));
        }
      }

      // 3. ROTATION (Using hand orientation / velocity)
      if (gesture === 'POINT' && selectedObjectId) {
        setSceneObjects(prev => prev.map(obj => {
           if (obj.id === selectedObjectId) {
             return { ...obj, animation: 'SPIN' };
           }
           return obj;
        }));
      }

      // 4. EXPLODE / DELETE (GUN)
      if (gesture === 'GUN' && selectedObjectId) {
         setSceneObjects(prev => prev.map(obj => {
           if (obj.id === selectedObjectId) {
             return { ...obj, animation: 'EXPLODE' };
           }
           return obj;
         }));
      }
    });
  });

  return null;
};

const MeshObject = ({ obj, isSelected, onClick }) => {
  const meshRef = useRef();
  const [explosionFactor, setExplosionFactor] = useState(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (obj.animation === 'SPIN') {
      meshRef.current.rotation.y += delta * 4;
      meshRef.current.rotation.x += delta * 2;
    }
    
    if (obj.animation === 'PULSE') {
      const s = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
      meshRef.current.scale.set(s, s, s);
    }

    if (obj.animation === 'EXPLODE') {
      setExplosionFactor(prev => Math.min(prev + delta * 2, 5));
    }
  });

  return (
    <group ref={meshRef} position={obj.position} scale={obj.scale}>
      {obj.parts.map((part, index) => {
        // Explode logic: offset parts from center
        const explodeOffset = [
          (part.position[0] || index - 0.5) * explosionFactor,
          (part.position[1] || index - 0.5) * explosionFactor,
          (part.position[2] || index - 0.5) * explosionFactor
        ];

        return (
          <mesh 
            key={index}
            position={[
              part.position[0] + explodeOffset[0],
              part.position[1] + explodeOffset[1],
              part.position[2] + explodeOffset[2]
            ]}
            scale={part.scale}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              onClick(obj.id, index);
            }}
          >
            {part.type === 'Box' && <boxGeometry />}
            {part.type === 'Sphere' && <sphereGeometry args={[1, 32, 32]} />}
            {part.type === 'Cylinder' && <cylinderGeometry args={[1, 1, 2, 32]} />}
            {part.type === 'Torus' && <torusGeometry args={[1, 0.4, 32, 64]} />}
            
            <meshStandardMaterial 
              color={part.color} 
              roughness={isSelected ? 0.1 : (part.roughness ?? 0.2)}
              metalness={isSelected ? 1.0 : (part.metalness ?? 0.8)}
              emissive={isSelected ? "#00ffff" : "#000"}
              emissiveIntensity={isSelected ? 0.5 : 0}
              transparent={obj.animation === 'EXPLODE'}
              opacity={obj.animation === 'EXPLODE' ? 1 - explosionFactor/5 : 1}
            />
          </mesh>
        );
      })}
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
  videoRef 
}) => {
  const lastGesturePos = useRef(null);

  return (
    <div className="viewport-3d-canvas-root">
      <Canvas 
         shadows 
         gl={{ 
           antialias: true, 
           powerPreference: "high-performance",
           alpha: true 
         }}
         dpr={[1, 2]}
      >
        <Suspense fallback={<Html center>Initializing OS...</Html>}>
          <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          
          {videoRef?.current && <ARBackground videoRef={videoRef} />}
          
          <GestureHand 
            gestureData={gestureData} 
            selectedObjectId={selectedObjectId}
            sceneObjects={sceneObjects}
            setSceneObjects={setSceneObjects}
            lastGesturePos={lastGesturePos}
          />
          
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00e5ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
          
          <group>
            {sceneObjects.map(obj => (
              <MeshObject 
                key={obj.id} 
                obj={obj} 
                isSelected={selectedObjectId === obj.id}
                onClick={(id, partIdx) => {
                  setSelectedObjectId(id);
                  setSelectedPartIndex(partIdx);
                }}
              />
            ))}
          </group>
          
          <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={40} blur={2} far={10} color="#000" />
          <Environment preset="city" />
          
          <EffectComposer>
            <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
            <ChromaticAberration offset={[0.002, 0.002]} />
          </EffectComposer>

          <BakeShadows />
        </Suspense>
      </Canvas>
      
      <style>{`
        .viewport-3d-canvas-root {
          width: 100%;
          height: 100%;
          background: #000;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default Viewport3D;
