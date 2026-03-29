import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ORB_MODES } from '../../data/orbs';
import { useSession } from '../../context/SessionContext';
import ChestReactorAssembly from './ChestReactorAssembly';
import Orb3D from './Orb3D';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import './Hero.css';

const Hero = ({ onConfirm }) => {
  const navigate = useNavigate();
  const { setSelectedOrbId, setIsOrbSelected, setOrbSettings } = useSession();

  // Unified State Machine (idle_closed | initialize_open | orb_swap | settle_open | idle_active)
  const [animState, setAnimState] = useState('idle_closed');
  
  // Interaction State
  const [activeOrbIdx, setActiveOrbIdx] = useState(0);
  const [nextOrbIdx, setNextOrbIdx] = useState(null); // Used for UI highlights during swap
  const [isExiting, setIsExiting] = useState(false);
  
  // Ref to prevent overlapping triggers
  const isAnimating = useRef(false);

  const currentOrb = ORB_MODES[activeOrbIdx];

  const triggerOrbSwap = useCallback((newIdx) => {
      // If closing or already animating a swap, ignore.
      if (isAnimating.current || newIdx === activeOrbIdx || animState === 'idle_closed') return;
      isAnimating.current = true;
      
      setNextOrbIdx(newIdx);
      setAnimState('orb_swap');
      setIsExiting(true); // tells current orb to sink/scale down

      // Halfway through swap sequence, swap the actual rendered component
      setTimeout(() => {
          setActiveOrbIdx(newIdx);
          setIsExiting(false); // new orb mounts and starts rising
      }, 1200);

      // Settle into open posture
      setTimeout(() => {
          setAnimState('settle_open');
          // Then move to continuous idle active after settling
          setTimeout(() => {
             setAnimState('idle_active');
             setNextOrbIdx(null);
             isAnimating.current = false;
          }, 800);
      }, 2500); 
  }, [activeOrbIdx, animState]);

  const handleNext = useCallback(() => {
      triggerOrbSwap((activeOrbIdx + 1) % ORB_MODES.length);
  }, [activeOrbIdx, triggerOrbSwap]);

  const handlePrev = useCallback(() => {
      triggerOrbSwap((activeOrbIdx - 1 + ORB_MODES.length) % ORB_MODES.length);
  }, [activeOrbIdx, triggerOrbSwap]);

  const handleInitialize = () => {
      if (isAnimating.current || animState !== 'idle_closed') return;
      isAnimating.current = true;
      setAnimState('initialize_open');
      
      setTimeout(() => {
          setAnimState('settle_open');
          setTimeout(() => {
             setAnimState('idle_active');
             isAnimating.current = false;
          }, 800);
      }, 2000);
  };

  const handleConfirm = () => {
      setSelectedOrbId(currentOrb.id);
      setOrbSettings(prev => ({ ...prev, color: currentOrb.color }));
      setIsOrbSelected(true);
      if (onConfirm) onConfirm(currentOrb.id);
      navigate('/editor');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
     <section className="hero-hardsurface-v6">
      <div className="v6-ambient-bg"></div>

      {/* TOP: Brand, Headline, Subheadline */}
      <header className="v6-header">
        <div className="v6-brand">AETHERFORGE // MK85</div>
        <h1 className="v6-headline">SELECT YOUR AI CORE</h1>
        <p className="v6-subheadline">
          Initialize the central chest reactor and choose the intelligence mode that powers your creation workflow.
        </p>
      </header>
      
      <div className="v6-main-layout">
         
         {/* SIDE PANEL: ORB SELECTOR */}
         <aside className="v6-selector-panel">
            <h3 className="v6-panel-title">CORE_LIBRARY</h3>
            <div className="v6-orb-list">
               {ORB_MODES.map((orb, idx) => {
                   const isActive = idx === (nextOrbIdx !== null ? nextOrbIdx : activeOrbIdx);
                   return (
                     <button 
                        key={orb.id} 
                        className={`v6-selector-btn ${isActive ? 'active' : ''}`}
                        onClick={() => {
                            if (animState === 'idle_closed') {
                                // First select the orb, then initialize
                                setActiveOrbIdx(idx);
                                handleInitialize();
                            } else {
                                triggerOrbSwap(idx);
                            }
                        }}
                     >
                       <span className="v6-orb-dot" style={{ backgroundColor: orb.color, boxShadow: isActive ? `0 0 10px ${orb.color}` : 'none' }}></span>
                       <span className="v6-orb-name-small">{orb.id.toUpperCase()}</span>
                     </button>
                   );
               })}
            </div>
         </aside>

         {/* CENTER: The 3D Render (40-50% width visual) */}
         <div className="v6-render-stage">
           <Canvas shadows camera={{ position: [0, 0, 16], fov: 35 }}>
             <Suspense fallback={null}>
               <OrbitControls 
                 enableZoom={false} 
                 enablePan={false} 
                 minPolarAngle={Math.PI/2.5} 
                 maxPolarAngle={Math.PI/1.8} 
                 minAzimuthAngle={-Math.PI/8}
                 maxAzimuthAngle={Math.PI/8}
               />
               <ChestReactorAssembly animState={animState}>
                 <Orb3D key={currentOrb.id} config={currentOrb} animState={animState} isExiting={isExiting} />
               </ChestReactorAssembly>
               <Environment preset="night" />
               <ContactShadows position={[0, -5, 0]} opacity={0.6} scale={30} blur={3} color="#000000" />
             </Suspense>
           </Canvas>

           {/* Hover Interaction Hints */}
           <button className="v6-nav-btn prev" onClick={handlePrev}><ChevronLeft size={64} /></button>
           <button className="v6-nav-btn next" onClick={handleNext}><ChevronRight size={64} /></button>
         </div>

         {/* RIGHT/BOTTOM SPACE (to balance columns) */}
         <aside className="v6-status-panel">
            <h3 className="v6-panel-title">SYSTEM_STATUS</h3>
            <div className="v6-status-item">
               <span className="v6-status-label">REACTOR</span>
               <span className="v6-status-value" style={{ color: currentOrb.color }}>{animState.toUpperCase().replace('_', ' ')}</span>
            </div>
            <div className="v6-status-item mt-4">
               <span className="v6-status-label">SYNC_LINK</span>
               <span className="v6-status-value text-white">99.8%</span>
            </div>
         </aside>

      </div>

      {/* BOTTOM: Orb Info & Helper */}
      <footer className="v6-footer">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentOrb.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="v6-orb-info"
          >
            <h2 className="v6-orb-name-large" style={{ color: currentOrb.color }}>{currentOrb.name.toUpperCase()}</h2>
            <p className="v6-orb-desc">{currentOrb.description}</p>
          </motion.div>
        </AnimatePresence>
        
        <div className="v6-actions">
           {animState === 'idle_closed' ? (
              <button className="v6-launch-btn init" onClick={handleInitialize}>
                INITIALIZE SUIT 
              </button>
           ) : (
              <button className="v6-launch-btn primary" onClick={handleConfirm} style={{ borderColor: currentOrb.color, color: currentOrb.color }}>
                ENTER WORKSPACE
              </button>
           )}
        </div>
        
        <div className="v6-helper">Use UI or Left/Right Arrows for selection</div>
      </footer>
    </section>
  );
};

export default Hero;
