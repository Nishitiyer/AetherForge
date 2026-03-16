import React, { useState } from 'react';
import { Box as BoxIcon, Hammer, Palette, Plus, Trash2, Layers } from 'lucide-react';
import { MODEL_TEMPLATES, createModel } from '../../utils/ModelFactory.jsx';
import './ConstructionPanel.css';

const ConstructionPanel = ({ 
  onAddObject, 
  sceneObjects, 
  setSceneObjects,
  selectedObjectId,
  setSelectedObjectId,
  selectedPartIndex,
  setSelectedPartIndex,
  transformMode,
  setTransformMode
}) => {
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');
  const selectedObject = sceneObjects.find(o => o.id === selectedObjectId);
  const selectedPart = selectedObject?.parts?.[selectedPartIndex] || (selectedPartIndex === null ? selectedObject : null);

  const handleAddExact = (templateKey) => {
    const newModel = createModel(templateKey, selectedColor);
    if (newModel) {
      setSceneObjects([...sceneObjects, newModel]);
    }
  };

  const removeObject = (id) => {
    setSceneObjects(sceneObjects.filter(obj => obj.id !== id));
  };

  return (
    <div className="construction-panel hologram-panel">
      <div className="panel-header">
        <Hammer size={20} className="text-primary" />
        <h2>Exact Constructor</h2>
      </div>

      <div className="construction-section">
        <div className="section-label">Construction Tools</div>
        <div className="transform-toggles">
          <button className={`mode-btn ${transformMode === 'translate' ? 'active' : ''}`} onClick={() => setTransformMode('translate')}>Move</button>
          <button className={`mode-btn ${transformMode === 'rotate' ? 'active' : ''}`} onClick={() => setTransformMode('rotate')}>Rotate</button>
          <button className={`mode-btn ${transformMode === 'scale' ? 'active' : ''}`} onClick={() => setTransformMode('scale')}>Scale</button>
        </div>
        <div className="transform-toggles" style={{ marginTop: '0.5rem' }}>
          <button className={`mode-btn ${transformMode === 'pinch' ? 'active' : ''}`} onClick={() => setTransformMode('pinch')}>Pinch</button>
          <button className={`mode-btn ${transformMode === 'grab' ? 'active' : ''}`} onClick={() => setTransformMode('grab')}>Grab</button>
        </div>
      </div>

      <div className="construction-section">
        <div className="section-label">Primitive Color</div>
        <div className="color-picker-simple">
          {['#8b5cf6', '#4f46e5', '#ec4899', '#8b4513', '#94a3b8', '#ffffff'].map(c => (
            <button 
              key={c} 
              className={`color-chip ${selectedColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setSelectedColor(c)}
            />
          ))}
          <input 
            type="color" 
            value={selectedColor} 
            onChange={(e) => setSelectedColor(e.target.value)}
          />
        </div>
      </div>

      <div className="construction-section">
        <div className="section-label">Render Settings</div>
        <div className="toggle-row">
          <span>Enable Shadows</span>
          <input type="checkbox" defaultChecked />
        </div>
      </div>

      <div className="construction-section">
        <div className="section-label">Mesh Primitives</div>
        <div className="template-grid">
          {['PLANE', 'Box (Cube)', 'CIRCLE', 'SPHERE', 'ICOSPHERE', 'Cylinder', 'Cone', 'Torus', 'GRID', 'MONKEY'].map(key => {
            const templateKey = key.includes('(') ? key.split(' ')[0].toUpperCase() : key.toUpperCase();
            return (
              <button key={key} className="template-card" onClick={() => handleAddExact(templateKey)}>
                <BoxIcon size={20} className="template-icon" />
                <span style={{ fontSize: '0.65rem' }}>{key}</span>
                <Plus size={12} className="add-plus" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="construction-section">
        <div className="section-label">Curves & Text</div>
        <div className="template-grid">
          <button className="template-card" onClick={() => handleAddExact('TEXT')}>
            <Palette size={20} className="template-icon" />
            <span style={{ fontSize: '0.65rem' }}>3D TEXT</span>
            <Plus size={12} className="add-plus" />
          </button>
        </div>
      </div>

      <div className="construction-section scene-outliner">
        <div className="section-label">Scene Hierarchy</div>
        <div className="outliner-list">
          {sceneObjects.map((obj, i) => (
            <div key={obj.id} className="outliner-wrapper">
              <div 
                className={`outliner-item ${selectedObjectId === obj.id && selectedPartIndex === null ? 'active' : ''}`}
                onClick={() => { setSelectedObjectId(obj.id); setSelectedPartIndex(null); }}
              >
                <div className="item-info">
                  <Layers size={14} />
                  <span>{obj.name || obj.type}</span>
                </div>
                <button 
                  className="delete-item" 
                  onClick={(e) => { e.stopPropagation(); removeObject(obj.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              {/* Nested parts if grouped */}
              {obj.parts && (
                <div className="nested-parts">
                  {obj.parts.map((part, pIdx) => (
                    <div 
                      key={pIdx} 
                      className={`outliner-item nested ${selectedObjectId === obj.id && selectedPartIndex === pIdx ? 'active' : ''}`}
                      onClick={() => { setSelectedObjectId(obj.id); setSelectedPartIndex(pIdx); }}
                    >
                      <div className="item-info">
                        <BoxIcon size={12} />
                        <span>{part.type} Part</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedPart && (
        <div className="construction-section part-editor glass-panel">
          <div className="section-label">Edit Part: {selectedPart.type}</div>
          <div className="edit-controls">
            <div className="edit-row">
              <label>Color</label>
              <input 
                type="color" 
                value={selectedPart.color} 
                onChange={(e) => {
                  const newObjects = sceneObjects.map(o => {
                    if (o.id === selectedObjectId) {
                      const newParts = [...o.parts];
                      newParts[selectedPartIndex] = { ...newParts[selectedPartIndex], color: e.target.value };
                      return { ...o, parts: newParts };
                    }
                    return o;
                  });
                  setSceneObjects(newObjects);
                }} 
              />
            </div>
            <div className="edit-row">
              <label>Y Pos</label>
              <input 
                type="range" min="-2" max="5" step="0.1"
                value={selectedPart.position[1]} 
                onChange={(e) => {
                  const newObjects = sceneObjects.map(o => {
                    if (o.id === selectedObjectId) {
                      const newParts = [...o.parts];
                      const newPos = [...newParts[selectedPartIndex].position];
                      newPos[1] = parseFloat(e.target.value);
                      newParts[selectedPartIndex] = { ...newParts[selectedPartIndex], position: newPos };
                      return { ...o, parts: newParts };
                    }
                    return o;
                  });
                  setSceneObjects(newObjects);
                }} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="construction-footer">
        <p>Models are built programmatically from exact geometric primitives.</p>
      </div>
    </div>
  );
};

export default ConstructionPanel;
