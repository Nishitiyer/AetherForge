import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Download, Settings, Play, Image, Webcam } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import './EditorToolbar.css';

const WORKSPACES = [
  'Layout', 'Modeling', 'Sculpting', 'UV', 'Paint', 
  'Shading', 'Animation', 'Rendering', 'Compositing', 'Nodes',
  'Simulation', 'AI', 'Gesture', 'Voice'
];

const EditorToolbar = ({ activeWorkspace, setActiveWorkspace, onExportOpen, onSettingsOpen, onIsltoggle }) => {
  const [islActive, setIslActive] = useState(false);
  const { orbSettings } = useSession(); 

  return (
    <header className="blender-top-bar">
      {/* 1. File Menu Area */}
      <div className="blender-menu-group">
        <Link to="/dashboard" className="blender-brand">
          <LayoutGrid size={14} />
        </Link>
        <div className="blender-dropdown">File</div>
        <div className="blender-dropdown">Edit</div>
        <div className="blender-dropdown">Render</div>
        <div className="blender-dropdown">Window</div>
        <div className="blender-dropdown">Help</div>
      </div>

      {/* 2. Workspace Tabs */}
      <div className="blender-workspace-tabs">
         {WORKSPACES.map(ws => (
            <button 
               key={ws}
               className={`workspace-tab ${activeWorkspace === ws ? 'active' : ''}`}
               onClick={() => setActiveWorkspace(ws)}
               style={activeWorkspace === ws ? { borderBottomColor: orbSettings?.color || '#00e5ff' } : {}}
            >
               {ws}
            </button>
         ))}
      </div>

      {/* 3. Right Status / Actions */}
      <div className="blender-right-actions">
         <button className={`action-btn ${islActive ? 'active' : ''}`} onClick={() => {
              const nextState = !islActive;
              setIslActive(nextState);
              if (onIsltoggle) onIsltoggle(nextState);
         }} title="Enable Front-Camera Gesture Tracking">
             <Webcam size={14} /> 
         </button>
         <div className="divider"></div>
         <button className="action-btn" title="Render Image"><Image size={14} /></button>
         <button className="action-btn" title="Export Layout" onClick={onExportOpen}><Download size={14} /></button>
      </div>
    </header>
  );
};

export default EditorToolbar;
