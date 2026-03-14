import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Zap, ArrowRight, Box } from 'lucide-react';
import './AuthSelection.css';

const AuthSelection = () => {
  const navigate = useNavigate();

  const handleSelection = (type) => {
    if (type === 'user') {
      navigate('/auth');
    } else if (type === 'admin') {
      navigate('/admin');
    } else if (type === 'creator') {
      navigate('/creator');
    }
  };

  return (
    <div className="auth-selection-page">
      <div className="auth-selection-background">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>

      <div className="auth-selection-container">
        <div className="selection-header">
          <div className="brand-logo">
            <Box size={32} className="text-gradient" />
            <span className="brand-name">AetherForge</span>
          </div>
          <h1>Choose Your Entrance</h1>
          <p>Select the edition of AetherForge you wish to access.</p>
        </div>

        <div className="selection-grid">
          <div className="selection-card glass-panel" onClick={() => handleSelection('user')}>
            <div className="card-icon user-icon">
              <User size={32} />
            </div>
            <h3>Standard User</h3>
            <p>Access the core AetherForge toolset and download the latest builds.</p>
            <div className="card-action">
              <span>Enter Portal</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="selection-card glass-panel featured" onClick={() => handleSelection('creator')}>
            <div className="card-icon creator-icon">
              <Zap size={32} />
            </div>
            <div className="featured-badge">MOST POPULAR</div>
            <h3>Creator Edition</h3>
            <p>Unlocks AI priority, real-time collaboration, and experimental nodes.</p>
            <div className="card-action">
              <span>Unlock Edition</span>
              <ArrowRight size={16} />
            </div>
          </div>

          <div className="selection-card glass-panel" onClick={() => handleSelection('admin')}>
            <div className="card-icon admin-icon">
              <Shield size={32} />
            </div>
            <h3>Admin Suite</h3>
            <p>Platform management, server monitoring, and user authorization.</p>
            <div className="card-action">
              <span>Secure Login</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        <button className="back-to-home" onClick={() => navigate('/')}>
          Return to Landing Page
        </button>
      </div>
    </div>
  );
};

export default AuthSelection;
