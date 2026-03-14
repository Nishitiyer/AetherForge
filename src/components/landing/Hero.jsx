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
          Create <span className="text-gradient">Worlds</span><br />
          with Words.
        </h1>
        
        <p className="hero-subtitle">
          The professional AI-native alternative for 3D creation. Generate models, characters, environments, and animations from natural language, with full manual control to refine every detail.
        </p>
        
        <div className="hero-actions">
          <Link to="/auth?mode=signup" className="btn-primary hero-btn glow-shadow">
            Start Creating Free
          </Link>
          <div className="portal-quick-links">
            <Link to="/creator" className="portal-link">Creator Hub</Link>
            <Link to="/admin" className="portal-link">Admin Suite</Link>
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
