import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Play, Box as BoxIcon } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Environment, ContactShadows } from '@react-three/drei';
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
        
        {/* Interactive 3D Showcase */}
        <div className="hero-showcase">
          <Canvas camera={{ position: [4, 4, 4], fov: 40 }}>
            <Suspense fallback={null}>
              <OrbitControls autoRotate enableZoom={false} autoRotateSpeed={0.5} />
              <Stage intensity={0.5} environment="city" adjustCamera>
                <mesh>
                  <boxGeometry args={[1.5, 1.5, 1.5]} />
                  <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={1} />
                </mesh>
              </Stage>
              <Grid infiniteGrid fadeDistance={20} cellColor="#4f46e5" sectionColor="#1e293b" />
              <Environment preset="night" />
              <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} />
            </Suspense>
          </Canvas>
          <div className="showcase-label">
            <BoxIcon size={14} /> LIVE 3D ENGINE
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
