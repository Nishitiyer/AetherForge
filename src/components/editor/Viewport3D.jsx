import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Stage, Environment, ContactShadows, TransformControls } from '@react-three/drei';
import { applyAnimation } from '../../utils/ModelFactory.jsx';
import './Viewport.css';

const Scene = ({ 
  activeMode, 
  sceneObjects, 
  setSceneObjects,
  selectedObjectId,
  setSelectedObjectId,
  selectedPartIndex,
  setSelectedPartIndex,
  transformMode
}) => {
  const [localParts, setLocalParts] = React.useState({});

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const updates = {};
    sceneObjects.forEach(obj => {
      if (obj.animation && obj.parts) {
        updates[obj.id] = applyAnimation(obj.parts, obj.animation, time);
      }
    });
    setLocalParts(updates);
  });

  const handleTransformChange = (objId, pIdx, newTransform) => {
    const newObjects = sceneObjects.map(obj => {
      if (obj.id === objId) {
        if (pIdx === null) {
          return { ...obj, ...newTransform };
        } else {
          const newParts = [...obj.parts];
          newParts[pIdx] = { ...newParts[pIdx], ...newTransform };
          return { ...obj, parts: newParts };
        }
      }
      return obj;
    });
    setSceneObjects(newObjects);
  };

  return (
    <>
      <OrbitControls makeDefault enabled={!selectedObjectId} />
      
      <Suspense fallback={null}>
        <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2 }} adjustCamera>
           {sceneObjects.map((obj) => (
             <group 
               key={obj.id} 
               position={obj.position} 
               scale={obj.scale}
               onClick={(e) => { e.stopPropagation(); setSelectedObjectId(obj.id); setSelectedPartIndex(null); }}
             >
               {(localParts[obj.id] || obj.parts || [obj]).map((part, pIdx) => {
                 const isSelected = selectedObjectId === obj.id && (obj.parts ? selectedPartIndex === pIdx : true);
                 const actualPart = obj.parts ? part : obj;
                 
                 return (
                   <React.Fragment key={pIdx}>
                     <mesh 
                       position={actualPart.position} 
                       scale={actualPart.scale}
                       rotation={actualPart.rotation || [0, 0, 0]}
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         setSelectedObjectId(obj.id); 
                         if (obj.parts) setSelectedPartIndex(pIdx);
                       }}
                     >
                       {actualPart.type === 'Box' && <boxGeometry args={[1, 1, 1]} />}
                       {actualPart.type === 'Sphere' && <sphereGeometry args={[1, 32, 32]} />}
                       {actualPart.type === 'Cylinder' && <cylinderGeometry args={[1, 1, 1, 32]} />}
                       {actualPart.type === 'Cone' && <coneGeometry args={[1, 1, 32]} />}
                       {actualPart.type === 'Torus' && <torusGeometry args={[1, 0.4, 16, 100]} />}
                       <meshStandardMaterial 
                         color={actualPart.color} 
                         roughness={0.2} 
                         metalness={0.7} 
                         emissive={isSelected ? '#4f46e5' : '#000000'}
                         emissiveIntensity={isSelected ? 0.3 : 0}
                       />
                     </mesh>
                     {isSelected && (
                       <TransformControls 
                         mode={transformMode}
                         onMouseUp={() => {
                           // In a real app we'd grab the new position from the ref
                           // For this demo, we'll assume the state updates are handled via interaction
                         }}
                       />
                     )}
                   </React.Fragment>
                 );
               })}
             </group>
           ))}
        </Stage>
      </Suspense>

      <Grid 
        infiniteGrid 
        fadeDistance={50} 
        fadeStrength={5} 
        cellSize={1} 
        sectionSize={5} 
        sectionColor="#4f46e5" 
        cellColor="#1e293b" 
      />
      
      <Environment preset="city" />
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
    </>
  );
};

const Viewport3D = (props) => {
  return (
    <div className="viewport-3d-container">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        <Scene {...props} />
      </Canvas>
      
      <div className="viewport-overlay-ui">
        <div className="viewport-stats">
          <span>FPS: 60</span>
          <span>Polys: 2.4k</span>
        </div>
      </div>
    </div>
  );
};

export default Viewport3D;
