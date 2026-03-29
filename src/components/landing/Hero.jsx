import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, ChevronLeft, ChevronRight, Mic, MicOff, Camera, Play, Pause, PanelLeft, PanelRight,
} from "lucide-react";
import { useSession } from "../../context/SessionContext";

// ─── ORB DATA ────────────────────────────────────────────────────────────────
const ORBS = [
  { id: "nova",     name: "Nova Core",     accent: "#fbbf24", glow: "rgba(251,191,36,.55)",  desc: "Cinematic lighting, hero composition, showcase rendering, and photoreal presentation.", personality: "Cinematic Director" },
  { id: "sentinel", name: "Sentinel Core", accent: "#22d3ee", glow: "rgba(34,211,238,.55)",  desc: "Technical analysis, scene structure, optimization, and precision-driven workflows.",    personality: "Technical Architect" },
  { id: "echo",     name: "Echo Core",     accent: "#e879f9", glow: "rgba(232,121,249,.55)", desc: "Multilingual voice-native prompting, guidance, and conversational creation control.",  personality: "Voice Companion" },
  { id: "forge",    name: "Forge Core",    accent: "#fb923c", glow: "rgba(251,146,60,.55)",  desc: "Asset building, blockout, production modeling, and creation-heavy workflows.",          personality: "Build Engineer" },
  { id: "prism",    name: "Prism Core",    accent: "#2dd4bf", glow: "rgba(45,212,191,.55)",  desc: "Style exploration, visual variations, material experiments, and design studies.",       personality: "Style Explorer" },
  { id: "quantum",  name: "Quantum Core",  accent: "#bae6fd", glow: "rgba(186,230,253,.55)", desc: "Simulation, procedural workflows, experimental systems, and advanced pipelines.",       personality: "Quantum Systems" },
];

const WORKSPACES = ["Layout","Modeling","Sculpting","UV Editing","Texture Paint","Shading","Animation","Rendering","Compositing","Geometry Nodes","Simulation","AI Generate","Gesture Build","Voice Build"];
const TOOLS = ["Move","Rotate","Scale","Extrude","Inset","Bevel","Knife","Loop Cut","Bridge","Boolean","Mirror","Array","Solidify","Remesh","Decimate","Retopo"];

// ─── ORB CORE VISUAL (upgraded — 4 rings + shimmer pulse) ───────────────────
function OrbCore({ orb, size = 84, active = true, listening = false }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer ambient glow */}
      <motion.div className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 ${size * 0.5}px ${orb.glow}, inset 0 0 ${size * 0.25}px ${orb.glow}`, border: `1.5px solid ${orb.glow}` }}
        animate={{ scale: active ? [1, 1.1, 1] : 1, opacity: active ? [0.75, 1, 0.75] : 0.45 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Ring 1 — slow outward */}
      <motion.div className="absolute inset-[6%] rounded-full border-[1.5px]"
        style={{ borderColor: orb.accent + "44" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
      />
      {/* Ring 2 — medium counter */}
      <motion.div className="absolute inset-[15%] rounded-full border"
        style={{ borderColor: orb.accent + "77" }}
        animate={{ rotate: -360, scale: listening ? [1, 1.1, 1] : 1 }}
        transition={{ duration: listening ? 1.1 : 6.5, repeat: Infinity, ease: "linear" }}
      />
      {/* Ring 3 — fast inner */}
      <motion.div className="absolute inset-[26%] rounded-full border"
        style={{ borderColor: orb.accent + "aa" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
      {/* Core radial */}
      <motion.div className="absolute inset-[33%] rounded-full"
        style={{ background: `radial-gradient(circle at 35% 35%, #fff, ${orb.accent} 36%, rgba(10,10,22,1) 72%)` }}
        animate={{ y: [0, -3, 0], scale: active ? [1, 1.04, 1] : 1 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Nucleus shimmer */}
      <motion.div className="absolute inset-[46%] rounded-full bg-white"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── SVG CHEST REACTOR HERO (preserved + heavily upgraded paths/effects) ────
function ChestHeroSVG({ orb, stateMode }) {
  const active    = stateMode !== "idle_closed";
  const opening   = stateMode === "initialize_open";
  const swapping  = stateMode === "orb_swap";

  return (
    <div className="relative mx-auto w-full max-w-[1020px] rounded-[40px] border border-cyan-400/20 bg-[#02060b] shadow-[0_0_90px_rgba(0,180,255,.13)] overflow-hidden select-none">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(to_right,rgba(0,255,255,.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,255,.09)_1px,transparent_1px)] [background-size:36px_36px]" />
      {/* Radial ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_55%,rgba(0,140,255,.13),transparent)]" />
      {/* Top scanline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

      <div className="relative" style={{ aspectRatio: "16/7.5", minHeight: 400 }}>
        <svg viewBox="0 0 1200 600" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="redArmor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#c62128" />
              <stop offset="40%"  stopColor="#8c1318" />
              <stop offset="100%" stopColor="#130408" />
            </linearGradient>
            <linearGradient id="redArmorSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#e8363e" stopOpacity="0.55" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#f5d99c" />
              <stop offset="100%" stopColor="#7d5618" />
            </linearGradient>
            <linearGradient id="gunmetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#2c3a4e" />
              <stop offset="45%"  stopColor="#0e1420" />
              <stop offset="100%" stopColor="#020408" />
            </linearGradient>
            <linearGradient id="gunmetalLight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3d4f68" />
              <stop offset="100%" stopColor="#0c1520" />
            </linearGradient>
            <radialGradient id="coreGlow" cx="50%" cy="45%" r="50%">
              <stop offset="0%"   stopColor="#ffffff" />
              <stop offset="22%"  stopColor={orb.accent} />
              <stop offset="55%"  stopColor="#08101e" />
              <stop offset="100%" stopColor="#020305" />
            </radialGradient>
            <radialGradient id="coreRingGlow" cx="50%" cy="50%" r="50%">
              <stop offset="60%"  stopColor="transparent" />
              <stop offset="100%" stopColor={orb.glow} />
            </radialGradient>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── COLLAR / UPPER FLAP ── */}
          <motion.g
            animate={{ y: opening ? -20 : active ? -10 : 0, rotateX: opening ? -15 : 0 }}
            transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
          >
            <path d="M390 108 L810 108 L775 162 L425 162 Z" fill="url(#gunmetal)" stroke="url(#goldTrim)" strokeWidth="2.5" />
            <path d="M430 126 L770 126" stroke="url(#goldTrim)" strokeWidth="1.5" opacity="0.5" />
            <path d="M455 142 L745 142" stroke="#58657e" strokeWidth="1" opacity="0.4" />
          </motion.g>

          {/* ── LEFT COLLARBONE SHOULDER ── */}
          <path d="M308 175 L432 155 L440 210 L320 225 Z" fill="url(#gunmetal)" stroke="#58657e55" strokeWidth="1.5" />
          {/* ── RIGHT COLLARBONE SHOULDER ── */}
          <path d="M892 175 L768 155 L760 210 L880 225 Z" fill="url(#gunmetal)" stroke="#58657e55" strokeWidth="1.5" />

          {/* ── LEFT PECTORAL ARMOR ── */}
          <motion.g
            animate={{ x: active ? -14 : 0, rotate: active ? -9 : opening ? -18 : -4 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: "50%", originY: "42%" }}
          >
            <path d="M200 238 Q272 186 440 202 L502 220 L474 444 Q442 526 292 520 L192 468 Z" fill="url(#redArmor)" stroke="url(#goldTrim)" strokeWidth="2.5" />
            {/* Armor sheen */}
            <path d="M210 255 Q280 200 430 215 L450 270 Q360 250 240 295 Z" fill="url(#redArmorSheen)" />
            {/* Beveled edge line */}
            <path d="M222 265 Q294 210 425 224" fill="none" stroke="#f7d48878" strokeWidth="2.5" />
            {/* Secondary panel line */}
            <path d="M260 340 Q318 315 440 325 L460 380 Q370 375 278 400 Z" fill="#00000033" />
            <path d="M270 350 L440 335" stroke="#58657e55" strokeWidth="1" />
          </motion.g>

          {/* ── RIGHT PECTORAL ARMOR ── */}
          <motion.g
            animate={{ x: active ? 14 : 0, rotate: active ? 9 : opening ? 18 : 4 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: "50%", originY: "42%" }}
          >
            <path d="M1000 238 Q928 186 760 202 L698 220 L726 444 Q758 526 908 520 L1008 468 Z" fill="url(#redArmor)" stroke="url(#goldTrim)" strokeWidth="2.5" />
            <path d="M990 255 Q920 200 770 215 L750 270 Q840 250 960 295 Z" fill="url(#redArmorSheen)" />
            <path d="M978 265 Q906 210 775 224" fill="none" stroke="#f7d48878" strokeWidth="2.5" />
            <path d="M940 340 Q882 315 760 325 L740 380 Q830 375 922 400 Z" fill="#00000033" />
            <path d="M930 350 L760 335" stroke="#58657e55" strokeWidth="1" />
          </motion.g>

          {/* ── STERNUM FRAME ── */}
          <path d="M506 162 L694 162 L708 540 L492 540 Z" fill="url(#gunmetal)" stroke="#58657e55" strokeWidth="2" />
          {/* Inner cavity */}
          <path d="M544 176 L656 176 L662 528 L538 528 Z" fill="#030609" opacity="0.9" />
          {/* Central ridge */}
          <path d="M585 162 L615 162 L618 540 L582 540 Z" fill="url(#gunmetalLight)" opacity="0.8" />
          {/* Cross braces */}
          {[200, 260, 320, 380, 460].map((y, i) => (
            <line key={i} x1="510" y1={y} x2="690" y2={y} stroke="#2c3a4e" strokeWidth="1.5" opacity="0.6" />
          ))}
          {/* Gold seam strips */}
          <line x1="540" y1="178" x2="540" y2="526" stroke="url(#goldTrim)" strokeWidth="1" opacity="0.3" />
          <line x1="660" y1="178" x2="660" y2="526" stroke="url(#goldTrim)" strokeWidth="1" opacity="0.3" />

          {/* ── LOWER TAPER / BASE PLATE ── */}
          <path d="M502 524 L698 524 L746 566 L454 566 Z" fill="url(#gunmetal)" stroke="#6b728033" strokeWidth="2" />
          <line x1="454" y1="542" x2="746" y2="542" stroke="url(#goldTrim)" strokeWidth="1.5" opacity="0.4" />

          {/* ── REACTOR CHAMBER HOUSING ── */}
          {/* Outer mount ring */}
          <circle cx="600" cy="308" r="108" fill="none" stroke="#1c2538" strokeWidth="10" />
          <circle cx="600" cy="308" r="102" fill="#020406" />
          {/* Gold accent ring */}
          <circle cx="600" cy="308" r="96" fill="none" stroke="url(#goldTrim)" strokeWidth="2" opacity="0.55" />

          {/* Rotating track ring + iris blades */}
          <motion.g
            animate={{ rotate: active ? 360 : 0 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ originX: "600px", originY: "308px" }}
          >
            <circle cx="600" cy="308" r="82" fill="none" stroke={orb.glow} strokeWidth="4" filter="url(#glow)" />
            {[0,60,120,180,240,300].map(a => (
              <rect key={a} x="596.5" y="232" width="7" height="32" rx="3.5"
                fill="#111827" stroke={orb.accent} strokeWidth="1.5"
                transform={`rotate(${a} 600 308)`} />
            ))}
          </motion.g>

          {/* Inner glow ring */}
          <motion.g
            animate={{ rotate: active ? -360 : 0, scale: swapping ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            style={{ originX: "600px", originY: "308px" }}
          >
            <circle cx="600" cy="308" r="65" fill="none" stroke={orb.accent} strokeWidth="2.5" opacity="0.6" />
          </motion.g>

          {/* Core orb */}
          <AnimatePresence mode="wait">
            <motion.g key={orb.id}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.55 }}
              style={{ originX: "600px", originY: "308px" }}
            >
              <circle cx="600" cy="308" r="46" fill="url(#coreGlow)" filter="url(#glow)" />
              <circle cx="600" cy="308" r="20" fill="#fff" opacity="0.93" />
            </motion.g>
          </AnimatePresence>

          {/* Orb reactive energy ring */}
          <motion.circle cx="600" cy="308" r="52"
            fill="none" stroke={orb.glow} strokeWidth="3"
            animate={{ r: active ? [52, 56, 52] : 52, opacity: active ? [0.6, 1, 0.6] : 0.3 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            filter="url(#softGlow)"
          />

          {/* Pedestal strut */}
          <motion.g
            animate={{ y: stateMode === "idle_closed" ? 14 : 0, opacity: stateMode === "idle_closed" ? 0.4 : 1 }}
            transition={{ duration: 0.65 }}
          >
            <path d="M553 366 L647 366 L640 445 L560 445 Z" fill="url(#gunmetal)" stroke="#3d4f6844" strokeWidth="1.5" />
            <line x1="560" y1="385" x2="640" y2="385" stroke="url(#goldTrim)" strokeWidth="1" opacity="0.3" />
          </motion.g>

          {/* Side connector struts */}
          <path d="M465 295 L513 295 L513 325 L465 325 Z" fill="url(#gunmetal)" stroke="#2c3a4e66" strokeWidth="1" />
          <path d="M735 295 L687 295 L687 325 L735 325 Z" fill="url(#gunmetal)" stroke="#2c3a4e66" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ────────────────────────────────────────────────────────────
function Landing({ selectedOrb, setSelectedOrb, onEnterWorkspace, heroState, setHeroState }) {
  const index = ORBS.findIndex(o => o.id === selectedOrb);
  const orb   = ORBS[index] ?? ORBS[0];

  const next = useCallback(() => { setHeroState("orb_swap"); setSelectedOrb(ORBS[(index + 1) % ORBS.length].id); }, [index]);
  const prev = useCallback(() => { setHeroState("orb_swap"); setSelectedOrb(ORBS[(index - 1 + ORBS.length) % ORBS.length].id); }, [index]);

  useEffect(() => {
    const fn = e => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft")  prev();
    };
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
    <div className="min-h-screen bg-[#03060b] text-white overflow-hidden">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/10 bg-black/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-6 w-6 text-cyan-300" />
            <span>AetherForge</span>
          </div>
          <nav className="hidden items-center gap-9 text-base text-white/65 md:flex">
            {["Features","Workflows","Pricing","Creator"].map(l => <a key={l} className="hover:text-white transition cursor-pointer">{l}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-xl bg-white/6 border border-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 transition">Log In</button>
            <button className="rounded-xl bg-gradient-to-r from-sky-400 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition">Free Download</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1380px] grid-cols-12 gap-5 px-6 py-10 items-start">
        {/* LEFT — Core Library */}
        <aside className="col-span-2 hidden xl:block rounded-[26px] border border-white/8 bg-white/3 p-4 sticky top-24">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.42em] text-white/35">Core Library</div>
          <div className="space-y-1.5">
            {ORBS.map(o => (
              <button key={o.id}
                onClick={() => { setHeroState("orb_swap"); setSelectedOrb(o.id); }}
                className="flex w-full items-center gap-2.5 rounded-2xl border px-2.5 py-2.5 text-left transition"
                style={{ borderColor: selectedOrb === o.id ? o.accent + "60" : "rgba(255,255,255,.05)", background: selectedOrb === o.id ? o.accent + "12" : "rgba(0,0,0,.2)" }}
              >
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
        <main className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="text-center">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.55em] text-cyan-300/65">Select Your AI Core</div>
            <h1 className="mx-auto max-w-3xl text-[clamp(26px,4vw,50px)] font-semibold leading-[1.2] tracking-tight">
              Blender-depth creation. Voice-native intelligence. Gesture-driven worldbuilding.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/60">
              Initialize the central chest reactor and choose the intelligence mode that powers your modeling, shading, animation, and live voice workflow.
            </p>
          </div>

          {/* CHEST HERO */}
          <div className="relative">
            <button onClick={prev} className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2.5 text-white/55 hover:text-white transition backdrop-blur-sm">
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button onClick={next} className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2.5 text-white/55 hover:text-white transition backdrop-blur-sm">
              <ChevronRight className="h-8 w-8" />
            </button>
            <ChestHeroSVG orb={orb} stateMode={heroState} />
          </div>

          {/* ORB INFO */}
          <AnimatePresence mode="wait">
            <motion.div key={orb.id} className="text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
              <div className="text-[32px] font-bold tracking-[0.3em] uppercase" style={{ color: orb.accent }}>{orb.name}</div>
              <p className="mx-auto mt-3 max-w-xl text-[17px] leading-7 text-white/65">{orb.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setHeroState("initialize_open")}
              className="rounded-[18px] border px-8 py-3.5 text-[13px] font-bold uppercase tracking-[0.35em] transition hover:bg-white/5"
              style={{ borderColor: orb.accent + "50", color: orb.accent }}>
              Initialize Suit
            </button>
            <button onClick={onEnterWorkspace}
              className="rounded-[18px] px-8 py-3.5 text-[13px] font-bold text-black transition hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${orb.accent}, #6366f1)` }}>
              Enter Workspace →
            </button>
          </div>
          <div className="text-center text-[11px] uppercase tracking-[0.45em] text-white/28">Use UI or Left/Right Arrows for selection</div>
        </main>

        {/* RIGHT — System Status */}
        <aside className="col-span-2 hidden xl:block rounded-[26px] border border-white/8 bg-white/3 p-5 sticky top-24">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.42em] text-white/35">System Status</div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/45">Reactor</span>
              <span className="font-semibold text-[11px] uppercase tracking-widest" style={{ color: orb.accent }}>{heroState.replaceAll("_"," ")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/45">Sync Link</span>
              <span className="font-semibold">99.8%</span>
            </div>
            <div className="mt-2 rounded-2xl border border-white/8 bg-black/30 p-3.5">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">Active Core</div>
              <div className="text-[15px] font-semibold" style={{ color: orb.accent }}>{orb.personality}</div>
              <p className="mt-2 text-[12px] leading-5 text-white/45">The selected core persists into the editor as your live assistant and voice interface.</p>
            </div>
            <div className="pt-2">
              <OrbCore orb={orb} size={72} active={heroState !== "idle_closed"} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

// ─── VIEWPORT MOCK ───────────────────────────────────────────────────────────
function ViewportMock() {
  return (
    <div className="relative h-full min-h-[480px] overflow-hidden rounded-[22px] border border-cyan-500/15 bg-[#020609]">
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(0,255,255,.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,255,255,.09)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(0,140,255,.09),transparent)]" />
      <div className="absolute left-5 top-4 flex gap-3 text-[11px] uppercase tracking-[0.38em] text-cyan-300/60">
        <span>Object Mode</span><span className="text-white/25">·</span><span>Perspective</span><span className="text-white/25">·</span><span>Rendered</span>
      </div>
      <div className="absolute inset-x-8 bottom-8 top-16 rounded-[20px] border border-white/5 bg-black/20">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-24 w-24 rounded-[18px] bg-gradient-to-br from-violet-300/80 to-indigo-700/90 shadow-[0_0_60px_rgba(120,120,255,.30)]" />
        </div>
        {/* Axis gizmo */}
        <div className="absolute bottom-4 right-4 h-12 w-12 opacity-40">
          <div className="absolute left-1/2 top-1/2 h-5 w-[1.5px] -translate-x-1/2 -rotate-45 bg-red-400 origin-bottom" />
          <div className="absolute left-1/2 top-1/2 h-5 w-[1.5px] -translate-x-1/2 rotate-45 bg-green-400 origin-bottom" />
          <div className="absolute left-1/2 top-1/2 h-5 w-[1.5px] -translate-x-1/2 bg-blue-400 origin-bottom" />
        </div>
      </div>
      {/* Bottom status */}
      <div className="absolute bottom-2 left-5 text-[10px] font-mono text-white/30">Verts: 8 · Faces: 6 · Tris: 12 · Mem: 48.2 MB</div>
    </div>
  );
}

// ─── GESTURE PANEL ───────────────────────────────────────────────────────────
function GesturePanel({ gestureEnabled, setGestureEnabled }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-[#070c12] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/35">Gesture Input</div>
          <div className="mt-1 text-[15px] font-semibold">Front Camera</div>
        </div>
        <button onClick={() => setGestureEnabled(v => !v)}
          className="rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition"
          style={{ background: gestureEnabled ? "#22d3ee" : "rgba(255,255,255,.08)", color: gestureEnabled ? "#000" : "#fff" }}>
          {gestureEnabled ? "Cam ON" : "Cam OFF"}
        </button>
      </div>
      <div className="mb-3 aspect-video rounded-xl border border-cyan-400/15 bg-[#030812] grid place-items-center">
        <div className="text-center text-white/50">
          <Camera className="mx-auto mb-1.5 h-7 w-7 text-cyan-300/70" />
          <div className="text-[12px]">Live Hand Tracking Feed</div>
        </div>
      </div>
      <div className="space-y-2 text-[12px] text-white/60">
        <div className="flex justify-between"><span>Gesture</span><span className="text-cyan-300 font-medium">Pinch Select</span></div>
        <div className="flex justify-between"><span>Confidence</span><span>92%</span></div>
        <div className="flex justify-between"><span>Map</span><span className="text-right">Pinch · Scale · Rotate · Place</span></div>
      </div>
    </div>
  );
}

// ─── ASSISTANT DOCK ──────────────────────────────────────────────────────────
function AssistantDock({ orb }) {
  const [listening, setListening] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [text, setText] = useState("Create a realistic ceramic vase, then make it blue glazed.");
  return (
    <div className="rounded-[22px] border border-white/8 bg-[#070c12] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrbCore orb={orb} size={48} listening={listening} />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/35">Active Assistant</div>
            <div className="text-[15px] font-semibold" style={{ color: orb.accent }}>{orb.name}</div>
            <div className="text-[12px] text-white/45">{orb.personality}</div>
          </div>
        </div>
        <button onClick={() => setMicEnabled(v => !v)} className="rounded-xl border border-white/10 bg-white/5 p-2.5">
          {micEnabled ? <Mic className="h-4 w-4 text-cyan-300" /> : <MicOff className="h-4 w-4 text-white/35" />}
        </button>
      </div>
      <button onClick={() => setListening(v => !v)}
        className="mb-2.5 w-full rounded-xl px-3.5 py-2.5 text-left text-[12px] transition"
        style={{ background: listening ? orb.accent + "18" : "rgba(34,211,238,.08)", color: listening ? orb.accent : "#a5f3fc", border: `1px solid ${listening ? orb.accent + "40" : "transparent"}` }}>
        {listening ? "● Listening…" : "Speak in any language — voice-native creation is active."}
      </button>
      <textarea value={text} onChange={e => setText(e.target.value)}
        className="h-24 w-full rounded-xl border border-white/8 bg-black/35 p-3 text-[12px] text-white outline-none resize-none placeholder:text-white/30" />
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <button className="rounded-xl bg-white/10 px-3 py-2.5 text-[12px] font-semibold hover:bg-white/15 transition">Run Command</button>
        <button className="rounded-xl bg-white/5 px-3 py-2.5 text-[12px] font-semibold text-white/60 hover:bg-white/8 transition">Refine Prompt</button>
      </div>
    </div>
  );
}

// ─── WORKSPACE ────────────────────────────────────────────────────────────────
function Workspace({ selectedOrb, onBack }) {
  const orb = useMemo(() => ORBS.find(o => o.id === selectedOrb) ?? ORBS[0], [selectedOrb]);
  const [workspaceTab, setWorkspaceTab] = useState("Layout");
  const [gestureEnabled, setGestureEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#020509] text-white">
      {/* TOP BAR */}
      <div className="border-b border-white/6 bg-black/75 px-4 py-3 backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            <span>AetherForge Studio</span>
            <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: orb.glow, color: orb.accent, background: orb.accent + "10" }}>{orb.name} Active</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={onBack} className="rounded-xl border border-white/8 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 transition">← Hero</button>
            <button className="rounded-xl px-4 py-1.5 text-sm font-bold text-black transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${orb.accent}, #6366f1)` }}>Export</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {WORKSPACES.map(tab => (
            <button key={tab} onClick={() => setWorkspaceTab(tab)}
              className="rounded-xl px-3 py-1.5 text-[12px] font-medium transition"
              style={{ background: workspaceTab === tab ? orb.accent + "18" : "rgba(255,255,255,.04)", color: workspaceTab === tab ? orb.accent : "rgba(255,255,255,.6)", borderBottom: workspaceTab === tab ? `2px solid ${orb.accent}` : "2px solid transparent" }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 p-3">
        {/* LEFT — Tools + Gesture */}
        <aside className="col-span-2 space-y-3">
          <div className="rounded-[22px] border border-white/8 bg-[#070c12] p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.38em] text-white/35"><PanelLeft className="h-3.5 w-3.5" />Tools</div>
            <div className="grid grid-cols-2 gap-1.5">
              {TOOLS.map(tool => (
                <button key={tool} className="rounded-xl border border-white/5 bg-black/25 px-2 py-2.5 text-[11px] font-semibold text-white/70 hover:bg-white/5 hover:text-white transition">{tool}</button>
              ))}
            </div>
          </div>
          <GesturePanel gestureEnabled={gestureEnabled} setGestureEnabled={setGestureEnabled} />
        </aside>

        {/* CENTER — Viewport + Timeline */}
        <main className="col-span-7 space-y-3">
          <ViewportMock />
          <div className="rounded-[22px] border border-white/8 bg-[#070c12] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/35">Timeline / Dope Sheet</div>
                <div className="text-[15px] font-semibold">Animation Workspace</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[11px] font-mono text-white/35">Frame: 001</div>
                <button onClick={() => setPlaying(v => !v)} className="rounded-xl bg-white/10 p-2.5 hover:bg-white/15 transition">
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="relative h-20 rounded-xl border border-white/8 bg-black/30 overflow-hidden">
              <div className="absolute inset-x-5 top-1/2 h-[1.5px] -translate-y-1/2 bg-white/8" />
              {[...Array(14)].map((_, i) => (
                <div key={i} className="absolute top-0 h-full w-px bg-white/5" style={{ left: `${5 + i * 6.7}%` }} />
              ))}
              {[...Array(14)].map((_, i) => (
                <div key={i} className="absolute top-1 h-3 text-[9px] font-mono text-white/20" style={{ left: `${5 + i * 6.7}%` }}>{(i + 1) * 10}</div>
              ))}
              {[16, 30, 47, 63, 78].map((x, i) => (
                <div key={i} className="absolute top-7 h-7 w-3 rounded" style={{ left: `${x}%`, background: orb.glow }} />
              ))}
            </div>
          </div>
        </main>

        {/* RIGHT — Assistant + Inspector */}
        <aside className="col-span-3 space-y-3">
          <AssistantDock orb={orb} />
          <div className="rounded-[22px] border border-white/8 bg-[#070c12] p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.38em] text-white/35"><PanelRight className="h-3.5 w-3.5" />Inspector</div>
            <div className="space-y-2.5 text-[12px] text-white/65">
              {[["Selection","Cube"],["Mode","Object"],["Material","Ceramic Blue Glaze"],["Camera Input", gestureEnabled ? "Enabled":"Disabled"],["Active Orb", orb.name]].map(([k,v]) => (
                <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40">{k}</span>
                  <span className="font-medium" style={k === "Active Orb" ? { color: orb.accent } : {}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── ROOT COMPONENT (wired to SessionContext) ────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  const { setSelectedOrbId, setIsOrbSelected, setOrbSettings } = useSession();
  const [selectedOrb, setSelectedOrb] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aetherforge:selectedOrb")) || "nova"; } catch { return "nova"; }
  });
  const [heroState, setHeroState]     = useState("idle_closed");
  const [screen, setScreen]           = useState("landing");

  const handleSelectOrb = (id) => {
    setSelectedOrb(id);
    try { localStorage.setItem("aetherforge:selectedOrb", JSON.stringify(id)); } catch {}
  };

  const handleEnterWorkspace = () => {
    const orb = ORBS.find(o => o.id === selectedOrb) ?? ORBS[0];
    setSelectedOrbId(orb.id);
    setOrbSettings(prev => ({ ...prev, color: orb.accent }));
    setIsOrbSelected(true);
    setScreen("workspace");
  };

  if (screen === "workspace") return <Workspace selectedOrb={selectedOrb} onBack={() => setScreen("landing")} />;

  return (
    <Landing
      selectedOrb={selectedOrb}
      setSelectedOrb={handleSelectOrb}
      heroState={heroState}
      setHeroState={setHeroState}
      onEnterWorkspace={handleEnterWorkspace}
    />
  );
};

export default Hero;
