import React from 'react';
import { Box, Twitter, Github, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="navbar-brand" style={{ marginBottom: '1.5rem' }}>
              <Box className="brand-icon text-gradient" />
              <span className="brand-name">AetherForge</span>
            </div>
            <p className="footer-description">
              The next-generation AI-native 3D creation platform. Generate, edit, and export production-ready assets with the power of natural language.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><Twitter size={20} /></a>
              <a href="#" className="social-link"><Github size={20} /></a>
              <a href="#" className="social-link"><Linkedin size={20} /></a>
            </div>
          </div>
          
          <div className="footer-links-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Workflows</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">API</a></li>
            </ul>
          </div>
          
          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Tutorials</a></li>
              <li><a href="#">Community Forum</a></li>
              <li><a href="#">Prompt Guide</a></li>
              <li><a href="/admin">Admin Portal</a></li>
              <li><a href="/creator">Creator Portal</a></li>
            </ul>
          </div>
          
          <div className="footer-links-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Partners</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AetherForge AI Inc. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
