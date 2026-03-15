import React, { useState } from 'react';
import { Camera, Maximize, Crosshair, Layers, Monitor, Rotate3d } from 'lucide-react';
import Viewport3D from './Viewport3D.jsx';
import './Viewport.css';

const Viewport = ({ 
  activeMode, 
  sceneObjects, 
  setSceneObjects,
  selectedObjectId,
  setSelectedObjectId,
  selectedPartIndex,
  setSelectedPartIndex,
  transformMode
}) => {
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
      {/* Main Interactive Area with Real 3D Engine */}
      <Viewport3D 
        activeMode={activeMode} 
        sceneObjects={sceneObjects} 
        setSceneObjects={setSceneObjects}
        selectedObjectId={selectedObjectId}
        setSelectedObjectId={setSelectedObjectId}
        selectedPartIndex={selectedPartIndex}
        setSelectedPartIndex={setSelectedPartIndex}
        transformMode={transformMode}
      />

      {/* Viewport Navigation Overlay */}
      <div className="viewport-nav-controls">
        <button title="Toggle Camera"><Monitor size={16} /></button>
        <button title="Pan"><Crosshair size={16} /></button>
        <button title="Orbit"><Rotate3d size={16} /></button>
        <button title="Zoom"><Maximize size={16} /></button>
      </div>
    </div>
  );
};

export default Viewport;
