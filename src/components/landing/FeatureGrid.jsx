import React from 'react';
import { Layers, Zap, PenTool, Layout, Box, Workflow } from 'lucide-react';
import './FeatureGrid.css';

const features = [
  {
    icon: <Zap size={24} />,
    title: 'Text to Fully Rigged Characters',
    description: 'Generate high-fidelity, production-ready characters complete with automated rigging, materials, and facial blendshapes instantly.'
  },
  {
    icon: <Layout size={24} />,
    title: 'Cinematic Environment Generation',
    description: 'Describe complex scenes—from cyberpunk streets to fantasy castles. AetherForge handles lighting, scattering, and atmopsherics.'
  },
  {
    icon: <Workflow size={24} />,
    title: 'Node-Based AI Prompting',
    description: 'Stack prompts visually to weave concept art, reference images, and text together for precise generative control.'
  },
  {
    icon: <PenTool size={24} />,
    title: 'Professional Manual Tools',
    description: 'Retopologize, UV unwrap, sculpt, and adjust nodes natively. AI brings the base, you deliver the masterpiece.'
  },
  {
    icon: <Layers size={24} />,
    title: 'Smart Material Generation',
    description: 'Describe any material. Automatically generate diffuse, normal, roughness, metallic, and displacement maps.'
  },
  {
    icon: <Box size={24} />,
    title: 'Export Anywhere',
    description: 'Seamlessly export to FBX, GLTF, USD, or native files perfectly optimized for Unreal Engine, Unity, or standard pipelines.'
  }
];

const FeatureGrid = () => {
  return (
    <section id="features" className="feature-section">
      <div className="feature-container">
        <div className="feature-header">
          <h2 className="section-title">A Studio in Your Browser</h2>
          <p className="section-subtitle">
            Every tool you need to concept, build, animate, and export.
          </p>
        </div>
        
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
