/**
 * OrbAssistantSidebar.jsx
 * Right-side panel in the AetherForge editor showing:
 *  - Selected orb (persisted from landing page)
 *  - Chat history wired to ChatContext
 *  - Voice / mic controls
 *  - Camera permission + gesture detection panel
 *  - Quick action buttons
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Camera, CameraOff, Hand, Sparkles, Send,
  Zap, Box, Palette, Layers, Film, Sun, Video, Target, Cpu,
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { useChat } from '../../context/ChatContext';

// ── Orb meta matches Hero.jsx ─────────────────────────────────────────────────
const ORB_META = {
  nova:     { accent: '#fbbf24', glow: 'rgba(251,191,36,.6)',  name: 'Nova Core',     personality: 'Cinematic Director' },
  sentinel: { accent: '#22d3ee', glow: 'rgba(34,211,238,.6)',  name: 'Sentinel Core', personality: 'Technical Architect' },
  echo:     { accent: '#e879f9', glow: 'rgba(232,121,249,.6)', name: 'Echo Core',     personality: 'Voice Companion' },
  forge:    { accent: '#fb923c', glow: 'rgba(251,146,60,.6)',  name: 'Forge Core',    personality: 'Build Engineer' },
  prism:    { accent: '#2dd4bf', glow: 'rgba(45,212,191,.6)',  name: 'Prism Core',    personality: 'Style Explorer' },
  quantum:  { accent: '#bae6fd', glow: 'rgba(186,230,253,.6)', name: 'Quantum Core',  personality: 'Quantum Systems' },
};

const QUICK_ACTIONS = [
  { icon: Box,     label: 'Create Object',    cmd: 'add a primitive cube at origin' },
  { icon: Palette, label: 'Add Material',     cmd: 'apply a new PBR material to selection' },
  { icon: Target,  label: 'Optimize Mesh',    cmd: 'decimate and remesh selected object' },
  { icon: Film,    label: 'Animate',          cmd: 'set keyframes for a rotation animation' },
  { icon: Video,   label: 'Add Camera',       cmd: 'add a cinematic camera at current view' },
  { icon: Sun,     label: 'Add Light',        cmd: 'add an area light above the scene' },
  { icon: Cpu,     label: 'Switch Tool',      cmd: 'switch to sculpt mode' },
  { icon: Layers,  label: 'Refine Topology',  cmd: 'retopologize selected high-poly mesh' },
];

// ── Mini orb visual (CSS-only, no Three.js) ───────────────────────────────────
function MiniOrb({ orb, listening, size = 62 }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 ${size * 0.5}px ${orb.glow}, inset 0 0 ${size * 0.2}px ${orb.glow}`, border: `1.5px solid ${orb.glow}` }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute inset-[8%] rounded-full border" style={{ borderColor: orb.accent + '55' }}
        animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute inset-[18%] rounded-full border" style={{ borderColor: orb.accent + '99' }}
        animate={{ rotate: -360, scale: listening ? [1, 1.12, 1] : 1 }}
        transition={{ duration: listening ? 1.0 : 6, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute inset-[30%] rounded-full"
        style={{ background: `radial-gradient(circle at 35% 35%, #fff, ${orb.accent} 38%, #0a0e1a 72%)` }}
        animate={{ y: [0, -2, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute inset-[44%] rounded-full bg-white"
        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} />
    </div>
  );
}

// ── Gesture Panel ─────────────────────────────────────────────────────────────
function GesturePanel({ orb }) {
  const videoRef = useRef(null);
  const [camGranted, setCamGranted]   = useState(false);
  const [camError, setCamError]       = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [detected, setDetected]       = useState('—');
  const [confidence, setConfidence]   = useState(0);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCamGranted(true);
      // Simulate gesture detection polling
      const gestures = ['Pinch Select', 'Open Palm', 'Two-Finger Drag', 'Wrist Rotate', 'Spread Scale', 'Point Place', 'Fist Create', 'Swipe Deselect'];
      const interval = setInterval(() => {
        setDetected(gestures[Math.floor(Math.random() * gestures.length)]);
        setConfidence(Math.floor(Math.random() * 20) + 78);
      }, 1800);
      return () => clearInterval(interval);
    } catch (err) {
      setCamError('Camera permission denied. Please allow access.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCamGranted(false);
    setDetected('—');
    setConfidence(0);
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/35 flex items-center gap-1.5">
          <Hand size={11} /> Gesture Control
        </div>
        <button
          onClick={camGranted ? stopCamera : startCamera}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition"
          style={{ background: camGranted ? orb.accent + '22' : 'rgba(255,255,255,.08)', color: camGranted ? orb.accent : '#fff', border: `1px solid ${camGranted ? orb.accent + '55' : 'rgba(255,255,255,.1)'}` }}>
          {camGranted ? <><CameraOff size={11} /> Disable</> : isLoading ? 'Starting…' : <><Camera size={11} /> Enable Gesture</>}
        </button>
      </div>

      {/* Camera feed area */}
      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/8 bg-[#030810]">
        {camGranted ? (
          <video ref={videoRef} className="h-full w-full object-cover scale-x-[-1]" muted playsInline />
        ) : (
          <div className="h-full grid place-items-center text-center text-white/35">
            <div>
              <Camera size={24} className="mx-auto mb-2 opacity-40" />
              <div className="text-[11px]">Click Enable Gesture to start camera</div>
            </div>
          </div>
        )}
        {camGranted && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1">
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: orb.accent }} />
            <span className="text-[10px] font-bold" style={{ color: orb.accent }}>LIVE</span>
          </div>
        )}
      </div>

      {camError && <div className="text-[11px] text-red-400">{camError}</div>}

      {/* Gesture status */}
      <div className="space-y-1.5 text-[11px] text-white/55">
        <div className="flex justify-between">
          <span>Detected</span>
          <span style={{ color: camGranted ? orb.accent : undefined }}>{detected}</span>
        </div>
        <div className="flex justify-between">
          <span>Confidence</span>
          <span>{camGranted ? `${confidence}%` : '—'}</span>
        </div>
      </div>

      {/* Gesture reference */}
      <details className="group">
        <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/55 transition">Gesture Map ▾</summary>
        <div className="mt-1.5 grid grid-cols-2 gap-1 text-[10px] text-white/45">
          {[['Pinch','Select'],['Open Palm','Deselect'],['2-Finger Drag','Move'],['Wrist Rotate','Rotate'],['Spread','Scale'],['Point','Place'],['Fist','Create Obj'],['Swipe','Animate']].map(([g,a]) => (
            <div key={g} className="flex justify-between rounded-lg bg-white/[0.03] px-2 py-1">
              <span>{g}</span><span className="text-white/30">{a}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────
const OrbAssistantSidebar = ({ onAddObject }) => {
  const { selectedOrbId } = useSession();
  const { activeChat, addMessage } = useChat();
  const orb = ORB_META[selectedOrbId?.toLowerCase()] || ORB_META.nova;

  const [prompt, setPrompt]     = useState('');
  const [listening, setListen]  = useState(false);
  const [micOn, setMicOn]       = useState(true);
  const [tab, setTab]           = useState('chat'); // 'chat' | 'gesture'
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeChat?.messages]);

  const handleSend = () => {
    if (!prompt.trim()) return;
    addMessage(activeChat.id, { type: 'user', content: prompt });
    const p = prompt.toLowerCase();
    setTimeout(() => {
      let res = `Processing: "${prompt}"`;
      if (p.includes('create') || p.includes('add') || p.includes('cube') || p.includes('sphere')) {
        const type = p.includes('sphere') ? 'Sphere' : p.includes('torus') ? 'Torus' : p.includes('cylinder') ? 'Cylinder' : 'Box';
        onAddObject?.(type);
        res = `✓ Generated ${type} at scene origin. Material channels initialized.`;
      } else if (p.includes('material') || p.includes('color') || p.includes('shader')) {
        res = `✓ Applying PBR material pass. Albedo, roughness, and metalness channels configured.`;
      } else if (p.includes('animate') || p.includes('spin') || p.includes('rotation')) {
        window.dispatchEvent(new CustomEvent('aether-ai-command', { detail: { action: 'ANIMATE', type: 'SPIN' } }));
        res = `✓ Keyframe sequence injected. F-curve smoothing applied.`;
      }
      addMessage(activeChat.id, { type: 'system', content: res });
    }, 700);
    setPrompt('');
  };

  const runQuickAction = (cmd) => {
    addMessage(activeChat.id, { type: 'user', content: cmd });
    setTimeout(() => addMessage(activeChat.id, { type: 'system', content: `✓ Executing: ${cmd}` }), 600);
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      {/* ── ORB HEADER ── */}
      <div className="flex-shrink-0 rounded-[20px] border p-3.5"
        style={{ borderColor: orb.accent + '30', background: orb.accent + '08' }}>
        <div className="flex items-center gap-3">
          <MiniOrb orb={orb} listening={listening} size={54} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/35">Active Assistant</div>
            <div className="text-[15px] font-bold leading-tight truncate" style={{ color: orb.accent }}>{orb.name}</div>
            <div className="text-[11px] text-white/45 truncate">{orb.personality}</div>
          </div>
          <button onClick={() => setMicOn(v => !v)} className="rounded-xl border border-white/10 bg-white/5 p-2 flex-shrink-0">
            {micOn ? <Mic size={14} className="text-cyan-300" /> : <MicOff size={14} className="text-white/35" />}
          </button>
        </div>
        {/* Tabs */}
        <div className="mt-3 flex gap-1.5">
          {[['chat', 'Chat'], ['gesture', 'Gesture']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 rounded-xl py-1.5 text-[11px] font-bold transition"
              style={{ background: tab === id ? orb.accent + '22' : 'rgba(255,255,255,.05)', color: tab === id ? orb.accent : 'rgba(255,255,255,.45)', border: `1px solid ${tab === id ? orb.accent + '44' : 'transparent'}` }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'gesture' ? (
          <motion.div key="gesture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto rounded-[20px] border border-white/8 bg-[#070c12] p-3.5 space-y-3">
            <GesturePanel orb={orb} />
          </motion.div>
        ) : (
          <motion.key key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col flex-1 min-h-0 gap-2">

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto rounded-[20px] border border-white/8 bg-[#040810] p-3 space-y-2 min-h-0" style={{ scrollbarWidth: 'thin' }}>
              {(!activeChat?.messages || activeChat.messages.length === 0) && (
                <div className="text-center text-[12px] text-white/25 pt-6">
                  <Sparkles size={18} className="mx-auto mb-2 opacity-30" style={{ color: orb.accent }} />
                  {orb.name} is ready. Ask me anything about your scene.
                </div>
              )}
              {activeChat?.messages?.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-0.5 ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-white/25">
                    {msg.type === 'user' ? 'You' : orb.name}
                  </div>
                  <div className="max-w-[92%] rounded-[14px] px-3 py-2 text-[12px] leading-5"
                    style={msg.type === 'user'
                      ? { background: orb.accent + '20', color: orb.accent, border: `1px solid ${orb.accent}33` }
                      : { background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.08)' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="flex-shrink-0 grid grid-cols-2 gap-1.5 px-0.5">
              {QUICK_ACTIONS.map(({ icon: Icon, label, cmd }) => (
                <button key={label} onClick={() => runQuickAction(cmd)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/6 bg-white/[0.03] px-2.5 py-2 text-[11px] font-medium text-white/55 hover:bg-white/6 hover:text-white/80 transition text-left">
                  <Icon size={11} style={{ color: orb.accent, flexShrink: 0 }} /> {label}
                </button>
              ))}
            </div>

            {/* Prompt input */}
            <div className="flex-shrink-0 flex gap-2">
              <button onClick={() => setListen(v => !v)}
                className="rounded-xl px-3 py-2.5 text-[11px] font-bold flex-shrink-0 transition"
                style={{ background: listening ? orb.accent + '22' : 'rgba(255,255,255,.06)', color: listening ? orb.accent : '#fff', border: `1px solid ${listening ? orb.accent + '44' : 'rgba(255,255,255,.1)'}` }}>
                <Mic size={13} />
              </button>
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={`Ask ${orb.name}…`}
                className="flex-1 rounded-xl border border-white/8 bg-black/40 px-3 py-2.5 text-[12px] text-white placeholder:text-white/25 outline-none min-w-0"
              />
              <button onClick={handleSend}
                className="rounded-xl px-3 py-2.5 flex-shrink-0 transition hover:opacity-80"
                style={{ background: `linear-gradient(135deg, ${orb.accent}, #7c3aed)` }}>
                <Send size={13} className="text-black" />
              </button>
            </div>
          </motion.key>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrbAssistantSidebar;
