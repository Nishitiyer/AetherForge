/**
 * OrbAssistantSidebar.jsx
 * Premium AI Assistant Sidebar for AetherForge Workspace.
 * Features: Persisted Orb identity, Chat history, Quick Action Modeling Tools,
 * and Stark-style Gesture Control telemetry.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Camera, CameraOff, Hand, Sparkles, Send,
  Box, Palette, Layers, Film, Sun, Video, Target, Cpu,
  Scissors, Maximize, Move, RotateCw, Plus, Minus,
  Grid3X3, MousePointer2, Wand2, Calculator, Settings,
  Zap, PenTool, Database
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { useChat } from '../../context/ChatContext';
import { useHands } from '../../hooks/useHands';

const ORB_META = {
  nova:     { accent: '#fbbf24', glow: 'rgba(251,191,36,.6)',  name: 'Nova Core',     personality: 'Cinematic Director' },
  sentinel: { accent: '#22d3ee', glow: 'rgba(34,211,238,.6)',  name: 'Sentinel Core', personality: 'Technical Architect' },
  echo:     { accent: '#e879f9', glow: 'rgba(232,121,249,.6)', name: 'Echo Core',     personality: 'Voice Companion' },
  forge:    { accent: '#fb923c', glow: 'rgba(251,146,60,.6)',  name: 'Forge Core',    personality: 'Build Engineer' },
  prism:    { accent: '#2dd4bf', glow: 'rgba(45,212,191,.6)',  name: 'Prism Core',    personality: 'Style Explorer' },
  quantum:  { accent: '#bae6fd', glow: 'rgba(186,230,253,.6)', name: 'Quantum Core',  personality: 'Quantum Systems' },
};

const MODE_TOOLS = [
  { icon: Box, label: 'Move', cmd: 'switch to transform-move tool' },
  { icon: RotateCw, label: 'Rotate', cmd: 'switch to transform-rotate tool' },
  { icon: Maximize, label: 'Scale', cmd: 'switch to transform-scale tool' },
  { icon: MousePointer2, label: 'Select', cmd: 'enter selection mode' },
];

const MODELING_TOOLS = [
  { icon: Scissors, label: 'Extrude', cmd: 'extrude selected faces' },
  { icon: Plus, label: 'Inset', cmd: 'inset selected faces' },
  { icon: Target, label: 'Bevel', cmd: 'apply bevel to edges' },
  { icon: PenTool, label: 'Knife', cmd: 'activate knife cut tool' },
  { icon: Grid3X3, label: 'Loop Cut', cmd: 'add loop cut' },
  { icon: Wand2, label: 'Subdivide', cmd: 'subdivide mesh' },
  { icon: Database, label: 'Boolean', cmd: 'apply boolean modifier' },
  { icon: Layers, label: 'Mirror', cmd: 'apply mirror modifier' },
];

const GESTURE_MODES = ['Select', 'Transform', 'Placement', 'Animation'];

function MiniOrb({ orb, active, size = 64 }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 ${size * 0.5}px ${orb.glow}, inset 0 0 ${size * 0.2}px ${orb.glow}`, border: `2px solid ${orb.glow}` }}
        animate={{ scale: active ? [1, 1.15, 1] : 1, opacity: active ? [0.6, 1, 0.6] : 0.3 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute inset-[15%] rounded-full"
        style={{ background: `radial-gradient(circle at 35% 35%, #fff, ${orb.accent} 40%, #000 85%)` }}
        animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

const OrbAssistantSidebar = () => {
  const { selectedOrbId } = useSession();
  const { activeChat, addMessage } = useChat();
  const orb = ORB_META[selectedOrbId?.toLowerCase()] || ORB_META.nova;

  const [tab, setTab] = useState('Assistant');
  const { videoRef, permissionState, gesture, confidence: realConfidence, requestCamera } = useHands();
  const [isGestureOn, setIsGestureOn] = useState(false);
  const [gestureMode, setGestureMode] = useState('Select');
  const [prompt, setPrompt] = useState('');
  const [micActive, setMicActive] = useState(false);

  const toggleGesture = async () => {
    if (!isGestureOn) {
      await requestCamera();
      setIsGestureOn(true);
    } else {
      setIsGestureOn(false);
    }
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    addMessage(activeChat.id, { type: 'user', content: prompt });
    setPrompt('');
    setTimeout(() => {
      addMessage(activeChat.id, { type: 'system', content: `✓ [${orb.name}] executing: ${prompt}. Spatial coordinates synchronized.` });
    }, 800);
  };

  return (
    <div className="flex h-full flex-col bg-[#03060a] border-l border-white/5 text-white overflow-hidden">
      
      {/* HEADER SECTION (Selected Orb Persistence) */}
      <div className="p-5 border-b border-white/5" style={{ background: `linear-gradient(to bottom, ${orb.accent}05, transparent)` }}>
        <div className="flex items-center gap-4">
          <MiniOrb orb={orb} active={true} size={60} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">Active Intelligence</div>
            <div className="text-[18px] font-bold tracking-tight" style={{ color: orb.accent }}>{orb.name}</div>
            <div className="text-[11px] text-white/50">{orb.personality}</div>
          </div>
          <button onClick={() => setMicActive(!micActive)} className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white transition">
            {micActive ? <Mic className="h-5 w-5" style={{ color: orb.accent }} /> : <MicOff className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex px-5 pt-4 gap-4 border-b border-white/5">
        {['Assistant', 'Gesture Control'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 text-[12px] font-bold uppercase tracking-widest transition-all ${tab === t ? 'text-white border-b-2' : 'text-white/30'}`}
            style={{ borderBottomColor: tab === t ? orb.accent : 'transparent' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <AnimatePresence mode="wait">
          {tab === 'Assistant' ? (
            <motion.div key="chat" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
              
              {/* CHAT HISTORY */}
              <div className="space-y-4 min-h-[200px] border border-white/5 bg-black/40 rounded-2xl p-4">
                {activeChat?.messages?.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">
                      {msg.type === 'user' ? 'Local Operator' : orb.name}
                    </div>
                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed"
                      style={msg.type === 'user' 
                        ? { background: orb.accent + '15', color: orb.accent, border: `1px solid ${orb.accent}25` }
                        : { background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.1)' }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {(!activeChat?.messages || activeChat.messages.length === 0) && (
                  <div className="grid place-items-center h-full text-center text-white/20">
                    <div>
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" style={{ color: orb.accent }} />
                      <div className="text-[11px] uppercase tracking-widest">Awaiting spatial command</div>
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK ACTIONS GRID */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 mb-3">Modeling Ops</div>
                <div className="grid grid-cols-2 gap-2">
                  {MODELING_TOOLS.map(t => (
                    <button key={t.label} onClick={() => { setPrompt(t.cmd); handleSend(); }}
                      className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-[11px] font-semibold text-white/50 hover:bg-white/5 hover:text-white transition text-left">
                      <t.icon className="h-4 w-4" style={{ color: orb.accent }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="gesture" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Spatial Telemetry</div>
                <button onClick={toggleGesture} className="rounded-xl px-4 py-2 text-[12px] font-bold transition-all"
                  style={{ background: isGestureOn ? orb.accent + '20' : '#fff', color: isGestureOn ? orb.accent : '#000' }}>
                  {isGestureOn ? 'Disable Interlink' : 'Enable Gesture Control'}
                </button>
              </div>

              {/* STARK-STYLE CAMERA FEED */}
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black">
                {isGestureOn ? (
                  <video ref={videoRef} className="h-full w-full object-cover scale-x-[-1]" muted />
                ) : (
                  <div className="h-full grid place-items-center bg-[#050508]">
                    <Camera className="h-10 w-10 text-white/10" />
                  </div>
                )}
                {isGestureOn && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 border border-white/10">
                      <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: orb.accent }} />
                      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: orb.accent }}>Interlink-V2</span>
                    </div>
                    {/* Holographic Overlays */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-white/40">Tracking Depth: <span className="text-white">1.82m</span></span>
                        <span className="text-white/40">Lat: <span className="text-white">12ms</span></span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* TELEMETRY READOUT */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Gesture</div>
                  <div className="text-[16px] font-bold" style={{ color: isGestureOn ? orb.accent : 'inherit' }}>{isGestureOn ? gesture : '—'}</div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center">
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Confidence</div>
                  <div className="text-[16px] font-bold">{isGestureOn ? `${(realConfidence * 100).toFixed(0)}%` : '—'}</div>
                </div>
              </div>

              {/* INTERACTION MODE */}
              <div className="space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Interaction Mode</div>
                <div className="grid grid-cols-4 gap-2">
                  {GESTURE_MODES.map(m => (
                    <button key={m} onClick={() => setGestureMode(m)}
                      className={`rounded-xl py-2 text-[10px] font-bold border transition-all ${gestureMode === m ? 'border-white/20' : 'border-white/5 text-white/30'}`}
                      style={{ background: gestureMode === m ? orb.accent + '15' : 'transparent', color: gestureMode === m ? orb.accent : 'inherit' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INPUT AREA */}
      <div className="p-5 border-t border-white/5 bg-black/40">
        <div className="relative">
          <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Instruct ${orb.name}…`}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-5 pr-24 text-[13px] text-white outline-none focus:border-white/20 transition-all font-medium"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
            <button onClick={handleSend} className="p-2.5 rounded-xl transition hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${orb.accent}, #000 85%)`, border: `1px solid ${orb.accent}40` }}>
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrbAssistantSidebar;
