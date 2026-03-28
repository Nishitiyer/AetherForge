import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import './Hero.css';

const Hero = ({ isSelectionMode = false, onConfirm }) => {
  const [selectedOrbIdx, setSelectedOrbIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const currentOrb = ORB_MODES[selectedOrbIdx];

  const handleNext = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      setSelectedOrbIdx((prev) => (prev + 1) % ORB_MODES.length);
      setTimeout(() => setIsOpen(false), 500);
    }, 300);
  }, []);

  const handlePrev = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => {
      setSelectedOrbIdx((prev) => (prev - 1 + ORB_MODES.length) % ORB_MODES.length);
      setTimeout(() => setIsOpen(false), 500);
    }, 300);
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
      {/* Background Technical Overlays */}
      <div className="aether-grid-overlay"></div>
      <div className="scanline-overlay"></div>

      <div className="hero-main-container">
        {/* Left Stats Panel */}
        <div className="side-panel left-panel">
          <div className="panel-header">
            <Shield size={16} />
            <span>SYSTEM STATUS</span>
          </div>
          <div className="status-item">
            <span className="label">CORE_SYNC</span>
            <span className="value text-cyan">STABLE</span>
          </div>
          <div className="status-item">
            <span className="label">AETHER_LINK</span>
            <span className="value text-cyan">ACTIVE</span>
          </div>
          <div className="status-item">
            <span className="label">MEMORY_LOAD</span>
            <span className="value">14.2 GB</span>
          </div>
          <div className="mt-8">
            <div className="orb-selector-list">
              {ORB_MODES.map((orb, idx) => (
                <button 
                  key={orb.id}
                  className={`orb-selector-item ${selectedOrbIdx === idx ? 'active' : ''}`}
                  onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => {
                      setSelectedOrbIdx(idx);
                      setTimeout(() => setIsOpen(false), 500);
                    }, 300);
                  }}
                >
                  <div className="orb-selector-color" style={{ background: orb.color }}></div>
                  <span>{orb.id.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Canvas Area */}
          <div className="center-stage">
            <div className="selection-arrows">
              <button className="nav-arrow left" onClick={handlePrev}>
                <ChevronLeft size={48} />
              </button>
              <button className="nav-arrow right" onClick={handleNext}>
                <ChevronRight size={48} />
              </button>
            </div>

            <div className="canvas-container">
              <Canvas shadows>
                <Suspense fallback={null}>
                  <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
                  <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/2.5} maxPolarAngle={Math.PI/2} />
                  
                  <Chestplate isOpen={isOpen}>
                    <Orb3D key={currentOrb.id} config={currentOrb} isListening={isListening} />
                  </Chestplate>

                  <Environment preset="night" />
                  <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2.5} far={10} color="#000000" />
                  
                  <ambientLight intensity={0.2} />
                </Suspense>
              </Canvas>
            </div>

            {/* Interactive HUD Elements */}
            <div className="hud-overlay">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentOrb.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="orb-info-hud"
                >
                  <div className="orb-title-row">
                    <h2 style={{ color: currentOrb.color }}>{currentOrb.name}</h2>
                    <span className="orb-aura">{currentOrb.aura}</span>
                  </div>
                  <p className="orb-desc">{currentOrb.description}</p>
                </motion.div>
              </AnimatePresence>

              <div className="keyboard-hint mt-4">
                <span className="key-tag">LEFT_ARROW</span> OR <span className="key-tag">RIGHT_ARROW</span> TO BROWSE CORES
              </div>
            </div>
          </div>

        {/* Right Action Panel */}
        <div className="side-panel right-panel text-right">
          <div className="panel-header justify-end">
            <span>COMMAND_MATRIX</span>
            <Cpu size={16} />
          </div>
          <div className="action-button-container">
            <button className="aether-primary-btn" onClick={() => (window.location.href = '/editor')}>
              <div className="btn-inner">
                <Palette size={18} />
                <span>LAUNCH STUDIO</span>
              </div>
              <div className="btn-glitch"></div>
            </button>
            <button className="aether-secondary-btn" onClick={() => setIsListening(!isListening)}>
              <div className="btn-inner">
                <Mic size={18} className={isListening ? 'listening-icon' : ''} />
                <span>{isListening ? 'LISTENING...' : 'VOICE COMMAND'}</span>
              </div>
            </button>
          </div>

          <div className="personality-box mt-12 p-4 glass-panel text-left">
            <div className="text-xs text-muted-foreground mb-2">AI_PERSONALITY_PROFILE</div>
            <div className="text-sm font-medium">{currentOrb.personality}</div>
            <div className="text-xs text-muted-foreground mt-4 mb-2">PRIMARY_USE_CASE</div>
            <div className="text-sm text-cyan-400">{currentOrb.useCase}</div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="hero-branding-footer">
        <div className="branding-line left"></div>
        <div className="branding-logo">AETHERFORGE // v2.0.4-STABLE</div>
        <div className="branding-line right"></div>
      </div>

      {/* Cinematic Reveal Elements */}
      <div className="cinematic-border top"></div>
      <div className="cinematic-border bottom"></div>
    </section>
  );
};

export default Hero;
