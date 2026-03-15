import React from 'react';
import { MessageSquare, Box, Image, ArrowRight } from 'lucide-react';
import './Workflows.css';

const Workflows = () => {
  const steps = [
    {
      icon: <MessageSquare size={32} />,
      title: "1. Prompt",
      content: '"A high-detail sci-fi cargo container with weathering and industrial decals"',
      color: "#8b5cf6"
    },
    {
      icon: <Box size={32} />,
      title: "2. Generate",
      content: "AI builds optimized topology, UV maps, and PBR textures in seconds.",
      color: "#4f46e5"
    },
    {
      icon: <Image size={32} />,
      title: "3. Render",
      content: "Real-time viewport preview with physically based lighting and shadows.",
      color: "#ec4899"
    }
  ];

  return (
    <section id="workflows" className="workflows-section">
      <div className="workflows-container">
        <h2 className="section-title">The Generative Workflow</h2>
        <div className="workflow-steps">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="workflow-card glass-panel" style={{"--accent-color": step.color}}>
                <div className="step-num">{i + 1}</div>
                <div className="workflow-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.content}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="workflow-connector">
                  <ArrowRight size={24} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflows;
