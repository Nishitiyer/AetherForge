import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronLeft, ChevronRight, Mic, MicOff, Camera, Play, Pause, PanelLeft, PanelRight } from "lucide-react";
import { useSession } from "../../context/SessionContext";

// ─── ORB DATA ────────────────────────────────────────────────────────────────
const ORBS = [
  { id: "nova",     name: "Nova Core",     accent: "#fbbf24", glow: "rgba(251,191,36,.6)",  desc: "Cinematic lighting, hero composition, showcase rendering, and photoreal presentation.", personality: "Cinematic Director" },
  { id: "sentinel", name: "Sentinel Core", accent: "#22d3ee", glow: "rgba(34,211,238,.6)",  desc: "Technical analysis, scene structure, optimization, and precision-driven workflows.",    personality: "Technical Architect" },
  { id: "echo",     name: "Echo Core",     accent: "#e879f9", glow: "rgba(232,121,249,.6)", desc: "Multilingual voice-native prompting, guidance, and conversational creation control.",  personality: "Voice Companion" },
  { id: "forge",    name: "Forge Core",    accent: "#fb923c", glow: "rgba(251,146,60,.6)",  desc: "Asset building, blockout, production modeling, and creation-heavy workflows.",          personality: "Build Engineer" },
  { id: "prism",    name: "Prism Core",    accent: "#2dd4bf", glow: "rgba(45,212,191,.6)",  desc: "Style exploration, visual variations, material experiments, and design studies.",       personality: "Style Explorer" },
  { id: "quantum",  name: "Quantum Core",  accent: "#bae6fd", glow: "rgba(186,230,253,.6)", desc: "Simulation, procedural workflows, experimental systems, and advanced pipelines.",       personality: "Quantum Systems" },
];

// ─── ORB CORE VISUAL ─────────────────────────────────────────────────────────
function OrbCore({ orb, size = 84, active = true, listening = false }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <motion.div className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 ${size*0.45}px ${orb.glow}, inset 0 0 ${size*0.2}px ${orb.glow}`, border: `1.5px solid ${orb.glow}` }}
        animate={{ scale: active ? [1, 1.09, 1] : 1, opacity: active ? [0.7, 1, 0.7] : 0.4 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute inset-[6%] rounded-full border" style={{ borderColor: orb.accent + "44" }}
        animate={{ rotate: 360 }} transition={{ duration: 11, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute inset-[15%] rounded-full border" style={{ borderColor: orb.accent + "88" }}
        animate={{ rotate: -360, scale: listening ? [1, 1.1, 1] : 1 }}
        transition={{ duration: listening ? 1.1 : 6.5, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute inset-[26%] rounded-full border" style={{ borderColor: orb.accent + "bb" }}
        animate={{ rotate: 360 }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} />
      <motion.div className="absolute inset-[33%] rounded-full"
        style={{ background: `radial-gradient(circle at 35% 35%, #fff, ${orb.accent} 36%, rgba(10,10,22,1) 72%)` }}
        animate={{ y: [0, -3, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute inset-[46%] rounded-full bg-white"
        animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

// ─── IRON MAN STYLE CHESTPLATE (SVG, center-split opening) ───────────────────
function ChestHeroSVG({ orb, stateMode }) {
  const isOpen = stateMode !== "idle_closed";
  const isOpening = stateMode === "initialize_open";
  const isSwap = stateMode === "orb_swap";

  // How far left/right panels split open
  const splitX = isOpen ? (isOpening ? 28 : 18) : 0;

  return (
    <div className="relative mx-auto w-full max-w-[940px] select-none overflow-hidden rounded-[36px] border border-yellow-500/20 bg-[#02060b] shadow-[0_0_80px_rgba(180,140,30,.12)]">
      {/* Ambient scanline grid */}
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(200,160,40,.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,160,40,.1)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_52%,rgba(160,110,0,.15),transparent)]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />

      <div className="relative" style={{ aspectRatio: "16/7.8", minHeight: 390 }}>
        <svg viewBox="0 0 1100 540" className="absolute inset-0 h-full w-full">
          <defs>
            {/* Gold main body */}
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5d98c" />
              <stop offset="35%" stopColor="#d4a830" />
              <stop offset="70%" stopColor="#8b6510" />
              <stop offset="100%" stopColor="#2a1c04" />
            </linearGradient>
            {/* Gold highlight */}
            <linearGradient id="goldSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffe8a0" stopOpacity="0.7" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            {/* Red armor panels */}
            <linearGradient id="red" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d92a2a" />
              <stop offset="45%" stopColor="#8c1515" />
              <stop offset="100%" stopColor="#1a0404" />
            </linearGradient>
            <linearGradient id="redSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff5555" stopOpacity="0.45" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            {/* Gunmetal silver */}
            <linearGradient id="silver" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9cb0c8" />
              <stop offset="50%" stopColor="#4a607a" />
              <stop offset="100%" stopColor="#0c1420" />
            </linearGradient>
            <linearGradient id="dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c2538" />
              <stop offset="100%" stopColor="#050810" />
            </linearGradient>
            {/* Core radial glow */}
            <radialGradient id="coreGlow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor={orb.accent} />
              <stop offset="55%" stopColor="#060c18" />
              <stop offset="100%" stopColor="#020408" />
            </radialGradient>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* ── UPPER COLLAR / NECKLINE ── */}
          <path d="M380 80 L720 80 L695 128 L405 128 Z" fill="url(#silver)" stroke="#c8a840" strokeWidth="2" />
          <path d="M420 92 L680 92" stroke="#c8a840" strokeWidth="1.5" opacity="0.5" />
          {/* Collar rivets */}
          {[450, 500, 550, 600, 650].map(x => (
            <circle key={x} cx={x} cy="108" r="3.5" fill="#c8a840" opacity="0.7" />
          ))}

          {/* ── SHOULDER LEDGES ── */}
          <path d="M275 155 L410 128 L418 172 L285 195 Z" fill="url(#silver)" stroke="#c8a840" strokeWidth="1.5" />
          <path d="M825 155 L690 128 L682 172 L815 195 Z" fill="url(#silver)" stroke="#c8a840" strokeWidth="1.5" />

          {/* ── MAIN GOLD CHEST BODY ── */}
          {/* Left chest section */}
          <path d="M192 210 Q255 168 408 182 L460 205 L440 408 Q418 480 278 475 L182 442 Z" fill="url(#gold)" stroke="#c8a840" strokeWidth="2.5" filter="url(#softShadow)" />
          <path d="M205 228 Q265 185 396 198 L432 225 Q360 215 255 258 Z" fill="url(#goldSheen)" />
          {/* Right chest section */}
          <path d="M908 210 Q845 168 692 182 L640 205 L660 408 Q682 480 822 475 L918 442 Z" fill="url(#gold)" stroke="#c8a840" strokeWidth="2.5" filter="url(#softShadow)" />
          <path d="M895 228 Q835 185 704 198 L668 225 Q740 215 845 258 Z" fill="url(#goldSheen)" />

          {/* ── RED ACCENT PANELS (outer sides) ── */}
          {/* Left red outer */}
          <path d="M182 240 Q205 210 258 218 L272 285 Q235 278 200 295 Z" fill="url(#red)" stroke="#c8a840" strokeWidth="1.5" />
          <path d="M187 330 Q210 310 268 318 L278 365 Q240 360 198 378 Z" fill="url(#red)" stroke="#c8a840" strokeWidth="1.5" />
          {/* Right red outer */}
          <path d="M918 240 Q895 210 842 218 L828 285 Q865 278 900 295 Z" fill="url(#red)" stroke="#c8a840" strokeWidth="1.5" />
          <path d="M913 330 Q890 310 832 318 L822 365 Q860 360 902 378 Z" fill="url(#red)" stroke="#c8a840" strokeWidth="1.5" />

          {/* ── STERNUM / CENTER PANEL — splits open from center seam ── */}
          {/* Left half of center sternum */}
          <motion.g animate={{ x: -splitX }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
            <path d="M475 168 L550 168 L548 475 L470 475 Z" fill="url(#gold)" stroke="#c8a840" strokeWidth="1.5" />
            {/* Red sternum accent stripe */}
            <path d="M478 200 L548 200 L548 235 L478 235 Z" fill="url(#red)" />
            <path d="M478 340 L548 340 L548 375 L478 375 Z" fill="url(#red)" />
            {/* Center seam line */}
            <line x1="548" y1="165" x2="548" y2="478" stroke="#ffe060" strokeWidth="2.5" opacity="0.9" />
            {/* Seam glow when opening */}
            {isOpen && <line x1="548" y1="165" x2="548" y2="478" stroke={orb.accent} strokeWidth="4" opacity="0.7" filter="url(#glow)" />}
          </motion.g>

          {/* Right half of center sternum */}
          <motion.g animate={{ x: splitX }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}>
            <path d="M550 168 L625 168 L630 475 L552 475 Z" fill="url(#gold)" stroke="#c8a840" strokeWidth="1.5" />
            <path d="M552 200 L628 200 L628 235 L552 235 Z" fill="url(#red)" />
            <path d="M552 340 L628 340 L628 375 L552 375 Z" fill="url(#red)" />
            <line x1="552" y1="165" x2="552" y2="478" stroke="#ffe060" strokeWidth="2.5" opacity="0.9" />
            {isOpen && <line x1="552" y1="165" x2="552" y2="478" stroke={orb.accent} strokeWidth="4" opacity="0.7" filter="url(#glow)" />}
          </motion.g>

          {/* ── REACTOR HOUSING ── */}
          {/* Outer mount plate */}
          <circle cx="550" cy="298" r="102" fill="url(#dark)" stroke="#c8a840" strokeWidth="3" />
          <circle cx="550" cy="298" r="94"  fill="#020408" stroke="url(#silver)" strokeWidth="2" opacity="0.7" />

          {/* Rotating ring */}
          <motion.g style={{ originX: "550px", originY: "298px" }}
            animate={{ rotate: isOpen ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
            <circle cx="550" cy="298" r="78" fill="none" stroke={orb.glow} strokeWidth="4" filter="url(#glow)" />
            {[0,45,90,135,180,225,270,315].map(a => (
              <rect key={a} x="547" y="224" width="6" height="28" rx="3" fill="#1a2438" stroke={orb.accent} strokeWidth="1.5" transform={`rotate(${a} 550 298)`} />
            ))}
          </motion.g>

          {/* Inner counter-ring */}
          <motion.g style={{ originX: "550px", originY: "298px" }}
            animate={{ rotate: isOpen ? -360 : 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
            <circle cx="550" cy="298" r="60" fill="none" stroke={orb.accent} strokeWidth="2" opacity="0.55" />
          </motion.g>

          {/* Orb core (replaces arc reactor) */}
          <AnimatePresence mode="wait">
            <motion.g key={orb.id}
              initial={{ scale: 0.65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.65, opacity: 0 }}
              transition={{ duration: 0.5 }} style={{ originX: "550px", originY: "298px" }}>
              <circle cx="550" cy="298" r="44" fill="url(#coreGlow)" filter="url(#glow)" />
              <circle cx="550" cy="298" r="18" fill="#fff" opacity="0.94" />
            </motion.g>
          </AnimatePresence>

          {/* Pulsing energy ring */}
          <motion.circle cx="550" cy="298" r="50" fill="none" stroke={orb.glow} strokeWidth="3"
            animate={{ r: isOpen ? [50, 55, 50] : 50, opacity: isOpen ? [0.5, 1, 0.5] : 0.25 }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            filter="url(#glow)" />

          {/* ── LOWER ABDOMINAL PLATE ── */}
          <path d="M470 474 L630 474 L660 510 L440 510 Z" fill="url(#gold)" stroke="#c8a840" strokeWidth="2" />
          <line x1="440" y1="490" x2="660" y2="490" stroke="#c8a840" strokeWidth="1.5" opacity="0.5" />
          {/* Bottom red accent strip */}
          <path d="M455 510 L645 510 L655 530 L445 530 Z" fill="url(#red)" stroke="#c8a840" strokeWidth="1" />

          {/* ── GOLD PANEL BEVEL DETAILS ── */}
          {/* Left chest detail lines */}
          <path d="M240 265 Q295 245 405 252" fill="none" stroke="#ffe8a088" strokeWidth="2" />
          <path d="M225 340 Q285 322 408 328" fill="none" stroke="#ffe8a066" strokeWidth="1.5" />
          {/* Right chest detail lines */}
          <path d="M860 265 Q805 245 695 252" fill="none" stroke="#ffe8a088" strokeWidth="2" />
          <path d="M875 340 Q815 322 692 328" fill="none" stroke="#ffe8a066" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
export function Landing({ selectedOrb, setSelectedOrb, onEnterWorkspace, heroState, setHeroState }) {
  const index = ORBS.findIndex(o => o.id === selectedOrb);
  const orb   = ORBS[index] ?? ORBS[0];

  const next = useCallback(() => { setHeroState("orb_swap"); setSelectedOrb(ORBS[(index + 1) % ORBS.length].id); }, [index]);
  const prev = useCallback(() => { setHeroState("orb_swap"); setSelectedOrb(ORBS[(index - 1 + ORBS.length) % ORBS.length].id); }, [index]);

  useEffect(() => {
    const fn = e => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [next, prev]);

  useEffect(() => {
    if (heroState === "orb_swap" || heroState === "initialize_open") {
      const t = setTimeout(() => setHeroState("idle_active"), 950);
      return () => clearTimeout(t);
    }
  }, [heroState]);

  return (
    <div className="min-h-screen bg-[#03060b] text-white overflow-x-hidden">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-yellow-500/10 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <span>AetherForge</span>
          </div>
          <nav className="hidden items-center gap-9 text-sm text-white/65 md:flex">
            {["Features","Workflows","Pricing","Creator"].map(l => <a key={l} className="hover:text-white transition cursor-pointer">{l}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-white/6 border border-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 transition">Log In</button>
            <button className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition">Free Download</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl grid-cols-12 gap-5 px-6 py-10 items-start">
        {/* LEFT — Core Library */}
        <aside className="col-span-2 hidden xl:block rounded-[24px] border border-white/8 bg-white/[0.03] p-4 sticky top-24">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.42em] text-white/35">Core Library</div>
          <div className="space-y-1.5">
            {ORBS.map(o => (
              <button key={o.id}
                onClick={() => { setHeroState("orb_swap"); setSelectedOrb(o.id); }}
                className="flex w-full items-center gap-2.5 rounded-[18px] border px-2.5 py-2.5 text-left transition"
                style={{ borderColor: selectedOrb === o.id ? o.accent + "60" : "rgba(255,255,255,.05)", background: selectedOrb === o.id ? o.accent + "12" : "rgba(0,0,0,.2)" }}>
                <OrbCore orb={o} size={38} active={selectedOrb === o.id} />
                <div>
                  <div className="text-[13px] font-semibold leading-tight">{o.name}</div>
                  <div className="text-[11px] text-white/45 mt-0.5">{o.personality}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER */}
        <main className="col-span-12 xl:col-span-8 flex flex-col gap-5">
          <div className="text-center">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.55em] text-yellow-400/70">Select Your AI Core</div>
            <h1 className="mx-auto max-w-3xl text-[clamp(24px,3.5vw,46px)] font-semibold leading-[1.2] tracking-tight">
              Blender-depth creation. Voice-native intelligence. Gesture-driven worldbuilding.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-white/60">
              Initialize the chestplate reactor and select the intelligence core that powers your 3D creation workflow.
            </p>
          </div>

          <div className="relative">
            <button onClick={prev} className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2.5 text-white/55 hover:text-white transition backdrop-blur-sm">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2.5 text-white/55 hover:text-white transition backdrop-blur-sm">
              <ChevronRight className="h-8 w-8" />
            </button>
            <ChestHeroSVG orb={orb} stateMode={heroState} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={orb.id} className="text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <div className="text-[28px] font-bold tracking-[0.3em] uppercase" style={{ color: orb.accent }}>{orb.name}</div>
              <p className="mx-auto mt-2 max-w-xl text-[15px] leading-6 text-white/60">{orb.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setHeroState("initialize_open")}
              className="rounded-[16px] border px-8 py-3 text-[13px] font-bold uppercase tracking-[0.35em] transition hover:bg-white/5"
              style={{ borderColor: orb.accent + "55", color: orb.accent }}>
              Initialize Suit
            </button>
            <button onClick={onEnterWorkspace}
              className="rounded-[16px] px-8 py-3 text-[13px] font-bold text-black transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${orb.accent}, #7c3aed)` }}>
              Enter Workspace →
            </button>
          </div>
          <div className="text-center text-[11px] uppercase tracking-[0.45em] text-white/28">Use UI or Left/Right Arrows for selection</div>
        </main>

        {/* RIGHT — System Status */}
        <aside className="col-span-2 hidden xl:block rounded-[24px] border border-white/8 bg-white/[0.03] p-5 sticky top-24">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.42em] text-white/35">System Status</div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/45">Reactor</span>
              <span className="font-bold text-[11px] uppercase tracking-widest" style={{ color: orb.accent }}>{heroState.replaceAll("_"," ")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/45">Sync Link</span>
              <span className="font-semibold text-green-400">99.8%</span>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/30 p-3">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">Active Core</div>
              <div className="text-[14px] font-semibold" style={{ color: orb.accent }}>{orb.personality}</div>
              <p className="mt-1.5 text-[11px] leading-4.5 text-white/40">Persists into the editor as your voice assistant and intelligence layer.</p>
            </div>
            <div className="flex justify-center pt-1">
              <OrbCore orb={orb} size={68} active={heroState !== "idle_closed"} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

// ─── ROOT / ROUTER WRAPPER ────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  const { setSelectedOrbId, setIsOrbSelected, setOrbSettings } = useSession();

  const [selectedOrb, setSelectedOrb] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aetherforge:selectedOrb")) || "nova"; } catch { return "nova"; }
  });
  const [heroState, setHeroState] = useState("idle_closed");

  const handleSelect = (id) => {
    setSelectedOrb(id);
    try { localStorage.setItem("aetherforge:selectedOrb", JSON.stringify(id)); } catch {}
  };

  const handleEnterWorkspace = () => {
    const orb = ORBS.find(o => o.id === selectedOrb) ?? ORBS[0];
    setSelectedOrbId(orb.id);
    setOrbSettings(prev => ({ ...prev, color: orb.accent, name: orb.name }));
    setIsOrbSelected(true);
    navigate("/editor");
  };

  return (
    <Landing
      selectedOrb={selectedOrb}
      setSelectedOrb={handleSelect}
      heroState={heroState}
      setHeroState={setHeroState}
      onEnterWorkspace={handleEnterWorkspace}
    />
  );
};

export { ORBS, OrbCore };
export default Hero;
