import React, { useState } from 'react';
import EditorToolbar from '../components/editor/EditorToolbar.jsx';
import EditorSidebar from '../components/editor/EditorSidebar.jsx';
import Viewport from '../components/editor/Viewport.jsx';
import ConstructionPanel from '../components/editor/ConstructionPanel.jsx';
import AIPanel from '../components/editor/AIPanel.jsx';
import SignLanguagePanel from '../components/editor/SignLanguagePanel.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { useCollaboration } from '../hooks/useCollaboration.js';
import { Camera, Lock, Clock } from 'lucide-react';
import './Editor.css';

const Editor = () => {
  const [activeWorkspace, setActiveWorkspace] = useState('Layout');
  const [activeMode, setActiveMode] = useState('Object Mode');
  const [sceneObjects, setSceneObjects] = useState([
    { 
      id: 'initial-model', 
      type: 'Mesh', 
      name: 'Startup Cube',
      parts: [{ type: 'Box', position: [0, 0, 0], scale: [1, 1, 1], color: '#8b5cf6' }],
      position: [0, 0, 0], 
      scale: [1, 1, 1] 
    }
  ]);

  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [selectedPartIndex, setSelectedPartIndex] = useState(null);
  const [transformMode, setTransformMode] = useState('translate');
  const [rightPanel, setRightPanel] = useState('Constructor');
  const [isSignPanelOpen, setIsSignPanelOpen] = useState(false);
  
  const { otherCursors, updateCursor } = useCollaboration('project-1');

  const workspaces = [
    'Layout', 'Modeling', 'Sculpting', 'UV Editing', 'Texture Paint', 
    'Shading', 'Animation', 'Rendering', 'Compositing', 'Geometry Nodes'
  ];

  const addObject = (type) => {
    const newObj = {
      id: `obj-${Math.random().toString(36).substr(2, 9)}`,
      type: 'Mesh',
      name: `${type} ${sceneObjects.length + 1}`,
      parts: [{ type: type === 'Model' ? 'Box' : type, position: [0, 0, 0], scale: [1, 1, 1], color: '#8b5cf6' }],
      position: [0, 2, 0],
      scale: [1, 1, 1]
    };
    setSceneObjects([...sceneObjects, newObj]);
    setSelectedObjectId(newObj.id);
  };

  return (
    <div className="editor-layout">
      {/* Workspace Tabs Bar */}
      <div className="workspace-tabs-bar">
        {workspaces.map(ws => (
          <button 
            key={ws}
            className={`workspace-tab ${activeWorkspace === ws ? 'active' : ''}`}
            onClick={() => setActiveWorkspace(ws)}
          >
            {ws}
          </button>
        ))}
      </div>

      <EditorToolbar 
        activeMode={activeMode} 
        setActiveMode={setActiveMode} 
        onExportOpen={() => {}} 
        onSettingsOpen={() => {}} 
        onAddObject={addObject} 
        onIsltoggle={(active) => setIsSignPanelOpen(active)}
      />
      
      <div className="aether-hud-scanlines"></div>

      <div className="editor-main-area">
        <EditorSidebar />
        
        <div className="editor-center-column">
          <div className="viewport-container relative hologram-panel">
            <Viewport 
              sceneObjects={sceneObjects} 
              setSceneObjects={setSceneObjects}
              selectedObjectId={selectedObjectId}
              setSelectedObjectId={setSelectedObjectId}
              selectedPartIndex={selectedPartIndex}
              setSelectedPartIndex={setSelectedPartIndex}
              transformMode={transformMode}
              setTransformMode={setTransformMode}
            />
            
            <div className="viewport-hud">
              <div className="hud-top-left hud-data-flicker">
                SEC_AUTH: VERIFIED // AF_PRO_v2
              </div>
              <div className="hud-top-right">
                MODE: {activeMode.toUpperCase()}
              </div>
              <div className="hud-bottom-left">
                OBJ_COUNT: {sceneObjects.length} // GRID_SYNC: ACTIVE
              </div>
              <div className="hud-bottom-right hud-data-flicker">
                LATENCY: 12ms // BUFFER: 100%
              </div>
            </div>

            {isSignPanelOpen && (
              <div className="sign-language-overlay animate-in">
                <SignLanguagePanel onClose={() => setIsSignPanelOpen(false)} />
              </div>
            )}
          </div>
        </div>

        <div className="editor-right-column">
          <div className="right-panel-tabs">
            <button className={`panel-tab ${rightPanel === 'Constructor' ? 'active' : ''}`} onClick={() => setRightPanel('Constructor')}>Tools</button>
            <button className={`panel-tab ${rightPanel === 'AI' ? 'active' : ''}`} onClick={() => setRightPanel('AI')}>AI Assistant</button>
          </div>
          
          <div className="right-panel-content">
            {rightPanel === 'Constructor' && (
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
            )}
            {rightPanel === 'AI' && (
              <AIPanel 
                activeMode={activeMode} 
                onAddObject={(obj) => {
                  if (obj?.action === 'ANIMATE') {
                    const targetId = selectedObjectId || (sceneObjects.length > 0 ? sceneObjects[sceneObjects.length - 1].id : null);
                    if (targetId) {
                      setSceneObjects(sceneObjects.map(o => o.id === targetId ? { ...o, animation: { ...o.animation, type: obj.type } } : o));
                    }
                  } else if (typeof obj === 'string') {
                    addObject(obj);
                  } else {
                    setSceneObjects([...sceneObjects, obj]);
                  }
                }} 
              />
            )}
          </div>
        </div>
      </div>

      <SignLanguagePanel 
        isOpen={isSignPanelOpen} 
        onClose={() => setIsSignPanelOpen(false)}
        onTranslation={(cmd) => {
          if (cmd.includes('add')) addObject('Box');
        }}
      />

      <div className="cursor-overlay">
        {Object.entries(otherCursors).map(([id, pos]) => (
          <div key={id} className="remote-cursor" style={{ left: pos?.x || 0, top: pos?.y || 0 }}>
            <div className="cursor-pointer"></div>
            <div className="cursor-label">User {id.substr(0, 4)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Editor;
