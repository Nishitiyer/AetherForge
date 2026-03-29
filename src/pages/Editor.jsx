import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Layers, 
  Settings, 
  Play, 
  ChevronDown, 
  Search, 
  HelpCircle, 
  Database, 
  PenTool, 
  MousePointer2, 
  Move, 
  RotateCw, 
  Maximize, 
  Scissors, 
  Plus, 
  Eye, 
  Zap,
  Cpu,
  Mic,
  Clapperboard,
  Waves
} from 'lucide-react';
import EditorToolbar from '../components/editor/EditorToolbar.jsx';
import EditorSidebar from '../components/editor/EditorSidebar.jsx';
import Viewport from '../components/editor/Viewport.jsx';
import ConstructionPanel from '../components/editor/ConstructionPanel.jsx';
import RenderSettings from '../components/editor/RenderSettings.jsx';
import AIPanel from '../components/editor/AIPanel.jsx';
import Timeline from '../components/editor/Timeline.jsx';
import useHands from '../hooks/useHands.js';
import GestureOverlay from '../components/editor/GestureOverlay.jsx';
import { useSession } from '../context/SessionContext.jsx';
import './Editor.css';

const WORKSPACES = [
  'Layout', 'Modeling', 'Sculpting', 'UV Editing', 'Texture Paint', 
  'Shading', 'Animation', 'Rendering', 'Compositing', 'Geometry Nodes',
  'Simulation', 'AI Generate', 'Gesture Build', 'Voice Build'
];

const MODES = [
  'Object Mode', 'Edit Mode', 'Sculpt Mode', 'Vertex Paint', 
  'Weight Paint', 'Texture Paint', 'Pose Mode'
];

const Editor = () => {
  const [activeWorkspace, setActiveWorkspace] = useState('Layout');
  const [activeMode, setActiveMode] = useState('Object Mode');
  const [sceneObjects, setSceneObjects] = useState([
    { 
      id: 'startup-cube', 
      type: 'Mesh', 
      name: 'Startup Cube',
      parts: [{ type: 'Box', position: [0, 0, 0], scale: [1, 1, 1], color: '#888888', metalness: 0.5, roughness: 0.5 }],
      position: [0, 0, 0], 
      scale: [1, 1, 1] 
    }
  ]);

  const [selectedObjectId, setSelectedObjectId] = useState('startup-cube');
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);
  const [transformMode, setTransformMode] = useState('translate');
  const [rightPanel, setRightPanel] = useState('Properties');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isGestureActive, setIsGestureActive] = useState(false);
  
  const { gesture, landmarks, videoRef } = useHands(isGestureActive);
  const { isOrbSelected, userType } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOrbSelected && userType === 'USER') {
      navigate('/orb-selection');
    }
  }, [isOrbSelected, userType, navigate]);

  const addObject = (type) => {
    const newObj = {
      id: `obj-${Math.random().toString(36).substr(2, 9)}`,
      type: 'Mesh',
      name: `${type} ${sceneObjects.length + 1}`,
      parts: [{ type: type === 'Model' ? 'Box' : type, position: [0, 0, 0], scale: [1, 1, 1], color: '#888888', metalness: 0.5, roughness: 0.5 }],
      position: [0, 2, 0],
      scale: [1, 1, 1]
    };
    setSceneObjects([...sceneObjects, newObj]);
    setSelectedObjectId(newObj.id);
  };

  return (
    <div className="aether-editor-root">
      {/* 1. Global Header / Workspace Bar */}
      <EditorToolbar 
        activeMode={activeMode} 
        setActiveMode={setActiveMode} 
        onIsltoggle={setIsGestureActive} 
      />

      {/* 2. Main Workspace Layout */}
      <main className="editor-grid">
        {/* Left Toolbar (Vertical) */}
        <EditorSidebar activeMode={activeMode} />

        {/* Central Area (Viewport) */}
        <section className="viewport-zone">
          <div className="viewport-header">
            <div className="mode-selector">
              <button className="mode-btn">
                <span>{activeMode}</span>
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="viewport-overlays-toggle">
              <button className="view-btn"><Eye size={14} /></button>
              <button className="view-btn"><Layers size={14} /></button>
              <button className="view-btn active"><Box size={14} /></button>
            </div>
          </div>
          
          <div className="viewport-canvas-wrapper">
            <Viewport 
              activeMode={activeMode}
              sceneObjects={sceneObjects} 
              setSceneObjects={setSceneObjects}
              selectedObjectId={selectedObjectId}
              setSelectedObjectId={setSelectedObjectId}
              selectedPartIndex={selectedPartIndex}
              setSelectedPartIndex={setSelectedPartIndex}
              transformMode={transformMode}
              setTransformMode={setTransformMode}
              gestureData={{ gesture, landmarks }}
              selectedOrbId={useSession().selectedOrbId}
            />
            
            <GestureOverlay videoRef={videoRef} landmarks={landmarks} active={isGestureActive} />
          </div>

          <div className="viewport-footer">
            <span>(1) Startup Cube | Verts: 8 | Faces: 6 | Tris: 12</span>
            <span>Mem: 48.2 MB | FPS: 120</span>
          </div>
        </section>

        {/* Right Sidebar (Outliner & Properties) */}
        <aside className="properties-shelf">
          {/* Outliner (Top Half) */}
          <div className="outliner-panel">
            <div className="panel-header">
              <Database size={14} />
              <span>Outliner</span>
              <div className="panel-actions">
                <Search size={12} />
                <ChevronDown size={12} />
              </div>
            </div>
            <div className="outliner-content">
              <div className="scene-tree">
                <div className="tree-item group">
                  <ChevronDown size={12} />
                  <span>Scene Collection</span>
                </div>
                <div className="tree-item group ml-4">
                  <ChevronDown size={12} />
                  <span>Collection</span>
                </div>
                {sceneObjects.map(obj => (
                  <div 
                    key={obj.id} 
                    className={`tree-item ml-8 ${selectedObjectId === obj.id ? 'selected' : ''}`}
                    onClick={() => setSelectedObjectId(obj.id)}
                  >
                    <Box size={12} />
                    <span>{obj.name}</span>
                    <Eye size={12} className="ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Properties (Bottom Half) */}
          <div className="inspector-panel">
            <div className="panel-tabs">
              <button 
                className={`prop-tab ${rightPanel === 'Properties' ? 'active' : ''}`}
                onClick={() => setRightPanel('Properties')}
              >
                <Settings size={14} />
              </button>
              <button 
                className={`prop-tab ${rightPanel === 'Render' ? 'active' : ''}`}
                onClick={() => setRightPanel('Render')}
              >
                <Clapperboard size={14} />
              </button>
              <button className="prop-tab"><Layers size={14} /></button>
              <button className="prop-tab"><Palette size={14} /></button>
              <button className="prop-tab"><Workflow size={14} /></button>
            </div>
            <div className="inspector-content">
              {rightPanel === 'Properties' ? (
                <ConstructionPanel 
                  onAddObject={addObject} 
                  sceneObjects={sceneObjects} 
                  setSceneObjects={setSceneObjects} 
                  selectedObjectId={selectedObjectId}
                  setSelectedObjectId={setSelectedObjectId}
                  selectedPartIndex={selectedPartIndex}
                  setSelectedPartIndex={setSelectedPartIndex}
                  transformMode={transformMode}
                  setTransformMode={setTransformMode}
                />
              ) : (
                <RenderSettings />
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* 3. Bottom Timeline Area */}
      <footer className="aether-footer">
        <div className="timeline-controls">
          <button className="btn-icon"><SkipBack size={16} /></button>
          <button className="btn-icon"><Play size={16} /></button>
          <button className="btn-icon"><SkipForward size={16} /></button>
          <div className="current-frame">0</div>
        </div>
        <div className="timeline-track">
          <Timeline />
        </div>
      </footer>

      {/* 4. Technical Floating Overlays */}
      <div className="floating-ai-trigger" onClick={() => setIsAIPanelOpen(!isAIPanelOpen)}>
        <Cpu size={20} />
      </div>
      
      {isAIPanelOpen && (
        <div className="floating-ai-panel glass-panel">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Mic size={14} className="text-cyan-400" />
                AETHER ALCHEMY
              </h3>
              <button onClick={() => setIsAIPanelOpen(false)}>×</button>
            </div>
            <AIPanel 
              activeMode={activeMode} 
              onAddObject={(obj) => {
                if (typeof obj === 'string') addObject(obj);
                else setSceneObjects([...sceneObjects, obj]);
              }} 
            />
          </div>
        </div>
      )}

      {/* Gesture Status Indicator */}
      <div className={`gesture-status ${isGestureActive ? 'active' : ''}`} onClick={() => setIsGestureActive(!isGestureActive)}>
        <Waves size={16} />
        <span>{isGestureActive ? 'GESTURE_SYNC_ON' : 'GESTURE_OFF'}</span>
      </div>

    </div>
  );
};

// Internal icons not imported from lucide-react but needed
const SkipBack = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>;
const SkipForward = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
const Share2 = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const Workflow = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const Palette = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.5-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-4.9-4.5-9-10-9z"/></svg>;

export default Editor;
