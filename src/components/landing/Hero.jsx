import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { 
  Environment, 
  ContactShadows, 
  PerspectiveCamera, 
  OrbitControls, 
  Float,
  BakeShadows
} from '@react-three/drei';
import { 
  ChevronRight, 
  ChevronLeft, 
  Mic, 
  Shield, 
  Cpu, 
  Palette, 
  Globe,
  Zap
} from 'lucide-react';
import Chestplate from './Chestplate.jsx';
import Orb3D from './Orb3D.jsx';
import { ORB_MODES } from '../../data/orbs.js';
import { useSession } from '../../context/SessionContext.jsx';
import './Hero.css';

const Hero = ({ isSelectionMode = false, onConfirm }) => {
  const [selectedOrbIdx, setSelectedOrbIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const { setSelectedOrbId, setIsOrbSelected, setOrbSettings } = useSession();
  
  const currentOrb = ORB_MODES[selectedOrbIdx];

  const handleNext = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      setSelectedOrbIdx((prev) => (prev + 1) % ORB_MODES.length);
      setTimeout(() => setIsOpen(false), 800);
    }, 400);
  }, []);

  const handlePrev = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      setSelectedOrbIdx((prev) => (prev - 1 + ORB_MODES.length) % ORB_MODES.length);
      setTimeout(() => setIsOpen(false), 800);
    }, 400);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <section className="hero-cinematic">
      <div className="aether-grid-overlay"></div>

      <div className="hero-layout-v3">
        {/* Top Header Section */}
        <header className="hero-header">
           <motion.h1 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="main-headline"
           >
             SELECT YOUR AI CORE
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="main-subheadline"
           >
             Initialize the chestplate core and choose the intelligence mode that powers your creation workflow.
           </motion.p>
        </header>

        <div className="hero-main-container">
            {/* Left Orb Selector */}
            <div className="side-panel left-panel">
              <div className="panel-header">CORE_LIBRARY</div>
              <div className="orb-selector-list">
                {ORB_MODES.map((orb, idx) => (
                  <button 
                    key={orb.id}
                    className={`orb-selector-item ${selectedOrbIdx === idx ? 'active' : ''}`}
                    onClick={() => {
                        setIsOpen(true);
                        setTimeout(() => {
                          setSelectedOrbIdx(idx);
                          setTimeout(() => setIsOpen(false), 800);
                        }, 400);
                    }}
                  >
                    <div className="orb-selector-dot" style={{ background: orb.color }}></div>
                    <span>{orb.id.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Centered Chestplate Canvas */}
            <div className="center-stage-v3">
              <div className="canvas-container-v3">
                <Canvas shadows camera={{ position: [0, 0, 15], fov: 35 }}>
                  <Suspense fallback={null}>
                    <OrbitControls 
                      enableZoom={false} 
                      enablePan={false} 
                      minPolarAngle={Math.PI/2.5} 
                      maxPolarAngle={Math.PI/1.8} 
                    />
                    
                    <Chestplate isOpen={isOpen}>
                      <Orb3D key={currentOrb.id} config={currentOrb} isListening={isListening} />
                    </Chestplate>

                    <Environment preset="night" />
                    <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2.5} />
                  </Suspense>
                </Canvas>
              </div>

              {/* Navigation Arrow Hints */}
              <div className="nav-hints">
                <button className="nav-hint-btn" onClick={handlePrev}><ChevronLeft size={32} /></button>
                <button className="nav-hint-btn" onClick={handleNext}><ChevronRight size={32} /></button>
              </div>
            </div>

            {/* Right Command Panel */}
            <div className="side-panel right-panel">
              <div className="panel-header">COMMAND_INTERFACE</div>
              <div className="action-buttons-v3">
                <button className="aether-premium-btn" onClick={() => {
                    setSelectedOrbId(currentOrb.id);
                    setOrbSettings(prev => ({ ...prev, color: currentOrb.color }));
                    setIsOrbSelected(true);
                    if (onConfirm) onConfirm(currentOrb.id);
                    navigate('/editor');
                }}>
                  INITIALIZE STUDIO
                </button>
                <button className="aether-ghost-btn" onClick={() => setIsListening(!isListening)}>
                  {isListening ? 'LISTENING...' : 'VOICE COMMAND'}
                </button>
              </div>

              <div className="status-box-v3 glass-panel">
                <div className="status-label">SYSTEM_CORE</div>
                <div className="status-value text-cyan">ACTIVE</div>
                <div className="status-label">LATENCY</div>
                <div className="status-value">14ms</div>
              </div>
            </div>
        </div>

        {/* Bottom Orb Info HUD */}
        <footer className="hero-footer-hud">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentOrb.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="orb-details-v3"
            >
              <div className="core-category">{currentOrb.coreType}</div>
              <h2 className="core-name" style={{ color: currentOrb.color }}>{currentOrb.name}</h2>
              <p className="core-description">{currentOrb.description}</p>
            </motion.div>
          </AnimatePresence>
          <div className="footer-hint">USE LEFT / RIGHT ARROW KEYS TO CYCLE CORES</div>
        </footer>
      </div>
    </section>
  );
};

export default Hero;
