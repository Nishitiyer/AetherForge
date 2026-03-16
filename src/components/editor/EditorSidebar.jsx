import { 
  MousePointer2, Move, RotateCcw, Maximize, GitMerge, Edit3, Type, 
  Box, Eraser, Scissors, Lasso, Wand2, Hand, Fingerprint
} from 'lucide-react';
import './EditorSidebar.css';

const EditorSidebar = ({ activeMode }) => {
  return (
    <aside className="editor-sidebar hologram-panel">
      {/* Transformation Tools (Always available or context-sensitive) */}
      <div className="tool-group">
        <button className="tool-btn active" title="Select (V)"><MousePointer2 size={18} /></button>
        <button className="tool-btn" title="Box Select (B)"><Box size={18} /></button>
      </div>
      
      <div className="sidebar-divider"></div>
      
      <div className="tool-group">
        <button className="tool-btn" title="Move (G)"><Move size={18} /></button>
        <button className="tool-btn" title="Rotate (R)"><RotateCcw size={18} /></button>
        <button className="tool-btn" title="Scale (S)"><Maximize size={18} /></button>
      </div>

      <div className="sidebar-divider"></div>

      {/* Mode Specific Tools */}
      <div className="tool-group">
        {activeMode === 'Edit Mode' && (
          <>
            <button className="tool-btn" title="Extrude (E)"><GitMerge size={18} /></button>
            <button className="tool-btn" title="Inset (I)"><Box size={18} /></button>
            <button className="tool-btn" title="Bevel (Ctrl+B)"><Edit3 size={18} /></button>
            <button className="tool-btn" title="Loop Cut (Ctrl+R)"><Type size={18} /></button>
            <button className="tool-btn" title="Knife (K)"><Scissors size={18} /></button>
          </>
        )}
        
        {activeMode === 'Sculpt Mode' && (
          <>
            <button className="tool-btn active" title="Draw (D)"><Edit3 size={18} /></button>
            <button className="tool-btn" title="Clay"><Wand2 size={18} /></button>
            <button className="tool-btn" title="Crease"><Scissors size={18} /></button>
            <button className="tool-btn" title="Grab (G)"><Hand size={18} /></button>
            <button className="tool-btn" title="Snake Hook"><Fingerprint size={18} /></button>
            <button className="tool-btn" title="Smooth (Shift)"><Eraser size={18} /></button>
          </>
        )}

        {activeMode === 'Object Mode' && (
          <>
            <button className="tool-btn" title="Annotate"><Edit3 size={18} /></button>
            <button className="tool-btn" title="Measure"><Type size={18} /></button>
          </>
        )}
      </div>
      
    </aside>
  );
};

export default EditorSidebar;
