import React from 'react';
import { Monitor, Apple, Terminal, Download as DownloadIcon, Box, ArrowRight } from 'lucide-react';
import './Download.css';

const Download = () => {
  const osOptions = [
    { name: 'Windows', icon: <Monitor size={32} />, version: 'v1.4.2 (LTS)', tag: 'Recommended' },
    { name: 'macOS', icon: <Apple size={32} />, version: 'v1.4.2 (Universal)', tag: 'Intel & Silicon' },
    { name: 'Linux', icon: <Terminal size={32} />, version: 'v1.4.2 (AppImage)', tag: 'glibc 2.27+' },
  ];

  return (
    <div className="download-page">
      <div className="download-container">
        <header className="download-header">
          <Box size={40} className="text-gradient" />
          <h1>Get AetherForge</h1>
          <p>Professional AI-native 3D creation suite, optimized for your hardware.</p>
        </header>

        <div className="os-grid">
          {osOptions.map((os, i) => (
            <div key={i} className="os-card glass-panel">
              {os.tag && <div className="os-tag">{os.tag}</div>}
              <div className="os-icon">{os.icon}</div>
              <h3>AetherForge for {os.name}</h3>
              <p className="os-version">{os.version}</p>
              <button className="btn-primary">
                <DownloadIcon size={18} /> Download Installer
              </button>
            </div>
          ))}
        </div>

        <div className="download-info glass-panel">
          <div className="info-section">
            <h4>System Requirements</h4>
            <ul>
              <li><strong>GPU:</strong> Vulcan-compatible (NVIDIA RTX 30+ recommended)</li>
              <li><strong>RAM:</strong> 16GB Minimum (32GB for AI generation)</li>
              <li><strong>OS:</strong> 64-bit Windows 10/11, macOS 12+, Linux</li>
            </ul>
          </div>
          <div className="info-section">
            <h4>Stable Release (LTS)</h4>
            <p>Our Long Term Support version is recommended for production environments. It includes the most stable AI prompt-to-model bridge.</p>
            <a href="#" className="docs-link">View Documentation <ArrowRight size={14} /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
