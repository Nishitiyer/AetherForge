import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import Orb3D from '../landing/Orb3D';
import { ORB_MODES } from '../../data/orbs';
import { useSession } from '../../context/SessionContext';
import './ActiveVoiceAssistant.css';

const ActiveVoiceAssistant = ({ isListening, onClick }) => {
  const { selectedOrbId } = useSession();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  React.useEffect(() => {
    const handleAI = () => {
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 2000); // Pulse while thinking/acting
    };
    window.addEventListener('aether-ai-command', handleAI);
    return () => window.removeEventListener('aether-ai-command', handleAI);
  }, []);

  const config = ORB_MODES.find(o => o.id === selectedOrbId) || ORB_MODES[0];
  const isActive = isListening || isProcessing;

  return (
    <div className={`active-assistant-widget ${isActive ? 'listening' : ''}`} onClick={onClick}>
       <div className="assistant-canvas-container">
          <Canvas camera={{ position: [0, 0, 4], fov: 40 }} style={{ background: 'transparent' }}>
             <Suspense fallback={null}>
                <Environment preset="night" />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                
                <group scale={isActive ? 0.92 : 0.8} position={[0, -0.2, 0]}>
                   <Orb3D config={config} animState={isActive ? 'idle_active' : 'idle_closed'} isExiting={false} responsive={isActive} />
                </group>
                <OrbitControls enableZoom={false} enablePan={false} autoRotate={isActive} autoRotateSpeed={isActive ? 12 : 4} />
             </Suspense>
          </Canvas>
       </div>
       <div className={`assistant-ring ${isActive ? 'active-pulse' : ''}`} 
            style={{ 
              borderColor: isActive ? config.color : 'rgba(255,255,255,0.05)', 
              boxShadow: isActive ? `0 0 25px ${config.color}, inset 0 0 15px ${config.color}` : 'none' 
            }}>
       </div>
    </div>
  );
};

export default ActiveVoiceAssistant;
