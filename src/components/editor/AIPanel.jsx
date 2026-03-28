import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Clock, 
  ChevronRight, 
  Zap, 
  Target, 
  Palette, 
  Box as BoxIcon, 
  Settings as SettingsIcon, 
  Plus, 
  MessageSquare, 
  Trash2,
  Sliders,
  Maximize,
  Cpu,
  Shield,
  RotateCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VoiceOrb from '../common/VoiceOrb.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import './AIPanel.css';

const AIPanel = ({ activeMode, onAddObject }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('Genesis');
  const [generationSettings, setGenerationSettings] = useState({
    realism: 0.8,
    complexity: 0.7,
    polyBudget: 50000,
    topologyQuality: 'Production',
    materialFidelity: '4K'
  });
  
  const { orbSettings, setOrbSettings, userType, setIsOrbSelected } = useSession();
  const { chats, activeChat, addMessage } = useChat();
  const navigate = useNavigate();

  const isPro = userType === 'CREATOR' || userType === 'ADMIN';

  const handleChangeOrb = () => {
    setIsOrbSelected(false);
    navigate('/orb-selection');
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    
    addMessage(activeChat.id, { type: 'user', content: prompt });
    
    // Simulate AI response for the demo
    setTimeout(() => {
      addMessage(activeChat.id, { 
        type: 'system', 
        content: `Analyzing prompt: "${prompt}" using ${selectedModel} engine. Applying ${generationSettings.topologyQuality} topology at ${generationSettings.materialFidelity} resolution. Object generation in progress...` 
      });
      
      if (prompt.toLowerCase().includes('create') || prompt.toLowerCase().includes('generate')) {
        onAddObject('Box'); // Fallback to primitive for demo
      }
    }, 1000);

    setPrompt('');
  };

  return (
    <div className="ai-advanced-panel">
      {/* 1. Model Matrix */}
      <div className="section-header">
        <Cpu size={12} />
        <span>INTELLIGENCE_CORE</span>
      </div>
      <div className="model-grid">
        {['Genesis', 'Aether-4', 'Nexus', 'Forge'].map(m => {
          const isLocked = !isPro && (m === 'Nexus' || m === 'Forge');
          return (
            <button 
              key={m} 
              className={`model-pill ${selectedModel === m ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
              onClick={() => !isLocked && setSelectedModel(m)}
              disabled={isLocked}
            >
              {m.toUpperCase()}
              {isLocked && <Shield size={10} className="ml-1" />}
            </button>
          );
        })}
      </div>

      {/* 2. Generation Parameters */}
      <div className="section-header mt-4">
        <Sliders size={12} />
        <span>GENERATION_METRICS</span>
      </div>
      <div className="params-container glass-panel p-3">
        <div className="param-row">
          <label>REALISM</label>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={generationSettings.realism}
            onChange={(e) => setGenerationSettings({...generationSettings, realism: parseFloat(e.target.value)})}
          />
        </div>
        <div className="param-row">
          <label>COMPLEXITY</label>
          <input 
            type="range" 
            min="0" max="1" step="0.1" 
            value={generationSettings.complexity}
            onChange={(e) => setGenerationSettings({...generationSettings, complexity: parseFloat(e.target.value)})}
          />
        </div>
        <div className="param-row">
          <label>POLY_BUDGET</label>
          <select 
            value={generationSettings.polyBudget}
            onChange={(e) => setGenerationSettings({...generationSettings, polyBudget: parseInt(e.target.value)})}
          >
            <option value={10000}>10K (Mobile)</option>
            <option value={50000}>50K (Game)</option>
            <option value={200000}>200K (Cinematic)</option>
          </select>
        </div>
      </div>

      {/* 3. AI Interaction Area */}
      <div className="chat-viewport mt-4">
        <div className="chat-messages">
          {activeChat.messages.map((msg, idx) => (
            <div key={idx} className={`msg-bubble ${msg.type}`}>
              <div className="msg-header">
                {msg.type === 'system' ? <Shield size={10} /> : <div className="user-dot"></div>}
                <span>{msg.type.toUpperCase()}</span>
              </div>
              <div className="msg-content">{msg.content}</div>
            </div>
          ))}
        </div>

        <div className="voice-input-zone relative">
          <VoiceOrb settings={orbSettings} onTranscription={(text) => setPrompt(text)} />
          <button 
            className="change-orb-btn absolute top-0 right-0 p-2 text-slate-500 hover:text-cyan-400"
            onClick={handleChangeOrb}
            title="Change Voice Orb"
          >
            <RotateCw size={14} />
          </button>
        </div>

        <div className="prompt-input-wrapper">
          <textarea 
            placeholder="Input creation vectors..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button className="execute-btn" onClick={handleSend}>
            <Send size={14} />
            <span>EXECUTE</span>
          </button>
        </div>
      </div>

      <div className="panel-footer-stats">
        <span>LATENCY: 42ms</span>
        <span>TOKEN_USAGE: 14%</span>
      </div>
    </div>
  );
};

export default AIPanel;
