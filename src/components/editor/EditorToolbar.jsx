import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Home, Save, Download, Undo, Redo, Settings, Play, Image, Webcam } from 'lucide-react';
import './EditorToolbar.css';

const EditorToolbar = ({ activeMode, setActiveMode, onExportOpen, onSettingsOpen, onAddObject, onIsltoggle }) => {
  const [islActive, setIslActive] = useState(false);
  const [showPermission, setShowPermission] = useState(false);
  const modes = ['Object Mode', 'Edit Mode', 'Sculpt Mode', 'Vertex Paint', 'Weight Paint', 'Texture Paint'];

  return (
    <header className="editor-toolbar">
      <div className="toolbar-left">
        <Link to="/dashboard" className="toolbar-brand">
          <LayoutGrid className="brand-icon text-gradient" size={20} />
        </Link>
        <div className="workspace-indicator">
          <span>{activeMode.split(' ')[0]} Context</span>
        </div>
        
        <nav className="toolbar-menu">
          <div className="menu-item">
            <span>File</span>
            <div className="menu-dropdown">
              <Link to="/dashboard"><Home size={14}/> Dashboard</Link>
              <a href="#"><Save size={14}/> Save Project</a>
              <button onClick={onExportOpen} className="menu-btn-action"><Download size={14}/> Export As...</button>
              <button onClick={onSettingsOpen} className="menu-btn-action"><Settings size={14}/> Project Settings</button>
            </div>
          </div>
          <div className="menu-item">
            <span>Edit</span>
          </div>
          <div className="menu-item">
            <span>Render</span>
          </div>
        </nav>
      </div>

      <div className="toolbar-center">
        <select 
          className="professional-mode-select"
          value={activeMode}
          onChange={(e) => setActiveMode(e.target.value)}
        >
          {modes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="toolbar-right">
        <div className="toolbar-actions">
          <button 
            className={`action-btn ${islActive ? 'active-gradient' : ''}`} 
            onClick={() => {
              if (!islActive) {
                setShowPermission(true);
              } else {
                setIslActive(false);
                onIsltoggle?.(false);
              }
            }}
            title="Enable ISL/ASL Voice & Gesture Control"
          >
            <Webcam size={16} />
            <span style={{fontSize: '0.7rem', marginLeft: '4px'}}>SL</span>
          </button>
          <div className="toolbar-divider"></div>
          <button className="action-btn" title="Undo"><Undo size={16} /></button>
          <button className="action-btn" title="Redo"><Redo size={16} /></button>
          <div className="toolbar-divider"></div>
          <button className="action-btn" title="Render Preview"><Image size={16} /></button>
          <button className="action-btn" title="Play Animation"><Play size={16} /></button>
        </div>
        
        <button className="btn-primary btn-sm export-btn" onClick={onExportOpen}>
          Export <Download size={14} style={{marginLeft: 4}}/>
        </button>
      </div>

      {showPermission && (
        <div className="isl-permission-portal">
          <div className="permission-modal hologram-box">
            <h3>Enable Sign Language Assist?</h3>
            <p>This will request camera access to recognize your gestures for 3D modeling commands.</p>
            <div className="permission-actions">
              <button className="btn-secondary" onClick={() => setShowPermission(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                setShowPermission(false);
                setIslActive(true);
                onIsltoggle?.(true);
              }}>Allow Access</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default EditorToolbar;
