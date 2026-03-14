import React, { useState } from 'react';
import { Download, FileJson, Activity, Image as ImageIcon, Layers, Sparkles } from 'lucide-react';
import './ExportModal.css';

const ExportModal = ({ onClose }) => {
  const [format, setFormat] = useState('FBX');
  const [quality, setQuality] = useState('optimized');

  const formats = [
    { id: 'FBX', label: 'FBX (.fbx)', desc: 'Standard for Unity/Unreal' },
    { id: 'GLTF', label: 'glTF (.glb)', desc: 'Web & VR optimized' },
    { id: 'OBJ', label: 'Wavefront (.obj)', desc: 'Legacy mesh support' },
    { id: 'USD', label: 'Universal (.usdc)', desc: 'NVIDIA Omniverse / Pixar' },
  ];

  return (
    <div className="export-modal-content">
      <div className="export-settings-grid">
        <div className="export-column">
          <label className="section-label">File Format</label>
          <div className="format-list">
            {formats.map(f => (
              <div 
                key={f.id} 
                className={`format-option ${format === f.id ? 'active' : ''}`}
                onClick={() => setFormat(f.id)}
              >
                <div className="format-info">
                  <span className="format-name">{f.label}</span>
                  <span className="format-desc">{f.desc}</span>
                </div>
                {format === f.id && <div className="active-chip">Selected</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="export-column">
          <label className="section-label">Options</label>
          <div className="options-stack">
            <div className="export-option-row">
              <div className="option-text">
                <span className="option-title">Bake Textures</span>
                <span className="option-desc">Export with PBR maps baked into the file</span>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            
            <div className="export-option-row">
              <div className="option-text">
                <span className="option-title">Include Animations</span>
                <span className="option-desc">Export current animation tracks</span>
              </div>
              <input type="checkbox" defaultChecked />
            </div>

            <div className="export-option-row">
              <div className="option-text">
                <span className="option-title">Mesh Optimization</span>
                <span className="option-desc">Smart decimation for web/mobile</span>
              </div>
              <div className="toggle-group">
                <button className={`toggle-btn-sm ${quality === 'none' ? 'active' : ''}`} onClick={() => setQuality('none')}>None</button>
                <button className={`toggle-btn-sm ${quality === 'optimized' ? 'active' : ''}`} onClick={() => setQuality('optimized')}>AI Auto</button>
              </div>
            </div>
          </div>

          <div className="export-preview glass-panel">
            <div className="preview-stat">
              <span>Estimated Size</span>
              <strong>4.2 MB</strong>
            </div>
            <div className="preview-stat">
              <span>Polygons</span>
              <strong>24,512</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary flex-center">
          <Download size={18} style={{marginRight: 8}} />
          Prepare & Download
        </button>
      </div>
    </div>
  );
};

export default ExportModal;
