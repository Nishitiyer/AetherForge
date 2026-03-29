import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Cpu, 
  Zap, 
  Globe, 
  Settings, 
  ChevronRight, 
  Shield, 
  Activity,
  Box,
  Layers
} from "lucide-react";
import { ChestHero3D } from "./ChestHero3D";
import { Canvas } from "@react-three/fiber";
import "./Hero.css";

const ORBS = [
  {
    id: "nova",
    name: "Nova Core",
    accent: "#fbbf24",
    desc: "Cinematic lighting, hero composition, and photoreal presentation.",
    personality: "Cinematic Director",
    status: "Ready"
  },
  {
    id: "sentinel",
    name: "Sentinel Core",
    accent: "#22d3ee",
    desc: "Technical analysis, scene structure, and precision workflows.",
    personality: "Technical Architect",
    status: "Active"
  },
  {
    id: "echo",
    name: "Echo Core",
    accent: "#e879f9",
    desc: "Voice-native prompting and conversational creation control.",
    personality: "Voice Companion",
    status: "Standby"
  },
  {
    id: "prism",
    name: "Prism Core",
    accent: "#818cf8",
    desc: "Creative catalyst for color theory and aesthetic refinement.",
    personality: "Creative Catalyst",
    status: "Optimization"
  },
  {
    id: "quantum",
    name: "Quantum Core",
    accent: "#34d399",
    desc: "Performance tuning and high-frequency creative geometry.",
    personality: "Efficiency Engine",
    status: "Active"
  }
];

export default function Hero() {
  const [selectedOrbId, setSelectedOrbId] = useState("sentinel");
  const [isHeroOpen, setIsHeroOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedOrb");
    if (saved) setSelectedOrbId(saved);
  }, []);

  const handleOrbSelect = (id) => {
    setSelectedOrbId(id);
    localStorage.setItem("selectedOrb", id);
    setIsHeroOpen(true);
    setTimeout(() => setIsHeroOpen(false), 3000);
  };

  const activeOrb = ORBS.find(o => o.id === selectedOrbId) || ORBS[1];

  return (
    <div className="hero-root">
      <div className="hero-bg-ambience" />
      <div className="hero-grid-pattern" />

      <main className="hero-main-grid">
        
        {/* LEFT PANEL: CORE LIBRARY */}
        <aside className="hero-side-panel left">
          <div className="panel-header-group">
            <div className="eyebrow-label">
              <Layers size={14} />
              IDENT_SYNC_REGISTRY
            </div>
            <h1 className="hero-title">
              Select <br/><span className="muted">Active Heart</span>
            </h1>
          </div>

          <div className="orb-card-list">
            {ORBS.map((orb) => (
              <div 
                key={orb.id}
                className={`orb-card ${selectedOrbId === orb.id ? 'selected' : ''}`}
                onClick={() => handleOrbSelect(orb.id)}
              >
                <div className="orb-icon-wrapper">
                   <div className="orb-glow-dot" style={{ backgroundColor: orb.accent, boxShadow: `0 0 15px ${orb.accent}` }} />
                </div>
                <div className="orb-content">
                  <div className="orb-title-row">
                    <span className="orb-name">{orb.name}</span>
                    <span className="orb-status-tag">{orb.status}</span>
                  </div>
                  <p className="orb-personality-label">{orb.personality}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="panel-footer-meta">
            <div className="meta-sync">
               <div className="sync-dot" />
               <span>LINK_STABLE_0.8.4</span>
            </div>
            <Settings size={14} className="meta-icon" />
          </div>
        </aside>

        {/* CENTER PANEL: STARK HERO */}
        <section className="hero-center-stage">
          <div className="viewport-hud-label">
             <div className="hud-dot" />
             Spatial Interface // Verified
          </div>

          <div className="hero-canvas-wrapper" onClick={() => setIsHeroOpen(!isHeroOpen)}>
            <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }}>
              <ChestHero3D orb={activeOrb} isOpen={isHeroOpen} />
            </Canvas>
          </div>

          <div className="hero-action-console">
             <div className="console-icon">
                <Box size={28} />
             </div>
             <div className="console-content">
                <p className="console-label">Logic Input</p>
                <p className="console-hint">"Initialize spatial constructor via {activeOrb.name}..."</p>
             </div>
             <button 
              className="btn-enter-workspace"
              onClick={() => window.location.href='/editor'}
             >
               ENTER_WORKSPACE
             </button>
          </div>
        </section>

        {/* RIGHT PANEL: SYSTEM TELEMETRY */}
        <aside className="hero-side-panel right">
          <div className="status-container">
            <div className="status-section">
              <div className="status-title-row">
                <Activity size={16} className="stark-cyan" />
                <h3 className="section-title">Telemetry_Sync</h3>
              </div>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Active Core</span>
                  <span className="status-value" style={{ color: activeOrb.accent }}>{activeOrb.name}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Stability</span>
                  <span className="status-value green">99.8%</span>
                </div>
              </div>
            </div>

            <div className="status-section">
              <div className="status-title-row">
                <Shield size={16} className="stark-gold" />
                <h3 className="section-title">Hardware_Link</h3>
              </div>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">Armor Frame</span>
                  <span className="status-value">MK85_EXO</span>
                </div>
              </div>
            </div>

            {/* PRIMARY ACTION BUTTON */}
            <div className="hero-deploy-zone">
               <button 
                className="btn-stark-deploy"
                onClick={() => window.location.href='/editor'}
               >
                 <Zap size={16} />
                 DEPLOY_CORE_WORKSPACE
               </button>
               <p className="deploy-hint">Initialize {activeOrb.name} architecture in spatial environment.</p>
            </div>

            <div className="stark-info-card">
               <div className="card-header">
                  <Zap size={18} className="stark-cyan" />
                  <span className="card-title">Spatial Awareness</span>
               </div>
               <p className="card-desc">
                 Gesture recognition engine ready. Deploy to workspace to initialize holographic hand tracking.
               </p>
            </div>
          </div>
        </aside>

      </main>

      <style>{`
        .panel-header-group { margin-bottom: 20px; }
        .orb-status-tag { font-size: 8px; font-family: 'JetBrains Mono', monospace; opacity: 0.2; }
        .orb-personality-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-top: 4px; }
        .panel-footer-meta { margin-top: auto; padding-top: 32px; border-top: 1px solid var(--stark-border); display: flex; justify-content: space-between; align-items: center; }
        .meta-sync { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.1); }
        .sync-dot { width: 4px; height: 4px; border-radius: 50%; background: #34d399; }
        .meta-icon { color: rgba(255,255,255,0.05); cursor: pointer; }
        .hero-canvas-wrapper { width: 100%; height: 100%; }
        .console-content { flex-grow: 1; }
        .console-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.2); text-transform: uppercase; margin-bottom: 2px; }
        .console-hint { font-size: 16px; font-weight: 500; color: rgba(255,255,255,0.6); italic; }
        .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(255,255,255,0.3); }
        .stark-cyan { color: var(--stark-cyan); }
        .stark-gold { color: var(--stark-gold); }
        .status-value.green { color: #34d399; }
        .status-value.cyan { color: var(--stark-cyan); }
        .stark-info-card { padding: 24px; border-radius: 28px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); margin-top: 40px; }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .card-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #fff; }
        .card-desc { font-size: 11px; line-height: 1.6; color: rgba(255,255,255,0.4); font-weight: 500; }
        .hero-title br { display: block; content: ""; margin-top: 8px; }
      `}</style>
    </div>
  );
}
