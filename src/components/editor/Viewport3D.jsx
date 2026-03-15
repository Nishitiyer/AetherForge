import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stage, Environment, ContactShadows, TransformControls } from '@react-three/drei';
import './Viewport.css';

const Scene = ({ activeMode, sceneObjects }) => {
  return (
    <>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      
      <Suspense fallback={null}>
        <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2 }} adjustCamera>
           {sceneObjects.map((obj) => (
             <group key={obj.id} position={obj.position} scale={obj.scale}>
               {obj.type === 'Group' ? (
                 obj.parts.map((part, pIdx) => (
                   <mesh key={pIdx} position={part.position} scale={part.scale}>
                     {part.type === 'Box' && <boxGeometry args={[1, 1, 1]} />}
                     {part.type === 'Sphere' && <sphereGeometry args={[1, 32, 32]} />}
                     {part.type === 'Cylinder' && <cylinderGeometry args={[1, 1, 1, 32]} />}
                     {part.type === 'Cone' && <coneGeometry args={[1, 1, 32]} />}
                     {part.type === 'Torus' && <torusGeometry args={[1, 0.4, 16, 100]} />}
                     <meshStandardMaterial 
                       color={part.color} 
                       roughness={0.2} 
                       metalness={0.7} 
                       envMapIntensity={1}
                     />
                   </mesh>
                 ))
               ) : (
                 <mesh>
                   {obj.type === 'Model' && <boxGeometry args={[1, 1, 1]} />}
                   {obj.type === 'Character' && <capsuleGeometry args={[0.3, 1, 4, 8]} />}
                   {obj.type === 'Material' && <sphereGeometry args={[1, 64, 64]} />}
                   <meshStandardMaterial color={obj.color} roughness={0.3} metalness={0.8} />
                 </mesh>
               )}
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

const Viewport3D = ({ activeMode, sceneObjects }) => {
  return (
    <div className="viewport-3d-container">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        <Scene activeMode={activeMode} sceneObjects={sceneObjects} />
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
