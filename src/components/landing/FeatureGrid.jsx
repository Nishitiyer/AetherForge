import React from 'react';
import { Layers, Zap, PenTool, Layout, Box, Workflow } from 'lucide-react';
import './FeatureGrid.css';

const features = [
  {
    icon: <Zap size={24} />,
    title: 'Generative Sculpting',
    description: 'Describe complex organic shapes. AetherForge generates base meshes with optimized topology, ready for high-detail sculpting.'
  },
  {
    icon: <Layout size={24} />,
    title: 'World Building',
    description: 'Describe complex scenes—from cyberpunk streets to fantasy castles. AetherForge handles lighting, scattering, and atmospherics.'
  },
  {
    icon: <Workflow size={24} />,
    title: 'Node-Based Logic',
    description: 'A professional node-based workflow for materials, geometry, and AI prompting. Full control over every generative step.'
  },
  {
    icon: <PenTool size={24} />,
    title: 'Precision Modeling',
    description: 'Full suite of manual tools: Retopology, UV unwrapping, vertex manipulation, and edge-loop control.'
  },
  {
    icon: <Layers size={24} />,
    title: 'AI PBR Materials',
    description: 'Generate physically-based materials from text. Includes Diffuse, Normal, Roughness, and Metallic maps up to 4K.'
  },
  {
    icon: <Box size={24} />,
    title: 'Universal Pipeline',
    description: 'Seamlessly export to FBX, GLTF, USDS, or Alembic. Perfectly optimized for Unreal Engine 5, Unity, and Blender.'
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
