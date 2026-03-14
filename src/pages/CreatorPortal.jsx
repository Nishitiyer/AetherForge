import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, ArrowRight, Zap, Layout, Camera, Mic, Settings as SettingsIcon } from 'lucide-react';
import VoiceOrb from '../components/common/VoiceOrb';
import SignLanguagePanel from '../components/editor/SignLanguagePanel';
import { useSession } from '../context/SessionContext';
import './CreatorPortal.css';

const CreatorPortal = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isCreator') === 'true');
  const [isSignPanelOpen, setIsSignPanelOpen] = useState(false);
  const { orbSettings, setOrbSettings } = useSession();
  const voices = window.speechSynthesis.getVoices();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Lalitha76!') {
      localStorage.setItem('isCreator', 'true');
      localStorage.removeItem('sessionStart'); // Stop the timer for this person
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Creator Key');
    }
  };

  const handleTranscription = (text) => {
    console.log('Creator Voice Instruction:', text);
    // Future: Link to global creator commands
  };

  if (isAuthenticated) {
    return (
      <div className="creator-portal-container">
        <div className="creator-hub glass-panel animate-in">
          <div className="hub-header">
            <Zap size={32} className="text-gradient" />
            <h1>Creator Control Hub</h1>
            <p>Master control for AetherForge Pro systems.</p>
          </div>

          <div className="hub-grid">
            <div className="hub-tool-card glass-panel">
              <Mic size={24} className="text-primary" />
              <h3>Voice Assistant</h3>
              <p>Test the global voice command system.</p>
              <VoiceOrb onTranscription={handleTranscription} settings={orbSettings} />
            </div>

            <div className="hub-tool-card glass-panel">
              <Camera size={24} className="text-primary" />
              <h3>Vision & Sign</h3>
              <p>Manage accessibility camera systems.</p>
              <button 
                className="btn-secondary" 
                onClick={() => setIsSignPanelOpen(true)}
              >
                Open Camera Panel
              </button>
            </div>

            <div className="hub-tool-card glass-panel workspace-card">
              <Layout size={24} className="text-primary" />
              <h3>Main Workspace</h3>
              <p>Jump directly to the 3D Creation Suite.</p>
              <button className="btn-primary" onClick={() => navigate('/editor')}>
                Open Editor
              </button>
            </div>

            <div className="hub-tool-card glass-panel config-card">
              <SettingsIcon size={24} className="text-primary" />
              <h3>Orb Customization</h3>
              <div className="hub-config-inputs">
                <input 
                  type="text" 
                  placeholder="Assistant Name"
                  value={orbSettings.name}
                  onChange={(e) => setOrbSettings({...orbSettings, name: e.target.value})}
                />
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
          </div>

          <SignLanguagePanel 
            isOpen={isSignPanelOpen} 
            onClose={() => setIsSignPanelOpen(false)} 
            onTranslation={(t) => console.log('Creator Sign:', t)}
          />

          <button className="logout-link" onClick={() => {
            localStorage.removeItem('isCreator');
            setIsAuthenticated(false);
          }}>
            Deactivate Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-portal-container">
      <div className="creator-card glass-panel animate-in">
        <div className="creator-header">
          <div className="creator-icon">
            <Zap size={32} className="text-gradient" />
          </div>
          <h1>Creator Access</h1>
          <p>Enter your private key to unlock AetherForge Pro.</p>
        </div>

        <form className="creator-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="password">Creator Secret Key</label>
            <div className="input-wrapper">
              <Lock className="field-icon" size={18} />
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error-badge">{error}</div>}

          <button type="submit" className="btn-primary creator-submit">
            Unlock Everything <ArrowRight size={18} />
          </button>
        </form>

        <div className="creator-footer">
          <Shield size={14} />
          <span>Private User Instance · Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};

export default CreatorPortal;
