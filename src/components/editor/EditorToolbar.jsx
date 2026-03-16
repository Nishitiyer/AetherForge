import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Home, Save, Download, Undo, Redo, Settings, Play, Image as ImageIcon } from 'lucide-react';
import './EditorToolbar.css';

const EditorToolbar = ({ activeMode, setActiveMode, onExportOpen, onSettingsOpen, onAddObject }) => {
  const modes = ['Object Mode', 'Edit Mode', 'Sculpt Mode', 'Vertex Paint', 'Weight Paint', 'Texture Paint'];

  return (
    <header className="editor-toolbar">
      <div className="toolbar-left">
        <Link to="/dashboard" className="toolbar-brand">
          <Box className="brand-icon text-gradient" size={20} />
        </Link>
        <div className="workspace-indicator">
          <span>{activeMode.split(' ')[0]} Context</span>
        </div>
        <div className="toolbar-divider"></div>
        <div className="toolbar-menu">
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
            <span>View</span>
          </div>
          <div className="menu-item">
            <span>Tools</span>
            <div className="menu-dropdown">
              <button onClick={() => onAddObject('Model')} className="menu-btn-action">Add Model</button>
              <button onClick={() => onAddObject('Character')} className="menu-btn-action">Add Character</button>
              <button onClick={() => onAddObject('Material')} className="menu-btn-action">Add Primitive</button>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar-center">
        <div className="mode-switcher-professional">
          <select 
            value={activeMode} 
            onChange={(e) => setActiveMode(e.target.value)}
            className="professional-mode-select"
          >
            {modes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="toolbar-right">
        <div className="toolbar-actions">
          <button className="action-btn" title="Undo"><Undo size={16} /></button>
          <button className="action-btn" title="Redo"><Redo size={16} /></button>
          <div className="toolbar-divider"></div>
          <button className="action-btn" title="Render Preview"><ImageIcon size={16} /></button>
          <button className="action-btn" title="Play Animation"><Play size={16} /></button>
        </div>
        
        <button className="btn-primary btn-sm export-btn" onClick={onExportOpen}>
          Export <Download size={14} style={{marginLeft: 4}}/>
        </button>
      </div>
    </header>
  );
};

export default EditorToolbar;
