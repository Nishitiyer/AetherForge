import React from 'react';
import { Settings, Eye, Camera, Sun, Moon, Cloud, Zap } from 'lucide-react';

const RenderSettings = ({ settings, onChange }) => {
  return (
    <div className="inspector-container">
      <div className="inspector-group">
        <div className="group-header">
          <Camera size={12} />
          <span>VIEWPORT DISPLAY</span>
        </div>
        <div className="prop-row">
          <label>Engine</label>
          <span className="prop-value">AETHER_REALTIME</span>
        </div>
        <div className="prop-row">
          <label>Passes</label>
          <span className="prop-value">COMBINED</span>
        </div>
      </div>

      <div className="inspector-group">
        <div className="group-header">
          <Sun size={12} />
          <span>ENVIRONMENT</span>
        </div>
        <div className="env-grid">
          <button className="env-btn active">City (HDRI)</button>
          <button className="env-btn">Studio</button>
          <button className="env-btn">Forest</button>
          <button className="env-btn">Night</button>
        </div>
      </div>

      <div className="inspector-group">
        <div className="group-header">
          <Zap size={12} />
          <span>POST PROCESSING</span>
        </div>
        <div className="prop-row">
          <label>Bloom</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="prop-row">
          <label>Ambient Occlusion</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="prop-row">
          <label>Screen Space Refl</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="prop-row">
          <label>Motion Blur</label>
          <input type="checkbox" />
        </div>
      </div>
      
      <style>{`
        .env-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          margin-top: 8px;
        }
        .env-btn {
          background: #2a2a2a;
          border: 1px solid #444;
          padding: 8px;
          border-radius: 4px;
          font-size: 10px;
          color: #888;
        }
        .env-btn.active {
          border-color: #00d4ff;
          color: #00d4ff;
          background: rgba(0, 212, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default RenderSettings;
