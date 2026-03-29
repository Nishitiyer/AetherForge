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
  Layers,
  Layout,
  MousePointer2
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

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="hero-container">
        <div className="hero-layout-grid">
          
          {/* LEFT COLUMN: CORE LIBRARY */}
          <aside className="hero-aside left">
            <div className="aside-header">
               <div className="eyebrow">
                 <Layers size={12} />
                 <span>CORE_REGISTRY</span>
               </div>
               <h2 className="aside-title">Identity Index</h2>
            </div>
            
            <div className="orb-selection-list">
              {ORBS.map((orb) => (
                <div 
                  key={orb.id}
                  className={`identity-card ${selectedOrbId === orb.id ? 'active' : ''}`}
                  onClick={() => handleOrbSelect(orb.id)}
                >
                  <div className="card-indicator" style={{ backgroundColor: orb.accent }} />
                  <div className="card-content">
                    <div className="card-primary">
                      <span className="card-name">{orb.name}</span>
                      <span className="card-status">{orb.status}</span>
                    </div>
                    <div className="card-meta">{orb.personality}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="aside-footer">
               <div className="system-sync">
                 <div className="dot pulse" />
                 <span>STARK_LINK_STABLE</span>
               </div>
            </div>
          </aside>

          {/* CENTER COLUMN: HERO FOCUS */}
          <section className="hero-main">
            
            {/* BALANCED CENTER HEADLINE */}
            <div className="center-header">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="hero-heading-group"
               >
                 <h1 className="main-title">
                   Select <span className="stark-accent">Active Heart</span>
                 </h1>
                 <p className="main-subtitle">
                   Initialize high-fidelity spatial construction via neural-linked AI architecture.
                 </p>
               </motion.div>
            </div>

            <div className="stage-hud-top">
               <div className="hud-label">SPATIAL_INTERFACE_VERIFIED</div>
            </div>

            {/* 3D HERO STAGE */}
            <div className="hero-3d-stage" onClick={() => setIsHeroOpen(!isHeroOpen)}>
              <Canvas camera={{ position: [0, 0, 4.5], fov: 40 }}>
                <ChestHero3D orb={activeOrb} isOpen={isHeroOpen} />
              </Canvas>
            </div>

            {/* BOTTOM COMMAND CONSOLE */}
            <div className="command-console">
               <div className="console-info">
                  <div className="console-icon-box">
                    <Cpu size={20} className="stark-cyan" />
                  </div>
                  <div className="console-text">
                    <div className="text-label">Active Intelligence</div>
                    <div className="text-status">Waiting for spatial deployment protocols...</div>
                  </div>
               </div>
               <button 
                className="btn-enter"
                onClick={() => window.location.href='/editor'}
               >
                 ENTER_WORKSPACE
               </button>
            </div>
          </section>

          {/* RIGHT COLUMN: TELEMETRY */}
          <aside className="hero-aside right">
            <div className="aside-header">
               <div className="eyebrow">
                 <Activity size={12} />
                 <span>SYSTEM_SYNC</span>
               </div>
               <h2 className="aside-title">Telemetry Index</h2>
            </div>

            <div className="status-stack">
              <StatusRow label="Active Core" value={activeOrb.name} accent={activeOrb.accent} />
              <StatusRow label="Sync Stability" value="99.8%" accent="#34d399" />
              <StatusRow label="Armor Frame" value="MK85_EXO" />
              <StatusRow label="Neural Link" value="STABLE" accent="#06b6d4" />
            </div>

            <div className="deploy-action-zone">
               <button 
                className="btn-deploy"
                onClick={() => window.location.href='/editor'}
               >
                 <Zap size={16} />
                 DEPLOY_CORE_WORKSPACE
               </button>
               <div className="deploy-disclaimer">Deploying {activeOrb.name} for 3D construction.</div>
            </div>

            <div className="stark-card-info">
               <div className="card-top">
                  <MousePointer2 size={16} className="stark-gold" />
                  <span className="card-label">Spatial Interaction</span>
               </div>
               <p className="card-body">
                 Gesture recognition engine ready. Deploy to workspace to initialize holographic hand tracking.
               </p>
            </div>
          </aside>

        </div>
      </main>

    </div>
  );
}

function StatusRow({ label, value, accent }) {
  return (
    <div className="status-row">
      <span className="row-label">{label}</span>
      <span className="row-value" style={{ color: accent }}>{value}</span>
    </div>
  );
}
