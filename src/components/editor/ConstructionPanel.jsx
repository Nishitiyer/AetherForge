import React, { useState } from 'react';
import { Box as BoxIcon, Hammer, Palette, Plus, Trash2, Layers } from 'lucide-react';
import { MODEL_TEMPLATES, createModel } from '../../utils/ModelFactory';
import './ConstructionPanel.css';

const ConstructionPanel = ({ onAddObject, sceneObjects, setSceneObjects }) => {
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');

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
    <div className="construction-panel">
      <div className="panel-header">
        <Hammer size={20} className="text-primary" />
        <h2>Exact Constructor</h2>
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
        <div className="section-label">Exact Templates</div>
        <div className="template-grid">
          {Object.keys(MODEL_TEMPLATES).map(key => (
            <button key={key} className="template-card" onClick={() => handleAddExact(key)}>
              <BoxIcon size={24} />
              <span>{key}</span>
              <Plus size={14} className="add-plus" />
            </button>
          ))}
        </div>
      </div>

      <div className="construction-section scene-outliner">
        <div className="section-label">Scene Hierarchy</div>
        <div className="outliner-list">
          {sceneObjects.map((obj, i) => (
            <div key={obj.id} className="outliner-item">
              <div className="item-info">
                <Layers size={14} />
                <span>{obj.name || obj.type} #{i+1}</span>
              </div>
              <button 
                className="delete-item" 
                onClick={() => removeObject(obj.id)}
                title="Remove Object"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {sceneObjects.length === 0 && (
            <div className="empty-outliner">No objects in scene</div>
          )}
        </div>
      </div>

      <div className="construction-footer">
        <p>Models are built programmatically from exact geometric primitives.</p>
      </div>
    </div>
  );
};

export default ConstructionPanel;
