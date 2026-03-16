import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  TransformControls
} from '@react-three/drei';

const MeshObject = ({ obj, isSelected, onClick, transformMode }) => {
  return (
    <group position={obj.position} scale={obj.scale}>
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
          {part.type === 'Sphere' && <sphereGeometry args={[1, part.detail || 32, part.detail || 32]} />}
          {part.type === 'Cylinder' && <cylinderGeometry />}
          {part.type === 'Torus' && <torusGeometry args={[1, 0.4, 16, 100, part.arc || Math.PI * 2]} />}
          {part.type === 'Plane' && <planeGeometry args={[1, 1, part.segments || 1, part.segments || 1]} />}
          {part.type === 'Cone' && <coneGeometry />}
          {/* Fallback */}
          {!['Box', 'Sphere', 'Cylinder', 'Torus', 'Plane', 'Cone'].includes(part.type) && <boxGeometry />}
          
          <meshStandardMaterial 
            color={part.color || '#8b5cf6'} 
            roughness={part.roughness ?? 0.15}
            metalness={part.metalness ?? 0.8}
            emissive={isSelected ? part.color : (part.emissive || '#000')}
            emissiveIntensity={isSelected ? 0.3 : (part.emissiveIntensity || 0)}
            wireframe={part.wireframe || false}
            transparent={part.opacity !== undefined}
            opacity={part.opacity ?? 1}
          />
        </mesh>
      ))}
      {isSelected && (
        <TransformControls mode={transformMode} />
      )}
    </group>
  );
};

const Scene = ({ sceneObjects, selectedObjectId, setSelectedObjectId, setSelectedPartIndex, transformMode, renderSettings = {} }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 12, 12]} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      
      <ambientLight intensity={renderSettings.ambientIntensity ?? 0.4} />
      <spotLight 
        position={[10, 15, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={renderSettings.lightIntensity ?? 2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      
      <Environment preset={renderSettings.envPreset || "city"} />
      
      <Suspense fallback={null}>
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
        
        {renderSettings.showShadows !== false && (
          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.6} 
            scale={40} 
            blur={2} 
            far={10} 
            color="#000000"
          />
        )}
        
        <gridHelper args={[100, 100, 0x444444, 0x222222]} />
      </Suspense>
    </>
  );
};

const Viewport3D = ({ 
  sceneObjects, 
  renderSettings = {},
  selectedObjectId, 
  setSelectedObjectId, 
  selectedPartIndex, 
  setSelectedPartIndex,
  transformMode
}) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#070708', position: 'relative' }}>
      <Canvas shadows antialias dpr={[1, 2]}>
        <Scene 
          sceneObjects={sceneObjects}
          selectedObjectId={selectedObjectId}
          setSelectedObjectId={setSelectedObjectId}
          setSelectedPartIndex={setSelectedPartIndex}
          transformMode={transformMode}
          renderSettings={renderSettings}
        />
      </Canvas>
      
      <div className="viewport-overlay-info glass">
        <span>{selectedObjectId ? `Editing: ${selectedObjectId}` : 'Scene View'}</span>
      </div>
    </div>
  );
};

export default Viewport3D;
