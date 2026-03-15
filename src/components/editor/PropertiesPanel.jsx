import React from 'react';
import { SlidersHorizontal, Image as ImageIcon, Type } from 'lucide-react';
import './PropertiesPanel.css';

const PropertiesPanel = ({ activeMode }) => {
  return (
    <div className="properties-panel">
      
      <div className="prop-section">
        <div className="prop-header">
          <SlidersHorizontal size={14} />
          <span>Transform</span>
        </div>
        <div className="prop-content">
          <div className="prop-row">
            <label>Position</label>
            <div className="prop-inputs-3">
              <input type="number" defaultValue="0.00" />
              <input type="number" defaultValue="0.00" />
              <input type="number" defaultValue="0.00" />
            </div>
          </div>
          <div className="prop-row">
            <label>Rotation</label>
            <div className="prop-inputs-3">
              <input type="number" defaultValue="0.00" />
              <input type="number" defaultValue="0.00" />
              <input type="number" defaultValue="0.00" />
            </div>
          </div>
          <div className="prop-row">
            <label>Scale</label>
            <div className="prop-inputs-3">
              <input type="number" defaultValue="1.00" />
              <input type="number" defaultValue="1.00" />
              <input type="number" defaultValue="1.00" />
            </div>
          </div>
        </div>
      </div>

      <div className="prop-section">
        <div className="prop-header">
          <ImageIcon size={14} />
          <span>Material Setup</span>
        </div>
        <div className="prop-content">
          <div className="prop-row column-layout">
            <label>Base Color</label>
            <div className="color-picker-row">
              <div className="color-swatch" style={{backgroundColor: '#8b5cf6'}}></div>
              <input type="text" defaultValue="#8b5cf6" className="hex-input" />
            </div>
          </div>
          
          <div className="prop-row column-layout mt-1">
            <div className="slider-label">
              <label>Roughness</label>
              <span>0.35</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="35" className="prop-slider" />
          </div>

          <div className="prop-row column-layout mt-1">
            <div className="slider-label">
              <label>Metallic</label>
              <span>0.10</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="10" className="prop-slider" />
          </div>
        </div>
      </div>
      
      {activeMode === 'Character' && (
         <div className="prop-section">
           <div className="prop-header">
             <Type size={14} />
             <span>Rigging Config</span>
           </div>
           <div className="prop-content">
             <div className="prop-row checkbox-row">
               <input type="checkbox" id="ik" defaultChecked />
               <label htmlFor="ik">Enable Inverse Kinematics</label>
             </div>
             <div className="prop-row checkbox-row">
               <input type="checkbox" id="facial" defaultChecked />
               <label htmlFor="facial">Auto-generate blendshapes</label>
             </div>
           </div>
         </div>
      )}

    </div>
  );
};

export default PropertiesPanel;
