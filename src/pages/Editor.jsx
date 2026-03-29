import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Camera,
  Play,
  Pause,
  PanelLeft,
  PanelRight,
  Monitor,
  Cpu,
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
  MessageSquare,
  Zap,
  Hand,
  Activity,
  Shield,
} from "lucide-react";
import "./Editor.css";
import { useHands } from "../hooks/useHands";
import { GestureOverlay } from "../components/editor/GestureOverlay";

const WORKSPACES = [
  "Layout", "Modeling", "Sculpting", "UV Editing", "Texture Paint", 
  "Shading", "Animation", "Rendering", "Compositing", "Geometry Nodes", 
  "Simulation", "AI Generate", "Gesture Build", "Voice Build"
];

const QUICK_ACTIONS = [
  { id: "create", name: "Create Object", icon: Box },
  { id: "material", name: "Add Material", icon: Layers3 },
  { id: "optimize", name: "Optimize Mesh", icon: Zap },
  { id: "animate", name: "Animate", icon: Play },
  { id: "camera", name: "Add Camera", icon: Camera },
  { id: "light", name: "Add Light", icon: Sparkles },
  { id: "refine", name: "Refine Topology", icon: Grid3X3 },
  { id: "env", name: "Generate Environment", icon: Wand2 },
];

const ORBS = {
  nova: { name: "Nova Core", personality: "Cinematic Director", accent: "#fbbf24" },
  sentinel: { name: "Sentinel Core", personality: "Technical Architect", accent: "#22d3ee" },
  echo: { name: "Echo Core", personality: "Voice Companion", accent: "#e879f9" },
  prism: { name: "Prism Core", personality: "Creative Catalyst", accent: "#818cf8" },
  quantum: { name: "Quantum Core", personality: "Efficiency Engine", accent: "#34d399" },
};

export default function Editor() {
  const [activeWorkspace, setActiveWorkspace] = useState("Modeling");
  const [selectedOrbId, setSelectedOrbId] = useState("sentinel");
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Active Intelligence initialized. System at 100%. Gesture controls ready for spatial manipulation." }
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
        content: `Spatial processing underway for "${chatInput}". Adjusting viewport telemetry via ${orb.name}.` 
      }]);
    }, 1000);
  };

  return (
    <div className="editor-root">
      
      {/* GLOBAL HEADER / WORKSPACES */}
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
          <div className="flex items-center gap-2 text-[12px] text-[#8e8e93]">
            <Monitor size={14} />
            <span>Standard Render</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#252529] flex items-center justify-center cursor-pointer hover:bg-[#2c2c31]">
            <Settings size={16} />
          </div>
        </div>
      </header>

      <main className="ed-main-container">
        
        {/* LEFT TOOL SHELF */}
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

        {/* CENTRAL VIEWPORT */}
        <section className="ed-viewport-section">
          {/* Viewport Header */}
          <div className="viewport-header">
            <div className="flex items-center gap-4 text-[12px] text-[#8e8e93]">
              <span className="text-white font-medium">Object Mode</span>
              <span>View</span>
              <span>Select</span>
              <span>Add</span>
              <span>Object</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-[#252529] rounded-md p-0.5">
                <div className="px-2 py-0.5 text-[11px] bg-[#3d3d42] rounded-sm cursor-pointer">Solid</div>
                <div className="px-2 py-0.5 text-[11px] cursor-pointer hover:text-white transition-colors">Wire</div>
                <div className="px-2 py-0.5 text-[11px] cursor-pointer hover:text-white transition-colors">Render</div>
              </div>
            </div>
          </div>

          {/* 3D Scene Area */}
          <div className="viewport-canvas-area">
            <div className="viewport-grid-overlay" />
            <div className="w-64 h-64 border-2 border-[rgba(255,255,255,0.05)] rounded-2xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-[#1c1c1e] to-[#252529]">
              <Box size={80} className="text-[#3d3d42]" />
            </div>

            {/* Float Overlays */}
            <div className="absolute top-6 left-6 text-[11px] text-[#8e8e93] font-mono flex flex-col gap-1 backdrop-blur-md p-4 rounded-xl bg-black/20 border border-white/5">
              <p className="text-white/40 mb-2 uppercase tracking-widest font-bold">(1) SCENE_TREE</p>
              <p>  - Camera_Primary</p>
              <p>  - Cube_Mesh_MK1</p>
              <p>  - Light_Point_A</p>
            </div>
          </div>

          {/* BOTTOM TIMELINE */}
          <div className="timeline-zone">
            <div className="h-8 flex items-center px-4 gap-4 text-[11px] text-[#8e8e93] border-b border-[#252529]">
              <span>Timeline</span>
              <span>Playback</span>
              <span>Keying</span>
              <div style={{ flexGrow: 1 }} />
              <Play size={12} className="text-green-500 cursor-pointer" />
            </div>
            <div className="flex-grow flex items-center justify-center opacity-10">
              <div className="w-full h-px bg-[#fff]/20" />
            </div>
          </div>
        </section>

        {/* RIGHT ASSISTANT SIDEBAR */}
        <aside className="ed-sidebar">
          
          {/* Active AI Core Section */}
          <div className="sidebar-orb-focus">
            <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none" style={{ background: orb.accent }} />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="orb-visual-mount">
                <div className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.05)]" />
                <div className="w-10 h-10 rounded-full animate-pulse blur-[10px] opacity-50" style={{ background: orb.accent }} />
                <div className="w-6 h-6 rounded-full relative z-10" style={{ background: orb.accent, boxShadow: `0 0 20px ${orb.accent}` }} />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-2 border border-dashed border-[rgba(255,255,255,0.1)] rounded-full" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tighter">{orb.name}</h3>
                <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold">{orb.personality}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsGestureEnabled(!isGestureEnabled)}
              className={`gesture-toggle-btn ${isGestureEnabled ? 'active' : ''}`}
            >
              <Hand size={18} />
              <span>{isGestureEnabled ? "Disable Gesture Control" : "Enable Gesture Control"}</span>
            </button>
          </div>

          {/* CHAT INTERFACE */}
          <div className="chat-container">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="chat-input-wrapper">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Ask intelligence..."
              className="chat-textarea"
            />
            <button onClick={handleSend} className="btn-send">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* QUICK OPERATIONS */}
          <div className="ops-grid">
            {QUICK_ACTIONS.map((action) => (
              <button key={action.id} className="op-btn">
                <action.icon size={14} className="text-[#8e8e93]" />
                <span className="op-label">{action.name}</span>
              </button>
            ))}
          </div>
        </aside>

      </main>

      {/* GESTURE HUD HOVER PANEL */}
      <AnimatePresence>
        {isGestureEnabled && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="gesture-hud-panel shadow-2xl"
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
      
      <style>{`
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .flex-col { flex-direction: column; }
        .flex-grow { flex-grow: 1; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; left: 0; right: 0; bottom: 0; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .w-64 { width: 256px; }
        .h-64 { height: 256px; }
        .rounded-full { border-radius: 9999px; }
        .rounded-lg { border-radius: 8px; }
        .rounded-xl { border-radius: 12px; }
        .rounded-2xl { border-radius: 16px; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
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
