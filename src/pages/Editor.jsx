import React, { useState } from 'react';
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
import './Editor.css';

const Editor = () => {
  const [activeMode, setActiveMode] = useState('Model');
  const [rightPanel, setRightPanel] = useState('AI');
  const [activeModal, setActiveModal] = useState(null); // 'export' or 'settings' or null
  
  return (
    <div className="editor-layout">
      <EditorToolbar 
        activeMode={activeMode} 
        setActiveMode={setActiveMode} 
        onExportOpen={() => setActiveModal('export')}
        onSettingsOpen={() => setActiveModal('settings')}
      />
      
      <div className="editor-main-area">
        <EditorSidebar activeMode={activeMode} />
        
        <div className="editor-center-column">
          <Viewport activeMode={activeMode} />
          {activeMode === 'Animation' && <Timeline />}
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
          </div>
          
          <div className="right-panel-content">
            {rightPanel === 'AI' && <AIPanel activeMode={activeMode} />}
            {rightPanel === 'Outliner' && <Outliner />}
            {rightPanel === 'Properties' && <PropertiesPanel activeMode={activeMode} />}
          </div>
        </div>
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
    </div>
  );
};

export default Editor;
