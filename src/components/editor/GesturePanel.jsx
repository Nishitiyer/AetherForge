import React from 'react';
import { Webcam, ShieldAlert, Sliders, Crosshair, HelpCircle, Activity } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import './GesturePanel.css';

const GesturePanel = ({ isGestureActive, setIsGestureActive, gestureData }) => {
  const { orbSettings } = useSession();
  const accentColor = orbSettings?.color || '#00e5ff';
  
  const currentGesture = gestureData?.gesture || 'None';
  // Fake confidence mapping based on detection
  const confidence = currentGesture !== 'None' ? Math.floor(Math.random() * 10 + 90) : 0;

  return (
    <div className="blender-properties-content gesture-panel-root">
      
      <div className="prop-section">
        <div className="prop-header font-bold text-xs uppercase flex items-center justify-between pointer-events-none">
           <span>Camera & Tracking</span>
           <Webcam size={14} className="text-gray-400" />
        </div>
        
        <div className="prop-row mt-2">
           <span className="prop-label">Gesture Engine</span>
           <button 
              className={`toggle-btn ${isGestureActive ? 'active' : ''}`} 
              onClick={() => setIsGestureActive(!isGestureActive)}
              style={isGestureActive ? { backgroundColor: `${accentColor}33`, borderColor: accentColor, color: accentColor } : {}}
           >
              {isGestureActive ? 'ON' : 'OFF'}
           </button>
        </div>

        <div className="prop-row">
           <span className="prop-label">Privacy Mode</span>
           <div className="flex gap-2 w-full justify-end">
              <ShieldAlert size={14} className="text-red-400" />
              <span className="text-xs text-gray-500">Local compute only</span>
           </div>
        </div>
      </div>

      <div className="prop-section mt-4 border-t border-gray-800 pt-3">
        <div className="prop-header font-bold text-xs uppercase flex items-center justify-between mb-2 pointer-events-none">
           <span>Live Telemetry</span>
           <Activity size={14} className={isGestureActive ? 'text-green-400 animate-pulse' : 'text-gray-600'} />
        </div>

        <div className="telemetry-box" style={{ borderColor: isGestureActive && currentGesture !== 'None' ? accentColor : '#333' }}>
           <div className="flex justify-between items-end">
              <span className="text-[10px] text-gray-400 font-mono">DETECTED GESTURE</span>
              <span className="text-xl font-bold uppercase" style={{ color: currentGesture !== 'None' ? '#fff' : '#555' }}>
                 {currentGesture}
              </span>
           </div>
           
           <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
                 <span>CONFIDENCE</span>
                 <span>{confidence}%</span>
              </div>
              <div className="confidence-track">
                 <div className="confidence-fill" style={{ width: `${confidence}%`, backgroundColor: accentColor }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="prop-section mt-4 border-t border-gray-800 pt-3">
        <div className="prop-header font-bold text-xs uppercase flex items-center justify-between mb-2 pointer-events-none">
           <span>Calibration</span>
           <Sliders size={14} className="text-gray-400" />
        </div>
        
        <div className="prop-row">
           <span className="prop-label">Sensitivity</span>
           <input type="range" className="blender-slider" min="0" max="100" defaultValue="75" />
        </div>
        
        <div className="prop-row">
           <span className="prop-label">Smoothing</span>
           <input type="range" className="blender-slider" min="0" max="100" defaultValue="40" />
        </div>

        <button className="blender-btn mt-3 w-full flex items-center justify-center gap-2">
           <Crosshair size={14} /> Run Calibration
        </button>
      </div>

      <div className="prop-section mt-4 border-t border-gray-800 pt-3">
        <div className="prop-header font-bold text-xs uppercase flex items-center justify-between mb-2 pointer-events-none">
           <span>Gesture Mapping</span>
           <HelpCircle size={14} className="text-gray-400" />
        </div>
        <div className="mapping-list text-xs text-gray-400 space-y-2 mt-2 font-mono bg-[#111] p-2 rounded border border-gray-800">
           <div className="flex justify-between"><span>Pinch</span><span className="text-white">Select</span></div>
           <div className="flex justify-between"><span>Open Palm</span><span className="text-white">Deselect</span></div>
           <div className="flex justify-between"><span>Spread</span><span className="text-white">Scale</span></div>
           <div className="flex justify-between"><span>Point</span><span className="text-white">Place</span></div>
           <div className="flex justify-between"><span>Wrist Turn</span><span className="text-white">Rotate</span></div>
        </div>
      </div>

    </div>
  );
};

export default GesturePanel;
