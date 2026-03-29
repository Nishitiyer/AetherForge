import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Camera,
  Play,
  Monitor,
  Box,
  Move3D,
  PencilRuler,
  SlidersHorizontal,
  Wand2,
  Layers3,
  Settings,
  Grid3X3,
  Bot,
  Search,
  Zap,
  Hand,
  Activity,
  Shield,
  ChevronRight,
  Mic,
  Volume2
} from "lucide-react";
import "./Editor.css";
import { useHands } from "../hooks/useHands";
import { GestureOverlay } from "../components/editor/GestureOverlay";

const WORKSPACES = [
  "Layout", "Modeling", "Sculpting", "UV Editing", "Texture Paint", 
  "Shading", "Animation", "Rendering", "Compositing", "Geometry Nodes", 
  "Simulation", "AI Generate", "Gesture Build", "Voice Build"
];

const ORBS = {
  nova: { name: "Nova Core", personality: "Cinematic Director", accent: "#fbbf24", voice: "Male/Barytone" },
  sentinel: { name: "Sentinel Core", personality: "Technical Architect", accent: "#22d3ee", voice: "Neutral/Analytical" },
  echo: { name: "Echo Core", personality: "Voice Companion", accent: "#e879f9", voice: "Female/Soft" },
  prism: { name: "Prism Core", personality: "Creative Catalyst", accent: "#818cf8", voice: "Male/Expressive" },
  quantum: { name: "Quantum Core", personality: "Efficiency Engine", accent: "#34d399", voice: "AI/Digital" },
};

export default function Editor() {
  const [activeWorkspace, setActiveWorkspace] = useState("Modeling");
  const [selectedOrbId, setSelectedOrbId] = useState("sentinel");
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Protocol Stark-Integrity active. Listening for spatial commands." }
  ]);

  const { videoRef, landmarks, gesture, confidence } = useHands();

  useEffect(() => {
    const savedOrb = localStorage.getItem("selectedOrb");
    if (savedOrb) setSelectedOrbId(savedOrb);
  }, []);

  const orb = ORBS[selectedOrbId] || ORBS.sentinel;

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const newHistory = [...chatHistory, { role: "user", content: chatInput }];
    setChatHistory(newHistory);
    setChatInput("");
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: `Analyzing "${chatInput}". Calibrating ${orb.name} for optimal reconstruction.` 
      }]);
    }, 8000); // 8 second delay for AI processing effect
  };

  return (
    <div className="editor-root">
      
      {/* ── TOP HEADER (14 TABS) ── */}
      <header className="ed-global-header">
        <div className="ed-workspace-nav">
          {WORKSPACES.map((ws) => (
            <button
              key={ws}
              className={`ws-tab ${activeWorkspace === ws ? "active" : ""}`}
              onClick={() => setActiveWorkspace(ws)}
            >
              {ws}
            </button>
          ))}
        </div>
        
        <div className="ed-header-right">
          <div className="header-telemetry">
            <Activity size={12} className="stark-cyan" />
            <span>99.8% FPS_STABLE</span>
          </div>
          <div className="header-icon-btn">
            <Settings size={16} />
          </div>
        </div>
      </header>

      <main className="ed-main-container">
        
        {/* ── LEFT TOOL SHELF ── */}
        <aside className="ed-tool-shelf">
          <ToolIcon icon={Move3D} active />
          <ToolIcon icon={PencilRuler} />
          <ToolIcon icon={Grid3X3} />
          <ToolIcon icon={Layers3} />
          <ToolIcon icon={SlidersHorizontal} />
          <div style={{ flexGrow: 1 }} />
          <ToolIcon icon={Search} />
          <ToolIcon icon={Bot} />
        </aside>

        {/* ── CENTRAL VIEWPORT ── */}
        <section className="ed-viewport-section">
          <div className="viewport-header">
            <div className="viewport-menu">
              <span className="active">Object Mode</span>
              <span>View</span>
              <span>Select</span>
              <span>Add</span>
              <span>Object</span>
            </div>
            <div className="viewport-render-modes">
               <button className="active">Solid</button>
               <button>Wire</button>
               <button>Rendered</button>
            </div>
          </div>

          <div className="viewport-canvas-area">
            <div className="viewport-grid-overlay" />
            <div className="stark-viewport-hud">
               <div className="hud-line" />
               <div className="hud-label">CAM_01 // MK85_SENSORS</div>
               <div className="hud-data">XYZ: 0.00 | 0.42 | -1.12</div>
            </div>

            {/* Mock 3D Component */}
            <div className="viewport-mock-3d">
              <motion.div 
                animate={{ rotateY: 360 }} 
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mock-cube"
              >
                <Box size={100} className="text-[#3d3d42]" />
              </motion.div>
            </div>
          </div>

          <div className="timeline-zone">
            <div className="timeline-header">
               <Play size={14} className="stark-cyan" />
               <span>TIMELINE // FRAMES: 0 - 250</span>
               <div className="ml-auto flex gap-4">
                  <span>Start: 1</span>
                  <span>End: 250</span>
               </div>
            </div>
            <div className="timeline-track-visual" />
          </div>
        </section>

        {/* ── RIGHT SIDEBAR: AI VOICE ASSISTANT ── */}
        <aside className="ed-sidebar">
          
          {/* AI Core Identity (The Heart) */}
          <div className="sidebar-orb-focus">
            <div className="orb-aura" style={{ background: `radial-gradient(circle, ${orb.accent}33 0%, transparent 70%)` }} />
            
            <div className="orb-mount-container">
              <div className="orb-mount-ring" />
              <div className="orb-mount-visual">
                 <div className="orb-core-glow" style={{ background: orb.accent, boxShadow: `0 0 30px ${orb.accent}` }} />
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="orb-tech-layer" 
                 />
              </div>
              <div className="orb-identity">
                <h3 className="orb-name-title">{orb.name}</h3>
                <div className="orb-personality-chip" style={{ borderColor: `${orb.accent}44`, color: orb.accent }}>
                   {orb.personality}
                </div>
              </div>
            </div>

            <div className="voice-telemetry">
               <div className="telemetry-item">
                  <Volume2 size={12} className="text-white/20" />
                  <span>Voice: {orb.voice}</span>
               </div>
               <div className="telemetry-item">
                  <Activity size={12} className="text-white/20" />
                  <span>Sync: 99.4%</span>
               </div>
            </div>

            <button 
              onClick={() => setIsGestureEnabled(!isGestureEnabled)}
              className={`stark-gesture-btn ${isGestureEnabled ? 'active' : ''}`}
            >
              <Hand size={18} />
              <span>{isGestureEnabled ? "SUSPEND_GESTURES" : "ENGAGE_HAND_TRACKING"}</span>
            </button>
          </div>

          {/* CHAT INTERFACE (The Conversation) */}
          <div className="chat-container">
            <div className="chat-scroll-area">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className="message-header">
                    {msg.role === 'assistant' ? orb.name : 'STARK_USER'}
                  </div>
                  <div className="message-body">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INPUT AREA (Voice & Text) */}
          <div className="chat-input-system">
            <div className="input-row">
               <input
                 type="text"
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && handleSend()}
                 placeholder="Command current core..."
                 className="stark-input"
               />
               <button 
                className={`mic-btn ${isListening ? 'active' : ''}`}
                onClick={() => setIsListening(!isListening)}
               >
                 <Mic size={18} />
               </button>
            </div>
            <div className="input-shortcuts">
               <button onClick={() => setChatInput("Add Cube")}>+ Cube</button>
               <button onClick={() => setChatInput("Add Light")}>+ Light</button>
               <button onClick={() => setChatInput("Render Scene")}>Render</button>
            </div>
          </div>
        </aside>

      </main>

      {/* ── GESTURE HUD HOVER PANEL ── */}
      <AnimatePresence>
        {isGestureEnabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            className="gesture-hud-panel"
          >
             <GestureOverlay 
               videoRef={videoRef} 
               landmarks={landmarks} 
               gesture={gesture} 
               confidence={confidence} 
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolIcon({ icon: Icon, active = false }) {
  return (
    <div className={`tool-btn ${active ? "active" : ""}`}>
      <Icon size={18} />
    </div>
  );
}
