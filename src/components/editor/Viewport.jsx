import React, { useState } from 'react';
import { Camera, Maximize, Crosshair, HelpCircle, Layers, Monitor, Rotate3D } from 'lucide-react';
import './Viewport.css';

const Viewport = ({ activeMode }) => {
  const [viewType, setViewType] = useState('Perspective');
  const [shading, setShading] = useState('Rendered');
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="viewport-container">
      {/* Viewport Toolbar */}
      <div className="viewport-toolbar">
        <div className="viewport-menus">
          <button className="viewport-menu-btn">View</button>
          <button className="viewport-menu-btn">Select</button>
          <button className="viewport-menu-btn">Add</button>
          <button className="viewport-menu-btn">Object</button>
        </div>
        
        <div className="viewport-controls">
          <div className="dropdown-control">
            <span>{viewType}</span>
            <Camera size={14} className="control-icon" />
          </div>
          <div className="dropdown-control">
            <span className="shading-indicator rendered"></span>
            <span>{shading}</span>
            <Layers size={14} className="control-icon" />
          </div>
        </div>
      </div>

      {/* Main Interactive Area Placeholder */}
      <div className="viewport-canvas">
        {/* Decorative Grid */}
        <div className="viewport-grid"></div>
        
        {/* Placeholder 3D Subject */}
        <div className="viewport-subject">
          {activeMode === 'Model' && <div className="subject-placeholder cube mode-model"></div>}
          {activeMode === 'Character' && <div className="subject-placeholder human mode-char"></div>}
          {activeMode === 'Environment' && <div className="subject-placeholder scene mode-env"></div>}
          {activeMode === 'Material' && <div className="subject-placeholder sphere mode-mat"></div>}
          {activeMode === 'Animation' && <div className="subject-placeholder rig mode-anim"></div>}
          
          <div className="subject-label">
            {isGenerating ? 'Generating Asset...' : `Selected: Default ${activeMode}`}
          </div>
        </div>

        {isGenerating && (
          <div className="generation-overlay">
            <div className="spinner"></div>
            <div className="generation-progress">
              <div className="progress-bar-inner" style={{width: '65%'}}></div>
            </div>
            <span>Refining topology (65%)</span>
          </div>
        )}

        {/* Viewport UI Overlays */}
        <div className="viewport-gizmo">
          <div className="axis axis-x">X</div>
          <div className="axis axis-y">Y</div>
          <div className="axis axis-z">Z</div>
        </div>

        <div className="viewport-info-overlay">
          <div>Faces: 24,512</div>
          <div>Tris: 48,150</div>
          <div>Objects: 1/14</div>
          <div>Mem: 142MB</div>
        </div>
      </div>

      {/* Viewport Navigation Overlay */}
      <div className="viewport-nav-controls">
        <button title="Toggle Camera"><Monitor size={16} /></button>
        <button title="Pan"><Crosshair size={16} /></button>
        <button title="Orbit"><Rotate3D size={16} /></button>
        <button title="Zoom"><Maximize size={16} /></button>
      </div>
    </div>
  );
};

export default Viewport;
