import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, ArrowRight, Zap, Layout, Camera, Mic, Settings as SettingsIcon } from 'lucide-react';
import VoiceOrb from '../components/common/VoiceOrb.jsx';
import SignLanguagePanel from '../components/editor/SignLanguagePanel.jsx';
import { useSession } from '../context/SessionContext.jsx';
import './CreatorPortal.css';

const CreatorPortal = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return typeof window !== 'undefined' && localStorage.getItem('isCreator') === 'true'; } catch (e) { return false; }
  });
  const [isSignPanelOpen, setIsSignPanelOpen] = useState(false);
  const { orbSettings, setOrbSettings } = useSession();
  const [voices, setVoices] = useState([]);
  const navigate = useNavigate();

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
    // Future: Link to global creator commands
  };

  if (isAuthenticated) {
    return (
      <div className="creator-portal-container">
        <div className="creator-hub glass-panel animate-in">
          <div className="hub-header">
            <Zap size={32} className="text-gradient" />
            <h1>Creator Edition Active</h1>
            <p>Your professional AetherForge license is verified and active.</p>
          </div>

          <div className="hub-grid" style={{gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto'}}>
            <div className="hub-tool-card glass-panel featured-card">
              <Zap size={32} className="text-primary" style={{marginBottom: '1rem'}} />
              <h3>AetherForge Pro Suite</h3>
              <p>Everything you need: AI Voice Control, Sign Accessibility, Real-time Collaboration, and the full Professional Editor.</p>
              <div style={{display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem'}}>
                <button className="btn-primary" style={{flex: 1, padding: '1rem'}} onClick={() => navigate('/editor')}>
                   Open Workspace
                </button>
                <button className="btn-secondary" style={{flex: 1, padding: '1rem'}} onClick={() => navigate('/download')}>
                  Install Desktop
                </button>
              </div>
            </div>
          </div>

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
