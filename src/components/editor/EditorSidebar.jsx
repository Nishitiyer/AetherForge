import React from 'react';
import { MousePointer2, Move, RotateCcw, Maximize, GitMerge, PenLine, Type, BoxSelect } from 'lucide-react';
import './EditorSidebar.css';

const EditorSidebar = ({ activeMode }) => {
  return (
    <aside className="editor-sidebar">
      <div className="tool-group">
        <button className="tool-btn active" title="Select (V)"><MousePointer2 size={18} /></button>
        <button className="tool-btn" title="Box Select (B)"><BoxSelect size={18} /></button>
      </div>
      
      <div className="sidebar-divider"></div>
      
      <div className="tool-group">
        <button className="tool-btn" title="Move (G)"><Move size={18} /></button>
        <button className="tool-btn" title="Rotate (R)"><RotateCcw size={18} /></button>
        <button className="tool-btn" title="Scale (S)"><Maximize size={18} /></button>
      </div>

      <div className="sidebar-divider"></div>

      <div className="tool-group">
        {activeMode === 'Model' && (
          <>
            <button className="tool-btn" title="Extrude (E)"><GitMerge size={18} /></button>
            <button className="tool-btn" title="Bevel (Ctrl+B)"><PenLine size={18} /></button>
            <button className="tool-btn" title="Loop Cut (Ctrl+R)"><Type size={18} /></button>
          </>
        )}
        
        {activeMode === 'Character' && (
          <>
            <button className="tool-btn" title="Pose Mode"><GitMerge size={18} /></button>
            <button className="tool-btn" title="Weight Paint"><PenLine size={18} /></button>
          </>
        )}
      </div>
      
    </aside>
  );
};

export default EditorSidebar;
