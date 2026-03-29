import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { ORB_MODES } from '../../data/orbs';
import { useSession } from '../../context/SessionContext';
import './Hero.css';

// ── Map our orb data into the visual tokens the components need ──────────────
const ORB_META = {
  nova:     { gradient: 'from-amber-300 via-orange-400 to-red-500',    ring: 'rgba(251,191,36,.6)',  accent: '#fbbf24' },
  echo:     { gradient: 'from-fuchsia-300 via-violet-400 to-purple-500', ring: 'rgba(232,121,249,.6)', accent: '#e879f9' },
  sentinel: { gradient: 'from-cyan-300 via-sky-400 to-blue-500',       ring: 'rgba(34,211,238,.6)',  accent: '#22d3ee' },
  prism:    { gradient: 'from-teal-300 via-cyan-400 to-indigo-500',    ring: 'rgba(45,212,191,.6)',  accent: '#2dd4bf' },
  forge:    { gradient: 'from-red-300 via-orange-500 to-yellow-500',   ring: 'rgba(249,115,22,.6)',  accent: '#fb923c' },
  quantum:  { gradient: 'from-slate-200 via-sky-300 to-indigo-400',   ring: 'rgba(186,230,253,.6)', accent: '#bae6fd' },
};

// ── CSS Orb visual (no Three.js) ─────────────────────────────────────────────
function OrbVisual({ orbId, color, active = true, small = false }) {
  const meta = ORB_META[orbId] || ORB_META.nova;
  return (
    <div className={`orb-visual-root ${small ? 'orb-small' : 'orb-large'}`}>
      <motion.div
        className={`orb-glow bg-gradient-to-br ${meta.gradient}`}
        animate={{ scale: active ? [1, 1.10, 1] : 1, opacity: active ? [0.75, 1, 0.75] : 0.45 }}
        transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb-ring-outer"
        style={{ borderColor: meta.ring }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="orb-ring-inner"
        style={{ borderColor: meta.ring }}
        animate={{ rotate: -360 }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className={`orb-core bg-gradient-to-br ${meta.gradient}`}
        animate={{ y: small ? 0 : [0, -4, 0], scale: active ? [1, 1.04, 1] : 1 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="orb-nucleus"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

// ── The CSS-based ChestAssembly ───────────────────────────────────────────────
function ChestAssembly({ orb, animState }) {
  const meta    = ORB_META[orb.id] || ORB_META.nova;
  const isClosed  = animState === 'idle_closed';
  const isOpening = animState === 'initialize_open';
  const isActive  = animState === 'idle_active' || animState === 'orb_swap';

  return (
    <div className="chest-stage">
      {/* Ambient grid bg */}
      <div className="chest-grid-bg" />
      <div className="chest-radial-bg" />

      {/* The chest assembly container */}
      <div className="chest-assembly">

        {/* 1. UPPER COLLAR / FLAP */}
        <motion.div
          className="chest-collar"
          animate={{ y: isOpening ? -22 : isActive ? -12 : 0, rotateX: isOpening ? -18 : isActive ? -8 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* 2. PECTORAL ZONE */}
        <div className="chest-pec-zone">

          {/* LEFT PECTORAL */}
          <motion.div
            className="pec-panel pec-left"
            animate={{ rotate: isClosed ? -6 : isOpening ? -24 : -13, x: isClosed ? 0 : isActive ? -18 : -10 }}
            transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pec-inner-shadow" />
            <div className="pec-gold-edge" />
          </motion.div>

          {/* RIGHT PECTORAL */}
          <motion.div
            className="pec-panel pec-right"
            animate={{ rotate: isClosed ? 6 : isOpening ? 24 : 13, x: isClosed ? 0 : isActive ? 18 : 10 }}
            transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pec-inner-shadow" />
            <div className="pec-gold-edge" />
          </motion.div>

          {/* 3. STERNUM FRAME */}
          <div className="sternum-frame">
            <div className="sternum-ridge" />
            {/* Horizontal braces */}
            {[-40, -13, 14, 41].map((y, i) => (
              <div key={i} className="sternum-brace" style={{ top: `calc(50% + ${y}px)` }} />
            ))}
          </div>

          {/* 4. REACTOR CHAMBER (embedded in sternum) */}
          <div className="reactor-housing">
            {/* Outer housing ring */}
            <div className="reactor-outer-ring" style={{ boxShadow: `0 0 24px ${meta.ring}` }} />
            {/* Gold accent ring */}
            <motion.div
              className="reactor-track-ring"
              style={{ borderColor: meta.ring }}
              animate={{ rotate: isActive ? 360 : 0, opacity: isClosed ? 0.4 : 1 }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            />

            {/* Iris blades */}
            {[0,1,2,3,4,5].map(i => (
              <motion.div
                key={i}
                className="iris-blade"
                style={{
                  transform: `translateX(-50%) rotate(${i * 60}deg)`,
                  boxShadow: `0 0 8px ${meta.ring}`
                }}
                animate={{ scaleY: isClosed ? 0.5 : 1, opacity: isClosed ? 0.35 : 1 }}
                transition={{ duration: 0.55, delay: i * 0.04 }}
              />
            ))}

            {/* Orb pedestal + Orb */}
            <motion.div
              className="orb-pedestal"
              animate={{ y: isClosed ? 20 : 0, scale: isOpening ? [0.85, 1.05, 1] : 1 }}
              transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            >
              <OrbVisual orbId={orb.id} color={orb.color} active={isActive} />
            </motion.div>
          </div>
        </div>

        {/* 5. LOWER CHEST TAPER */}
        <div className="chest-lower-taper">
          <div className="taper-red-stripe" />
        </div>
      </div>
    </div>
  );
}

// ── Main Hero Component ───────────────────────────────────────────────────────
const Hero = ({ onConfirm }) => {
  const navigate = useNavigate();
  const { setSelectedOrbId, setIsOrbSelected, setOrbSettings } = useSession();

  const [animState, setAnimState]     = useState('idle_closed');
  const [activeOrbIdx, setActiveOrbIdx] = useState(0);
  const [nextOrbIdx, setNextOrbIdx]   = useState(null);
  const [isExiting, setIsExiting]     = useState(false);
  const isAnimating = React.useRef(false);

  const currentOrb = ORB_MODES[activeOrbIdx];

  const triggerOrbSwap = useCallback((newIdx) => {
    if (isAnimating.current || newIdx === activeOrbIdx || animState === 'idle_closed') return;
    isAnimating.current = true;
    setNextOrbIdx(newIdx);
    setAnimState('orb_swap');
    setIsExiting(true);
    setTimeout(() => { setActiveOrbIdx(newIdx); setIsExiting(false); }, 1100);
    setTimeout(() => {
      setAnimState('settle_open');
      setTimeout(() => { setAnimState('idle_active'); setNextOrbIdx(null); isAnimating.current = false; }, 700);
    }, 2200);
  }, [activeOrbIdx, animState]);

  const handleNext = useCallback(() => triggerOrbSwap((activeOrbIdx + 1) % ORB_MODES.length), [activeOrbIdx, triggerOrbSwap]);
  const handlePrev = useCallback(() => triggerOrbSwap((activeOrbIdx - 1 + ORB_MODES.length) % ORB_MODES.length), [activeOrbIdx, triggerOrbSwap]);

  const handleInitialize = () => {
    if (isAnimating.current || animState !== 'idle_closed') return;
    isAnimating.current = true;
    setAnimState('initialize_open');
    setTimeout(() => {
      setAnimState('settle_open');
      setTimeout(() => { setAnimState('idle_active'); isAnimating.current = false; }, 700);
    }, 900);
  };

  const handleConfirm = () => {
    setSelectedOrbId(currentOrb.id);
    setOrbSettings(prev => ({ ...prev, color: currentOrb.color }));
    setIsOrbSelected(true);
    if (onConfirm) onConfirm(currentOrb.id);
    navigate('/editor');
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft')  handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev]);

  return (
    <div className="hero-v8-root">
      {/* NAV */}
      <header className="v8-navbar">
        <div className="v8-brand">
          <Sparkles size={22} style={{ color: '#22d3ee' }} />
          <span>AetherForge</span>
        </div>
        <nav className="v8-nav-links">
          <a>Features</a><a>Workflows</a><a>Pricing</a><a>Creator</a>
        </nav>
        <div className="v8-nav-cta">
          <button className="v8-btn-ghost">Log In</button>
          <button className="v8-btn-primary">Free Download</button>
        </div>
      </header>

      <div className="v8-grid-layout">

        {/* LEFT PANEL — Core Library */}
        <aside className="v8-core-library">
          <div className="v8-panel-label">Core Library</div>
          <div className="v8-orb-list">
            {ORB_MODES.map((orb, idx) => {
              const isActive = idx === (nextOrbIdx !== null ? nextOrbIdx : activeOrbIdx);
              const meta = ORB_META[orb.id] || ORB_META.nova;
              return (
                <button
                  key={orb.id}
                  className={`v8-orb-row ${isActive ? 'v8-orb-row-active' : ''}`}
                  style={isActive ? { borderColor: meta.accent + '90' } : {}}
                  onClick={() => {
                    if (animState === 'idle_closed') { setActiveOrbIdx(idx); handleInitialize(); }
                    else triggerOrbSwap(idx);
                  }}
                >
                  <OrbVisual orbId={orb.id} small active={isActive} />
                  <div>
                    <div className="v8-orb-row-name">{orb.name}</div>
                    <div className="v8-orb-row-type">{orb.coreType}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER */}
        <main className="v8-center">
          <div className="v8-headline-block">
            <div className="v8-eyebrow">Select Your AI Core</div>
            <h1 className="v8-headline">Blender-depth creation, voice-native intelligence, gesture-driven worldbuilding.</h1>
          </div>

          <div className="v8-assembly-wrapper">
            <button className="v8-nav-arrow left" onClick={handlePrev}><ChevronLeft size={36} /></button>
            <button className="v8-nav-arrow right" onClick={handleNext}><ChevronRight size={36} /></button>
            <ChestAssembly orb={currentOrb} animState={animState} />
          </div>

          <div className="v8-orb-info">
            <AnimatePresence mode="wait">
              <motion.div key={currentOrb.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="v8-orb-name" style={{ color: (ORB_META[currentOrb.id] || ORB_META.nova).accent }}>{currentOrb.name}</div>
                <p className="v8-orb-desc">{currentOrb.description}</p>
              </motion.div>
            </AnimatePresence>
            <div className="v8-action-row">
              {animState === 'idle_closed' ? (
                <button className="v8-btn-init" onClick={handleInitialize}>Initialize Suit</button>
              ) : (
                <button className="v8-btn-enter" onClick={handleConfirm}
                  style={{ borderColor: (ORB_META[currentOrb.id] || ORB_META.nova).accent + '80',
                            color: (ORB_META[currentOrb.id] || ORB_META.nova).accent }}>
                  Enter Workspace
                </button>
              )}
            </div>
            <div className="v8-helper">Use UI or Left/Right Arrows for selection</div>
          </div>
        </main>

        {/* RIGHT PANEL — System Status */}
        <aside className="v8-system-panel">
          <div className="v8-panel-label">System Status</div>
          <div className="v8-status-row"><span>Reactor</span><span style={{ color: (ORB_META[currentOrb.id]||ORB_META.nova).accent }}>{animState.replace(/_/g, ' ').toUpperCase()}</span></div>
          <div className="v8-status-row"><span>Sync Link</span><span>99.8%</span></div>
          <div className="v8-status-card">
            <div className="v8-panel-label" style={{ marginBottom: '8px' }}>Active Personality</div>
            <div className="v8-status-personality">{currentOrb.coreType}</div>
            <p className="v8-status-hint">The selected core persists into the editor as your live assistant and voice interface.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Hero;
