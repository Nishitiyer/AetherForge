import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Box className="brand-icon text-gradient" />
          <span className="brand-name">AetherForge</span>
        </Link>
        <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#workflows">Workflows</a>
          <a href="#pricing">Pricing</a>
          <Link to="/creator" className="creator-link">Creator</Link>
        </div>
        <div className="navbar-actions">
          <Link to="/auth-selection" className="btn-secondary">Log In</Link>
          <Link to="/auth-selection" className="btn-primary">Free Download</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
