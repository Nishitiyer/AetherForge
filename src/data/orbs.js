/**
 * AetherForge Neural Core Registry (v4.0)
 * Defines the personalities, aesthetics, and behavioral logic for the Stark-grade orb system.
 */

export const ORB_DATA = {
  nova: {
    id: "nova",
    name: "Nova Core",
    role: "Cinematic Director",
    primaryColor: "#fbbf24", // Gold
    secondaryColor: "#f59e0b", // Amber
    accentColor: "#fff7ed", // Warm White
    description: "Showcase renders, presentation mode, and hero lighting composition.",
    behavior: {
      pulseSpeed: 1.2,
      ringSpeed: 0.05,
      bloomIntensity: 1.5,
      coreDistortion: 0.4
    }
  },
  sentinel: {
    id: "sentinel",
    name: "Sentinel Core",
    role: "Technical Architect",
    primaryColor: "#06b6d4", // Cyan
    secondaryColor: "#0e7490", // Cool Blue
    accentColor: "#ecfeff", // Cool White
    description: "System analysis, structural integrity, and structural optimization workflows.",
    behavior: {
      pulseSpeed: 0.8,
      ringSpeed: 0.08,
      bloomIntensity: 1.0,
      coreDistortion: 0.2
    }
  },
  echo: {
    id: "echo",
    name: "Echo Core",
    role: "Voice Companion",
    primaryColor: "#a855f7", // Violet
    secondaryColor: "#d946ef", // Magenta
    accentColor: "#fdf4ff", // Soft Blue-Violet
    description: "Voice-native prompting, multilingual communication, and sentient assistance.",
    behavior: {
      pulseSpeed: 2.5, // Reactive
      ringSpeed: 0.12,
      bloomIntensity: 1.2,
      coreDistortion: 0.8 // Fluid waveform
    }
  },
  forge: {
    id: "forge",
    name: "Forge Core",
    role: "Build Engineer",
    primaryColor: "#f97316", // Orange
    secondaryColor: "#dc2626", // Red-Orange
    accentColor: "#fef3c7", // Warm Gold
    description: "Asset creation, object generation, and industrial-grade modeling protocols.",
    behavior: {
      pulseSpeed: 1.8,
      ringSpeed: 0.15,
      bloomIntensity: 2.0, // High power
      coreDistortion: 0.6 // Denser energy
    }
  },
  prism: {
    id: "prism",
    name: "Prism Core",
    role: "Style Explorer",
    primaryColor: "#2dd4bf", // Teal
    secondaryColor: "#6366f1", // Indigo
    accentColor: "#f0f9ff", // Iridescent White
    description: "Visual concept generation, style explorer, and iridescent creative variations.",
    behavior: {
      pulseSpeed: 1.0,
      ringSpeed: 0.02, // Slow elegant
      bloomIntensity: 1.8,
      coreDistortion: 0.9 // Highly refractive
    }
  },
  quantum: {
    id: "quantum",
    name: "Quantum Core",
    role: "Experimental Intelligence",
    primaryColor: "#ffffff", // Pure White
    secondaryColor: "#06b6d4", // Pale Cyan
    accentColor: "#e2e8f0", // Silver
    description: "Advanced simulation, experimental systems, and quantum-state intelligence.",
    behavior: {
      pulseSpeed: 0.5, // Mysterious
      ringSpeed: 0.25, // Deep turbulence
      bloomIntensity: 1.4,
      coreDistortion: 1.2 // Unstable but controlled
    }
  }
};

export const ORB_MODES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  ALERT: 'alert'
};

export const getOrbById = (id) => ORB_DATA[id] || ORB_DATA.sentinel;
