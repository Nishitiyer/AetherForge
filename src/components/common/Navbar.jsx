import React from 'react';
import { Link } from 'react-router-dom';
import { Box, User, Download, Layout, Sparkles } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* LEFT: BRAND */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-hex">
             <Box size={22} className="brand-icon" />
          </div>
          <span className="brand-name">AetherForge</span>
        </Link>

        {/* CENTER: NAV LINKS */}
        <div className="navbar-links">
          <a href="#features" className="nav-item">Features</a>
          <a href="#workflows" className="nav-item">Workflows</a>
          <a href="#pricing" className="nav-item">Pricing</a>
          <Link to="/creator" className="nav-item creator-mode">
             <Sparkles size={14} className="stark-gold" />
             Creator
          </Link>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="navbar-actions">
          <Link to="/auth-selection" className="nav-btn-secondary">
            <User size={16} />
            <span>ID_SIGN_IN</span>
          </Link>
          <Link to="/download" className="nav-btn-primary">
            <Download size={16} />
            <span>DOWNLOAD</span>
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
