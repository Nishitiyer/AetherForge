import React, { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Sparkles, ChevronLeft, ChevronRight, Mic, MicOff, Camera, Play, Pause, PanelLeft, PanelRight } from "lucide-react";
import { useSession } from "../../context/SessionContext";
import { ChestHero3D } from "./ChestHero3D";
import "./Hero.css";

// ─── ORB DATA ────────────────────────────────────────────────────────────────
const ORBS = [
  { id: "nova",     name: "Nova Core",     accent: "#fbbf24", glow: "rgba(251,191,36,.6)",  desc: "Cinematic lighting, hero composition, showcase rendering, and photoreal presentation.", personality: "Cinematic Director" },
  { id: "sentinel", name: "Sentinel Core", accent: "#22d3ee", glow: "rgba(34,211,238,.6)",  desc: "Technical analysis, scene structure, optimization, and precision-driven workflows.",    personality: "Technical Architect" },
  { id: "echo",     name: "Echo Core",     accent: "#e879f9", glow: "rgba(232,121,249,.6)", desc: "Multilingual voice-native prompting, guidance, and conversational creation control.",  personality: "Voice Companion" },
  { id: "forge",    name: "Forge Core",    accent: "#fb923c", glow: "rgba(251,146,60,.6)",  desc: "Asset building, blockout, production modeling, and creation-heavy workflows.",          personality: "Build Engineer" },
  { id: "prism",    name: "Prism Core",    accent: "#2dd4bf", glow: "rgba(45,212,191,.6)",  desc: "Style exploration, visual variations, material experiments, and design studies.",       personality: "Style Explorer" },
  { id: "quantum",  name: "Quantum Core",  accent: "#bae6fd", glow: "rgba(186,230,253,.6)", desc: "Simulation, procedural workflows, experimental systems, and advanced pipelines.",       personality: "Quantum Systems" },
];

function OrbCore({ orb, size = 60, active = true }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 ${size*0.4}px ${orb.glow}, inset 0 0 ${size*0.2}px ${orb.glow}`, border: `1.5px solid ${orb.glow}` }}
        animate={{ scale: active ? [1, 1.1, 1] : 1, opacity: active ? [0.7, 1, 0.7] : 0.4 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-[30%] rounded-full" style={{ background: `radial-gradient(circle at 35% 35%, #fff, ${orb.accent} 40%, #000 80%)` }} />
    </div>
  );
}

const Hero = () => {
  const navigate = useNavigate();
  const { setSelectedOrbId, setIsOrbSelected, setOrbSettings } = useSession();

  const [selectedOrbId, setSelectedOrbIdLocal] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aetherforge:selectedOrb")) || "nova"; } catch { return "nova"; }
  });
  const [heroState, setHeroState] = useState("idle_closed");

  const orb = useMemo(() => ORBS.find(o => o.id === selectedOrbId) || ORBS[0], [selectedOrbId]);

  const next = useCallback(() => {
    setHeroState("orb_swap");
    const idx = ORBS.findIndex(o => o.id === selectedOrbId);
    setSelectedOrbIdLocal(ORBS[(idx + 1) % ORBS.length].id);
  }, [selectedOrbId]);

  const prev = useCallback(() => {
    setHeroState("orb_swap");
    const idx = ORBS.findIndex(o => o.id === selectedOrbId);
    setSelectedOrbIdLocal(ORBS[(idx - 1 + ORBS.length) % ORBS.length].id);
  }, [selectedOrbId]);

  useEffect(() => {
    if (heroState === "orb_swap" || heroState === "initialize_open") {
      const t = setTimeout(() => setHeroState("idle_active"), 800);
      return () => clearTimeout(t);
    }
  }, [heroState]);

  const handleEnterWorkspace = () => {
    setSelectedOrbId(orb.id);
    setOrbSettings({ color: orb.accent, name: orb.name });
    setIsOrbSelected(true);
    navigate("/editor");
  };

  return (
    <div className="hero-v9-root">
      {/* NAVBAR */}
      <header className="v9-navbar">
        <div className="v9-brand">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <span>AetherForge</span>
        </div>
        <nav className="v9-nav-links">
          {["Features", "Workflows", "Pricing", "Gallery"].map(l => <a key={l}>{l}</a>)}
        </nav>
        <div className="v9-nav-cta">
          <button className="v8-btn-ghost">Log In</button>
          <button className="v8-btn-primary">Get Started</button>
        </div>
      </header>

      {/* THREE-COLUMN GRID */}
      <div className="v9-grid-layout">
        
        {/* LEFT — Core Library */}
        <aside className="v9-panel v9-left">
          <div className="v8-panel-label">Core Library</div>
          <div className="v8-orb-list">
            {ORBS.map(o => (
              <button key={o.id} 
                onClick={() => { setHeroState("orb_swap"); setSelectedOrbIdLocal(o.id); }}
                className={`v8-orb-row ${selectedOrbId === o.id ? "v8-orb-row-active" : ""}`}
                style={selectedOrbId === o.id ? { borderColor: o.accent + "88", background: o.accent + "11" } : {}}
              >
                <OrbCore orb={o} size={40} active={selectedOrbId === o.id} />
                <div className="flex flex-col ml-2">
                  <span className="v8-orb-row-name">{o.name}</span>
                  <span className="v8-orb-row-type">{o.personality}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER — 3D Hero */}
        <main className="v9-center">
          <div className="v8-headline-block">
            <div className="v8-eyebrow" style={{ color: orb.accent }}>Intelligence Integrated</div>
            <h1 className="v8-headline">Direct Spatial 3D Creation Powered by AI Cores</h1>
            <p className="v8-orb-desc" style={{ marginTop: '12px' }}>
              Initialize the MK85-inspired chest reactor and select the intelligence core that defines your worldbuilding experience.
            </p>
          </div>

          <div className="v9-hero-stage">
            <button onClick={prev} className="v8-nav-arrow left"><ChevronLeft /></button>
            <button onClick={next} className="v8-nav-arrow right"><ChevronRight /></button>
            
            <div className="v9-canvas-container">
              <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                  <ChestHero3D orb={orb} isOpen={heroState !== "idle_closed"} />
                </Suspense>
              </Canvas>
            </div>
          </div>

          <div className="v8-orb-info">
            <div className="v8-orb-name" style={{ color: orb.accent }}>{orb.name}</div>
            <p className="v8-orb-desc">{orb.desc}</p>
          </div>

          <div className="v8-action-row">
            <button onClick={() => setHeroState("initialize_open")} className="v8-btn-init" style={{ borderColor: orb.accent }}>
              Initialize Suit
            </button>
            <button onClick={handleEnterWorkspace} className="v8-btn-enter" style={{ background: `linear-gradient(135deg, ${orb.accent}, #000 80%)`, color: '#fff', border: `1px solid ${orb.accent}` }}>
              Enter Workspace →
            </button>
          </div>
        </main>

        {/* RIGHT — System Status */}
        <aside className="v9-panel v9-right">
          <div className="v8-panel-label">System Status</div>
          <div className="v8-status-row">
            <span>Core State</span>
            <span style={{ color: orb.accent, fontWeight: 'bold' }}>{heroState.toUpperCase()}</span>
          </div>
          <div className="v8-status-row">
            <span>Neural Link</span>
            <span className="text-green-400">Stable</span>
          </div>
          <div className="v8-status-card">
            <div className="v8-status-personality" style={{ color: orb.accent }}>{orb.personality}</div>
            <p className="v8-status-hint">This core will act as your spatial assistant, bridging voice and gesture into the 3D viewport.</p>
          </div>
          <div className="flex justify-center mt-6">
            <OrbCore orb={orb} size={100} active={heroState !== "idle_closed"} />
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Hero;
