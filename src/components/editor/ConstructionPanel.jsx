import React, { useState } from 'react';
import { Box as BoxIcon, Hammer, Palette, Plus, Trash2, Layers, GitMerge, Maximize } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('Add'); // Add, Modifiers, Object, Scene
  const [activeCategory, setActiveCategory] = useState('Mesh');
  const [showShadows, setShowShadows] = useState(true);
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');

  const CATEGORIES = {
    Mesh: ['PLANE', 'CUBE', 'CIRCLE', 'UVSPHERE', 'ICOSPHERE', 'CYLINDER', 'CONE', 'TORUS', 'GRID', 'MONKEY', 'TEXT'],
    Curve: ['BEZIER_CURVE', 'BEZIER_CIRCLE', 'PATH'],
    Light: ['LIGHT_POINT', 'LIGHT_SUN', 'LIGHT_SPOT', 'LIGHT_AREA'],
    Other: ['METABALL', 'NURBS_SPHERE', 'EMPTY_PLAIN', 'CAMERA']
  };
  
  const selectedObject = sceneObjects.find(o => o.id === selectedObjectId);
  const selectedPart = selectedObject?.parts?.[selectedPartIndex] || (selectedPartIndex === null ? selectedObject : null);

  const modifiers = [
    { id: 'Array', icon: <Layers size={14} /> },
    { id: 'Mirror', icon: <GitMerge size={14} /> },
    { id: 'Solidify', icon: <Maximize size={14} /> },
    { id: 'Subdivision', icon: <BoxIcon size={14} /> }
  ];

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
      <div className="property-tabs">
        <button 
          className={`prop-tab glitch-on-hover ${activeTab === 'Add' ? 'active' : ''}`}
          onClick={() => setActiveTab('Add')}
          title="Add Objects"
        ><Plus size={16} /></button>
        <button 
          className={`prop-tab ${activeTab === 'Modifiers' ? 'active' : ''}`}
          onClick={() => setActiveTab('Modifiers')}
          title="Modifiers"
        ><GitMerge size={16} /></button>
        <button 
          className={`prop-tab ${activeTab === 'Object' ? 'active' : ''}`}
          onClick={() => setActiveTab('Object')}
          title="Object Properties"
        ><BoxIcon size={16} /></button>
        <button 
          className={`prop-tab ${activeTab === 'Scene' ? 'active' : ''}`}
          onClick={() => setActiveTab('Scene')}
          title="Render Settings"
        ><Palette size={16} /></button>
      </div>

      <div className="property-content">
        {activeTab === 'Add' && (
          <div className="add-workflow">
            <div className="construction-section">
              <div className="section-label">Construction Tools</div>
              <div className="transform-toggles">
                <button className={`mode-btn ${transformMode === 'translate' ? 'active' : ''}`} onClick={() => setTransformMode('translate')}>Move</button>
                <button className={`mode-btn ${transformMode === 'rotate' ? 'active' : ''}`} onClick={() => setTransformMode('rotate')}>Rotate</button>
                <button className={`mode-btn ${transformMode === 'scale' ? 'active' : ''}`} onClick={() => setTransformMode('scale')}>Scale</button>
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
              </div>
            </div>

            <div className="construction-section">
              <div className="section-label">Categorized Primitives</div>
              <div className="category-tabs">
                {['Mesh', 'Curve', 'Light', 'Other'].map(cat => (
                  <button 
                    key={cat} 
                    className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="template-grid">
                {CATEGORIES[activeCategory].map(key => (
                  <button key={key} className="template-card glitch-on-hover" onClick={() => handleAddExact(key)}>
                    <BoxIcon size={18} className="template-icon" />
                    <span style={{ fontSize: '0.6rem' }}>{key.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Modifiers' && (
          <div className="modifier-workflow">
            <div className="construction-section">
              <div className="section-label">Modifier Stack</div>
              <button className="add-modifier-btn">
                Add Modifier <Plus size={14} />
              </button>
              <div className="modifier-grid">
                {modifiers.map(mod => (
                  <button key={mod.id} className="template-card modifier-card">
                    {mod.icon}
                    <span style={{ fontSize: '0.6rem' }}>{mod.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Object' && (
          <div className="object-workflow">
            <div className="construction-section scene-outliner">
              <div className="section-label">Scene Hierarchy</div>
              <div className="outliner-list">
                {sceneObjects.map((obj) => (
                  <div key={obj.id} className="outliner-wrapper">
                    <div 
                      className={`outliner-item ${selectedObjectId === obj.id ? 'active' : ''}`}
                      onClick={() => setSelectedObjectId(obj.id)}
                    >
                      <div className="item-info">
                        <Layers size={14} />
                        <span>{obj.name || obj.type}</span>
                      </div>
                      <button className="delete-item" onClick={(e) => { e.stopPropagation(); removeObject(obj.id); }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPart && (
              <div className="construction-section part-editor glass-panel">
                <div className="section-label">Properties: {selectedPart.name || selectedPart.type}</div>
                <div className="edit-controls">
                  <div className="edit-row">
                    <label>Y Position</label>
                    <input type="range" min="-5" max="5" step="0.1" value={selectedObject.position[1]} onChange={(e) => {
                      setSceneObjects(sceneObjects.map(o => o.id === selectedObjectId ? { ...o, position: [o.position[0], parseFloat(e.target.value), o.position[2]] } : o));
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Scene' && (
          <div className="scene-workflow">
            <div className="construction-section">
              <div className="section-label">Render Settings</div>
              <div className="toggle-row">
                <span>Dynamic Shadows</span>
                <input type="checkbox" checked={showShadows} onChange={(e) => setShowShadows(e.target.checked)} />
              </div>
              <div className="toggle-row">
                <span>Ambient Occlusion</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="toggle-row">
                <span>Bloom Effect</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="construction-footer glow-text-cyan">
        <p>AETHERFORGE_v2.0 // HOLOGRAPGIC_SYS_ACTIVE</p>
      </div>
    </div>
  );
};

export default ConstructionPanel;
