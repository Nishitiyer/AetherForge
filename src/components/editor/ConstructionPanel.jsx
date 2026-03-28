import React from 'react';
import { 
  Box, 
  Circle, 
  Square, 
  Triangle, 
  Torus as TorusIcon, 
  Maximize, 
  Move, 
  RotateCw,
  Search,
  ChevronDown,
  Lock,
  Eye,
  Settings,
  Palette
} from 'lucide-react';
import './ConstructionPanel.css';

const ConstructionPanel = ({ 
  onAddObject, 
  sceneObjects, 
  selectedObjectId, 
  transformMode, 
  setTransformMode 
}) => {
  const selectedObject = sceneObjects.find(o => o.id === selectedObjectId);

  if (!selectedObject) {
    return (
      <div className="inspector-empty">
        <p>No Object Selected</p>
      </div>
    );
  }

  return (
    <div className="inspector-container">
      {/* 1. Object Info Header */}
      <div className="inspector-group">
        <div className="group-header">
          <Settings size={12} />
          <span>OBJECT PROPERTIES</span>
        </div>
        <div className="prop-row">
          <label>Name</label>
          <input type="text" value={selectedObject.name} readOnly />
        </div>
        <div className="prop-row">
          <label>Type</label>
          <span className="prop-value">MESH</span>
        </div>
      </div>

      {/* 2. Transform Controls */}
      <div className="inspector-group">
        <div className="group-header">
          <Move size={12} />
          <span>TRANSFORM</span>
        </div>
        <div className="transform-grid">
          <div className="axis-row">
            <span className="axis-label x">X</span>
            <input type="number" value={selectedObject.position[0].toFixed(2)} step="0.1" readOnly />
          </div>
          <div className="axis-row">
            <span className="axis-label y">Y</span>
            <input type="number" value={selectedObject.position[1].toFixed(2)} step="0.1" readOnly />
          </div>
          <div className="axis-row">
            <span className="axis-label z">Z</span>
            <input type="number" value={selectedObject.position[2].toFixed(2)} step="0.1" readOnly />
          </div>
        </div>
        <div className="transform-modes mt-2">
          <button 
            className={`mode-toggle ${transformMode === 'translate' ? 'active' : ''}`}
            onClick={() => setTransformMode('translate')}
          >
            <Move size={12} />
          </button>
          <button 
            className={`mode-toggle ${transformMode === 'rotate' ? 'active' : ''}`}
            onClick={() => setTransformMode('rotate')}
          >
            <RotateCw size={12} />
          </button>
          <button 
            className={`mode-toggle ${transformMode === 'scale' ? 'active' : ''}`}
            onClick={() => setTransformMode('scale')}
          >
            <Maximize size={12} />
          </button>
        </div>
      </div>

      {/* 3. Material Properties */}
      <div className="inspector-group">
        <div className="group-header">
          <Palette size={12} />
          <span>MATERIAL</span>
        </div>
        <div className="prop-row">
          <label>Base Color</label>
          <div className="color-preview" style={{ background: selectedObject.parts[0].color }}></div>
          <input type="text" value={selectedObject.parts[0].color} readOnly />
        </div>
        <div className="prop-grid">
          <div className="prop-row">
            <label>Metallic</label>
            <input type="range" min="0" max="1" step="0.01" value={selectedObject.parts[0].metalness || 0} readOnly />
          </div>
          <div className="prop-row">
            <label>Roughness</label>
            <input type="range" min="0" max="1" step="0.01" value={selectedObject.parts[0].roughness || 0.5} readOnly />
          </div>
          <div className="prop-row">
            <label>Emission</label>
            <input type="range" min="0" max="10" step="0.1" value={selectedObject.parts[0].emissiveIntensity || 0} readOnly />
          </div>
          <div className="prop-row">
            <label>Opacity</label>
            <input type="range" min="0" max="1" step="0.01" value={selectedObject.parts[0].opacity ?? 1} readOnly />
          </div>
          <div className="prop-row">
            <label>Transmission</label>
            <input type="range" min="0" max="1" step="0.01" value={selectedObject.parts[0].transmission ?? 0} readOnly />
          </div>
          <div className="prop-row">
            <label>Clearcoat</label>
            <input type="range" min="0" max="1" step="0.01" value={selectedObject.parts[0].clearcoat ?? 0} readOnly />
          </div>
        </div>
      </div>

      {/* 4. Add Geometry */}
      <div className="inspector-group border-t border-black mt-4 pt-4">
        <div className="group-header">
          <Plus size={12} />
          <span>ADD PRIMITIVE</span>
        </div>
        <div className="primitive-grid">
          <button onClick={() => onAddObject('Box')}><Box size={16} /><br/>Cube</button>
          <button onClick={() => onAddObject('Sphere')}><Circle size={16} /><br/>Sphere</button>
          <button onClick={() => onAddObject('Cylinder')}><Triangle size={16} style={{transform: 'rotate(180deg)'}} /><br/>Cylinder</button>
          <button onClick={() => onAddObject('Torus')}><TorusIcon size={16} /><br/>Torus</button>
        </div>
      </div>
    </div>
  );
};

const Plus = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default ConstructionPanel;
