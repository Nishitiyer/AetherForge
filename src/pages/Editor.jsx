import React, { useState } from 'react';
import { Camera, Lock, Clock } from 'lucide-react';
import EditorSidebar from '../components/editor/EditorSidebar';
import EditorToolbar from '../components/editor/EditorToolbar';
import Viewport from '../components/editor/Viewport';
import AIPanel from '../components/editor/AIPanel';
import Outliner from '../components/editor/Outliner';
import Timeline from '../components/editor/Timeline';
import PropertiesPanel from '../components/editor/PropertiesPanel';
import Modal from '../components/common/Modal';
import ExportModal from '../components/editor/ExportModal';
import ProjectSettings from '../components/editor/ProjectSettings';
import RiggingPanel from '../components/editor/RiggingPanel';
import NodeEditor from '../components/editor/NodeEditor';
import { useCollaboration } from '../hooks/useCollaboration';
import { useSession } from '../context/SessionContext';
import SignLanguagePanel from '../components/editor/SignLanguagePanel';
import VoiceOrb from '../components/common/VoiceOrb';
import './Editor.css';

const Editor = () => {
  const [activeMode, setActiveMode] = useState('Animation');
  const [rightPanel, setRightPanel] = useState('AI');
  const [activeModal, setActiveModal] = useState(null);
  const [sceneObjects, setSceneObjects] = useState([
    { id: 'initial-model', type: 'Model', position: [0, 0, 0], scale: [1, 1, 1], color: '#8b5cf6' }
  ]);
  
  const { isExpired, isCreator } = useSession();
  const [isSignPanelOpen, setIsSignPanelOpen] = useState(false);
  const { otherCursors, updateCursor } = useCollaboration('default-project');

  const handleMouseMove = (e) => {
    updateCursor({ x: e.clientX, y: e.clientY });
  };

  const addObject = (type) => {
    const newObj = {
      id: `obj-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: [Math.random() * 2 - 1, 0, Math.random() * 2 - 1],
      scale: [1, 1, 1],
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setSceneObjects([...sceneObjects, newObj]);
  };
  
  return (
    <div className="editor-layout" onMouseMove={handleMouseMove}>
      <EditorToolbar 
        activeMode={activeMode} 
        setActiveMode={setActiveMode} 
        onExportOpen={() => setActiveModal('export')}
        onSettingsOpen={() => setActiveModal('settings')}
        onAddObject={addObject}
      />
      
      <div className="editor-main-area">
        <EditorSidebar activeMode={activeMode} />
        
        <button 
          className="accessibility-toggle-btn"
          onClick={() => setIsSignPanelOpen(true)}
          title="Sign Language Assistant"
        >
          <Camera size={20} />
        </button>

        <div className="editor-voice-assistant">
          <VoiceOrb onTranscription={(t) => console.log('AI Command:', t)} settings={orbSettings} />
        </div>

        <div className="editor-center-column">
          {activeMode === 'Material' ? (
            <div className="shader-workspace">
              <div className="shader-viewport">
                <Viewport activeMode={activeMode} sceneObjects={sceneObjects} setSceneObjects={setSceneObjects} />
              </div>
              <div className="shader-nodes relative">
                {!isCreator && (
                  <div className="locked-overlay">
                    <Lock size={24} />
                    <span>AetherNodes requires Creator Access</span>
                    <button onClick={() => window.location.href='/creator'}>Unlock Pro</button>
                  </div>
                )}
                <NodeEditor />
              </div>
            </div>
          ) : (
            <>
              <Viewport activeMode={activeMode} sceneObjects={sceneObjects} setSceneObjects={setSceneObjects} />
              {activeMode === 'Animation' && <Timeline />}
            </>
          )}
        </div>
        
        <div className="editor-right-column">
          <div className="right-panel-tabs">
            <button 
              className={`panel-tab ${rightPanel === 'AI' ? 'active' : ''}`}
              onClick={() => setRightPanel('AI')}
            >AI Assistant</button>
            <button 
              className={`panel-tab ${rightPanel === 'Outliner' ? 'active' : ''}`}
              onClick={() => setRightPanel('Outliner')}
            >Outliner</button>
            <button 
              className={`panel-tab ${rightPanel === 'Properties' ? 'active' : ''}`}
              onClick={() => setRightPanel('Properties')}
            >Properties</button>
            {activeMode === 'Character' && (
              <button 
                className={`panel-tab ${rightPanel === 'Rigging' ? 'active' : ''}`}
                onClick={() => setRightPanel('Rigging')}
              >Rigging</button>
            )}
          </div>
          
          <div className="right-panel-content">
            {rightPanel === 'AI' && <AIPanel activeMode={activeMode} onAddObject={addObject} />}
            {rightPanel === 'Outliner' && <Outliner />}
            {rightPanel === 'Properties' && <PropertiesPanel activeMode={activeMode} />}
            {rightPanel === 'Rigging' && <RiggingPanel />}
          </div>
        </div>
      </div>

      {/* Collaboration Cursor Overlay */}
      <div className="cursor-overlay">
        {Object.entries(otherCursors).map(([id, pos]) => (
          <div 
            key={id} 
            className="remote-cursor" 
            style={{ left: pos.x, top: pos.y }}
          >
            <div className="cursor-pointer"></div>
            <div className="cursor-label">User {id.slice(0, 4)}</div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'export'} 
        onClose={() => setActiveModal(null)} 
        title="Export Project Assets"
      >
        <ExportModal onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal 
        isOpen={activeModal === 'settings'} 
        onClose={() => setActiveModal(null)} 
        title="Project Settings"
      >
        <ProjectSettings />
      </Modal>

      <SignLanguagePanel 
        isOpen={isSignPanelOpen} 
        onClose={() => setIsSignPanelOpen(false)} 
        onTranslation={(text) => addObject(text.includes('Character') ? 'Character' : 'Model')}
      />

      {isExpired && !isCreator && (
        <div className="session-expired-overlay">
          <div className="expiry-card glass-panel flex-column">
            <Clock size={48} className="text-primary" />
            <h2>Session Limit Reached</h2>
            <p>You've reached your 2-hour free limit. Unlock AetherForge Pro for unlimited creation, higher fidelity models, and collaborative workspaces.</p>
            <div className="expiry-actions">
              <button className="btn-primary" onClick={() => window.location.href='/billing'}>View Plans</button>
              <button className="btn-secondary" onClick={() => window.location.href='/creator'}>Creator Portal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
