import React, { useState } from 'react';
import { Send, Sparkles, RefreshCw, Layers, History as HistoryIcon, ChevronRight, Zap, Target, Palette, Box as BoxIcon, Settings as SettingsIcon, Plus, MessageSquare, Trash2 } from 'lucide-react';
import VoiceOrb from '../common/VoiceOrb.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { assembleFromAI } from '../../utils/ModelFactory.jsx';
import './AIPanel.css';

const AIPanel = ({ activeMode, onAddObject }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('Genesis');
  const [showOrbSettings, setShowOrbSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const { isExpired, isCreator, orbSettings, setOrbSettings } = useSession();
  const { chats, activeChat, setActiveChatId, addChat, addMessage, deleteChat } = useChat();
  
  const [voices, setVoices] = useState([]);
  
  React.useEffect(() => {
    const updateVoices = () => {
      if (window.speechSynthesis) {
        setVoices(window.speechSynthesis.getVoices());
      }
    };
    updateVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const models = [
    { id: 'Genesis', name: 'Genesis', tier: 'Basic', description: 'General 3D generation', icon: <Sparkles size={14}/> },
    { id: 'Draft', name: 'Draft', tier: 'Basic', description: 'Fast, low detail', icon: <Zap size={14}/> },
    { id: 'Poly', name: 'Poly', tier: 'Basic', description: 'Low-poly optimized', icon: <BoxIcon size={14}/> },
    { id: 'Nexus', name: 'Nexus Ultra', tier: 'Pro', description: 'Locked for users - Free for you', icon: <Target size={14}/> },
    { id: 'Artisan', name: 'Artisan', tier: 'Pro', description: 'Locked for users - Free for you', icon: <Palette size={14}/> },
  ];

  const handleVoiceInput = (text) => {
    setPrompt(text);
    // Auto-trigger if it's a clear command
    if (text.toLowerCase().includes('add') || text.toLowerCase().includes('create')) {
      onAddObject(activeMode === 'Animation' ? 'Model' : activeMode);
    }
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    const model = models.find(m => m.id === selectedModel);
    
    // Rigid gating logic: Premium/Pro models lock after 2hrs for users
    if (model.tier === 'Pro' && isExpired && !isCreator) {
      alert('Daily Pro session ended. Please use Basic models or upgrade.');
      return;
    }

    // Add user message to history
    addMessage(activeChat.id, { type: 'user', content: prompt });

    if (prompt.toLowerCase().includes('add') || prompt.toLowerCase().includes('create') || prompt.toLowerCase().includes('build')) {
      const color = prompt.toLowerCase().includes('red') ? '#ef4444' : 
                    prompt.toLowerCase().includes('blue') ? '#3b82f6' : 
                    prompt.toLowerCase().includes('green') ? '#22c55e' : '#8b5cf6';
                    
      const newModel = assembleFromAI(prompt, color);
      onAddObject(newModel);
      
      addMessage(activeChat.id, { 
        type: 'system', 
        content: `Exact construction of "${newModel.name}" complete. I've assembled it from ${newModel.parts.length} primitives including detailed "definitions". You can drag and edit each part in the Constructor panel.` 
      });
    } else if (prompt.toLowerCase().includes('animate') || prompt.toLowerCase().includes('walk') || prompt.toLowerCase().includes('wave')) {
      // Find the last added/selected object and apply animation
      const type = prompt.toLowerCase().includes('walk') ? 'Walk' : 
                   prompt.toLowerCase().includes('wave') ? 'Wave' : 'Idle';
      
      // We rely on the parent (Editor) to handle the state update for animations
      onAddObject({ action: 'ANIMATE', type });
      
      addMessage(activeChat.id, { 
        type: 'system', 
        content: `Animation sequence "${type}" applied to the character. You can see it performing the action in the viewport now.` 
      });
    } else {
      // Generic AI response
      addMessage(activeChat.id, { 
        type: 'system', 
        content: `I've analyzed your request for the ${activeMode.toLowerCase()}. I'm refining the generation parameters...` 
      });
    }
    
    setPrompt('');
  };

  const suggestions = {
    Model: ['Make it more realistic', 'Reduce poly count', 'Add battle damage', 'Optimize for mobile'],
    Character: ['Change clothing color', 'Make them smile', 'Adjust pose to combat', 'Make taller'],
    Material: ['Increase metallic value', 'Add rust patches', 'Make it tileable', 'Increase normal depth'],
    Environment: ['Change time to sunset', 'Add more fog', 'Make it look abandoned', 'Add cinematic lighting'],
    Animation: ['Make the walk heavier', 'Add idle breathing', 'Speed up the punch', 'Loop the cycle']
  };

  return (
    <div className="ai-panel">
      <div className="ai-model-selector">
        {models.map(m => (
          <button 
            key={m.id}
            className={`model-card ${selectedModel === m.id ? 'active' : ''} ${m.tier === 'Pro' && isExpired && !isCreator ? 'locked' : ''}`}
            onClick={() => setSelectedModel(m.id)}
            title={m.description}
          >
            {m.icon}
            <span className="model-name">{m.name}</span>
            {m.tier === 'Pro' && <span className="pro-badge">PRO</span>}
          </button>
        ))}
      </div>

      <div className="orb-settings-toggle">
        <button onClick={() => setShowOrbSettings(!showOrbSettings)} className="btn-icon">
          <SettingsIcon size={16} /> {showOrbSettings ? 'Close Voice Settings' : 'Orb Settings'}
        </button>
      </div>

      {showOrbSettings && (
        <div className="orb-config-panel glass-panel">
          <div className="config-group">
            <label>Orb Name</label>
            <input 
              type="text" 
              value={orbSettings.name} 
              onChange={(e) => setOrbSettings({...orbSettings, name: e.target.value})} 
            />
          </div>
          <div className="config-group">
            <label>Theme Color</label>
            <input 
              type="color" 
              value={orbSettings.color} 
              onChange={(e) => setOrbSettings({...orbSettings, color: e.target.value})} 
            />
          </div>
          <div className="config-group">
            <label>Animation</label>
            <select 
              value={orbSettings.animation} 
              onChange={(e) => setOrbSettings({...orbSettings, animation: e.target.value})}
            >
              <option>Pulse</option>
              <option>Float</option>
              <option>Spin</option>
              <option>Ripple</option>
            </select>
          </div>
          <div className="config-group">
            <label>Voice ({voices.length} found)</label>
            <select 
              value={orbSettings.voice} 
              onChange={(e) => setOrbSettings({...orbSettings, voice: parseInt(e.target.value)})}
            >
              {voices.slice(0, 10).map((v, i) => (
                <option key={i} value={i}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="ai-chat-history">
        {activeChat.messages.length === 0 && (
          <div className="chat-message system">
            <Sparkles size={16} className="text-primary" />
            <p>I'm {orbSettings.name}, your AI 3D assistant. I'm ready to generate or edit {activeMode.toLowerCase()}s. What would you like to build?</p>
          </div>
        )}
        
        {activeChat.messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.type}`}>
            {msg.type === 'system' && <Sparkles size={16} className="text-gradient" />}
            <p>{msg.content}</p>
            {msg.type === 'system' && idx === activeChat.messages.length - 1 && (
              <div className="chat-actions">
                <button className="chat-action-btn"><RefreshCw size={12}/> Regenerate</button>
                <button className="chat-action-btn"><Layers size={12}/> View Nodes</button>
              </div>
            )}
          </div>
        ))}
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
        <div className="ai-history-control">
          <button onClick={() => setShowChatHistory(!showChatHistory)} className="btn-icon">
            <MessageSquare size={16} /> History ({chats.length})
          </button>
          <button onClick={addChat} className="btn-icon">
            <Plus size={16} /> New Chat
          </button>
        </div>

        {showChatHistory && (
          <div className="chat-sessions-list glass-panel">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-session-item ${chat.id === activeChat.id ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <MessageSquare size={14} />
                <span>{chat.name}</span>
                <button 
                  className="delete-chat" 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <VoiceOrb onTranscription={handleVoiceInput} settings={orbSettings} />
        
        <div className="ai-input-controls">
          <button className="control-btn" title="Prompt History"><HistoryIcon size={16}/></button>
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
          <button className="send-btn" disabled={!prompt.trim()} onClick={handleSend}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
