import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles className="badge-icon" size={16} />
          <span>Next-Generation AI 3D Platform</span>
        </div>
        
        <h1 className="hero-title">
          The Free & Open <span className="text-gradient">AI 3D Suite</span><br />
          For Professionals.
        </h1>
        
        <p className="hero-subtitle">
          AetherForge is the professional AI-native alternative for 3D creation. Generate models, characters, environments, and animations with cutting-edge generative tools, then refine every vertex with industry-standard manual controls.
        </p>
        
        <div className="hero-actions">
          <Link to="/auth-selection" className="btn-primary hero-btn glow-shadow">
            Free Download
          </Link>
          <div className="portal-quick-links">
            <Link to="/auth-selection" className="portal-link">Login & Access</Link>
          </div>
        </div>
        
        <div className="hero-prompts-preview glass-panel">
          <div className="typing-prompt">
            <span className="prompt-cursor">"</span>
            Create a realistic cyberpunk soldier with scratched armor, glowing visor, and a heavy plasma rifle
            <span className="prompt-cursor blink">"</span>
          </div>
        </div>
        
        {/* Placeholder for the 3D showcase image/canvas */}
        <div className="hero-showcase glass-panel">
          <div className="showcase-overlay">
            <span>Interactive 3D Preview Engine</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
