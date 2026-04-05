import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useSession } from "../../context/SessionContext.jsx";
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
    accent: "#a5f3fc", // Cyan 200
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
    id: "forge",
    name: "Forge Core",
    accent: "#f97316",
    desc: "Asset creation, object generation, and industrial workflows.",
    personality: "Build Engineer",
    status: "Offline"
  },
  {
    id: "prism",
    name: "Prism Core",
    accent: "#2dd4bf",
    desc: "Creative catalyst for color theory and aesthetic refinement.",
    personality: "Style Explorer",
    status: "Optimization"
  },
  {
    id: "quantum",
    name: "Quantum Core",
    accent: "#e2e8f0",
    desc: "Advanced logic, simulation, and high-frequency creative geometry.",
    personality: "Experimental Intel",
    status: "Restricted"
  }
];

export default function Hero({ isSelectionMode, onConfirm }) {
  const navigate = useNavigate();
  const { selectedOrbId, setSelectedOrbId } = useSession();
  const [isHeroOpen, setIsHeroOpen] = useState(false);

  const currentId = selectedOrbId || "sentinel";

  const handleOrbSelect = (id) => {
    console.log('[AetherForge] Orb Selected:', id);
    setSelectedOrbId(id);
    setIsHeroOpen(true);
    setTimeout(() => setIsHeroOpen(false), 1000);
  };

  const activeOrb = ORBS.find(o => o.id === currentId) || ORBS[1];

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
                  className={`identity-card ${currentId === orb.id ? 'active' : ''}`}
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
               <div className="hero-heading-group">
                 <h1 className="main-title">
                   Select <span className="stark-accent">Active Heart</span>
                 </h1>
                 <p className="main-subtitle">
                   Initialize high-fidelity spatial construction via neural-linked AI architecture.
                 </p>
               </div>
            </div>

            <div className="stage-hud-top">
               <div className="hud-label">SPATIAL_INTERFACE_VERIFIED</div>
            </div>

            {/* 3D HERO STAGE - RE-ENABLED */}
            <div className="hero-3d-stage">
              <div className="stage-glow-fallback" />
              <Canvas 
                id="stark-hero-canvas"
                gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
                camera={{ position: [0, 0, 3.5], fov: 45 }}
              >
                <ambientLight intensity={0.4} />
                <ChestHero3D orb={activeOrb} />
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
                id="hero-workshop-btn"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  console.log('[AetherForge] Enter/Confirm Triggered');
                  if (onConfirm) onConfirm(currentId);
                  else navigate('/orb-selection');
                }}
               >
                 {isSelectionMode ? 'INITIALIZE_CORE' : 'ENTER_WORKSPACE'}
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
                 id="hero-deploy-btn"
                 onPointerDown={(e) => {
                   e.stopPropagation();
                   if (onConfirm) onConfirm(currentId);
                   else navigate('/orb-selection');
                 }}
                >
                  <Zap size={16} />
                  {isSelectionMode ? 'DEPLOY_ACTIVE_HEART' : 'DEPLOY_CORE_WORKSPACE'}
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
