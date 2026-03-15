import React from 'react';
import { Settings, Globe, Shield, Zap, Database } from 'lucide-react';
import './ProjectSettings.css';

const ProjectSettings = () => {
  return (
    <div className="project-settings-content">
      <div className="settings-nav">
        <button className="settings-nav-item active"><Settings size={16}/> General</button>
        <button className="settings-nav-item"><Globe size={16}/> Rendering</button>
        <button className="settings-nav-item"><Database size={16}/> Assets</button>
        <button className="settings-nav-item"><Shield size={16}/> Permissions</button>
      </div>

      <div className="settings-pane">
        <div className="settings-group">
          <label>Project Name</label>
          <input type="text" defaultValue="Cyberpunk Soldier Model" className="settings-input" />
        </div>

        <div className="settings-group">
          <label>Default AI Engine</label>
          <select className="settings-input">
            <option>Omni-3D-v2 (Balanced)</option>
            <option>Omni-HighDetail-v1</option>
            <option>Omni-FastDraft-v3</option>
          </select>
          <p className="settings-help">The default model used for prompt-to-3D generations.</p>
        </div>

        <div className="settings-divider"></div>

        <div className="settings-group">
          <label className="toggle-label">
            <span>Auto-Save to Cloud</span>
            <input type="checkbox" defaultChecked />
          </label>
        </div>

        <div className="settings-group">
          <label className="toggle-label">
            <span>Public Visibility</span>
            <input type="checkbox" />
          </label>
          <p className="settings-help">Allow other creators to view and fork this project.</p>
        </div>

        <div className="settings-group">
          <label>Project Units</label>
          <div className="toggle-group">
            <button className="toggle-btn-sm active">Meters</button>
            <button className="toggle-btn-sm">Centimeters</button>
            <button className="toggle-btn-sm">Inches</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
