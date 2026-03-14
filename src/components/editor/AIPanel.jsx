import React, { useState } from 'react';
import { Send, Sparkles, RefreshCw, Layers, History, ChevronRight } from 'lucide-react';
import './AIPanel.css';

const AIPanel = ({ activeMode }) => {
  const [prompt, setPrompt] = useState('');
  
  const suggestions = {
    Model: ['Make it more realistic', 'Reduce poly count', 'Add battle damage', 'Optimize for mobile'],
    Character: ['Change clothing color', 'Make them smile', 'Adjust pose to combat', 'Make taller'],
    Material: ['Increase metallic value', 'Add rust patches', 'Make it tileable', 'Increase normal depth'],
    Environment: ['Change time to sunset', 'Add more fog', 'Make it look abandoned', 'Add cinematic lighting'],
    Animation: ['Make the walk heavier', 'Add idle breathing', 'Speed up the punch', 'Loop the cycle']
  };

  return (
    <div className="ai-panel">
      <div className="ai-chat-history">
        <div className="chat-message system">
          <Sparkles size={16} className="text-primary" />
          <p>I'm Omni, your AI 3D assistant. I'm ready to generate or edit {activeMode.toLowerCase()}s. What would you like to build?</p>
        </div>
        
        <div className="chat-message user">
          <p>Generate a low poly fantasy tavern base mesh</p>
        </div>
        
        <div className="chat-message system">
          <p>Generation complete. I've created the base mesh and added it to your scene. You can ask me to refine it, or use manual tools.</p>
          <div className="chat-actions">
            <button className="chat-action-btn"><RefreshCw size={12}/> Regenerate</button>
            <button className="chat-action-btn"><Layers size={12}/> View Nodes</button>
          </div>
        </div>
      </div>

      <div className="ai-suggestions">
        <div className="suggestions-title">Suggestions ({activeMode})</div>
        <div className="suggestions-list">
          {suggestions[activeMode]?.map((sug, i) => (
            <button key={i} className="suggestion-chip">{sug}</button>
          ))}
        </div>
      </div>

      <div className="ai-input-area">
        <div className="ai-input-controls">
          <button className="control-btn" title="Prompt History"><History size={16}/></button>
          <div className="settings-pill">
            <span>Quality: High</span> <ChevronRight size={12}/>
          </div>
        </div>
        
        <div className="ai-input-box">
          <textarea 
            placeholder={`Ask me to change the ${activeMode.toLowerCase()}...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
          ></textarea>
          <button className="send-btn" disabled={!prompt.trim()}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
